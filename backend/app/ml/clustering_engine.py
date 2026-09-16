import re
from typing import List, Dict, Any, Optional

def jaccard_similarity(str1: str, str2: str) -> float:
    words1 = set(re.findall(r'\w+', str1.lower()))
    words2 = set(re.findall(r'\w+', str2.lower()))
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union)

class ClusteringEngine:
    @staticmethod
    def match_cluster(
        new_text: str,
        new_brand: Optional[str],
        new_threat_type: str,
        existing_clusters: List[Dict[str, Any]],
        threshold: float = 0.35
    ) -> Optional[Dict[str, Any]]:
        best_match = None
        best_score = 0.0

        for cluster in existing_clusters:
            score = 0.0
            # 1. Threat type match
            if cluster.get("cluster_type", "").lower() in new_threat_type.lower() or new_threat_type.lower() in cluster.get("cluster_type", "").lower():
                score += 0.40

            # 2. Target brand match
            target_brands = [b.lower() for b in cluster.get("target_brands", [])]
            if new_brand and new_brand.lower() in target_brands:
                score += 0.35

            # 3. Textual overlap
            common_indicators = " ".join(cluster.get("common_indicators", []))
            text_sim = jaccard_similarity(new_text, common_indicators + " " + cluster.get("campaign_title", ""))
            score += (text_sim * 0.25)

            if score > best_score and score >= threshold:
                best_score = score
                best_match = cluster

        return best_match

clustering_engine = ClusteringEngine()
