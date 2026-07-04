#!/usr/bin/env python3
"""
Tạo các biến môi trường cần thiết cho production deployment
Chạy: python generate_env.py
"""

import secrets
import json

def generate_jwt_secret():
    """Generate JWT secret key"""
    return secrets.token_hex(32)

def generate_sample_env():
    """Generate sample .env.production"""
    env_vars = {
        "JWT_SECRET_KEY": generate_jwt_secret(),
        "JWT_ALGORITHM": "HS256",
        "JWT_EXPIRE_MINUTES": "1440",
        "API_HOST": "0.0.0.0",
        "API_PORT": "$PORT",
        "DEBUG": "false",
        "YOLO_CONFIDENCE": "0.3",
        "EMBEDDING_MODEL": "all-MiniLM-L6-v2",
        "SIMILARITY_THRESHOLD": "0.9",
        "CHROMA_HOST": "localhost",
        "CHROMA_PORT": "8000",
        "CHROMA_COLLECTION": "receipt_insights",
    }
    
    return env_vars

if __name__ == "__main__":
    print("=" * 60)
    print("🔐 Production Environment Variables Generator")
    print("=" * 60)
    
    env_vars = generate_sample_env()
    
    print("\n📝 Sao chép các biến sau vào Render/Vercel Settings:\n")
    for key, value in env_vars.items():
        print(f"  {key} = {value}")
    
    print("\n" + "=" * 60)
    print("✅ JWT_SECRET_KEY được tạo mới tự động!")
    print("⚠️  Các biến khác (API_KEY, DATABASE_URL) cần được set thủ công")
    print("=" * 60)
    
    # Export ra file
    with open(".env.production", "w") as f:
        for key, value in env_vars.items():
            if value != "$PORT":  # Skip dynamic vars
                f.write(f"{key}={value}\n")
    
    print(f"\n✅ Đã tạo .env.production")
    print("📌 Thêm các biến còn thiếu vào file này trước khi deploy!")
