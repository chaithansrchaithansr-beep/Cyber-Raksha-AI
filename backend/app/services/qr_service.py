import io
import re
from typing import Dict, Any, List
from PIL import Image
from pyzbar.pyzbar import decode as pyzbar_decode
from app.ml.url_classifier import url_classifier

class QrService:
    @staticmethod
    def decode_qr_image(image_bytes: bytes) -> str:
        """
        Real QR image decoder using pyzbar and Pillow.
        Extracts encoded payload from uploaded PNG/JPEG/WEBP image.
        Raises ValueError with clear message if no QR code can be decoded.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB or L if needed for barcode reader
            if image.mode not in ('L', 'RGB'):
                image = image.convert('RGB')
        except Exception as e:
            raise ValueError(f"Invalid image format or corrupt file: {str(e)}")

        decoded_objects = pyzbar_decode(image)
        if not decoded_objects:
            raise ValueError("No readable QR code found in the uploaded image. Please ensure the QR code is clear, well-focused, and uncorrupted.")

        # Take first detected QR code payload
        qr_data = decoded_objects[0].data.decode('utf-8', errors='replace').strip()
        if not qr_data:
            raise ValueError("The detected QR code payload was empty.")
        return qr_data

    @staticmethod
    def analyze_qr_payload(payload: str) -> Dict[str, Any]:
        cleaned = payload.strip()
        is_url = bool(re.match(r'^(?:https?://|www\.)', cleaned, re.IGNORECASE))
        is_upi = cleaned.lower().startswith("upi://pay")

        indicators = []
        if is_upi:
            # UPI Intent QR
            indicators.append("UPI Payment Intent Payload detected")
            if "pa=" in cleaned.lower():
                # Extract VPA
                match = re.search(r'pa=([^&]+)', cleaned, re.IGNORECASE)
                vpa = match.group(1) if match else "Unknown"
                indicators.append(f"Target Payee VPA: {vpa}")
            
            # Check for suspicious parameters
            if "am=" in cleaned.lower():
                match = re.search(r'am=([^&]+)', cleaned, re.IGNORECASE)
                amount = match.group(1) if match else "0"
                indicators.append(f"Hardcoded debit amount: Rs {amount}")

            risk_score = 45.0
            confidence = 88.0
            classification = "MODERATE RISK"
            explanation = "This QR code initiates a direct UPI payment debit. Verify the merchant name and VPA before entering your UPI PIN."
            destination = cleaned
        elif is_url:
            prob, url_indicators, features = url_classifier.predict(cleaned)
            risk_score = round(prob * 100, 1)
            confidence = 90.0
            indicators = url_indicators
            destination = cleaned
            
            if risk_score >= 76.0:
                classification = "CRITICAL RISK"
                explanation = "QR code redirects directly to a high-risk phishing destination designed to harvest credentials or install malicious APKs."
            elif risk_score >= 51.0:
                classification = "HIGH RISK"
                explanation = "Destination URL exhibits strong phishing indicators and lookalike domain structure."
            elif risk_score >= 26.0:
                classification = "MODERATE RISK"
                explanation = "Destination URL contains potential tracking redirects or unusual domain patterns."
            else:
                classification = "LOW RISK"
                explanation = "QR code destination appears to be a standard legitimate URL."
        else:
            destination = cleaned[:100]
            risk_score = 20.0
            confidence = 80.0
            classification = "LOW RISK"
            indicators.append("Plain text / Non-URL payload")
            explanation = "QR payload does not contain an executable link or immediate financial intent."

        return {
            "destination": destination,
            "is_url": is_url,
            "is_upi": is_upi,
            "risk_score": risk_score,
            "confidence": confidence,
            "classification": classification,
            "indicators": indicators,
            "explanation": explanation,
            "analysis_method": "QR Protocol & Destination Analyzer"
        }

qr_service = QrService()
