"""
Idempotent default admin creation on application startup.

Requires ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME to all be set.
If a user with that email already exists, no row is inserted (no duplicate admins).
"""
import logging
import re

from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError

from app.config.settings import settings
from app.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.utils.auth import get_password_hash

logger = logging.getLogger(__name__)

_MIN_PASSWORD_LEN = 8
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


async def ensure_default_admin() -> None:
    """
    Create the bootstrap admin user when configured and absent.

    Safe for production: no-op when env vars are missing, invalid, or user exists.
    Password is never logged. Uses the same bcrypt hashing as normal registration.
    """
    email_raw = settings.ADMIN_EMAIL
    password = settings.ADMIN_PASSWORD
    name_raw = settings.ADMIN_NAME

    if not email_raw or not password or not name_raw:
        logger.info(
            "Admin bootstrap skipped: set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME "
            "to create a default admin on startup."
        )
        return

    email = email_raw.strip().lower()
    name = name_raw.strip()

    if not name:
        logger.warning("Admin bootstrap skipped: ADMIN_NAME is empty after trimming.")
        return

    if not _EMAIL_RE.match(email):
        logger.warning("Admin bootstrap skipped: ADMIN_EMAIL is not a valid email format.")
        return

    if len(password) < _MIN_PASSWORD_LEN:
        logger.warning(
            "Admin bootstrap skipped: ADMIN_PASSWORD must be at least %s characters.",
            _MIN_PASSWORD_LEN,
        )
        return

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User.id).where(func.lower(User.email) == email))
        if result.scalar_one_or_none() is not None:
            logger.info(
                "Admin bootstrap skipped: a user with email %s already exists.",
                email,
            )
            return

        admin = User(
            name=name,
            email=email,
            password_hash=get_password_hash(password),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        try:
            await db.commit()
            logger.info(
                "Admin bootstrap: created default admin user for %s (role=admin).",
                email,
            )
        except IntegrityError:
            await db.rollback()
            logger.info(
                "Admin bootstrap skipped: user with email %s was created concurrently "
                "or already exists.",
                email,
            )
