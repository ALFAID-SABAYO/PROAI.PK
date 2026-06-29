"""One-time seed: load cleaned Karachi/Islamabad dataset into Postgres."""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.orm import Session

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

BACKEND_ROOT_ENV = Path(__file__).resolve().parents[1] / ".env"
if (PROJECT_ROOT / ".env").exists():
    load_dotenv(PROJECT_ROOT / ".env")
elif BACKEND_ROOT_ENV.exists():
    load_dotenv(BACKEND_ROOT_ENV)
else:
    load_dotenv()

from app.config import get_settings
from app.database import get_session_local
from app.ml.preprocessing import clean_dataset, load_raw_dataset
from app.models.property import Property
from app.models.user import User, UserRole
from app.services.auth_service import create_user

settings = get_settings()
BATCH_SIZE = 1000


def seed_users(db: Session) -> None:
    admin = db.query(User).filter(User.email == "admin@realestate.pk").first()
    if not admin:
        create_user(db, "admin@realestate.pk", "admin123", "System Admin", UserRole.ADMIN)
        print("Created admin@realestate.pk / admin123")

    investor = db.query(User).filter(User.email == "investor@realestate.pk").first()
    if not investor:
        create_user(db, "investor@realestate.pk", "investor123", "Demo Investor", UserRole.INVESTOR)
        print("Created investor@realestate.pk / investor123")

    agent = db.query(User).filter(User.email == "agent@realestate.pk").first()
    if not agent:
        create_user(db, "agent@realestate.pk", "agent123", "Demo Agent", UserRole.AGENT)
        print("Created agent@realestate.pk / agent123")


def seed_properties(db: Session, limit: int | None = None) -> int:
    existing = db.query(Property).filter(Property.external_id.isnot(None)).count()
    if existing > 0:
        print(f"Skipping property seed — {existing} dataset rows already loaded.")
        return 0

    raw = load_raw_dataset(settings.DATASET_PATH)
    cleaned = clean_dataset(raw)
    if limit:
        cleaned = cleaned.head(limit)

    inserted = 0
    batch: list[Property] = []

    for _, row in cleaned.iterrows():
        prop = Property(
            external_id=int(row["property_id"]) if "property_id" in row and row["property_id"] else None,
            property_type=str(row["property_type"]),
            price=float(row["price_numeric"]),
            location=str(row["location"]),
            city=str(row["city"]),
            province_name=str(row.get("province_name")) if row.get("province_name") else None,
            latitude=float(row["latitude"]) if row.get("latitude") == row.get("latitude") else None,
            longitude=float(row["longitude"]) if row.get("longitude") == row.get("longitude") else None,
            baths=int(row["baths"]),
            bedrooms=int(row["bedrooms"]),
            area_type=str(row.get("area_type")) if row.get("area_type") else None,
            area_size=float(row["area_size"]),
            area_category=str(row.get("area_category")) if row.get("area_category") else None,
            purpose=str(row.get("purpose")) if row.get("purpose") else None,
            page_url=str(row.get("page_url")) if row.get("page_url") else None,
            agency=str(row.get("agency")) if row.get("agency") and str(row.get("agency")) != "nan" else None,
            agent_name=str(row.get("agent")) if row.get("agent") and str(row.get("agent")) != "nan" else None,
            date_added=str(row.get("date_added")) if row.get("date_added") else None,
            is_active=True,
        )
        batch.append(prop)
        if len(batch) >= BATCH_SIZE:
            db.bulk_save_objects(batch)
            db.commit()
            inserted += len(batch)
            print(f"Inserted {inserted} properties...")
            batch = []

    if batch:
        db.bulk_save_objects(batch)
        db.commit()
        inserted += len(batch)

    print(f"Seeded {inserted} properties from dataset.")
    return inserted


def main():
    limit = int(os.getenv("SEED_LIMIT", "0")) or None
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        seed_users(db)
        seed_properties(db, limit=limit)
    finally:
        db.close()


if __name__ == "__main__":
    main()
