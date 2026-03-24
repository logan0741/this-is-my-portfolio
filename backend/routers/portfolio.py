"""
Portfolio API Router
GET /api/portfolio - 전체 데이터 조회
POST /api/portfolio - 새 활동 추가
PUT /api/portfolio/{id} - 활동 수정
"""
import os
import uuid
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Year, Activity, ActivityRole, ActivityFile

router = APIRouter()

UPLOAD_DIR = "uploads"


def activity_to_dict(activity: Activity) -> dict:
    """Convert Activity ORM object to frontend-compatible dict"""
    return {
        "id": activity.id,
        "year": activity.year.year_value,
        "term": activity.term,
        "category": activity.category,
        "title": activity.title,
        "is_awarded": activity.is_awarded,
        "award_title": activity.award_title,
        "github_url": activity.github_url,
        "readme_content": activity.readme_content,
        "reflection": activity.reflection,
        "roles": [r.role_name for r in activity.roles],
        "images": [f.file_url for f in activity.files if f.file_type == "image"],
        "certificates": [f.file_url for f in activity.files if f.file_type == "certificate"],
    }


@router.get("/portfolio")
def get_portfolio(db: Session = Depends(get_db)):
    """전체 포트폴리오 데이터를 JSON 규격으로 반환"""
    activities = db.query(Activity).all()
    return [activity_to_dict(a) for a in activities]


@router.post("/portfolio")
async def create_activity(
    id: str = Form(default_factory=lambda: str(uuid.uuid4())),
    year: int = Form(...),
    term: str = Form(...),
    category: str = Form(...),
    roles: str = Form(...),  # JSON string array
    title: str = Form(...),
    is_awarded: str = Form("false"),
    award_title: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    reflection: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    certificates: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    """새 활동 추가 (multipart/form-data)"""

    # Get or create Year
    year_obj = db.query(Year).filter(Year.year_value == year).first()
    if not year_obj:
        year_obj = Year(year_value=year)
        db.add(year_obj)
        db.flush()

    # Create Activity
    activity = Activity(
        id=id,
        year_id=year_obj.id,
        term=term,
        category=category,
        title=title,
        is_awarded=is_awarded.lower() == "true",
        award_title=award_title if award_title else None,
        github_url=github_url if github_url else None,
        reflection=reflection,
    )
    db.add(activity)

    # Parse and save roles
    role_list = json.loads(roles)
    for role_name in role_list:
        db.add(ActivityRole(activity_id=id, role_name=role_name))

    # Save uploaded images
    for img in images:
        filename = f"{uuid.uuid4()}_{img.filename}"
        filepath = os.path.join(UPLOAD_DIR, "images", filename)
        content = await img.read()
        with open(filepath, "wb") as f:
            f.write(content)
        db.add(ActivityFile(
            activity_id=id,
            file_type="image",
            file_url=f"/uploads/images/{filename}",
        ))

    # Save uploaded certificates
    for cert in certificates:
        filename = f"{uuid.uuid4()}_{cert.filename}"
        filepath = os.path.join(UPLOAD_DIR, "certificates", filename)
        content = await cert.read()
        with open(filepath, "wb") as f:
            f.write(content)
        db.add(ActivityFile(
            activity_id=id,
            file_type="certificate",
            file_url=f"/uploads/certificates/{filename}",
        ))

    db.commit()
    db.refresh(activity)

    return {"status": "created", "id": activity.id}


@router.put("/portfolio/{activity_id}")
async def update_activity(
    activity_id: str,
    year: int = Form(...),
    term: str = Form(...),
    category: str = Form(...),
    roles: str = Form(...),
    title: str = Form(...),
    is_awarded: str = Form("false"),
    award_title: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    reflection: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    certificates: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    """특정 활동 수정"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get or create Year
    year_obj = db.query(Year).filter(Year.year_value == year).first()
    if not year_obj:
        year_obj = Year(year_value=year)
        db.add(year_obj)
        db.flush()

    # Update fields
    activity.year_id = year_obj.id
    activity.term = term
    activity.category = category
    activity.title = title
    activity.is_awarded = is_awarded.lower() == "true"
    activity.award_title = award_title if award_title else None
    activity.github_url = github_url if github_url else None
    activity.reflection = reflection

    # Update roles
    db.query(ActivityRole).filter(ActivityRole.activity_id == activity_id).delete()
    role_list = json.loads(roles)
    for role_name in role_list:
        db.add(ActivityRole(activity_id=activity_id, role_name=role_name))

    # Add new files (keep existing ones unless new ones are uploaded)
    if images:
        # Remove old images
        old_images = db.query(ActivityFile).filter(
            ActivityFile.activity_id == activity_id,
            ActivityFile.file_type == "image"
        ).all()
        for old in old_images:
            db.delete(old)

        for img in images:
            filename = f"{uuid.uuid4()}_{img.filename}"
            filepath = os.path.join(UPLOAD_DIR, "images", filename)
            content = await img.read()
            with open(filepath, "wb") as f:
                f.write(content)
            db.add(ActivityFile(
                activity_id=activity_id,
                file_type="image",
                file_url=f"/uploads/images/{filename}",
            ))

    if certificates:
        old_certs = db.query(ActivityFile).filter(
            ActivityFile.activity_id == activity_id,
            ActivityFile.file_type == "certificate"
        ).all()
        for old in old_certs:
            db.delete(old)

        for cert in certificates:
            filename = f"{uuid.uuid4()}_{cert.filename}"
            filepath = os.path.join(UPLOAD_DIR, "certificates", filename)
            content = await cert.read()
            with open(filepath, "wb") as f:
                f.write(content)
            db.add(ActivityFile(
                activity_id=activity_id,
                file_type="certificate",
                file_url=f"/uploads/certificates/{filename}",
            ))

    db.commit()
    db.refresh(activity)

    return {"status": "updated", "id": activity.id}
