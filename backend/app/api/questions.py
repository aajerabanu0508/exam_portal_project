from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid, json

from app.database.session import get_db
from app.models.models import Question, DifficultyLevel
from app.schemas.schemas import QuestionCreate, QuestionUpdate, QuestionOut
from app.api.deps import require_trainer

router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.get("", response_model=List[QuestionOut])
def list_questions(
    topic: Optional[str] = Query(None),
    difficulty: Optional[DifficultyLevel] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(require_trainer),
):
    q = db.query(Question).filter(Question.is_active == True)
    if topic:
        q = q.filter(Question.topic == topic)
    if difficulty:
        q = q.filter(Question.difficulty == difficulty)
    return q.offset(skip).limit(limit).all()


@router.get("/topics", response_model=List[str])
def list_topics(db: Session = Depends(get_db), _=Depends(require_trainer)):
    rows = db.query(Question.topic).distinct().all()
    return [r[0] for r in rows]


@router.post("", response_model=QuestionOut, status_code=201)
def create_question(
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    _=Depends(require_trainer),
):
    q = Question(id=uuid.uuid4(), **payload.model_dump())
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.put("/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: str,
    payload: QuestionUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_trainer),
):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    for key, value in payload.model_dump().items():
        setattr(q, key, value)
    db.commit()
    db.refresh(q)
    return q


@router.delete("/{question_id}", status_code=204)
def delete_question(
    question_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_trainer),
):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.is_active = False
    db.commit()


@router.post("/import", status_code=201)
def import_questions(
    questions: List[QuestionCreate],
    db: Session = Depends(get_db),
    _=Depends(require_trainer),
):
    created = []
    for payload in questions:
        q = Question(id=uuid.uuid4(), **payload.model_dump())
        db.add(q)
        created.append(q)
    db.commit()
    return {"imported": len(created)}
