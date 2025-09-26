"""
Verification Service for comparing user and satellite image predictions
"""

import logging
from typing import Dict, Optional, List
from datetime import datetime

from ..database.models import VerificationResult
from ..database.connection import get_db_session

logger = logging.getLogger(__name__)

class VerificationService:
    def __init__(self):
        self.confidence_threshold = 0.7
        self.category_match_threshold = 0.8
    
    def compare_predictions(self, user_prediction: Dict, satellite_prediction: Dict) -> Dict:
        """
        Compare user and satellite image predictions
        
        Args:
            user_prediction: CNN prediction for user image
            satellite_prediction: CNN prediction for satellite image
            
        Returns:
            Dictionary with verification result
        """
        try:
            user_category = user_prediction.get('category')
            satellite_category = satellite_prediction.get('category')
            user_confidence = user_prediction.get('confidence', 0)
            satellite_confidence = satellite_prediction.get('confidence', 0)
            
            # Check if both predictions are valid
            if not user_category or not satellite_category:
                return {
                    'verified': False,
                    'reason': 'Invalid predictions from one or both images'
                }
            
            # Check confidence thresholds
            if user_confidence < self.confidence_threshold:
                return {
                    'verified': False,
                    'reason': f'User image confidence too low ({user_confidence:.2f} < {self.confidence_threshold})'
                }
            
            if satellite_confidence < self.confidence_threshold:
                return {
                    'verified': False,
                    'reason': f'Satellite image confidence too low ({satellite_confidence:.2f} < {self.confidence_threshold})'
                }
            
            # Check if categories match
            if user_category == satellite_category:
                # Categories match - check if both indicate pollution
                if user_category == 'clean_water':
                    return {
                        'verified': True,
                        'reason': 'Both images show clean water - no pollution detected'
                    }
                else:
                    return {
                        'verified': True,
                        'reason': f'Both images show {user_category} - pollution verified'
                    }
            else:
                # Categories don't match - check for partial matches
                similarity_score = self._calculate_category_similarity(user_category, satellite_category)
                
                if similarity_score >= self.category_match_threshold:
                    return {
                        'verified': True,
                        'reason': f'Similar pollution types detected: {user_category} vs {satellite_category}'
                    }
                else:
                    return {
                        'verified': False,
                        'reason': f'User image shows {user_category} but satellite shows {satellite_category} - mismatch'
                    }
        
        except Exception as e:
            logger.error(f"Error comparing predictions: {str(e)}")
            return {
                'verified': False,
                'reason': f'Error during comparison: {str(e)}'
            }
    
    def _calculate_category_similarity(self, category1: str, category2: str) -> float:
        """Calculate similarity between two pollution categories"""
        # Define similarity groups
        similarity_groups = {
            'water_pollution': ['sewage_discharge', 'turbidity', 'algae_bloom'],
            'surface_pollution': ['plastic_pollution', 'oil_spill'],
            'clean': ['clean_water']
        }
        
        # Find which group each category belongs to
        group1 = None
        group2 = None
        
        for group, categories in similarity_groups.items():
            if category1 in categories:
                group1 = group
            if category2 in categories:
                group2 = group
        
        # If both categories are in the same group, they're similar
        if group1 and group2 and group1 == group2:
            return 0.8
        
        # If one is clean and the other is not, they're not similar
        if (category1 == 'clean_water') != (category2 == 'clean_water'):
            return 0.2
        
        # Default similarity for different pollution types
        return 0.4
    
    def save_verification(self, verification_record: VerificationResult) -> bool:
        """Save verification result to database"""
        try:
            session = get_db_session()
            session.add(verification_record)
            session.commit()
            session.close()
            
            logger.info(f"Verification result saved for report {verification_record.report_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving verification: {str(e)}")
            return False
    
    def get_verification(self, report_id: int) -> Optional[VerificationResult]:
        """Get verification result for a specific report"""
        try:
            session = get_db_session()
            result = session.query(VerificationResult).filter(
                VerificationResult.report_id == report_id
            ).first()
            session.close()
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting verification for report {report_id}: {str(e)}")
            return None
    
    def get_verification_history(self, limit: int = 100) -> List[VerificationResult]:
        """Get recent verification history"""
        try:
            session = get_db_session()
            results = session.query(VerificationResult).order_by(
                VerificationResult.timestamp.desc()
            ).limit(limit).all()
            session.close()
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting verification history: {str(e)}")
            return []
    
    def get_verification_stats(self) -> Dict:
        """Get verification statistics"""
        try:
            session = get_db_session()
            
            total = session.query(VerificationResult).count()
            verified = session.query(VerificationResult).filter(
                VerificationResult.verified == True
            ).count()
            
            # Get category breakdown
            category_stats = {}
            for category in ['plastic_pollution', 'oil_spill', 'algae_bloom', 
                           'sewage_discharge', 'turbidity', 'clean_water']:
                count = session.query(VerificationResult).filter(
                    VerificationResult.user_category == category
                ).count()
                category_stats[category] = count
            
            session.close()
            
            return {
                'total_verifications': total,
                'verified_count': verified,
                'rejected_count': total - verified,
                'verification_rate': (verified / total * 100) if total > 0 else 0,
                'category_breakdown': category_stats,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting verification stats: {str(e)}")
            return {
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def verify_single_report(self, report_data: Dict) -> Dict:
        """Verify a single report (used in batch processing)"""
        try:
            # This would integrate with your existing database to get report details
            # For now, return a placeholder
            return {
                'report_id': report_data.get('id'),
                'verified': False,
                'reason': 'Batch verification not fully implemented',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error verifying single report: {str(e)}")
            return {
                'report_id': report_data.get('id'),
                'verified': False,
                'reason': f'Verification error: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }
    
    def get_report_details(self, report_id: int) -> Optional[Dict]:
        """Get report details from your existing database"""
        try:
            # This would integrate with your existing database
            # For now, return a placeholder
            return {
                'id': report_id,
                'latitude': 0.0,
                'longitude': 0.0,
                'pollution_type': 'unknown',
                'image_path': ''
            }
            
        except Exception as e:
            logger.error(f"Error getting report details for {report_id}: {str(e)}")
            return None
