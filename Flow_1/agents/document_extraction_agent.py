# agents/document_extraction_agent.py
import os
import json
from typing import List, Optional

from models import ProviderInput

try:
    import google.generativeai as genai
except ImportError:
    genai = None


class DocumentExtractionAgent:
    """
    Uses Gemini Pro Vision to extract structured provider records from a PDF.

    PDF (unstructured) → Gemini Vision → JSON → ProviderInput[]
    Then fed into the normal Flow-1 pipeline (same as CSV).
    """

    def __init__(self) -> None:
        self._llm_ready = False
        self._model = None

        api_key = os.getenv("GEMINI_API_KEY")
        if api_key and genai is not None:
            try:
                genai.configure(api_key=api_key)
                # Using Flash model for better free tier support, still supports vision/PDFs
                self._model = genai.GenerativeModel("gemini-2.5-flash")
                self._llm_ready = True
                print("[DocumentExtractionAgent] Gemini Flash configured.")
            except Exception as e:
                print(f"[DocumentExtractionAgent] Failed to configure Gemini: {e}")
        else:
            print("[DocumentExtractionAgent] Gemini not available or API key missing.")

    def extract_providers_from_pdf(self, pdf_bytes: bytes) -> List[ProviderInput]:
        if not self._llm_ready or not self._model:
            return []

        prompt = """
You are assisting a healthcare payer with provider directory cleanup.

You will receive a PDF that may contain provider rosters, credentialing forms,
or scanned documents.

Extract a list of individual providers.

STRICT RULES:
- Return ONLY valid JSON
- Return an ARRAY of objects
- Do NOT guess or infer NPIs
- If a field is missing, return an empty string ""

Each object MUST have:
- name (string, required)
- npi (string, may be empty)
- mobile_no (string, may be empty)
- address (string, may be empty)
- speciality (string, may be empty)
- member_impact (integer 1–5, default 3 if unclear)

Return ONLY the JSON array. No markdown. No explanation.
""".strip()

        try:
            response = self._model.generate_content(
                [
                    {"mime_type": "application/pdf", "data": pdf_bytes},
                    prompt,
                ]
            )

            text = getattr(response, "text", None)
            if not text:
                return []

            json_str = self._extract_json(text)
            if not json_str:
                return []

            raw = json.loads(json_str)
            if not isinstance(raw, list):
                return []

            providers: List[ProviderInput] = []

            for item in raw[:200]:  # safety cap
                if not isinstance(item, dict):
                    continue

                name = (item.get("name") or "").strip()
                if not name:
                    continue

                providers.append(
                    ProviderInput(
                        name=name,
                        npi=(item.get("npi") or "").strip(),
                        mobile_no=(item.get("mobile_no") or "").strip(),
                        address=(item.get("address") or "").strip(),
                        speciality=(item.get("speciality") or "").strip(),
                        member_impact=int(item.get("member_impact", 3)),
                    )
                )

            return providers

        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                print(f"[DocumentExtractionAgent] API quota/rate limit exceeded. Please check your Google AI Studio quota or wait before retrying.")
                print(f"Error details: {error_msg[:200]}...")
            elif "404" in error_msg:
                print(f"[DocumentExtractionAgent] Model not found. Please check if the model name is correct.")
            else:
                print(f"[DocumentExtractionAgent] PDF extraction error: {e}")
            return []

    def _extract_json(self, text: str) -> Optional[str]:
        text = text.strip()

        if text.startswith("```"):
            lines = text.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines)

        start, end = text.find("["), text.rfind("]")
        if start == -1 or end == -1 or end <= start:
            return None

        return text[start : end + 1]
