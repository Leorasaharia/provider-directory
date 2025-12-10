# npi_client.py
from typing import Optional, Dict

import requests

NPI_BASE_URL = "https://npiregistry.cms.hhs.gov/api/"

# Reuse a single session for all requests (connection pooling, less overhead)
_session = requests.Session()


def query_npi_by_number(npi: str) -> Optional[Dict]:
    """
    Call CMS NPI Registry API by NPI number.
    Returns the first result dict if found, otherwise None.
    """
    params = {
        "version": "2.1",
        "number": npi.strip(),
    }

    try:
        resp = _session.get(NPI_BASE_URL, params=params, timeout=6)
        resp.raise_for_status()
        data = resp.json()
        results = data.get("results", [])
        if not results:
            return None
        return results[0]
    except Exception as e:
        print(f"[NPI ERROR] for NPI {npi}: {e}")
        return None
