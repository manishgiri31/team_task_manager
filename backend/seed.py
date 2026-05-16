#!/usr/bin/env python3
"""
Development database seed: 1 admin, 3 members, 2 projects, 8 tasks.

Usage (from the `backend` directory, with `.env` containing DATABASE_URL and SECRET_KEY):

    python seed.py

Replace an existing seed:

    python seed.py --force

Requires existing tables (run the app once with DEBUG=True or apply migrations).
"""
from __future__ import annotations

import argparse
import asyncio
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from dotenv import load_dotenv

load_dotenv(_BACKEND_ROOT / ".env")

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models.project import Project, ProjectMember
from app.models.task import Task, TaskPriority, TaskStatus
from app.models.user import User, UserRole
from app.utils.auth import get_password_hash

SEED_EMAIL_DOMAIN = "@seed.team-task-manager.local"
SEED_MARKER = "[[seed:team-task-manager-v1]]"
SEED_ADMIN_EMAIL = f"morgan.chen{SEED_EMAIL_DOMAIN}"
SEED_PASSWORD = "SeedDemo#2024"
SEED_MEMBER_EMAILS = [
    f"jordan.ellis{SEED_EMAIL_DOMAIN}",
    f"sam.rivera{SEED_EMAIL_DOMAIN}",
    f"casey.brooks{SEED_EMAIL_DOMAIN}",
]
ALL_SEED_EMAILS = [SEED_ADMIN_EMAIL, *SEED_MEMBER_EMAILS]


async def _already_seeded(session: AsyncSession) -> bool:
    r = await session.execute(select(User.id).where(User.email == SEED_ADMIN_EMAIL))
    return r.scalar_one_or_none() is not None


async def clear_seed(session: AsyncSession) -> None:
    """Delete seed projects (cascade tasks + memberships), then seed users."""
    await session.execute(
        delete(Project).where(Project.description.like(f"%{SEED_MARKER}%"))
    )
    await session.execute(delete(User).where(User.email.in_(ALL_SEED_EMAILS)))
    await session.commit()


async def insert_seed() -> None:
    password_hash = get_password_hash(SEED_PASSWORD)

    admin = User(
        name="Morgan Chen",
        email=SEED_ADMIN_EMAIL,
        password_hash=password_hash,
        role=UserRole.ADMIN,
    )
    members = [
        User(
            name="Jordan Ellis",
            email=SEED_MEMBER_EMAILS[0],
            password_hash=password_hash,
            role=UserRole.MEMBER,
        ),
        User(
            name="Sam Rivera",
            email=SEED_MEMBER_EMAILS[1],
            password_hash=password_hash,
            role=UserRole.MEMBER,
        ),
        User(
            name="Casey Brooks",
            email=SEED_MEMBER_EMAILS[2],
            password_hash=password_hash,
            role=UserRole.MEMBER,
        ),
    ]

    now = datetime.now(timezone.utc)

    async with AsyncSessionLocal() as session:
        session.add(admin)
        session.add_all(members)
        await session.flush()

        jordan, sam, casey = members

        p1 = Project(
            title="Customer onboarding redesign",
            description=(
                "Unify signup, profile completion, and first-run guidance across web and mobile. "
                "Partner with design on research-backed flows.\n\n"
                f"{SEED_MARKER}"
            ),
            created_by=admin.id,
        )
        p2 = Project(
            title="API performance initiative",
            description=(
                "Reduce p95 latency on core read paths, add caching where safe, and document SLOs. "
                "Includes load-test harness updates.\n\n"
                f"{SEED_MARKER}"
            ),
            created_by=admin.id,
        )
        session.add_all([p1, p2])
        await session.flush()

        for uid in (admin.id, jordan.id, sam.id, casey.id):
            session.add(ProjectMember(project_id=p1.id, user_id=uid))
        for uid in (admin.id, jordan.id, sam.id):
            session.add(ProjectMember(project_id=p2.id, user_id=uid))

        await session.flush()

        tasks_spec: list[dict] = [
            {
                "title": "Draft onboarding journey map",
                "description": "Cover happy path, edge cases, and handoffs to support.",
                "status": TaskStatus.TODO,
                "priority": TaskPriority.HIGH,
                "due_date": now - timedelta(days=5),
                "project_id": p1.id,
                "assigned_to": jordan.id,
            },
            {
                "title": "Implement profile completion checklist",
                "description": "Persist progress server-side; reuse existing auth middleware.",
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.MEDIUM,
                "due_date": now + timedelta(days=1),
                "project_id": p1.id,
                "assigned_to": sam.id,
            },
            {
                "title": "Ship tooltip copy for first-run tour",
                "description": "Localization-ready strings; coordinate with marketing.",
                "status": TaskStatus.DONE,
                "priority": TaskPriority.LOW,
                "due_date": now - timedelta(days=21),
                "project_id": p1.id,
                "assigned_to": casey.id,
            },
            {
                "title": "Backlog: audit analytics events for onboarding funnel",
                "description": None,
                "status": TaskStatus.TODO,
                "priority": TaskPriority.MEDIUM,
                "due_date": None,
                "project_id": p1.id,
                "assigned_to": None,
            },
            {
                "title": "Add Redis cache for org directory endpoint",
                "description": "TTL 120s; invalidate on membership writes.",
                "status": TaskStatus.TODO,
                "priority": TaskPriority.HIGH,
                "due_date": now + timedelta(days=10),
                "project_id": p2.id,
                "assigned_to": jordan.id,
            },
            {
                "title": "Document baseline p95 metrics",
                "description": "Attach Grafana links and methodology to the wiki.",
                "status": TaskStatus.DONE,
                "priority": TaskPriority.MEDIUM,
                "due_date": now.replace(hour=23, minute=59, second=0, microsecond=0),
                "project_id": p2.id,
                "assigned_to": sam.id,
            },
            {
                "title": "Profile slow query on invoices listing",
                "description": "EXPLAIN ANALYZE against staging snapshot.",
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.HIGH,
                "due_date": now - timedelta(days=2),
                "project_id": p2.id,
                "assigned_to": sam.id,
            },
            {
                "title": "Schedule load-test dry run",
                "description": "Coordinate with infra; no customer traffic window Thu 02:00 UTC.",
                "status": TaskStatus.TODO,
                "priority": TaskPriority.MEDIUM,
                "due_date": now + timedelta(days=3),
                "project_id": p2.id,
                "assigned_to": None,
            },
        ]

        for spec in tasks_spec:
            session.add(
                Task(
                    title=spec["title"],
                    description=spec["description"],
                    status=spec["status"],
                    priority=spec["priority"],
                    due_date=spec["due_date"],
                    project_id=spec["project_id"],
                    assigned_to=spec["assigned_to"],
                    created_by=admin.id,
                )
            )

        await session.commit()

    print("Seed completed successfully.")
    print(f"  Admin login:   {SEED_ADMIN_EMAIL} / {SEED_PASSWORD}")
    print(f"  Member logins: {', '.join(SEED_MEMBER_EMAILS)} / same password")
    print("  Projects:      Customer onboarding redesign, API performance initiative")
    print("  Tasks:         8 (mixed status, priority, due dates, assignments)")


async def async_main(force: bool) -> None:
    async with AsyncSessionLocal() as session:
        exists = await _already_seeded(session)
    if exists and not force:
        print(
            "Seed data already exists (admin email found). "
            "Use `python seed.py --force` to remove and re-seed.",
            file=sys.stderr,
        )
        sys.exit(1)
    if exists and force:
        async with AsyncSessionLocal() as session:
            await clear_seed(session)
        print("Cleared previous seed data.")

    async with AsyncSessionLocal() as session:
        if await _already_seeded(session):
            print("Seed admin still present after clear; aborting.", file=sys.stderr)
            sys.exit(1)

    await insert_seed()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the Team Task Manager database.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Remove existing seed rows (marker + seed emails) then re-insert.",
    )
    args = parser.parse_args()
    asyncio.run(async_main(force=args.force))


if __name__ == "__main__":
    main()
