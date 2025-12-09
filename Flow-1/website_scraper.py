# website_scraper.py
from typing import Dict, Optional
import re

import requests
from bs4 import BeautifulSoup


def scrape_practice_site(url: str) -> Optional[Dict[str, str]]:
    """
    Simple heuristic scraper for a provider practice website.

    Returns dict possibly containing:
      - "phone"
      - "address"
      - "speciality"
    or None if nothing usable was found.
    """
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"[SCRAPER] Failed to fetch {url}: {e}")
        return None

    soup = BeautifulSoup(resp.text, "lxml")
    text = soup.get_text(separator="\n")
    text_lower = text.lower()

    # speciality guess
    speciality = None
    for spec in [
        "cardiology", "dermatology", "neurology", "pediatrics",
        "family medicine", "internal medicine", "orthopedics",
        "ophthalmology", "endocrinology", "gastroenterology",
    ]:
        if spec in text_lower:
            speciality = spec.title()
            break

    # phone guess
    phone_match = re.search(r'\+?\d[\d\-\s\(\)]{7,}', text)
    phone = phone_match.group(0).strip() if phone_match else None

    # address guess: first line that looks address-ish
    address = None
    for line in text.splitlines():
        if any(tag in line for tag in ["Street", "St", "Ave", "Avenue", "Road", "Rd", "Blvd", "Drive", "Dr"]):
            cleaned = line.strip()
            if len(cleaned) > 10:
                address = cleaned
                break

    result: Dict[str, str] = {}
    if phone:
        result["phone"] = phone
    if address:
        result["address"] = address
    if speciality:
        result["speciality"] = speciality

    return result or None
