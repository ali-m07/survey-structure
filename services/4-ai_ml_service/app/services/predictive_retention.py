"""Predictive retention service."""
from typing import Dict, Any, List
import logging
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

logger = logging.getLogger(__name__)


class PredictiveRetentionService:
    """Service for predicting employee retention."""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        """Load existing model or train a new one."""
        model_path = "/tmp/retention_model.pkl"
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                logger.info("Loaded existing retention model")
            except Exception as e:
                logger.warning(f"Error loading model: {e}, will train new model")
                self._train_model()
        else:
            self._train_model()
    
    def _train_model(self):
        """Train a retention prediction model."""
        # Generate synthetic training data
        # In production, this would use real employee data
        np.random.seed(42)
        n_samples = 1000
        
        # Features: tenure, satisfaction_score, performance_rating, salary_percentile, promotion_count
        X = np.random.rand(n_samples, 5)
        X[:, 0] = np.random.uniform(0, 10, n_samples)  # tenure in years
        X[:, 1] = np.random.uniform(0, 5, n_samples)   # satisfaction score
        X[:, 2] = np.random.uniform(1, 5, n_samples)   # performance rating
        X[:, 3] = np.random.uniform(0, 1, n_samples)   # salary percentile
        X[:, 4] = np.random.randint(0, 5, n_samples)   # promotion count
        
        # Target: retention (1 = retained, 0 = left)
        # Higher satisfaction, performance, salary, promotions = higher retention
        y = ((X[:, 1] > 3) & (X[:, 2] > 3) & (X[:, 3] > 0.5)).astype(int)
        
        X_scaled = self.scaler.fit_transform(X)
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_scaled, y)
        
        # Save model
        try:
            joblib.dump(self.model, "/tmp/retention_model.pkl")
            logger.info("Trained and saved retention model")
        except Exception as e:
            logger.warning(f"Error saving model: {e}")
    
    def predict(self, employee_data: Dict[str, Any], features: List[str]) -> Dict[str, Any]:
        """Predict retention probability for an employee."""
        try:
            # Extract features
            feature_values = []
            feature_mapping = {
                "tenure": employee_data.get("tenure", 0),
                "satisfaction_score": employee_data.get("satisfaction_score", 3),
                "performance_rating": employee_data.get("performance_rating", 3),
                "salary_percentile": employee_data.get("salary_percentile", 0.5),
                "promotion_count": employee_data.get("promotion_count", 0)
            }
            
            for feature in features:
                feature_values.append(feature_mapping.get(feature, 0))
            
            # Predict
            X = np.array([feature_values])
            X_scaled = self.scaler.transform(X)
            probability = self.model.predict_proba(X_scaled)[0][1]
            
            # Determine risk level
            if probability < 0.3:
                risk_level = "high"
                recommendations = [
                    "Schedule one-on-one meeting",
                    "Review compensation",
                    "Discuss career development opportunities",
                    "Address any concerns"
                ]
            elif probability < 0.6:
                risk_level = "medium"
                recommendations = [
                    "Monitor engagement",
                    "Provide growth opportunities",
                    "Regular check-ins"
                ]
            else:
                risk_level = "low"
                recommendations = [
                    "Maintain current engagement strategies",
                    "Continue professional development"
                ]
            
            return {
                "retention_probability": float(probability),
                "risk_level": risk_level,
                "recommendations": recommendations
            }
        except Exception as e:
            logger.error(f"Error in retention prediction: {e}")
            return {
                "retention_probability": 0.5,
                "risk_level": "unknown",
                "recommendations": ["Unable to generate prediction"]
            }

