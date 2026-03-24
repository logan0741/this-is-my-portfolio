"""
GitHub README 비동기 업데이트 서비스
- Phase 2: 서버 시작 시 백그라운드 태스크로 실행
- Phase 3: APScheduler로 매일 자정 실행
"""
import asyncio
import logging
import os

import httpx
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Activity

logger = logging.getLogger(__name__)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")


def parse_github_owner_repo(url: str) -> Optional[Tuple[str, str]]:
    """GitHub URL에서 owner/repo 추출"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        if parsed.hostname != "github.com":
            return None
        parts = parsed.path.strip("/").split("/")
        if len(parts) >= 2:
            return parts[0], parts[1]
    except Exception:
        pass
    return None


async def fetch_readme(owner: str, repo: str) -> Optional[str]:
    """GitHub API에서 README 내용을 가져옴"""
    headers = {
        "Accept": "application/vnd.github.v3.raw",
        "User-Agent": "Portfolio-Backend",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    url = f"https://api.github.com/repos/{owner}/{repo}/readme"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                return response.text
            else:
                logger.warning(f"Failed to fetch README for {owner}/{repo}: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error fetching README for {owner}/{repo}: {e}")
            return None


async def update_all_readmes():
    """
    DB의 모든 활동 중 github_url이 있고 readme_content가 비어있거나
    업데이트가 필요한 항목을 크롤링하여 업데이트
    """
    logger.info("Starting README update task...")

    db: Session = SessionLocal()
    try:
        activities = db.query(Activity).filter(
            Activity.github_url.isnot(None),
            Activity.github_url != "",
        ).all()

        updated_count = 0
        for activity in activities:
            # readme_content가 이미 있으면 건너뜀 (강제 업데이트 원하면 조건 제거)
            if activity.readme_content:
                continue

            parsed = parse_github_owner_repo(activity.github_url)
            if not parsed:
                continue

            owner, repo = parsed
            readme = await fetch_readme(owner, repo)

            if readme:
                activity.readme_content = readme
                updated_count += 1
                logger.info(f"Updated README for: {activity.title} ({owner}/{repo})")

            # Rate Limit 방어: 각 요청 사이 2초 대기
            await asyncio.sleep(2)

        db.commit()
        logger.info(f"README update complete. Updated {updated_count} activities.")

    except Exception as e:
        logger.error(f"README update task failed: {e}")
        db.rollback()
    finally:
        db.close()
