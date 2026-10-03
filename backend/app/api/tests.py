from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database.session import get_db
from app.models.models import Test, User
from app.schemas.schemas import TestCreate, TestUpdate, TestOut
from app.api.deps import get_current_user, require_trainer

router = APIRouter(prefix="/api/tests", tags=["tests"])


@router.get("", response_model=List[TestOut])
def list_tests(db: Session = Depends(get_db)):
    return db.query(Test).filter(Test.is_active == True).all()


@router.get("/{test_id}", response_model=TestOut)
def get_test(test_id: str, db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test


@router.post("", response_model=TestOut, status_code=201)
def create_test(
    payload: TestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer),
):
    test = Test(id=uuid.uuid4(), **payload.model_dump(), created_by=current_user.id)
    db.add(test)
    db.commit()
    db.refresh(test)
    return test


@router.put("/{test_id}", response_model=TestOut)
def update_test(
    test_id: str,
    payload: TestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer),
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    for key, value in payload.model_dump().items():
        setattr(test, key, value)
    db.commit()
    db.refresh(test)
    return test


@router.delete("/{test_id}", status_code=204)
def delete_test(
    test_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer),
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    test.is_active = False
    db.commit()
