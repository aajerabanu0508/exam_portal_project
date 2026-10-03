"""
Database seed script: creates admin user and inserts question bank.
Run once after migrations: python -m app.services.seed
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database.session import SessionLocal, engine
from app.models.models import Base, User, UserRole, Question, DifficultyLevel, Test
from app.core.security import get_password_hash
from app.core.config import settings
from app.services.questions_data import QUESTIONS
import uuid


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Create admin/trainer user
        existing_admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not existing_admin:
            admin = User(
                id=uuid.uuid4(),
                name=settings.ADMIN_NAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                role=UserRole.trainer,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"✅ Admin created: {settings.ADMIN_EMAIL}")
        else:
            admin = existing_admin
            print(f"ℹ️  Admin already exists: {settings.ADMIN_EMAIL}")

        # Seed questions
        existing_count = db.query(Question).count()
        if existing_count == 0:
            for q in QUESTIONS:
                question = Question(
                    id=uuid.uuid4(),
                    question_text=q["question_text"],
                    option_a=q["option_a"],
                    option_b=q["option_b"],
                    option_c=q["option_c"],
                    option_d=q["option_d"],
                    correct_answer=q["correct_answer"],
                    explanation=q.get("explanation"),
                    topic=q["topic"],
                    difficulty=DifficultyLevel(q["difficulty"]),
                )
                db.add(question)
            db.commit()
            print(f"✅ {len(QUESTIONS)} questions seeded.")
        else:
            print(f"ℹ️  {existing_count} questions already exist, skipping seed.")

        # Create default test
        existing_test = db.query(Test).first()
        if not existing_test:
            test = Test(
                id=uuid.uuid4(),
                name="AWS & CS Assessment 01",
                description="AWS and Computer Science fundamentals assessment",
                duration_minutes=30,
                total_questions=30,
                marks_per_correct=1.0,
                negative_marks=0.0,
                passing_percentage=50.0,
                max_violations=3,
                auto_submit_on_violation=True,
                difficulty_config={"easy": 10, "medium": 15, "hard": 5},
                is_active=True,
                created_by=admin.id,
            )
            db.add(test)
            db.commit()
            print(f"✅ Default test created: {test.name}")
        else:
            print(f"ℹ️  Tests already exist, skipping.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
