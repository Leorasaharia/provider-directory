# data_loader.py
import csv
from typing import List

from models import ProviderInput


def load_providers_from_csv(path: str) -> List[ProviderInput]:
    providers: List[ProviderInput] = []

    with open(path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # member_impact is optional – default to 3 if missing/bad
            raw_impact = (row.get("member_impact") or "3").strip()
            try:
                member_impact = int(raw_impact)
            except ValueError:
                member_impact = 3

            provider = ProviderInput(
                name=row["name"].strip(),
                npi=row["npi"].strip(),
                mobile_no=row["mobile_no"].strip(),
                address=row["address"].strip(),
                speciality=row["speciality"].strip(),
                member_impact=member_impact,
            )
            providers.append(provider)

    return providers
