import asyncio
import hashlib
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.database.db import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash, compute_sha256
from app.models.user import User, Organization
from app.models.threat import ThreatReport, ThreatCluster
from app.models.alert import Alert
from app.models.scan import Scan

from sqlalchemy import text

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Seamless column migration for SQLite
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 1"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN last_login TIMESTAMP"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE organizations ADD COLUMN status VARCHAR(50) DEFAULT 'verified'"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE scans ADD COLUMN analysis_method VARCHAR(100) DEFAULT 'Rule-Based Defensive Security Analysis'"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE threat_reports ADD COLUMN admin_notes TEXT"))
        except Exception:
            pass

    async with AsyncSessionLocal() as session:
        # Check if users already seeded
        result = await session.execute(select(User).limit(1))
        if result.scalars().first():
            return # Already initialized

        # 1. Create Organization
        org = Organization(
            name="National Cyber Defense Alliance",
            verified_domain="cyberraksha.gov.in",
            contact_email="defense@cyberraksha.gov.in",
            api_key="cr_live_sec_key_77a984bc23"
        )
        session.add(org)
        await session.flush()

        # 2. Create Users
        admin_user = User(
            name="National SecOps Officer",
            email=settings.INITIAL_ADMIN_EMAIL,
            password_hash=get_password_hash(settings.INITIAL_ADMIN_PASSWORD),
            role="admin",
            language="en",
            is_active=True,
            mfa_enabled=True,
            organization_id=org.id
        )

        org_user = User(
            name="Enterprise SecOps Lead",
            email="org@infosec-defense.in",
            password_hash=get_password_hash("OrgAdmin@123"),
            role="organization",
            language="en",
            is_active=True,
            mfa_enabled=False,
            organization_id=org.id
        )

        citizen_user = User(
            name="Aarav Sharma",
            email="citizen@cyberraksha.gov.in",
            password_hash=get_password_hash("Citizen@123"),
            role="citizen",
            language="hi",
            is_active=True,
            mfa_enabled=False
        )

        session.add_all([admin_user, org_user, citizen_user])
        await session.flush()

        # 3. Create Threat Clusters
        now = datetime.now(timezone.utc)
        c1 = ThreatCluster(
            cluster_code="CR-2026-00124",
            campaign_title="Aadhaar / PAN KYC Account Suspension Wave",
            cluster_type="KYC Scam Campaign",
            severity="CRITICAL",
            confidence=91.5,
            report_count=54,
            first_seen=now - timedelta(days=5),
            last_seen=now - timedelta(hours=2),
            status="active",
            target_brands=["State Bank of India", "HDFC Bank", "Income Tax Department"],
            common_indicators=["Urgent action language", "Masked shortlink bit.ly", "Fake APK download request", "PAN suspension threat"],
            affected_states=["Maharashtra", "Delhi", "Karnataka", "Uttar Pradesh"]
        )

        c2 = ThreatCluster(
            cluster_code="CR-2026-00189",
            campaign_title="DISCOM Electricity Cut-off SMS Extortion Campaign",
            cluster_type="Electricity Bill Scam",
            severity="HIGH",
            confidence=88.0,
            report_count=38,
            first_seen=now - timedelta(days=3),
            last_seen=now - timedelta(minutes=45),
            status="active",
            target_brands=["State Electricity Boards", "DISCOM"],
            common_indicators=["Nighttime disconnection threat", "Direct WhatsApp number contact", "Fake helpline APK"],
            affected_states=["Uttar Pradesh", "Bihar", "Rajasthan", "Madhya Pradesh"]
        )

        c3 = ThreatCluster(
            cluster_code="CR-2026-00210",
            campaign_title="Telegram Part-Time Task / YouTube Review Fraud",
            cluster_type="Fake Job Scam",
            severity="HIGH",
            confidence=94.2,
            report_count=67,
            first_seen=now - timedelta(days=7),
            last_seen=now - timedelta(hours=5),
            status="active",
            target_brands=["YouTube", "Telegram", "Amazon Review Task"],
            common_indicators=["Guaranteed daily income Rs 5000", "Telegram task coordinator", "Initial cryptocurrency/UPI deposit"],
            affected_states=["Karnataka", "Tamil Nadu", "Telangana", "Kerala", "Maharashtra"]
        )

        c4 = ThreatCluster(
            cluster_code="CR-2026-00305",
            campaign_title="Fake SBI YONO APK Credential Stealer",
            cluster_type="Brand Impersonation & Phishing",
            severity="CRITICAL",
            confidence=96.8,
            report_count=82,
            first_seen=now - timedelta(days=10),
            last_seen=now - timedelta(minutes=15),
            status="active",
            target_brands=["SBI YONO", "State Bank of India"],
            common_indicators=["Typosquatting domain sbi-rewards-yono.xyz", "Embedded APK payload", "Netbanking credential capture"],
            affected_states=["Maharashtra", "Delhi", "Gujarat", "Karnataka", "West Bengal"]
        )

        session.add_all([c1, c2, c3, c4])
        await session.flush()

        # 4. Seed Threat Reports (with PII-sanitized content) across Indian States
        sample_reports = [
            ThreatReport(
                reporter_id=citizen_user.id,
                threat_type="kyc_scam",
                severity="CRITICAL",
                target_brand="SBI",
                sanitized_content="Dear Customer, Your SBI account will be blocked today! Update your PAN immediately via http://secure-sbi-kyc.xyz. Contact Helpline: +91 98*** **321.",
                raw_content_hash=compute_sha256("sbi_kyc_report_1"),
                state="Maharashtra",
                status="verified",
                cluster_id=c1.id,
                upvotes=18
            ),
            ThreatReport(
                reporter_id=citizen_user.id,
                threat_type="electricity_bill",
                severity="HIGH",
                target_brand="Electricity Board",
                sanitized_content="Dear consumer, your electricity power will be disconnected tonight at 9:30 PM from the power station because your previous month bill was not updated. Call Officer: +91 87*** **456 immediately.",
                raw_content_hash=compute_sha256("discom_report_2"),
                state="Uttar Pradesh",
                status="verified",
                cluster_id=c2.id,
                upvotes=14
            ),
            ThreatReport(
                reporter_id=citizen_user.id,
                threat_type="fake_job",
                severity="HIGH",
                target_brand="YouTube Review Task",
                sanitized_content="Earn Rs 3000 to Rs 8000 daily from home! Just like and subscribe YouTube videos and take screenshots. Join Telegram VIP task room: t.me/vip_tasks_reward.",
                raw_content_hash=compute_sha256("job_report_3"),
                state="Karnataka",
                status="verified",
                cluster_id=c3.id,
                upvotes=25
            ),
            ThreatReport(
                reporter_id=citizen_user.id,
                threat_type="phishing_url",
                severity="CRITICAL",
                target_brand="SBI YONO",
                sanitized_content="Received SMS: 'Claim your 5,840 reward points on YONO! Redeem into bank account before expiry: http://sbi-rewards-yono.xyz/login.php'",
                raw_content_hash=compute_sha256("sbi_phish_4"),
                state="Delhi",
                status="verified",
                cluster_id=c4.id,
                upvotes=32
            )
        ]

        # Add reports across states for rich Heatmap
        states_distribution = [
            ("Maharashtra", "CRITICAL", "kyc_scam", 35),
            ("Karnataka", "HIGH", "fake_job", 28),
            ("Delhi", "CRITICAL", "phishing_url", 30),
            ("Uttar Pradesh", "HIGH", "electricity_bill", 26),
            ("Tamil Nadu", "HIGH", "upi_fraud", 22),
            ("Gujarat", "HIGH", "kyc_scam", 19),
            ("Telangana", "HIGH", "fake_job", 18),
            ("West Bengal", "HIGH", "phishing_url", 16),
            ("Rajasthan", "MODERATE", "electricity_bill", 14),
            ("Kerala", "MODERATE", "fake_job", 12),
            ("Bihar", "HIGH", "electricity_bill", 15),
            ("Madhya Pradesh", "MODERATE", "kyc_scam", 13),
            ("Punjab", "MODERATE", "phishing_url", 10),
            ("Haryana", "HIGH", "upi_fraud", 12),
            ("Odisha", "MODERATE", "fake_job", 9),
            ("Andhra Pradesh", "HIGH", "upi_fraud", 14),
            ("Assam", "MODERATE", "lottery_scam", 8),
            ("Jharkhand", "MODERATE", "kyc_scam", 7)
        ]

        for st_name, sev, t_type, count in states_distribution:
            sample_reports.append(
                ThreatReport(
                    reporter_id=None,
                    threat_type=t_type,
                    severity=sev,
                    target_brand="National Banking / Services",
                    sanitized_content=f"Aggregated regional cyber threat telemetry for {st_name}: Multiple reports of {t_type.replace('_', ' ').title()}.",
                    raw_content_hash=compute_sha256(f"{st_name}_{t_type}"),
                    state=st_name,
                    status="verified",
                    cluster_id=c1.id if "kyc" in t_type else (c2.id if "electricity" in t_type else c3.id),
                    upvotes=count
                )
            )

        session.add_all(sample_reports)

        # 5. Seed Alerts
        alerts = [
            Alert(
                title="🚨 New High-Risk Campaign: Fake SBI YONO Credential Stealer",
                message="Multiple reports received across Delhi, Maharashtra, and Gujarat. Malicious lookalike domain sbi-rewards-yono.xyz attempts credential harvesting.",
                severity="critical",
                category="phishing",
                active=True
            ),
            Alert(
                title="⚠ Increase in DISCOM Electricity Bill Disconnection Scams",
                message="Consumers in UP, Bihar, and Rajasthan targeted with fraudulent power cut warnings demanding immediate calls to spoofed helpline numbers.",
                severity="high",
                category="kyc_scam",
                active=True
            ),
            Alert(
                title="🔴 Threat Cluster Alert: Telegram Part-Time Job Fraud",
                message="Emerging cluster CR-2026-00210 detected. Scammers promising Rs 5,000/day for reviewing YouTube videos requiring upfront UPI deposits.",
                severity="high",
                category="upi_fraud",
                active=True
            ),
            Alert(
                title="ℹ️ Security Advisory: Always Verify 1930 National Helpline",
                message="In case of digital financial fraud, report immediately to national toll-free number 1930 or online at cybercrime.gov.in within the golden hour.",
                severity="medium",
                category="advisory",
                active=True
            )
        ]
        session.add_all(alerts)

        # 6. Seed Sample Scans
        scans = [
            Scan(
                user_id=citizen_user.id,
                scan_type="url",
                input_preview="http://sbi-rewards-yono.xyz/login.php",
                input_hash=compute_sha256("http://sbi-rewards-yono.xyz/login.php"),
                classification="CRITICAL RISK",
                risk_score=92.5,
                confidence=95.0,
                detected_indicators=["Lookalike brand impersonation targeting SBI", "High-risk TLD .xyz", "Credential-related keyword pattern", "Insecure HTTP protocol"],
                ai_explanation="The analyzed destination attempts to spoof State Bank of India login portal on a suspicious untrusted domain.",
                recommendations=["Do not enter passwords, OTPs, or banking credentials.", "Access services solely through official domain onlinesbi.sbi."],
                report_integrity_hash=compute_sha256("scan_sample_1")
            ),
            Scan(
                user_id=citizen_user.id,
                scan_type="message",
                input_preview="Dear user, your electricity power will be disconnected tonight...",
                input_hash=compute_sha256("electricity_message_scan"),
                classification="HIGH RISK",
                risk_score=84.0,
                confidence=89.0,
                detected_indicators=["Electricity Bill Scam signature match", "Urgent deadline pressure (tonight)", "Suspicious personal contact number"],
                ai_explanation="Message employs social engineering and false urgency threatening utility disconnection.",
                recommendations=["Do not call the unverified phone number.", "Contact your electricity provider via your official utility bill."],
                report_integrity_hash=compute_sha256("scan_sample_2")
            ),
            Scan(
                user_id=citizen_user.id,
                scan_type="qr",
                input_preview="upi://pay?pa=scammer99@ybl&am=5000&pn=LuckyPrize",
                input_hash=compute_sha256("upi_qr_sample"),
                classification="HIGH RISK",
                risk_score=78.0,
                confidence=90.0,
                detected_indicators=["UPI Payment Intent Payload", "Hardcoded debit amount: Rs 5000", "Lure merchant name 'LuckyPrize'"],
                ai_explanation="Scanning this QR code immediately triggers a money deduction from your linked bank account.",
                recommendations=["NEVER scan a QR code or enter your UPI PIN to receive funds.", "Cancel the transaction immediately."],
                report_integrity_hash=compute_sha256("scan_sample_3")
            )
        ]
        session.add_all(scans)

        await session.commit()
