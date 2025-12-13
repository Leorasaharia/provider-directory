# agents/llm_explanation_agent.py
from models import ProviderReport


class LLMExplanationAgent:
    """
    RULE-BASED explanation agent for Workflow-1.

    NOTE:
    - No LLM calls are made here.
    - This is intentional to ensure scalability, cost control,
      and deterministic behavior.
    - LLMs are reserved for unstructured document extraction only.
    """

    def explain(self, report: ProviderReport) -> str:
        if report.status != "needs_review":
            return (
                "No manual review required. Provider information met "
                "confidence thresholds across validated data sources."
            )

        explanations = []

        for reason in report.reasons:
            r = reason.lower()

            if "npi" in r:
                explanations.append(
                    "• NPI could not be confidently verified in the public registry. "
                    "Confirm provider identity and active enrollment status."
                )

            elif "address" in r:
                explanations.append(
                    "• Address information is inconsistent across sources. "
                    "Verify the provider’s current practice location."
                )

            elif "phone" in r or "mobile" in r:
                explanations.append(
                    "• Contact number appears outdated or mismatched. "
                    "Confirm the correct phone number for patient access."
                )

            elif "speciality" in r:
                explanations.append(
                    "• Speciality information does not align with public records. "
                    "Validate the provider’s primary taxonomy."
                )

            else:
                explanations.append(f"• {reason}")

        explanations.append(
            "• Recommended action: Perform targeted manual verification or "
            "provider outreach before updating member-facing directories."
        )

        return "\n".join(explanations)
