# agents/quality_assurance_agent.py
from typing import Optional, Dict
from rapidfuzz import fuzz

from models import ProviderInput, DataValidationResult, ProviderOutput, FieldWithConfidence


class QualityAssuranceAgent:
    """
    Uses:
    - provider_input
    - npi_raw (NPI registry)
    - website_data (scraped practice site)

    to compute final field values + confidence scores.
    """

    # ---------- helpers to extract from NPI ----------

    def _build_name_from_npi(self, npi_raw: Dict) -> Optional[str]:
        basic = npi_raw.get("basic", {}) if npi_raw else {}
        first = basic.get("first_name")
        last = basic.get("last_name")
        org_name = basic.get("organization_name")
        if org_name:
            return org_name
        if first and last:
            return f"Dr. {first} {last}"
        if first:
            return f"Dr. {first}"
        return None

    def _build_address_from_npi(self, npi_raw: Dict) -> Optional[str]:
        if not npi_raw:
            return None
        addresses = npi_raw.get("addresses", [])
        if not addresses:
            return None
        addr = addresses[0]
        parts = [
            addr.get("address_1"),
            addr.get("address_2"),
            addr.get("city"),
            addr.get("state"),
            addr.get("postal_code"),
        ]
        return ", ".join([p for p in parts if p])

    def _build_speciality_from_npi(self, npi_raw: Dict) -> Optional[str]:
        if not npi_raw:
            return None
        taxonomies = npi_raw.get("taxonomies", [])
        if not taxonomies:
            return None
        primary = taxonomies[0]
        desc = primary.get("desc")
        if desc:
            return desc
        return primary.get("code")

    def _build_phone_from_npi(self, npi_raw: Dict) -> Optional[str]:
        if not npi_raw:
            return None
        addresses = npi_raw.get("addresses", [])
        if not addresses:
            return None
        return addresses[0].get("telephone_number")

    # ---------- multi-source comparison helper ----------

    def _multi_source_field(
        self,
        input_value: str,
        npi_value: Optional[str],
        web_value: Optional[str],
        source_label: str,
    ) -> FieldWithConfidence:
        """
        Combine input, NPI, and website values:

        Rules:
        - If no NPI and no website -> confidence 0.0, note about missing external sources.
        - If only one external source exists -> compare input vs that source.
        - If both NPI and website exist:
            - If they agree strongly -> very high confidence.
            - If they disagree -> choose the one closer to input but with lower confidence.
        """
        input_value = (input_value or "").strip()
        npi_value = npi_value.strip() if npi_value else None
        web_value = web_value.strip() if web_value else None

        # No external sources at all
        if not npi_value and not web_value:
            return FieldWithConfidence(
                value=input_value,
                confidence=0.0,
                note=f"No NPI/website {source_label} available",
            )

        # Case 1: NPI only
        if npi_value and not web_value:
            similarity = fuzz.ratio(input_value.lower(), npi_value.lower()) if input_value else 0
            if similarity >= 85:
                conf = 0.95
            elif similarity >= 60:
                conf = 0.75
            else:
                conf = 0.4
            return FieldWithConfidence(
                value=npi_value,
                confidence=conf,
                note=f"{source_label} validated via NPI only",
            )

        # Case 2: Website only
        if web_value and not npi_value:
            similarity = fuzz.ratio(input_value.lower(), web_value.lower()) if input_value else 0
            if similarity >= 85:
                conf = 0.9
            elif similarity >= 60:
                conf = 0.7
            else:
                conf = 0.45
            return FieldWithConfidence(
                value=web_value,
                confidence=conf,
                note=f"{source_label} validated via website only (NPI not found)",
            )

        # Case 3: Both NPI and Website exist
        # First check agreement between NPI and website
        agreement = fuzz.ratio(npi_value.lower(), web_value.lower())
        # Then similarity of input to each
        sim_input_npi = fuzz.ratio(input_value.lower(), npi_value.lower()) if input_value else 0
        sim_input_web = fuzz.ratio(input_value.lower(), web_value.lower()) if input_value else 0

        # If NPI and website strongly agree -> trust that value heavily
        if agreement >= 85:
            chosen_val = npi_value  # or web_value, they are almost same
            conf = 0.97
            note = f"{source_label} confirmed by NPI + website"
        else:
            # They disagree: pick the one closer to input, but with lower confidence
            if sim_input_npi >= sim_input_web:
                chosen_val = npi_value
                base_conf = 0.7
                src = "NPI"
            else:
                chosen_val = web_value
                base_conf = 0.7
                src = "website"
            # degrade confidence a bit because of disagreement
            conf = base_conf - 0.2
            note = f"{source_label} disagreement between NPI and website; leaning towards {src}"

        return FieldWithConfidence(
            value=chosen_val,
            confidence=conf,
            note=note,
        )

    # ---------- main entry ----------

    def generate_output(self, result: DataValidationResult) -> ProviderOutput:
        provider: ProviderInput = result.provider_input
        npi_raw: Optional[Dict] = result.npi_raw
        website_data: Optional[Dict[str, str]] = result.website_data

        # NPI itself
        if npi_raw:
            npi_field = FieldWithConfidence(
                value=provider.npi,
                confidence=0.98,
                note="NPI found in registry",
            )
        else:
            npi_field = FieldWithConfidence(
                value=provider.npi,
                confidence=0.0,
                note="NPI not found in registry",
            )

        # Extract external values
        npi_name = self._build_name_from_npi(npi_raw) if npi_raw else None
        npi_phone = self._build_phone_from_npi(npi_raw) if npi_raw else None
        npi_address = self._build_address_from_npi(npi_raw) if npi_raw else None
        npi_spec = self._build_speciality_from_npi(npi_raw) if npi_raw else None

        web_phone = website_data.get("phone") if website_data else None
        web_address = website_data.get("address") if website_data else None
        web_spec = website_data.get("speciality") if website_data else None

        # Name: only NPI vs input for now (usually websites don’t show "Dr Full Name" cleanly)
        name_field = self._multi_source_field(
            input_value=provider.name,
            npi_value=npi_name,
            web_value=None,  # ignore website for name
            source_label="Name",
        )

        # Mobile / phone
        mobile_field = self._multi_source_field(
            input_value=provider.mobile_no,
            npi_value=npi_phone,
            web_value=web_phone,
            source_label="Phone",
        )

        # Address
        address_field = self._multi_source_field(
            input_value=provider.address,
            npi_value=npi_address,
            web_value=web_address,
            source_label="Address",
        )

        # Speciality
        speciality_field = self._multi_source_field(
            input_value=provider.speciality,
            npi_value=npi_spec,
            web_value=web_spec,
            source_label="Speciality",
        )

        return ProviderOutput(
            name=name_field,
            npi=npi_field,
            mobile_no=mobile_field,
            address=address_field,
            speciality=speciality_field,
        )
