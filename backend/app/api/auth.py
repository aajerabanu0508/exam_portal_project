from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from app.database.session import get_db
from app.models.models import User, UserRole
from app.schemas.schemas import StudentRegister, TrainerLogin, TokenResponse, UserOut
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register_student(payload: StudentRegister, db: Session = Depends(get_db)):
    """Register a new student and return a JWT token."""
    email_clean = payload.email.strip().lower()
    student_id_clean = payload.student_id.strip() if payload.student_id else None
    phone_clean = payload.phone.strip() if payload.phone else None

    # Check if student_id is already registered to a different user/email
    if student_id_clean:
        existing_by_student_id = db.query(User).filter(User.student_id == student_id_clean).first()
        if existing_by_student_id and existing_by_student_id.email.lower() != email_clean:
            raise HTTPException(
                status_code=400,
                detail=f"Student ID '{student_id_clean}' is already registered to another user."
            )

    # Check if phone number is already registered to a different user/email
    if phone_clean:
        existing_by_phone = db.query(User).filter(User.phone == phone_clean).first()
        if existing_by_phone and existing_by_phone.email.lower() != email_clean:
            raise HTTPException(
                status_code=400,
                detail=f"Phone number '{phone_clean}' is already registered to another user."
            )

    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        # Check student_id match if provided
        if student_id_clean and existing.student_id and existing.student_id.strip().lower() != student_id_clean.lower():
            raise HTTPException(
                status_code=400,
                detail=f"Student ID '{student_id_clean}' does not match the registered record for {payload.email}."
            )
        # Check phone match if provided
        if phone_clean and existing.phone and existing.phone.strip() != phone_clean:
            raise HTTPException(
                status_code=400,
                detail=f"Phone number '{phone_clean}' does not match the registered record for {payload.email}."
            )
        # If already registered, log them in
        token = create_access_token({"sub": str(existing.id), "role": existing.role.value})
        return TokenResponse(
            access_token=token,
            user_id=str(existing.id),
            name=existing.name,
            role=existing.role.value,
        )

    # Auto-generate a random password for students (they don't need it)
    temp_password = str(uuid.uuid4())
    user = User(
        id=uuid.uuid4(),
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        college=payload.college,
        student_id=payload.student_id,
        hashed_password=get_password_hash(temp_password),
        role=UserRole.student,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        name=user.name,
        role=user.role.value,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: TrainerLogin, db: Session = Depends(get_db)):
    """Login for trainers/admins with email+password."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.role == UserRole.student:
        raise HTTPException(status_code=403, detail="Use the student registration endpoint")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        name=user.name,
        role=user.role.value,
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
