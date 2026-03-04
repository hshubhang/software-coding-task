"""Seed script: creates demo user and ingests Meridian trace data into Postgres."""

import sys
from pathlib import Path

# Ensure the api package is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api.auth import hash_password
from api.database import SessionLocal, engine, Base
from api.models import User, DashboardData
from api.services.meridian_service import load_model, extract_all

PKL_PATH = str(Path(__file__).resolve().parent.parent.parent / "meridian_trace" / "example_mmm_1_4_0.pkl")
DEMO_EMAIL = "demo@bluealpha.com"
DEMO_PASSWORD = "password123"


def seed():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if demo user already exists
        existing = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if existing:
            print(f"Demo user already exists (id={existing.id}). Clearing old dashboard data...")
            db.query(DashboardData).filter(DashboardData.user_id == existing.id).delete()
            db.commit()
            user = existing
        else:
            print("Creating demo user...")
            user = User(email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD))
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created user: {user.email} (id={user.id})")

        print(f"Loading Meridian model from {PKL_PATH}...")
        model = load_model(PKL_PATH)

        print("Extracting dashboard data...")
        all_data = extract_all(model)

        print("Storing in database...")
        for data_type, data in all_data.items():
            entry = DashboardData(user_id=user.id, data_type=data_type, data=data)
            db.add(entry)

        db.commit()
        print(f"Stored {len(all_data)} data entries for user {user.email}")
        print("\nSeed complete! Login with:")
        print(f"  Email: {DEMO_EMAIL}")
        print(f"  Password: {DEMO_PASSWORD}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
