import pytest
from app.services.fusion_engine import fusion_engine
from app.schemas.fusion import FusionRequest

def test_multi_vector_threat_fusion():
    req = FusionRequest(
        url="http://sbi-kyc-update-login.xyz/portal",
        message="Dear user your SBI account is blocked today. Click link to update PAN.",
        brand_context="SBI"
    )
    result = fusion_engine.correlate(req)
    assert result.campaign_detected is True
    assert result.signals_correlated == 2
    assert result.combined_risk_score >= 60.0
    assert result.brand_impersonated == "SBI"
    assert "CR-2026-" in result.suggested_cluster_code
