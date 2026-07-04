from datetime import datetime, timedelta, timezone
from hashlib import sha256
from uuid import NAMESPACE_URL, UUID, uuid5

import bcrypt
import jwt

from src.core.config import get_settings


def _bcrypt_input(plain: str) -> bytes:
    return sha256(plain.encode("utf-8")).hexdigest().encode("ascii")


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(_bcrypt_input(plain), bcrypt.gensalt()).decode("ascii")


def verify_password(plain: str, hashed: str) -> bool:
    hashed_bytes = hashed.encode("ascii")
    if bcrypt.checkpw(_bcrypt_input(plain), hashed_bytes):
        return True

    raw = plain.encode("utf-8")
    if len(raw) <= 72:
        return bcrypt.checkpw(raw, hashed_bytes)

    return False


def user_id_from_email(email: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"spendsense:user:{email.lower()}")


def create_access_token(user_id: UUID, *, email: str | None = None) -> str:
    settings = get_settings()
    expire = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire}
    if email:
        payload["email"] = email
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token_payload(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


def decode_token(token: str) -> str:
    payload = decode_token_payload(token)
    return str(payload["sub"])
