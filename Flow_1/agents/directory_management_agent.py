# agents/directory_management_agent.py
from typing import List

from models import ProviderInput, ProviderOutput, ProviderReport


class DirectoryManagementAgent:
    """
    Generates:
    - Overall provider status
    - Human-readable reasons
    - Priority score and level for manual review
    """

    def _field_changed(self, original: str, final: str) -> bool:
        return (original or "").strip() != (final or "").strip()

    def summarize_provider(
        self, provider: ProviderInput, output: ProviderOutput
    ) -> ProviderReport:
        reasons: List[str] = []

        # --- NPI status ---
        npi_missing = "not found" in (output.npi.note or "").lower()
        if npi_missing:
            reasons.append("NPI not found in registry")

        # --- Field-level changes ---
        if self._field_changed(provider.name, output.name.value):
            reasons.append(
                f"Name updated (confidence={output.name.confidence:.2f}; note={output.name.note})"
            )

        if self._field_changed(provider.mobile_no, output.mobile_no.value):
            reasons.append(
                f"Phone updated (confidence={output.mobile_no.confidence:.2f}; note={output.mobile_no.note})"
            )

        if self._field_changed(provider.address, output.address.value):
            reasons.append(
                f"Address updated (confidence={output.address.confidence:.2f}; note={output.address.note})"
            )

        if self._field_changed(provider.speciality, output.speciality.value):
            reasons.append(
                f"Speciality updated (confidence={output.speciality.confidence:.2f}; note={output.speciality.note})"
            )

        # --- Determine status ---
        status = "confirmed"

        low_confidence = any(
            f.confidence < 0.6
            for f in [output.name, output.mobile_no, output.address, output.speciality]
        )

        if npi_missing or low_confidence:
            status = "needs_review"
        elif reasons:
            status = "updated"

        if not reasons and status == "confirmed":
            reasons.append("All fields validated; no changes required")

        # --- Risk scoring (independent of status) ---
        data_risk_score = 0.0

        if npi_missing:
            data_risk_score += 5.0

        for field in [output.name, output.mobile_no, output.address, output.speciality]:
            if field.confidence < 0.4:
                data_risk_score += 2.0
            elif field.confidence < 0.6:
                data_risk_score += 1.0

            if field.note and "disagreement" in field.note.lower():
                data_risk_score += 2.0

        # --- Priority (only relevant for needs_review) ---
        priority_score = 0.0
        priority_level = "NONE"

        if status == "needs_review":
            impact = provider.member_impact  # 1–5
            priority_score = 0.6 * impact + 0.4 * data_risk_score

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
            priority_score=priority_score,
            priority_level=priority_level,
        )

    def summarize_batch(
        self, providers: List[ProviderInput], outputs: List[ProviderOutput]
    ) -> List[ProviderReport]:
        return [
            self.summarize_provider(p, o)
            for p, o in zip(providers, outputs)
        ]

    def prioritized_review_queue(
        self, reports: List[ProviderReport]
    ) -> List[ProviderReport]:
        review = [r for r in reports if r.status == "needs_review"]
        return sorted(review, key=lambda r: r.priority_score, reverse=True)
