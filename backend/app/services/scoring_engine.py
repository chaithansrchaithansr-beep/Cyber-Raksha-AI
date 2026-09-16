from typing import Dict, Any, List, Tuple

class ScoringEngine:
    @staticmethod
    def classify_risk(score: float) -> str:
        score = max(0.0, min(100.0, score))
        if score <= 25.0:
            return "LOW RISK"
        elif score <= 50.0:
            return "MODERATE RISK"
        elif score <= 75.0:
            return "HIGH RISK"
        else:
            return "CRITICAL RISK"

    @staticmethod
    def compute_weighted_score(
        ml_probability: float, # 0.0 to 1.0
        rule_penalty: float, # 0 to 100
        threat_intel_match: bool = False,
        brand_impersonated: bool = False,
        community_flagged_count: int = 0
    ) -> Tuple[float, float, str]:
        """
        Combines ML model outputs, heuristic rule counts, threat intel, and community telemetry.
        Returns: (final_score, confidence, classification)
        """
        ml_score = ml_probability * 100.0
        
        # Base weights: ML (40%), Rules (35%), Threat Intel (15%), Community (10%)
        intel_score = 100.0 if threat_intel_match else 0.0
        brand_boost = 25.0 if brand_impersonated else 0.0
        comm_score = min(100.0, community_flagged_count * 20.0)

        raw_score = (
            (ml_score * 0.40) +
            (rule_penalty * 0.35) +
            (intel_score * 0.15) +
            (comm_score * 0.10) +
            brand_boost
        )

        final_score = round(max(0.0, min(100.0, raw_score)), 1)
        
        # Confidence calculation
        confidence_base = 70.0
        if ml_probability > 0.85 or ml_probability < 0.15:
            confidence_base += 15.0
        if threat_intel_match:
            confidence_base += 10.0
        if brand_impersonated:
            confidence_base += 5.0
        
        confidence = round(min(98.5, confidence_base), 1)
        classification = ScoringEngine.classify_risk(final_score)

        return final_score, confidence, classification

scoring_engine = ScoringEngine()
