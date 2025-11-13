"""Clustering service."""
from typing import Dict, Any, List
import logging
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class ClusteringService:
    """Service for clustering analysis."""
    
    def __init__(self):
        self.scaler = StandardScaler()
    
    def cluster(self, data: List[Dict[str, Any]], n_clusters: int = 5, features: List[str] = None) -> Dict[str, Any]:
        """Perform clustering on data."""
        try:
            if not data:
                return {"clusters": [], "cluster_centers": []}
            
            # Extract feature vectors
            if features is None:
                # Auto-detect numeric features
                features = [key for key in data[0].keys() if isinstance(data[0][key], (int, float))]
            
            X = []
            for item in data:
                feature_vector = [item.get(feature, 0) for feature in features]
                X.append(feature_vector)
            
            X = np.array(X)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Perform clustering
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            labels = kmeans.fit_predict(X_scaled)
            
            # Prepare results
            clusters = []
            for i, item in enumerate(data):
                clusters.append({
                    **item,
                    "cluster_id": int(labels[i]),
                    "cluster_label": f"Cluster {labels[i]}"
                })
            
            cluster_centers = kmeans.cluster_centers_.tolist()
            
            return {
                "clusters": clusters,
                "cluster_centers": cluster_centers
            }
        except Exception as e:
            logger.error(f"Error in clustering: {e}")
            return {"clusters": [], "cluster_centers": []}

