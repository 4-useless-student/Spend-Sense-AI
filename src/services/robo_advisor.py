from __future__ import annotations

import asyncio
import json
import math
from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models import Transaction, InvestmentProfile, InvestmentAsset
from src.core.config import get_settings
from src.llm.gemini_client import _call_gemini

log = structlog.get_logger(__name__)

# Target allocations by risk appetite
TARGET_ALLOCATIONS = {
    "conservative": {
        "saving": 0.50,
        "gold": 0.30,
        "stock": 0.20,
        "crypto": 0.00
    },
    "moderate": {
        "saving": 0.30,
        "gold": 0.20,
        "stock": 0.40,
        "crypto": 0.10
    },
    "aggressive": {
        "saving": 0.10,
        "gold": 0.10,
        "stock": 0.60,
        "crypto": 0.20
    }
}

# Expected annual yields by risk appetite
EXPECTED_YIELDS = {
    "conservative": 0.07,  # 7%
    "moderate": 0.10,      # 10%
    "aggressive": 0.14     # 14%
}

# Static challenges configuration
SAVING_CHALLENGES = [
    {
        "id": "52_weeks",
        "title": "Thử thách 52 Tuần Tích Lũy",
        "description": "Tích lũy tăng dần mỗi tuần bắt đầu từ 10.000đ (Tuần 1: 10k, Tuần 2: 20k,... Tuần 52: 520k). Tổng tích lũy sau 1 năm là 13.780.000đ.",
        "target_amount": 13780000.0,
        "badge": "📅"
    },
    {
        "id": "no_bubble_tea",
        "title": "Cắt Giảm Trà Sữa / Cà Phê",
        "description": "Tiết kiệm 30.000đ mỗi ngày thay vì mua đồ uống ngoài. Nạp đều đặn vào quỹ tích lũy. Mục tiêu tích lũy 900.000đ mỗi tháng.",
        "target_amount": 900000.0,
        "badge": "🧋"
    },
    {
        "id": "blue_chip_accumulation",
        "title": "Tích Lũy Cổ Phiếu HPG / FPT",
        "description": "Mua tích sản định kỳ cổ phiếu đầu ngành sản xuất/công nghệ Việt Nam. Mục tiêu tích lũy tối thiểu 5.000.000đ giá trị cổ phiếu.",
        "target_amount": 5000000.0,
        "badge": "📈"
    }
]


async def get_robo_advisor_data(
    db: AsyncSession,
    user_id: UUID,
    profile_dict: dict[str, Any],
    assets_list: list[dict[str, Any]],
    current_prices: dict[str, float]
) -> dict[str, Any]:
    """
    Computes cash flow stats from transactions, compares actual vs target allocation,
    simulates financial freedom projections, and queries Gemini for personalized advisory.
    """
    total_capital = float(profile_dict.get("capital") or 0.0)
    risk_appetite = str(profile_dict.get("risk_appetite") or "moderate").lower()
    if risk_appetite not in TARGET_ALLOCATIONS:
        risk_appetite = "moderate"
    goal = str(profile_dict.get("goal") or "")
    goal_formatted = goal
    try:
        goal_formatted = f"{float(goal):,.0f} VND"
    except ValueError:
        pass

    # 1. Fetch transaction totals in the last 30 days
    monthly_income, monthly_expenses = await _get_monthly_cash_flow(db, user_id)
    
    # Calculate savings rate
    savings_rate = 0.0
    if monthly_income > 0:
        savings_rate = ((monthly_income - monthly_expenses) / monthly_income) * 100
        savings_rate = max(0.0, min(100.0, savings_rate))
    
    # 2. Categorize and sum actual asset values
    portfolio_value = 0.0
    actual_values = {"saving": 0.0, "gold": 0.0, "stock": 0.0, "crypto": 0.0}
    
    for asset in assets_list:
        symbol = str(asset.get("symbol", "")).upper()
        asset_type = str(asset.get("type", "stock")).lower()
        qty = float(asset.get("quantity") or 0.0)
        buy_price = float(asset.get("purchase_price") or 0.0)
        
        current_price = current_prices.get(symbol, buy_price)
        if current_price == 0.0:
            current_price = buy_price
            
        val = qty * current_price
        portfolio_value += val
        
        if asset_type in actual_values:
            actual_values[asset_type] += val
        else:
            actual_values["stock"] += val  # fallback to stock

    idle_cash = max(0.0, total_capital - portfolio_value)
    total_assets_value = portfolio_value + idle_cash

    # 3. Calculate target and actual allocations
    target_weights = TARGET_ALLOCATIONS[risk_appetite]
    
    actual_weights = {}
    if total_assets_value > 0:
        for k, v in actual_values.items():
            actual_weights[k] = v / total_assets_value
        # Add cash weighting to the allocation comparison (we allocate it to saving target in Robo advice)
        # However, for pure asset comparison, actual weights represent physical investment.
    else:
        actual_weights = {"saving": 0.0, "gold": 0.0, "stock": 0.0, "crypto": 0.0}

    # 4. Generate rebalance suggestions
    rebalance_suggestions = []
    for asset_class, target_w in target_weights.items():
        actual_w = actual_weights.get(asset_class, 0.0)
        # Note: cash is currently "idle_cash" and is technically liquid.
        # If we rebalance, we want to allocate idle cash towards targets.
        target_val = target_w * total_assets_value
        actual_val = actual_values.get(asset_class, 0.0)
        
        diff_val = target_val - actual_val
        
        # Decide action
        if diff_val > 100000.0:  # > 100k VND
            action = "Mua thêm"
            reasoning = f"Tỷ trọng hiện tại là {actual_w*100:.1f}%, thấp hơn mức mục tiêu {target_w*100:.0f}% cho hồ sơ {risk_appetite}. Cần bổ sung thêm {diff_val:,.0f} VND để tối ưu hiệu quả sinh lời."
        elif diff_val < -100000.0:  # < -100k VND
            action = "Bán bớt"
            reasoning = f"Tỷ trọng hiện tại là {actual_w*100:.1f}%, vượt quá mức phân bổ mục tiêu {target_w*100:.0f}%. Nên chốt lời hoặc cơ cấu giảm bớt {abs(diff_val):,.0f} VND để quản trị rủi ro."
        else:
            action = "Giữ nguyên"
            reasoning = f"Tỷ trọng {actual_w*100:.1f}% đang nằm sát mức phân bổ tối ưu {target_w*100:.0f}%."
            
        rebalance_suggestions.append({
            "asset_class": asset_class,
            "current_weight": actual_w * 100,
            "target_weight": target_w * 100,
            "difference_value": diff_val,
            "action": action,
            "reasoning": reasoning
        })

    # 5. Financial Freedom & Wealth Projection
    # Financial freedom number = 25x annual expenses (4% rule)
    monthly_exp_calc = monthly_expenses if monthly_expenses > 0 else 15000000.0  # fallback 15M
    annual_expenses = monthly_exp_calc * 12
    financial_freedom_number = annual_expenses * 25
    
    # Monthly investment calculation
    monthly_savings = max(0.0, monthly_income - monthly_expenses)
    if monthly_savings == 0.0:
        # Fallback: assume 15% of monthly income, or 5% of capital if income is 0
        monthly_savings = monthly_income * 0.15 if monthly_income > 0 else (total_capital * 0.05 / 12 if total_capital > 0 else 2000000.0)
        
    expected_yield = EXPECTED_YIELDS[risk_appetite]
    
    # Simulate wealth projection over 30 years
    # FV = PV * (1 + r)^t + PMT * (((1 + r)^t - 1) / r)
    projection_points = []
    current_wealth = total_assets_value
    
    # Numerical calculation year-by-year
    years_to_freedom = -1.0
    for year in range(0, 31):
        if year > 0:
            # Add monthly deposits with compound yield annually
            # We assume deposits happen monthly and yield is compounded monthly:
            # monthly_r = expected_yield / 12
            monthly_r = expected_yield / 12
            for month in range(12):
                current_wealth = current_wealth * (1 + monthly_r) + monthly_savings
                
        projection_points.append({
            "year": year,
            "value": current_wealth
        })
        
        # Track when wealth exceeds financial freedom number
        if current_wealth >= financial_freedom_number and years_to_freedom < 0:
            years_to_freedom = float(year)

    if years_to_freedom < 0:
        # If not achieved in 30 years, estimate logarithmically or set default
        years_to_freedom = 99.0  # Or represent as longer term

    # 6. Query Gemini for AI Advisor Commentary
    prompt = f"""Bạn là một Cố vấn Tài chính Cá nhân và Robot-Advisor AI chuyên nghiệp.
Hãy viết một bài phân tích ngắn gọn, trực quan và thực tế bằng tiếng Việt (khoảng 200-300 từ) cho người dùng dựa trên các số liệu thực tế sau:
- Khẩu vị rủi ro: {risk_appetite}
- Mục tiêu tích lũy: {goal_formatted}
- Tổng tài sản hiện tại: {total_assets_value:,.0f} VND (gồm danh mục {portfolio_value:,.0f} VND và tiền mặt nhàn rỗi {idle_cash:,.0f} VND)
- Thu nhập 30 ngày qua: {monthly_income:,.0f} VND, Chi tiêu: {monthly_expenses:,.0f} VND
- Tỷ lệ tiết kiệm thực tế: {savings_rate:.1f}% (Số tiền tích lũy hàng tháng dự tính: {monthly_savings:,.0f} VND)
- Số tự do tài chính mục tiêu (25x chi tiêu năm): {financial_freedom_number:,.0f} VND
- Lộ trình: Dự kiến đạt tự do tài chính sau {years_to_freedom:.1f} năm với tỷ suất sinh lời {expected_yield*100:.0f}%/năm.

Hãy phân tích:
1. Đánh giá tính hợp lý của tỷ lệ tiết kiệm (Saving Rate) hiện tại và cách tối ưu hóa chi tiêu để tăng tiền tích lũy.
2. Nhận xét về rổ tài sản hiện tại so với tỷ trọng tối ưu và khuyên họ làm thế nào để thực hiện Rebalance hiệu quả.
3. Đưa ra lời khuyên thực tế để rút ngắn lộ trình đạt được Số Tự Do Tài Chính mục tiêu.

LƯU Ý QUAN TRỌNG VỀ ĐỊNH DẠNG:
- KHÔNG ĐƯỢC dùng ký tự dấu sao (*) hoặc (**) làm đầu dòng hay bôi đậm.
- Khi liệt kê các ý hoặc các bước hành động, hãy xuống dòng bằng ký tự '\n' và sử dụng dấu gạch ngang '-' hoặc đánh số thứ tự rõ ràng (1., 2., 3.) để hiển thị sạch sẽ.
- Tránh ghi các từ như \"aggressive\", \"moderate\" hay \"conservative\" kèm dấu gạch chéo ngược. Hãy dùng tiếng Việt (ví dụ: Tăng trưởng, Cân bằng, Thận trọng) hoặc ghi thường bình thường.
- Chỉ trả về đoạn văn phân tích dưới dạng TEXT thuần, không chứa mã markdown JSON, phân đoạn rõ ràng bằng ký tự xuống dòng.
"""
    try:
        overall_analysis = await asyncio.to_thread(lambda: _call_gemini(prompt))
        overall_analysis = overall_analysis.strip()
    except Exception as exc:
        log.warning("robo_advisor.gemini.failed", error=str(exc))
        overall_analysis = (
            f"Dựa trên phân tích của AI, tỷ lệ tiết kiệm hiện tại của bạn là {savings_rate:.1f}%. "
            f"Để đạt được số tiền Tự do Tài chính mục tiêu {financial_freedom_number:,.0f} VND, bạn cần duy trì tích lũy đều đặn {monthly_savings:,.0f} VND mỗi tháng. "
            f"Hồ sơ rủi ro của bạn là {risk_appetite}, vì vậy chúng tôi khuyên bạn nên điều chỉnh tỷ trọng danh mục tài sản nhàn rỗi theo bảng Rebalance để tối đa hóa hiệu suất sinh lời và phòng vệ rủi ro biến động thị trường."
        )

    # 7. Convert challenges
    challenges_response = []
    for ch in SAVING_CHALLENGES:
        challenges_response.append({
            "id": ch["id"],
            "title": ch["title"],
            "description": ch["description"],
            "target_amount": ch["target_amount"],
            "current_amount": 0.0,  # Frontend merges from localStorage
            "status": "active",
            "badge": ch["badge"]
        })

    return {
        "portfolio_value": portfolio_value,
        "total_capital": total_capital,
        "idle_cash": idle_cash,
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "savings_rate": savings_rate,
        "financial_freedom_number": financial_freedom_number,
        "years_to_financial_freedom": years_to_freedom,
        "risk_appetite": risk_appetite,
        "diversification_score": _compute_diversification(actual_weights),
        "target_allocation": target_weights,
        "actual_allocation": {k: v * 100 for k, v in actual_weights.items()},
        "rebalance_suggestions": rebalance_suggestions,
        "overall_analysis": overall_analysis,
        "challenges": challenges_response,
        "projection_points": projection_points
    }


async def _get_monthly_cash_flow(db: AsyncSession, user_id: UUID) -> tuple[float, float]:
    """
    Queries user's transactions from the past 30 days and aggregates income and expenses.
    """
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Query income
    stmt_income = (
        select(Transaction.amount)
        .where(Transaction.user_id == user_id)
        .where(Transaction.type == "income")
        .where(Transaction.transaction_date >= thirty_days_ago.date())
    )
    res_income = await db.execute(stmt_income)
    income_total = sum(res_income.scalars().all())

    # Query expenses
    stmt_expense = (
        select(Transaction.amount)
        .where(Transaction.user_id == user_id)
        .where(Transaction.type == "expense")
        .where(Transaction.transaction_date >= thirty_days_ago.date())
    )
    res_expense = await db.execute(stmt_expense)
    expense_total = sum(res_expense.scalars().all())

    return float(income_total), float(expense_total)


def _compute_diversification(weights: dict[str, float]) -> float:
    """
    Computes Simpson's Index of Diversity based on weights.
    """
    sum_sq = sum(w ** 2 for w in weights.values())
    diversity = 1.0 - sum_sq
    # Normalize to 0-100 based on max possible diversity of 4 classes (0.75)
    score = (diversity / 0.75) * 100.0
    return min(100.0, max(0.0, score))
