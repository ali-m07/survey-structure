"""Performance calibration service."""
from typing import List, Dict, Any
from app.performance.models import Feedback, ReviewCycle
import statistics
import logging

logger = logging.getLogger(__name__)


class CalibrationService:
    """Service for performance calibration and bias detection."""
    
    def detect_bias(self, review_cycle: ReviewCycle) -> Dict[str, Any]:
        """Detect bias in performance reviews."""
        feedbacks = Feedback.objects.filter(review_cycle=review_cycle)
        
        # Calculate average ratings by reviewer
        reviewer_ratings = {}
        for feedback in feedbacks:
            reviewer_id = str(feedback.reviewer.id)
            if reviewer_id not in reviewer_ratings:
                reviewer_ratings[reviewer_id] = []
            if feedback.rating:
                reviewer_ratings[reviewer_id].append(feedback.rating)
        
        # Detect outliers (potential bias)
        bias_detected = []
        overall_avg = statistics.mean([f.rating for f in feedbacks if f.rating])
        
        for reviewer_id, ratings in reviewer_ratings.items():
            if len(ratings) > 1:
                reviewer_avg = statistics.mean(ratings)
                if abs(reviewer_avg - overall_avg) > 1.0:  # Significant deviation
                    bias_detected.append({
                        'reviewer_id': reviewer_id,
                        'average_rating': reviewer_avg,
                        'overall_average': overall_avg,
                        'deviation': abs(reviewer_avg - overall_avg)
                    })
        
        return {
            'bias_detected': len(bias_detected) > 0,
            'biases': bias_detected,
            'overall_average': overall_avg
        }
    
    def calibrate_ratings(self, review_cycle: ReviewCycle) -> Dict[str, Any]:
        """Calibrate ratings across reviewers."""
        feedbacks = Feedback.objects.filter(review_cycle=review_cycle)
        
        # Calculate calibration factors
        overall_avg = statistics.mean([f.rating for f in feedbacks if f.rating])
        reviewer_factors = {}
        
        for feedback in feedbacks:
            reviewer_id = str(feedback.reviewer.id)
            if reviewer_id not in reviewer_factors:
                reviewer_ratings = [f.rating for f in feedbacks 
                                   if f.reviewer.id == feedback.reviewer.id and f.rating]
                if reviewer_ratings:
                    reviewer_avg = statistics.mean(reviewer_ratings)
                    reviewer_factors[reviewer_id] = overall_avg / reviewer_avg if reviewer_avg > 0 else 1.0
        
        return {
            'calibration_factors': reviewer_factors,
            'overall_average': overall_avg
        }

