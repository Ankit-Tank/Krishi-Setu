from typing import List, Dict, Any
from app.models.models import BuyerMatch


class BuyerMatcher:
    """Scoring & ranking algorithm for market buyer-farmer matching."""

    PRICE_WEIGHT = 0.5
    DISTANCE_WEIGHT = 2.0
    URGENCY_BOOST = {
        "high": 100.0,
        "medium": 50.0,
        "normal": 0.0
    }

    @classmethod
    def calculate_score(cls, match: BuyerMatch) -> float:
        """
        Compute matching score:
        score = 0.5 * offered_price - 2.0 * distance_km + urgency_boost
        """
        urgency = getattr(match, "demand_urgency", "normal") or "normal"
        boost = cls.URGENCY_BOOST.get(urgency.lower(), 0.0)
        return (cls.PRICE_WEIGHT * match.offered_price) - (cls.DISTANCE_WEIGHT * match.distance_km) + boost

    @classmethod
    def generate_explanation(cls, match: BuyerMatch, rank: int, total_matches: int) -> str:
        """Construct human-readable explanation string for why this match was recommended."""
        urgency = getattr(match, "demand_urgency", "normal") or "normal"
        urgency_str = f"{urgency.upper()} current demand"
        
        if rank == 1:
            return f"Top Recommendation: Best overall price (INR {match.offered_price:,.2f}/qtl), only {match.distance_km}km away with {urgency_str}."
        elif match.distance_km <= 15:
            return f"Optimal Logistics: Short distance ({match.distance_km}km) for fast farm-gate pickup, offered INR {match.offered_price:,.2f}/qtl ({urgency_str})."
        elif match.offered_price >= 2400:
            return f"Premium Rate: High purchase offer of INR {match.offered_price:,.2f}/qtl with {urgency_str} at {match.mandi_name}."
        else:
            return f"Reliable Match: Offered INR {match.offered_price:,.2f}/qtl, {match.distance_km}km distance, {urgency_str}."

    @classmethod
    def rank_matches(cls, matches: List[BuyerMatch], limit: int = 3) -> List[Dict[str, Any]]:
        """Sort buyer matches by descending score and return top N matches with explanations."""
        scored = []
        for m in matches:
            score = cls.calculate_score(m)
            scored.append((m, round(score, 2)))

        # Sort by descending score
        sorted_matches = sorted(scored, key=lambda x: x[1], reverse=True)

        ranked = []
        for idx, (m, score) in enumerate(sorted_matches[:limit]):
            rank = idx + 1
            explanation = cls.generate_explanation(m, rank, len(sorted_matches))
            ranked.append({
                "id": m.id,
                "trade_listing_id": m.trade_listing_id,
                "buyer_name": m.buyer_name,
                "mandi_name": m.mandi_name,
                "distance_km": m.distance_km,
                "offered_price": m.offered_price,
                "demand_urgency": getattr(m, "demand_urgency", "normal") or "normal",
                "logistics_note": m.logistics_note,
                "score": score,
                "explanation": explanation
            })

        return ranked
