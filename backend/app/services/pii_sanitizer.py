import re
from typing import Tuple, List

class PiiSanitizer:
    @staticmethod
    def sanitize(text: str) -> Tuple[str, List[str]]:
        sanitized = text
        detected = []

        # 1. Mask Credit / Debit Card Numbers FIRST (16 digits with spaces or hyphens)
        card_pattern = r'\b(\d{4})[\s-](\d{4})[\s-](\d{4})[\s-](\d{4})\b'
        if re.search(card_pattern, sanitized):
            detected.append("Payment Card")
            sanitized = re.sub(card_pattern, r'****-****-****-\4', sanitized)

        # 2. Mask Aadhaar Numbers (12 digits, exactly 3 blocks of 4 digits)
        aadhaar_pattern = r'\b(\d{4})[\s-](\d{4})[\s-](\d{4})\b'
        if re.search(aadhaar_pattern, sanitized):
            detected.append("Aadhaar Number")
            sanitized = re.sub(aadhaar_pattern, r'XXXX-XXXX-\3', sanitized)

        # 3. Mask 10-digit Indian Mobile Numbers (with or without +91 / 0)
        phone_pattern = r'(?:(?:\+|0{0,2})91[\s-]?)?([6-9]\d{2})[\s-]?(\d{3})[\s-]?(\d{4})\b'
        if re.search(phone_pattern, sanitized):
            detected.append("Phone Number")
            sanitized = re.sub(phone_pattern, r'+91 \1*** **\3', sanitized)

        # 4. Mask PAN Card Numbers (5 uppercase letters, 4 digits, 1 letter)
        pan_pattern = r'\b([A-Z]{5})(\d{4})([A-Z])\b'
        if re.search(pan_pattern, sanitized):
            detected.append("PAN Card Number")
            sanitized = re.sub(pan_pattern, r'\1****\3', sanitized)

        # 5. Mask Email Addresses
        email_pattern = r'\b([a-zA-Z0-9_.+-])[a-zA-Z0-9_.+-]*([a-zA-Z0-9_.+-])@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b'
        if re.search(email_pattern, sanitized):
            detected.append("Email Address")
            sanitized = re.sub(email_pattern, r'\1***\2@\3', sanitized)

        # 6. Mask OTPs (4-6 digits preceded by OTP/code/verification/pin)
        otp_pattern = r'(?i)(?:otp|code|verification\s*code|one\s*time\s*password)\D{0,10}\b(\d{4,8})\b'
        if re.search(otp_pattern, sanitized):
            detected.append("One-Time Password (OTP)")
            sanitized = re.sub(otp_pattern, r'OTP: [REDACTED OTP]', sanitized)

        # 7. Mask Passwords / Credentials
        pwd_pattern = r'(?i)(?:password|pwd|passcode)\s*[:=]\s*([^\s,]+)'
        if re.search(pwd_pattern, sanitized):
            detected.append("Password / Credential")
            sanitized = re.sub(pwd_pattern, r'password: [REDACTED PASSWORD]', sanitized)

        # 8. Mask Bank Account Numbers (9 to 18 digits following a/c or account)
        ac_pattern = r'(?i)(?:a/c|account(?:\s*no|\s*number)?)\D{0,6}(\d{4,18})\b'
        if re.search(ac_pattern, sanitized):
            detected.append("Bank Account Number")
            sanitized = re.sub(ac_pattern, lambda m: f"A/C: *******{m.group(1)[-4:]}" if len(m.group(1)) >= 4 else "A/C: [REDACTED]", sanitized)

        return sanitized, list(set(detected))

pii_sanitizer = PiiSanitizer()
