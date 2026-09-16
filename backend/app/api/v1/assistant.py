import re
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter(prefix="/assistant", tags=["AI Cyber Safety Assistant"])

class ChatMessage(BaseModel):
    role: str # user, assistant
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    category: str
    suggested_actions: List[str]
    emergency_contacts: List[str]

OFFENSIVE_PROMPTS = [
    r"how\s*to\s*hack", r"create\s*malware", r"steal\s*password", r"ddos\s*attack",
    r"crack\s*wifi", r"bypass\s*otp", r"keylogger", r"trojan", r"ransomware\s*code",
    r"exploit\s*vulnerability\s*on"
]

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(req: ChatRequest):
    query = req.message.lower()

    # 1. Defensive Guardrail: Refuse offensive exploitation requests
    for pattern in OFFENSIVE_PROMPTS:
        if re.search(pattern, query):
            return ChatResponse(
                reply=(
                    "🛡️ **Defensive Policy Notice**: CYBER RAKSHA AI operates exclusively as a defensive cybersecurity platform. "
                    "I cannot assist with hacking, exploiting unauthorized systems, cracking passwords, or generating malicious software.\n\n"
                    "I can, however, help you **defend against these attacks**, configure robust Multi-Factor Authentication (MFA), "
                    "or audit your authorized digital assets for security hygiene."
                ),
                category="policy_refusal",
                suggested_actions=[
                    "Learn defensive password best practices",
                    "Understand how to secure personal devices",
                    "Review Cyber Awareness Academy modules"
                ],
                emergency_contacts=["National Cyber Helpline: 1930"]
            )

    # 2. Intelligent Contextual Responses for Common Indian Cyber Safety Queries
    if "clicked" in query and ("link" in query or "phishing" in query):
        reply = (
            "🚨 **Immediate Incident Containment Steps for Clicking a Suspicious Link:**\n\n"
            "1. **Disconnect from the Network**: Immediately turn on Airplane mode or disconnect Wi-Fi to stop background data transfer.\n"
            "2. **Do Not Enter Any Information**: If the page asks for passwords, PINs, or OTPs, do NOT type anything.\n"
            "3. **Change Crucial Passwords**: Using another secure device, immediately change passwords for your primary email, net banking, and UPI apps.\n"
            "4. **Monitor Financial Accounts**: Check your bank statements for unauthorized debit mandates.\n"
            "5. **Run Antivirus / Anti-Malware Scan**: Scan your device to ensure no malicious APK or script was downloaded.\n"
            "6. **Report Immediately**: Call the National Cyber Helpline at **1930** or log a complaint at **cybercrime.gov.in**."
        )
        cat = "incident_response"
        actions = ["Disconnect Internet", "Change banking passwords", "Call 1930 helpline"]

    elif "sms" in query or "message" in query or "whatsapp" in query:
        reply = (
            "📱 **Evaluating Suspicious Messages & WhatsApp Frauds:**\n\n"
            "• **Golden Rule for UPI**: Remember, you **NEVER** need to enter your UPI PIN to receive money! Entering a PIN always deducts funds from your account.\n"
            "• **Disconnection Warnings**: Electricity boards (DISCOMs) never send personal mobile numbers asking you to call to prevent power cut.\n"
            "• **Part-Time Telegram Tasks**: Any job offering Rs 3,000–8,000 daily for liking YouTube videos or requiring an initial security deposit is a task-based scam.\n"
            "• **Paste into Scanner**: You can paste the entire text into our **Message Scanner** page to get an immediate AI risk score."
        )
        cat = "message_guidance"
        actions = ["Use Message Scanner", "Block unknown sender", "Never share OTPs"]

    elif "fake website" in query or "identify" in query or "check website" in query:
        reply = (
            "🌐 **How to Spot a Fake / Phishing Website:**\n\n"
            "1. **Check the Domain Carefully**: Scammers use lookalike domains (e.g., `sbi-login.xyz` instead of `sbi.co.in`). Look out for typos and unusual extensions (`.xyz`, `.top`, `.tk`).\n"
            "2. **Inspect the Protocol**: Legitimate financial portals use valid HTTPS with corporate EV certificates, not self-signed or free automated certificates.\n"
            "3. **Examine Login Forms**: Fake sites ask for unnecessary credentials, such as ATM PIN, Mother's maiden name, or full Aadhaar OTP during simple navigation.\n"
            "4. **Analyze via URL Scanner**: Run the link through our **URL Scanner** or **Website Analyzer** for a deep heuristic inspection."
        )
        cat = "url_hygiene"
        actions = ["Use URL Scanner", "Bookmark official bank websites", "Enable browser anti-phishing"]

    elif "mfa" in query or "two factor" in query or "2fa" in query or "password" in query:
        reply = (
            "🔐 **Multi-Factor Authentication (MFA) & Password Hygiene:**\n\n"
            "• **What is MFA?**: MFA requires two or more verification factors to gain access: something you know (password) + something you have (authenticator app or hardware key).\n"
            "• **Prefer Authenticator Apps over SMS**: SMS OTPs can be intercepted via SIM swapping or phishing. Use apps like Google Authenticator or Microsoft Authenticator.\n"
            "• **Password Length**: Use passphrases of at least 14+ characters combining letters, numbers, and symbols.\n"
            "• **Never Reuse Passwords**: A single data breach on a shopping site can compromise your email and bank if you share passwords."
        )
        cat = "mfa_guidance"
        actions = ["Enable Authenticator App", "Use unique 14+ character passphrases", "Check haveibeenpwned"]

    else:
        reply = (
            "🛡️ **Welcome to CYBER RAKSHA AI Cyber Safety Advisory:**\n\n"
            "I can assist you with:\n"
            "• Assessing suspicious URLs, SMS, WhatsApp messages, or emails.\n"
            "• Guidance on what to do if you have been targeted by digital scams.\n"
            "• Recognizing emerging frauds: Fake Job scams, KYC expiry lures, Electricity bill extortions, and Fake payment screenshots.\n"
            "• Securing your devices, social accounts, and banking applications.\n\n"
            "Feel free to ask a specific question or paste a suspicious snippet for instant defensive analysis."
        )
        cat = "general_cyber_safety"
        actions = ["Scan a URL", "Analyze a message", "Explore National Heatmap"]

    return ChatResponse(
        reply=reply,
        category=cat,
        suggested_actions=actions,
        emergency_contacts=[
            "National Cyber Helpline: 1930",
            "Portal: https://cybercrime.gov.in",
            "CERT-In Incident Reporting: incident@cert-in.org.in"
        ]
    )
