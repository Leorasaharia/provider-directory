import json

# test_step3.py
from data_loader import load_providers_from_csv
from agents.data_validation_agent import DataValidationAgent
from agents.quality_assurance_agent import QualityAssuranceAgent

if __name__ == "__main__":
    csv_path = "data/providers_synthetic.csv"
    providers = load_providers_from_csv(csv_path)
    print(f"Loaded {len(providers)} providers from CSV.")

    dv_agent = DataValidationAgent()
    qa_agent = QualityAssuranceAgent()

    for p in providers[:5]:
        print("\n=== Provider Input ===")
        print(p)

        # Step 2: NPI lookup
        dv_result = dv_agent.validate_provider(p)

        if dv_result.npi_raw:
            print("NPI data found for this provider.")
        else:
            print("No NPI data found for this provider; using input with lower confidence.")

        # Step 3: QA merge into final output
        output = qa_agent.generate_output(dv_result)

        print("=== Provider Output (with confidence) ===")

        print(json.dumps(output.model_dump(), indent=2))

