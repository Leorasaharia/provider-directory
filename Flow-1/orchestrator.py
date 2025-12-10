# orchestrator.py
from typing import List
from concurrent.futures import ThreadPoolExecutor, as_completed

from models import ProviderInput, ProviderOutput, ProviderReport
from agents.data_validation_agent import DataValidationAgent
from agents.quality_assurance_agent import QualityAssuranceAgent
from agents.directory_management_agent import DirectoryManagementAgent


class Flow1Orchestrator:
    """
    Orchestrates Flow-1 for one or many providers:
    ProviderInput -> DataValidationAgent -> QAAgent -> DirectoryAgent

    For speed, run_batch() uses a ThreadPoolExecutor so that NPI API calls
    (and optional website scraping) happen in parallel.
    """

    def __init__(self) -> None:
        self.dv_agent = DataValidationAgent()
        self.qa_agent = QualityAssuranceAgent()
        self.dir_agent = DirectoryManagementAgent()

    def run_for_provider(self, provider: ProviderInput) -> ProviderReport:
        """
        Run the full Flow-1 pipeline for a single provider (sequential).
        """
        dv_result = self.dv_agent.validate_provider(provider)
        output: ProviderOutput = self.qa_agent.generate_output(dv_result)
        report: ProviderReport = self.dir_agent.summarize_provider(provider, output)
        return report

    def run_batch(
        self,
        providers: List[ProviderInput],
        max_workers: int = 8,
    ) -> List[ProviderReport]:
        """
        Run Flow-1 for many providers in parallel.

        - max_workers controls how many providers are processed concurrently.
        - Because this is I/O-bound (NPI API + HTTP), threads give a big speedup.
        - We preserve the original order of providers in the returned list.
        """
        if not providers:
            return []

        # Pre-allocate list to preserve order
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
                    rep = future.result()
                    reports[idx] = rep
                except Exception as e:
                    provider = providers[idx]
                    print(f"[Flow1Orchestrator] Error processing provider {provider.npi}: {e}")

        # Filter out any None in case of unexpected errors
        return [r for r in reports if r is not None]

    def build_review_queue(self, reports: List[ProviderReport]) -> List[ProviderReport]:
        """
        Return providers that need human review, sorted by priority.
        """
        return self.dir_agent.prioritized_review_queue(reports)
