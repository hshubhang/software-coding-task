from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database import get_db
from api.dependencies import get_current_user
from api.models import DashboardData, User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _get_data(user: User, data_type: str, db: Session) -> dict:
    entry = (
        db.query(DashboardData)
        .filter(DashboardData.user_id == user.id, DashboardData.data_type == data_type)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail=f"No {data_type} data found")
    return entry.data


@router.get("/summary")
def get_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_data(user, "summary", db)


@router.get("/roi")
def get_roi(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_data(user, "roi", db)


@router.get("/contribution")
def get_contribution(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_data(user, "contribution", db)


@router.get("/response-curves")
def get_response_curves(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_data(user, "response_curves", db)


@router.get("/spend")
def get_spend(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_data(user, "spend", db)


