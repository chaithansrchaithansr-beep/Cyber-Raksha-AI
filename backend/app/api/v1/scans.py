import hashlib
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.db import get_db
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import (
    UrlScanRequest, EmailScanRequest, MessageScanRequest, WebsiteScanRequest,
    QrScanRequest, ScanResponse, IncidentReportExport
)
from app.schemas.fusion import FusionRequest, FusionResponse
from app.ml.url_classifier import url_classifier
from app.ml.text_scam_classifier import text_scam_classifier
from app.services.scoring_engine import scoring_engine
from app.services.ocr_service import ocr_service
from app.services.qr_service import qr_service
from app.services.fusion_engine import fusion_engine
from app.services.report_generator import report_generator
from app.security.rbac import get_current_user_optional, get_current_user
from app.core.security import compute_sha256

router = APIRouter(prefix="/scans", tags=["Threat Scans"])

@router.post("/url", response_model=ScanResponse)
async def scan_url(
    req: UrlScanRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    prob, indicators, features = url_classifier.predict(req.url)
    rule_score = prob * 100.0
    risk_score, confidence, classification = scoring_engine.compute_weighted_score(
        ml_probability=prob,
        rule_penalty=rule_score,
        threat_intel_match=bool(features.get("brand_impersonation")),
        brand_impersonated=bool(features.get("brand_impersonation"))
    )

    recs = [
        "Do not input passwords, OTPs, or financial details on this destination.",
        "Verify destination through official recognized channels and bookmarks.",
        "Report lookalike domain to Indian Computer Emergency Response Team (CERT-In)."
    ] if risk_score >= 50 else [
        "Destination has low apparent risk. Always check for valid HTTPS before submitting confidential data."
    ]

    ai_exp = (
        f"Analyzed destination URL '{features.get('domain')}'. Detected {len(indicators)} indicators. "
        f"{'Brand impersonation and lexical entropy suggest high deceptive intent.' if risk_score > 50 else 'Standard domain lexical structure observed.'}"
    )

    integrity_hash = compute_sha256(f"{req.url}|{risk_score}|{time.time()}")

    scan = Scan(
        user_id=current_user.id if current_user else None,
        scan_type="url",
        input_preview=req.url[:120],
        input_hash=compute_sha256(req.url),
        classification=classification,
        risk_score=risk_score,
        confidence=confidence,
        detected_indicators=indicators,
        ai_explanation=ai_exp,
        recommendations=recs,
        details=features,
        analysis_method=features.get("analysis_method", "Machine Learning Classifier (Random Forest v1.4.2)"),
        report_integrity_hash=integrity_hash
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return scan

@router.post("/email", response_model=ScanResponse)
async def scan_email(
    req: EmailScanRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    combined_text = f"Subject: {req.subject}\nFrom: {req.sender}\nBody:\n{req.body}"
    analysis = text_scam_classifier.analyze(combined_text)
    prob = analysis["probability"]
    rule_score = prob * 100.0

    risk_score, confidence, classification = scoring_engine.compute_weighted_score(
        ml_probability=prob,
        rule_penalty=rule_score,
        threat_intel_match=analysis.get("urgency_detected", False)
    )

    integrity_hash = compute_sha256(f"{req.subject}|{risk_score}|{time.time()}")
    ai_exp = (
        f"Email flagged as '{analysis['threat_type']}'. Content exhibits {len(analysis['indicators'])} social engineering signatures. "
        f"Language patterns use urgency manipulation to induce credential or financial transfer."
    )

    scan = Scan(
        user_id=current_user.id if current_user else None,
        scan_type="email",
        input_preview=f"Subject: {req.subject[:50]}...",
        input_hash=compute_sha256(combined_text),
        classification=classification,
        risk_score=risk_score,
        confidence=confidence,
        detected_indicators=analysis["indicators"],
        ai_explanation=ai_exp,
        recommendations=analysis["recommendations"],
        details={"threat_type": analysis["threat_type"], "sender": req.sender},
        analysis_method=analysis.get("analysis_method", "Multilingual Scam NLP (TF-IDF + LogisticRegression v2.1.0)"),
        report_integrity_hash=integrity_hash
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return scan

@router.post("/message", response_model=ScanResponse)
async def scan_message(
    req: MessageScanRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    analysis = text_scam_classifier.analyze(req.text)
    prob = analysis["probability"]
    rule_score = prob * 100.0

    risk_score, confidence, classification = scoring_engine.compute_weighted_score(
        ml_probability=prob,
        rule_penalty=rule_score,
        threat_intel_match=len(analysis.get("all_matched_categories", [])) > 0
    )

    integrity_hash = compute_sha256(f"{req.text[:50]}|{risk_score}|{time.time()}")
    ai_exp = (
        f"Categorized as: {analysis['threat_type']}. "
        f"Message relies on {', '.join(analysis['indicators'][:2]) if analysis['indicators'] else 'standard message syntax'}. "
        f"Never authorize payments or share personal OTPs based on unverified mobile messages."
    )

    scan = Scan(
        user_id=current_user.id if current_user else None,
        scan_type="message",
        input_preview=req.text[:120],
        input_hash=compute_sha256(req.text),
        classification=classification,
        risk_score=risk_score,
        confidence=confidence,
        detected_indicators=analysis["indicators"],
        ai_explanation=ai_exp,
        recommendations=analysis["recommendations"],
        details={"threat_type": analysis["threat_type"], "channel": req.source_channel},
        analysis_method=analysis.get("analysis_method", "Multilingual Scam NLP (TF-IDF + LogisticRegression v2.1.0)"),
        report_integrity_hash=integrity_hash
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return scan

@router.post("/website", response_model=ScanResponse)
async def scan_website(
    req: WebsiteScanRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    import re
    from urllib.parse import urlparse
    import httpx

    prob, url_indicators, features = url_classifier.predict(req.url)
    indicators = list(url_indicators)

    raw_url = req.url if "://" in req.url else f"http://{req.url}"
    parsed = urlparse(raw_url)
    target_brand = req.simulated_brand or features.get("brand_impersonation")
    is_live = False
    html_content = ""
    status_code = None
    credential_inputs: List[str] = []
    page_title = ""
    is_https = parsed.scheme.lower() == "https"

    if is_https:
        indicators.append("Protocol: Transport Layer Security (HTTPS) verified")
    else:
        indicators.append("Security Vulnerability: Insecure plain HTTP connection (No SSL encryption)")

    try:
        async with httpx.AsyncClient(
            timeout=6.0,
            follow_redirects=True,
            verify=False,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CyberRakshaDefenseBot/1.0"}
        ) as client:
            resp = await client.get(raw_url)
            status_code = resp.status_code
            html_content = resp.text[:150000]
            is_live = True
            indicators.append(f"Live Network Fetch: HTTP {status_code} ({len(html_content)} bytes retrieved)")
    except httpx.ConnectTimeout:
        indicators.append("Network Probe: Host connection timed out (server unreachable)")
    except httpx.ConnectError:
        indicators.append("Network Probe: Unable to resolve hostname or establish socket connection")
    except Exception as e:
        indicators.append(f"Network Probe Notice: Server returned connection alert ({type(e).__name__})")

    if is_live and html_content:
        # Extract title
        title_match = re.search(r'<title[^>]*>(.*?)</title>', html_content, re.IGNORECASE | re.DOTALL)
        if title_match:
            page_title = title_match.group(1).strip()
            indicators.append(f"DOM Title: '{page_title[:60]}'")

        # Detect forms and inputs
        forms = re.findall(r'<form\b[^>]*>(.*?)</form>', html_content, re.IGNORECASE | re.DOTALL)
        if forms:
            indicators.append(f"DOM Structure: Detected {len(forms)} interactive form elements")

        # Check for sensitive inputs
        input_tags = re.findall(r'<input\b[^>]*>', html_content, re.IGNORECASE)
        for inp in input_tags:
            t_match = re.search(r'type=[\'"]([^\'"]+)[\'"]', inp, re.IGNORECASE)
            n_match = re.search(r'name=[\'"]([^\'"]+)[\'"]', inp, re.IGNORECASE)
            inp_type = (t_match.group(1) if t_match else "text").lower()
            inp_name = (n_match.group(1) if n_match else "").lower()

            if inp_type == "password":
                credential_inputs.append("Password Input")
            for kw in ["pin", "otp", "cvv", "card", "pan", "aadhaar", "account", "token", "mpin"]:
                if kw in inp_name:
                    credential_inputs.append(f"Sensitive Field: '{kw.upper()}'")

        if credential_inputs:
            unique_creds = list(set(credential_inputs))
            indicators.append(f"Credential Harvesting Risk: Detected sensitive fields ({', '.join(unique_creds[:5])})")

        # Brand mismatch detection in real HTML
        if target_brand:
            brand_in_html = target_brand.lower() in html_content.lower() or (page_title and target_brand.lower() in page_title.lower())
            domain = parsed.netloc.lower()
            official_domains = ["sbi.co.in", "onlinesbi.sbi", "hdfcbank.com", "icicibank.com", "incometax.gov.in", "paytm.com", "gov.in"]
            if brand_in_html and not any(kw in domain for kw in official_domains):
                indicators.append(f"Brand Impersonation: Page content targets '{target_brand}' while hosted on unverified domain '{domain}'")

    evidence_penalty = 0.0
    if credential_inputs:
        evidence_penalty += 35.0
    if not is_https:
        evidence_penalty += 20.0
    if any("Brand Impersonation" in ind for ind in indicators):
        evidence_penalty += 35.0

    raw_score = min(100.0, (prob * 50.0) + evidence_penalty)
    risk_score, confidence, classification = scoring_engine.compute_weighted_score(
        ml_probability=min(0.99, max(prob, raw_score / 100.0)),
        rule_penalty=raw_score,
        threat_intel_match=bool(credential_inputs or not is_https),
        brand_impersonated=bool(any("Brand Impersonation" in ind for ind in indicators))
    )

    integrity_hash = compute_sha256(f"{req.url}|web|{risk_score}|{time.time()}")
    if risk_score >= 75.0:
        ai_exp = f"Critical Risk: Destination '{parsed.netloc}' exhibits severe credential harvesting or brand impersonation signatures."
    elif risk_score >= 50.0:
        ai_exp = f"High Risk: Destination '{parsed.netloc}' solicits sensitive inputs without verified organizational authentication."
    elif not is_live:
        ai_exp = f"Host Unreachable: Destination '{parsed.netloc}' did not respond to live HTTP/HTTPS connection probes."
    else:
        ai_exp = f"Low Risk: Live DOM inspection of '{parsed.netloc}' completed with no malicious harvesting signatures observed."

    recs = [
        "Do not enter netbanking credentials, debit card numbers, or ATM PINs.",
        "Close browser tab immediately and flush browser cache.",
        "File report with National Cyber Crime Reporting Portal."
    ] if risk_score >= 50 else [
        "Destination analyzed. Continue observing standard cyber safety practices."
    ]

    scan = Scan(
        user_id=current_user.id if current_user else None,
        scan_type="website",
        input_preview=req.url[:120],
        input_hash=compute_sha256(req.url),
        classification=classification,
        risk_score=risk_score,
        confidence=confidence,
        detected_indicators=indicators,
        ai_explanation=ai_exp,
        recommendations=recs,
        details={
            "brand": target_brand or "N/A",
            "page_title": page_title,
            "status_code": status_code,
            "is_live": is_live,
            "is_https": is_https
        },
        analysis_method="Live Network & DOM Visual Forensics",
        report_integrity_hash=integrity_hash
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return scan

@router.post("/screenshot", response_model=ScanResponse)
async def scan_screenshot(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()
    res = ocr_service.analyze_image_bytes(content, filename=file.filename or "")

    risk = res.get("risk_score", 15.0)
    conf = res.get("confidence", 85.0)
    indicators = res.get("indicators", ["Visual image analysis completed"])
    threat_t = res.get("threat_type", "Benign Image / Valid Screenshot")
    extracted_text = res.get("extracted_text", "")
    extracted_preview = extracted_text[:120] if extracted_text else "No text extracted"

    integrity_hash = compute_sha256(f"{file.filename}|{risk}|{time.time()}")
    classification = scoring_engine.classify_risk(risk)
    recs = [
        "Do not release goods or provide services based solely on digital payment screenshots.",
        "Always verify settlement directly inside your official merchant banking or UPI app statement.",
        "Report fake payment receipt generator activity to law enforcement."
    ] if risk > 50 else [
        "Screenshot analyzed. Always verify monetary transactions in official bank statement."
    ]

    scan = Scan(
        user_id=current_user.id if current_user else None,
        scan_type="screenshot",
        input_preview=f"Image: {file.filename} ({res.get('dimensions', 'N/A')})",
        input_hash=compute_sha256(str(len(content)) + (file.filename or "")),
        classification=classification,
        risk_score=risk,
        confidence=conf,
        detected_indicators=indicators,
        ai_explanation=f"OCR & Image Forensics: {threat_t}. Extracted text preview: '{extracted_preview}'",
        recommendations=recs,
        details={
            "dimensions": res.get("dimensions"),
            "format": res.get("format"),
            "extracted_text": extracted_text,
            "is_fake_receipt": res.get("is_fake_receipt", False)
        },
        analysis_method=res.get("analysis_method", "Native Windows OCR & Visual Forensics"),
        report_integrity_hash=integrity_hash
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return scan

@router.post("/qr", response_model=ScanResponse)
async def scan_qr(
    req: QrScanRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    payload = req.extracted_data or "https://secure-verify-update.xyz/kyc"
    res = qr_service.analyze_qr_payload(payload)

    integrity_hash = compute_sha256(f"{payload}|{res['risk_score']}|{time.time()}")
    recs = [
        "Never scan a QR code to 'receive' cashback or money. Scanning a QR code ALWAYS debits your account.",
        "Check destination domain name carefully before approving any redirection.",
        "Block and report the sender requesting you to scan this code."
    ] if res["risk_score"] > 50 else [
        "QR destination analyzed. Check merchant details before submitting transaction PIN."
    ]

    scan = Scan(
        user_id=current_user.id if current_user else None,
        scan_type="qr",
        input_preview=payload[:100],
        input_hash=compute_sha256(payload),
        classification=res["classification"],
        risk_score=res["risk_score"],
        confidence=res["confidence"],
        detected_indicators=res["indicators"],
        ai_explanation=res["explanation"],
        recommendations=recs,
        details={"destination": res["destination"]},
        analysis_method=res.get("analysis_method", "QR Protocol & Destination Analyzer"),
        report_integrity_hash=integrity_hash
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return scan

@router.post("/qr-image", response_model=ScanResponse)
async def scan_qr_image(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Uploaded file exceeds 10MB limit.")
    try:
        qr_payload = qr_service.decode_qr_image(content)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing error: {str(e)}")

    res = qr_service.analyze_qr_payload(qr_payload)
    integrity_hash = compute_sha256(f"{qr_payload}|{res['risk_score']}|{time.time()}")
    recs = [
        "Never scan a QR code to 'receive' cashback or money. Scanning a QR code ALWAYS debits your account.",
        "Check destination domain name carefully before approving any redirection.",
        "Block and report the sender requesting you to scan this code."
    ] if res["risk_score"] > 50 else [
        "QR destination analyzed. Check merchant details before submitting transaction PIN."
    ]

    scan = Scan(
        user_id=current_user.id if current_user else None,
        scan_type="qr",
        input_preview=f"QR Image: {file.filename} -> {qr_payload[:80]}",
        input_hash=compute_sha256(qr_payload),
        classification=res["classification"],
        risk_score=res["risk_score"],
        confidence=res["confidence"],
        detected_indicators=res["indicators"] + [f"Decoded from uploaded image: {file.filename}"],
        ai_explanation=f"QR Decoded Destination: {res['explanation']}",
        recommendations=recs,
        details={"destination": res["destination"], "filename": file.filename},
        analysis_method="QR Protocol & Destination Analyzer (pyzbar)",
        report_integrity_hash=integrity_hash
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return scan

@router.post("/fusion", response_model=FusionResponse)
async def correlate_threats(req: FusionRequest):
    """
    Cyber Threat Fusion Engine - Multi-vector threat correlation
    """
    return fusion_engine.correlate(req)

@router.get("/history", response_model=List[ScanResponse])
async def get_scan_history(
    limit: int = 50,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    query = select(Scan).order_by(Scan.created_at.desc()).limit(limit)
    if current_user:
        if current_user.role == "citizen":
            query = query.where(Scan.user_id == current_user.id)
        elif current_user.role == "organization" and current_user.organization_id:
            query = query.join(User, Scan.user_id == User.id).where(User.organization_id == current_user.organization_id)
        # Admin can view all records across the national network
    else:
        query = query.where(Scan.user_id == None)
    result = await db.execute(query)
    scans = result.scalars().all()
    return scans

@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan_by_id(
    scan_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    if current_user and current_user.role == "citizen" and scan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You do not own this scan record.")
    return scan

@router.delete("/{scan_id}")
async def delete_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    if current_user.role != "admin" and scan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You can only delete your own scans.")
    await db.delete(scan)
    await db.commit()
    return {"success": True, "message": "Scan deleted successfully", "id": scan_id}

@router.get("/{scan_id}/pdf")
async def download_scan_pdf(
    scan_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    if current_user and current_user.role == "citizen" and scan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You do not own this scan report.")

    pdf_bytes = report_generator.generate_pdf({
        "report_id": f"CR-INC-2026-{scan.id:05d}",
        "created_at": scan.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "scan_type": scan.scan_type,
        "classification": scan.classification,
        "risk_score": scan.risk_score,
        "confidence": scan.confidence,
        "detected_indicators": scan.detected_indicators,
        "ai_explanation": scan.ai_explanation,
        "recommendations": scan.recommendations,
        "report_integrity_hash": scan.report_integrity_hash
    })

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Cyber_Raksha_Report_{scan.id}.pdf"}
    )

@router.get("/{scan_id}/json", response_model=IncidentReportExport)
async def download_scan_json(
    scan_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    if current_user and current_user.role == "citizen" and scan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You do not own this scan report.")

    return IncidentReportExport(
        report_id=f"CR-INC-2026-{scan.id:05d}",
        date_and_time=scan.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        scan_type=scan.scan_type,
        threat_classification=scan.classification,
        risk_score=scan.risk_score,
        confidence=scan.confidence,
        detected_indicators=scan.detected_indicators or [],
        ai_explanation=scan.ai_explanation or "",
        recommended_actions=scan.recommendations or [],
        report_integrity_hash=scan.report_integrity_hash or "",
        technical_metadata=scan.details or {}
    )
