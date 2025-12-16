from agents.document_extraction_agent import DocumentExtractionAgent
from dotenv import load_dotenv
load_dotenv()


if __name__ == "__main__":
    agent = DocumentExtractionAgent()

    with open("providers_test.pdf", "rb") as f:
        pdf_bytes = f.read()

    providers = agent.extract_providers_from_pdf(pdf_bytes)

    print(f"Extracted {len(providers)} providers\n")

    for p in providers[:5]:
        print(p)
