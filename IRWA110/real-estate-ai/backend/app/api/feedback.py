from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel
from app.db.base import get_db
from app.models.user import User
from app.models.response import Response
from app.models.feedback import Feedback
from app.api.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["feedback"])

# Pydantic models
class FeedbackRequest(BaseModel):
    response_id: int
    is_positive: bool

class FeedbackResponse(BaseModel):
    id: int
    response_id: int
    is_positive: bool
    created_at: str

@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(
    feedback_data: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit feedback for a property analysis response"""
    try:
        # Check if response exists - Updated to SQLAlchemy 2.x syntax
        stmt = select(Response).where(Response.id == feedback_data.response_id)
        response = db.execute(stmt).scalar_one_or_none()
        
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Response not found"
            )
        
        # Check if user already provided feedback for this response - Updated to SQLAlchemy 2.x syntax
        stmt = select(Feedback).where(
            Feedback.response_id == feedback_data.response_id,
            Feedback.user_id == current_user.id
        )
        existing_feedback = db.execute(stmt).scalar_one_or_none()
        
        if existing_feedback:
            # Update existing feedback
            existing_feedback.is_positive = feedback_data.is_positive
            db.commit()
            db.refresh(existing_feedback)
            
            logger.info(f"Feedback updated for response {feedback_data.response_id} by user {current_user.id}")
            
            return FeedbackResponse(
                id=existing_feedback.id,
                response_id=existing_feedback.response_id,
                is_positive=existing_feedback.is_positive,
                created_at=existing_feedback.created_at.isoformat()
            )
        else:
            # Create new feedback
            new_feedback = Feedback(
                response_id=feedback_data.response_id,
                user_id=current_user.id,
                is_positive=feedback_data.is_positive
            )
            
            db.add(new_feedback)
            db.commit()
            db.refresh(new_feedback)
            
            logger.info(f"New feedback submitted for response {feedback_data.response_id} by user {current_user.id}")
            
            return FeedbackResponse(
                id=new_feedback.id,
                response_id=new_feedback.response_id,
                is_positive=new_feedback.is_positive,
                created_at=new_feedback.created_at.isoformat()
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error submitting feedback"
        )

@router.get("/response/{response_id}")
async def get_response_feedback(
    response_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get feedback statistics for a specific response"""
    try:
        # Check if response exists - Updated to SQLAlchemy 2.x syntax
        stmt = select(Response).where(Response.id == response_id)
        response = db.execute(stmt).scalar_one_or_none()
        
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Response not found"
            )
        
        # Get feedback statistics - Updated to SQLAlchemy 2.x syntax
        stmt = select(Feedback).where(Feedback.response_id == response_id)
        total_feedback = len(db.execute(stmt).scalars().all())
        
        stmt = select(Feedback).where(
            Feedback.response_id == response_id,
            Feedback.is_positive == True
        )
        positive_feedback = len(db.execute(stmt).scalars().all())
        
        # Get user's feedback if any - Updated to SQLAlchemy 2.x syntax
        stmt = select(Feedback).where(
            Feedback.response_id == response_id,
            Feedback.user_id == current_user.id
        )
        user_feedback = db.execute(stmt).scalar_one_or_none()
        
        return {
            "response_id": response_id,
            "total_feedback": total_feedback,
            "positive_feedback": positive_feedback,
            "negative_feedback": total_feedback - positive_feedback,
            "user_feedback": user_feedback.is_positive if user_feedback else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching response feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error fetching feedback"
        )
