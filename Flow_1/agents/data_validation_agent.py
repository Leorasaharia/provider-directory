# agents/data_validation_agent.py
from typing import Optional
# agents/data_validation_agent.py
from models import ProviderInput, DataValidationResult
from npi_client import query_npi_by_number
from website_scraper import scrape_practice_site

# TEMP: map real NPIs to their known practice website URLs for demo
PRACTICE_WEBSITES = {
    "1053395590": "https://www.findatopdoc.com/doctor/1449207-Joseph-Aaron-chiropractor-Renton-WA-98056",
    "1144297730": "https://www.medifind.com/doctors/jose-s-abad-santos/9737113",
    "1063484491": "https://www.providerrankings.com/gordon-abrams-1063484491",
    # Add entries for the real NPIs you are using
}

class DataValidationAgent:
    """
    Now:
    - Calls NPI Registry API
    - Optionally scrapes provider practice website (if we know the URL)
    """

    def validate_provider(self, provider: ProviderInput) -> DataValidationResult:
        npi_data = None
        website_data = None

        if provider.npi:
            npi_data = query_npi_by_number(provider.npi)

        # Look up practice website by NPI (for demo)
        practice_url = PRACTICE_WEBSITES.get(provider.npi)
        if practice_url:
            website_data = scrape_practice_site(practice_url)

        return DataValidationResult(
            provider_input=provider,
            npi_raw=npi_data,
            website_data=website_data,
        )

