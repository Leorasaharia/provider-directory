# npi_client.py
import requests
from typing import Optional, Dict

NPI_BASE_URL = "https://npiregistry.cms.hhs.gov/api/"

def query_npi_by_number(npi: str) -> Optional[Dict]:
    """
    Call the CMS NPI Registry API by NPI number.
    Returns the first result dict if found, otherwise None.
    """
    params = {
        "version": "2.1",
        "number": npi.strip()
    }

    try:
        resp = requests.get(NPI_BASE_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        # NPI API returns 'results' list when found
        results = data.get("results", [])
        if not results:
            return None

        return results[0]  # first matching provider
    except Exception as e:
        print(f"[NPI ERROR] for NPI {npi}: {e}")
        return None
