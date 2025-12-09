# orchestrator.py
from typing import List

from models import ProviderInput, ProviderOutput, ProviderReport
from agents.data_validation_agent import DataValidationAgent
from agents.quality_assurance_agent import QualityAssuranceAgent
from agents.directory_management_agent import DirectoryManagementAgent


class Flow1Orchestrator:
    """
    Orchestrates Flow-1 for one or many providers:
    ProviderInput -> DataValidationAgent -> QAAgent -> DirectoryAgent
    """

    def __init__(self) -> None:
        self.dv_agent = DataValidationAgent()
        self.qa_agent = QualityAssuranceAgent()
        self.dir_agent = DirectoryManagementAgent()

    def run_for_provider(self, provider: ProviderInput) -> ProviderReport:
        dv_result = self.dv_agent.validate_provider(provider)
        output: ProviderOutput = self.qa_agent.generate_output(dv_result)
        report: ProviderReport = self.dir_agent.summarize_provider(provider, output)
        return report

    def run_batch(self, providers: List[ProviderInput]) -> List[ProviderReport]:
        return [self.run_for_provider(p) for p in providers]

    def build_review_queue(self, reports: List[ProviderReport]) -> List[ProviderReport]:
        return self.dir_agent.prioritized_review_queue(reports)
