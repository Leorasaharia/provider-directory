# agents/directory_management_agent.py
from typing import List

from models import ProviderInput, ProviderOutput, ProviderReport


class DirectoryManagementAgent:
    """
    Takes ProviderInput + ProviderOutput and generates:
    - Overall status per provider
    - Reasons (confirmed updates, discrepancies, manual review flags)
    """

    def _field_changed(self, original: str, final: str) -> bool:
        return (original or "").strip() != (final or "").strip()

    def summarize_provider(self, provider: ProviderInput, output: ProviderOutput) -> ProviderReport:
        reasons: List[str] = []

        # Check NPI lookup result from note
        npi_note = output.npi.note or ""
        if "not found" in npi_note.lower():
            reasons.append("NPI not found in registry")

        # For each field, see if it changed and what confidence is
        # Name
        if self._field_changed(provider.name, output.name.value):
            reasons.append(f"Name updated (confidence={output.name.confidence:.2f}; note={output.name.note})")

        # Mobile
        if self._field_changed(provider.mobile_no, output.mobile_no.value):
            reasons.append(f"Phone updated (confidence={output.mobile_no.confidence:.2f}; note={output.mobile_no.note})")

        # Address
        if self._field_changed(provider.address, output.address.value):
            reasons.append(f"Address updated (confidence={output.address.confidence:.2f}; note={output.address.note})")

        # Speciality
        if self._field_changed(provider.speciality, output.speciality.value):
            reasons.append(f"Speciality updated (confidence={output.speciality.confidence:.2f}; note={output.speciality.note})")

        # Decide status based on confidence & notes
        status = "confirmed"

        # If NPI not found -> needs review
        if "NPI not found" in (npi_note or ""):
            status = "needs_review"

        # If any field has low confidence (< 0.6) or disagreement notes -> needs_review
        low_conf = any(
            f.confidence < 0.6
            for f in [
                output.name,
                output.mobile_no,
                output.address,
                output.speciality,
            ]
        )
        if low_conf:
            status = "needs_review"

        # If there are changes but not low-confidence / NPI-missing -> updated
        if status == "confirmed" and reasons:
            status = "updated"

        # If no reasons and high confidences everywhere -> confirmed
        if not reasons and status == "confirmed":
            reasons.append("All fields validated; no changes required")

            # --- data risk score based on confidences and notes ---
        data_risk_score = 0.0

        # NPI missing is a big risk
        if "not found" in (output.npi.note or "").lower():
            data_risk_score += 5.0

        # low-confidence fields add risk
        for field in [output.name, output.mobile_no, output.address, output.speciality]:
            if field.confidence < 0.4:
                data_risk_score += 2.0
            elif field.confidence < 0.6:
                data_risk_score += 1.0

            if field.note and "disagreement" in field.note.lower():
                data_risk_score += 2.0

            # member impact from input (1–5)
            impact = provider.member_impact

            # weight: 0.6 for member impact, 0.4 for data risk (tweak as you like)
            priority_score = 0.6 * impact + 0.4 * data_risk_score

            # map to priority level
            if priority_score >= 7:
                priority_level = "HIGH"
            elif priority_score >= 4:
                priority_level = "MEDIUM"
            else:
                priority_level = "LOW"

        
        return ProviderReport(
            provider_input=provider,
            provider_output=output,
            status=status,
            reasons=reasons,
            priority_score=priority_score if status == "needs_review" else 0.0,
            priority_level=priority_level if status == "needs_review" else "NONE",
        )

    def summarize_batch(
        self, providers: List[ProviderInput], outputs: List[ProviderOutput]
    ) -> List[ProviderReport]:
        reports: List[ProviderReport] = []
        for provider, output in zip(providers, outputs):
            reports.append(self.summarize_provider(provider, output))
        return reports

    def prioritized_review_queue(self, reports: List[ProviderReport]) -> List[ProviderReport]:
        # Filter only needs_review
        review = [r for r in reports if r.status == "needs_review"]
        # Sort descending by priority_score
        review.sort(key=lambda r: r.priority_score, reverse=True)
        return review
