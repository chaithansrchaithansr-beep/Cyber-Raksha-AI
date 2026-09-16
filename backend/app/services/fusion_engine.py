import hashlib
import time
from typing import Dict, Any, List, Optional
from app.ml.url_classifier import url_classifier
from app.ml.text_scam_classifier import text_scam_classifier
from app.schemas.fusion import FusionRequest, FusionResponse, ThreatSignal

class CyberThreatFusionEngine:
    def correlate(self, request: FusionRequest) -> FusionResponse:
        signals: List[ThreatSignal] = []
        all_indicators: List[str] = []
        brand_signals: List[str] = []
        total_risk = 0.0
        signal_count = 0

        # 1. Correlate URL if provided
        if request.url:
            prob, indicators, features = url_classifier.predict(request.url)
            score = round(prob * 100, 1)
            total_risk += score
            signal_count += 1
            all_indicators.extend(indicators)
            if features.get("brand_impersonation"):
                brand_signals.append(features["brand_impersonation"])
            signals.append(ThreatSignal(
                source="URL Scanner",
                preview=request.url[:60],
                risk_score=score,
                indicators=indicators[:3]
            ))

        # 2. Correlate Message / SMS / WhatsApp if provided
        if request.message:
            analysis = text_scam_classifier.analyze(request.message)
            score = round(analysis["probability"] * 100, 1)
            total_risk += score
            signal_count += 1
            all_indicators.extend(analysis["indicators"])
            if analysis.get("threat_type") and "Scam" in analysis["threat_type"]:
                brand_signals.append(analysis["threat_type"].split()[0])
            signals.append(ThreatSignal(
                source="Scam Message Scanner",
                preview=request.message[:60],
                risk_score=score,
                indicators=analysis["indicators"][:3]
            ))

        # 3. Correlate Email if provided
        if request.email_body:
            analysis = text_scam_classifier.analyze(request.email_body)
            score = round(analysis["probability"] * 100, 1)
            total_risk += score
            signal_count += 1
            all_indicators.extend(analysis["indicators"])
            signals.append(ThreatSignal(
                source="Email Security Engine",
                preview=request.email_body[:60],
                risk_score=score,
                indicators=analysis["indicators"][:3]
            ))

        # 4. Correlate Screenshot Text / Payment receipt if provided
        if request.screenshot_text:
            analysis = text_scam_classifier.analyze(request.screenshot_text)
            score = round(analysis["probability"] * 100, 1)
            total_risk += score
            signal_count += 1
            all_indicators.extend(analysis["indicators"])
            signals.append(ThreatSignal(
                source="Screenshot OCR Engine",
                preview=request.screenshot_text[:60],
                risk_score=score,
                indicators=analysis["indicators"][:3]
            ))

        # 5. Correlate QR Destination if provided
        if request.qr_destination:
            prob, indicators, features = url_classifier.predict(request.qr_destination)
            score = round(prob * 100, 1)
            total_risk += score
            signal_count += 1
            all_indicators.extend(indicators)
            signals.append(ThreatSignal(
                source="QR Destination Analyzer",
                preview=request.qr_destination[:60],
                risk_score=score,
                indicators=indicators[:3]
            ))

        if signal_count == 0:
            # Empty demo fallback
            return FusionResponse(
                campaign_detected=False,
                campaign_name="No Active Threat Signals",
                campaign_risk="LOW RISK",
                combined_risk_score=0.0,
                confidence=0.0,
                signals_correlated=0,
                signals=[],
                shared_patterns=[],
                brand_impersonated=None,
                suggested_cluster_code="N/A",
                fusion_explanation="Please provide at least one threat artifact (URL, message, screenshot text, or QR) to correlate.",
                recommended_containment=["No action needed."],
                integrity_hash="0000000000"
            )

        avg_score = total_risk / signal_count
        # Fusion Multiplier: Correlated multi-channel attacks increase risk probability!
        fusion_boost = (signal_count - 1) * 6.5
        combined_score = round(min(100.0, avg_score + fusion_boost), 1)

        # Determine campaign classification
        if combined_score >= 76.0:
            campaign_risk = "CRITICAL RISK"
        elif combined_score >= 51.0:
            campaign_risk = "HIGH RISK"
        elif combined_score >= 26.0:
            campaign_risk = "MODERATE RISK"
        else:
            campaign_risk = "LOW RISK"

        confidence = round(min(97.0, 72.0 + (signal_count * 7.5)), 1)
        campaign_detected = combined_score >= 50.0 and signal_count >= 2

        detected_brand = request.brand_context or (brand_signals[0] if brand_signals else "Major Indian Financial/Utility Service")
        campaign_name = f"Multi-Vector {detected_brand} Campaign" if campaign_detected else "Isolated Suspicious Artifacts"
        cluster_code = f"CR-2026-{hashlib.md5(str(time.time()).encode()).hexdigest()[:5].upper()}"

        shared_patterns = list(set(all_indicators))[:5]
        if not shared_patterns:
            shared_patterns = ["No critical shared malicious artifacts identified."]

        explanation = (
            f"The Cyber Threat Fusion Engine correlated {signal_count} disparate vectors. "
            f"Cross-examination of lexical features, brand tokens, and social engineering indicators indicates "
            f"{'a coordinated multi-channel cyber threat campaign' if campaign_detected else 'isolated threat telemetry with moderate correlation'}. "
            f"Aggregated threat vector score evaluated at {combined_score}/100 with {confidence}% AI confidence."
        )

        containment = [
            "Issue emergency threat advisory across organization communication channels.",
            "Block suspicious domains and associated subdomains at perimeter DNS/firewall.",
            "Warn users against approving unexpected 2FA or UPI debit requests.",
            "Report cluster signature to National Cybercrime Reporting Portal (1930 / cybercrime.gov.in)."
        ]

        integrity_hash = hashlib.sha256(f"{combined_score}{cluster_code}{time.time()}".encode()).hexdigest()

        return FusionResponse(
            campaign_detected=campaign_detected,
            campaign_name=campaign_name,
            campaign_risk=campaign_risk,
            combined_risk_score=combined_score,
            confidence=confidence,
            signals_correlated=signal_count,
            signals=signals,
            shared_patterns=shared_patterns,
            brand_impersonated=detected_brand,
            suggested_cluster_code=cluster_code,
            fusion_explanation=explanation,
            recommended_containment=containment,
            integrity_hash=integrity_hash
        )

fusion_engine = CyberThreatFusionEngine()
