"""
Pydantic Schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional, List


class ActivityBase(BaseModel):
    year: int
    term: str
    category: str
    title: str
    is_awarded: bool = False
    award_title: Optional[str] = None
    github_url: Optional[str] = None
    reflection: Optional[str] = None


class ActivityResponse(ActivityBase):
    id: str
    roles: List[str]
    images: List[str]
    certificates: List[str]
    readme_content: Optional[str] = None

    class Config:
        from_attributes = True


class PortfolioResponse(BaseModel):
    data: List[ActivityResponse]
