# test_step4.py
from data_loader import load_providers_from_csv
from agents.data_validation_agent import DataValidationAgent
from agents.quality_assurance_agent import QualityAssuranceAgent
from agents.directory_management_agent import DirectoryManagementAgent
import json

if __name__ == "__main__":
    csv_path = "data/providers_synthetic.csv"
    providers = load_providers_from_csv(csv_path)
    print(f"Loaded {len(providers)} providers from CSV.")

    dv_agent = DataValidationAgent()
    qa_agent = QualityAssuranceAgent()
    dir_agent = DirectoryManagementAgent()

    outputs = []
    # you can increase this later (e.g. providers[:50] or all providers)
    selected_providers = providers[:10]  # just test on first 10

    # --- run validation + QA for each selected provider ---
    for p in selected_providers:
        dv_result = dv_agent.validate_provider(p)
        qa_output = qa_agent.generate_output(dv_result)
        outputs.append(qa_output)

    # --- build directory reports (status + reasons + priority fields) ---
    reports = dir_agent.summarize_batch(selected_providers, outputs)

    print("\n=== VALIDATION REPORT (PER PROVIDER) ===\n")
    for rep in reports:
        print(f"Provider: {rep.provider_input.name} (NPI: {rep.provider_input.npi})")
        print(f"Status : {rep.status}")
        # if you added member_impact to ProviderInput, you can also show it:
        try:
            print(f"Member Impact : {rep.provider_input.member_impact}")
        except AttributeError:
            # member_impact not yet added, ignore
            pass
        # priority fields (may be 0 / 'NONE' for confirmed/updated)
        try:
            print(f"Priority: {rep.priority_level} (score={rep.priority_score:.2f})")
        except AttributeError:
            # priority fields not yet added, ignore
            pass

        print("Reasons:")
        for r in rep.reasons:
            print(f"  - {r}")
        print("Final fields:")
        print(json.dumps(rep.provider_output.model_dump(), indent=2))
        print("-" * 60)

    # --- HUMAN REVIEW QUEUE (sorted by priority) ---
    # this assumes DirectoryManagementAgent has a prioritized_review_queue() method
    try:
        review_queue = dir_agent.prioritized_review_queue(reports)

        print("\n=== HUMAN REVIEW QUEUE (NEEDS REVIEW, SORTED BY PRIORITY) ===\n")
        if not review_queue:
            print("No providers currently require human review.")
        else:
            for rep in review_queue:
                print(
                    f"{rep.provider_input.name} "
                    f"(NPI: {rep.provider_input.npi}) | "
                    f"Priority: {rep.priority_level} "
                    f"(score={rep.priority_score:.2f})"
                )
                for r in rep.reasons:
                    print(f"  - {r}")
                print("-" * 40)
    except AttributeError:
        # prioritized_review_queue not implemented yet
        print("\n[INFO] prioritized_review_queue() not implemented on DirectoryManagementAgent yet.")
