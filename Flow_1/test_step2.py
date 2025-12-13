# test_step2.py
from data_loader import load_providers_from_csv
from agents.data_validation_agent import DataValidationAgent

if __name__ == "__main__":
    csv_path = "data/providers_synthetic.csv"
    providers = load_providers_from_csv(csv_path)

    print(f"Loaded {len(providers)} providers from CSV.")

    agent = DataValidationAgent()

    for p in providers[:10]:  # test a few
        print("\n--- Provider ---")
        print(p)
        result = agent.validate_provider(p)
        if result.npi_raw:
            basic = result.npi_raw.get("basic", {})
            addresses = result.npi_raw.get("addresses", [])
            print("Matched NPI name:", basic.get("first_name"), basic.get("last_name"))
            if addresses:
                print("Matched NPI address:", addresses[0].get("address_1"), addresses[0].get("city"))
        else:
            print("No NPI result found for this provider.")
