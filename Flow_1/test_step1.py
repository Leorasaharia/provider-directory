# test_step1.py
from data_loader import load_providers_from_csv

if __name__ == "__main__":
    providers = load_providers_from_csv("data/providers_synthetic.csv")
    print(f"Loaded {len(providers)} providers.")
    for p in providers[:5]:
        print(p)
