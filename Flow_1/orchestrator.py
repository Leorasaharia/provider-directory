# orchestrator.py
from typing import List
from concurrent.futures import ThreadPoolExecutor, as_completed

from models import ProviderInput, ProviderOutput, ProviderReport, FieldWithConfidence
from agents.data_validation_agent import DataValidationAgent
from agents.quality_assurance_agent import QualityAssuranceAgent
from agents.directory_management_agent import DirectoryManagementAgent
from agents.llm_explanation_agent import LLMExplanationAgent


class Flow1Orchestrator:
    """
    Orchestrates Flow-1 for one or many providers:
    ProviderInput
      -> DataValidationAgent
      -> QualityAssuranceAgent
      -> DirectoryManagementAgent
      -> ExplanationAgent (rule-based in Workflow-1)

    Designed for I/O-bound workloads (NPI API, scraping).
    Uses thread-based parallelism for speed.
    """

    def __init__(self) -> None:
        self.dv_agent = DataValidationAgent()
        self.qa_agent = QualityAssuranceAgent()
        self.dir_agent = DirectoryManagementAgent()

        # NOTE: In Workflow-1 this agent is RULE-BASED (no LLM calls)
        self.llm_agent = LLMExplanationAgent()

    def run_for_provider(self, provider: ProviderInput) -> ProviderReport:
        """
        Run Flow-1 for a single provider (sequential).
        """
        # 1) Validate provider data (NPI + public sources)
        dv_result = self.dv_agent.validate_provider(provider)

        # 2) Consolidate and score fields
        output: ProviderOutput = self.qa_agent.generate_output(dv_result)

        # 3) Determine status, reasons, and priority
        report: ProviderReport = self.dir_agent.summarize_provider(provider, output)

        # 4) Generate human-readable explanation (rule-based)
        report.llm_explanation = self.llm_agent.explain(report)

        return report

    def run_batch(
        self,
        providers: List[ProviderInput],
        max_workers: int = 8,
    ) -> List[ProviderReport]:
        """
        Run Flow-1 for many providers in parallel.

        - Uses threads because the workload is I/O-bound.
        - Preserves input order in output.
        """
        if not providers:
            return []

        reports: List[ProviderReport] = [None] * len(providers)  # type: ignore

        def task(index: int, provider: ProviderInput) -> ProviderReport:
            return self.run_for_provider(provider)

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_index = {
                executor.submit(task, idx, p): idx
                for idx, p in enumerate(providers)
            }

            for future in as_completed(future_to_index):
                idx = future_to_index[future]
                try:
                    reports[idx] = future.result()
                except Exception as e:
                    provider = providers[idx]
                    print(
                        "[Flow1Orchestrator] Error processing provider "
                        f"{provider.name} (NPI: {provider.npi}): {e}"
                    )
                    # Create a failed report instead of None to preserve the provider
                    failed_output = ProviderOutput(
                        name=FieldWithConfidence(value=provider.name, confidence=0.0, note="Processing error"),
                        npi=FieldWithConfidence(value=provider.npi, confidence=0.0, note="Processing error"),
                        mobile_no=FieldWithConfidence(value=provider.mobile_no, confidence=0.0, note="Processing error"),
                        address=FieldWithConfidence(value=provider.address, confidence=0.0, note="Processing error"),
                        speciality=FieldWithConfidence(value=provider.speciality, confidence=0.0, note="Processing error"),
                    )
                    reports[idx] = ProviderReport(
                        provider_input=provider,
                        provider_output=failed_output,
                        status="needs_review",
                        reasons=[f"Processing error: {str(e)[:100]}"],
                        priority_score=1.0,
                        priority_level="HIGH",
                    )

        # Return all reports (no longer filtering None - all should have reports now)
        return reports

    def build_review_queue(self, reports: List[ProviderReport]) -> List[ProviderReport]:
        """
        Return providers that need human review, sorted by priority.
        """
        return self.dir_agent.prioritized_review_queue(reports)
