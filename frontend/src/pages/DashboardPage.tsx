import { Sparkles, ArrowRight, Zap } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import {
  walletSummary,
  recentTransactions,
  monthlyTrend,
  financialGoals,
  aiInvestmentSuggestions,
} from "@/data/mockData";
import { Link } from "react-router-dom";

// ── KPI stat card matching Stitch: white, 16px radius, soft shadow, hover lift ──
function StatCard({
  label,
  value,
  unit,
  change,
  changeLabel,
  icon,
  accent,
}: Readonly<{
  label: string;
  value: string;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon: string;
  accent: "blue" | "green" | "amber" | "purple";
}>) {
  const accentMap = {
    blue: "text-stitch-primary-container",
    green: "text-success",
    amber: "text-warning",
    purple: "text-purple-500",
  };
  const isUp = change !== undefined && change >= 0;

  return (
    <div className="stat-card">
      <p className="font-sans text-body-sm text-stitch-on-surface-variant">{label}</p>
      <h2 className="font-heading text-h2-kpi text-stitch-on-surface mt-xs">
        {value}{" "}
        {unit && <span className="text-body-sm font-normal text-stitch-on-surface-variant">{unit}</span>}
      </h2>
      {change !== undefined && (
        <div className={`mt-3 flex items-center gap-1 text-label-caps ${isUp ? "text-success" : "text-danger"}`}>
          <span className="material-symbols-outlined text-sm">
            {isUp ? "trending_up" : "trending_down"}
          </span>
          <span>{formatPercent(Math.abs(change))} {changeLabel ?? "so với tháng trước"}</span>
        </div>
      )}
      {change === undefined && (
        <div className={`mt-3 flex items-center gap-1 text-label-caps ${accentMap[accent]}`}>
          <span className="material-symbols-outlined text-sm">{icon}</span>
          <span>Cập nhật lúc nãy</span>
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-stitch-outline-variant rounded-lg p-3 shadow-soft text-sm">
        <p className="font-semibold text-stitch-on-surface mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="text-sm">
            {p.name === "thuNhap" ? "Thu nhập" : "Chi tiêu"}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const goalDisplay = financialGoals.slice(0, 2);

  return (
    <div className="space-y-xxl">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1-hero text-stitch-on-surface leading-tight">
            AI Copilot <span className="text-stitch-primary-container">Tài Chính</span>
          </h1>
          <p className="text-body-lg text-stitch-on-surface-variant mt-2 max-w-xl">
            Theo dõi chi tiêu, tối ưu tiết kiệm và nhận tư vấn đầu tư thông minh từ AI.
          </p>
          <p className="text-body-sm text-stitch-on-surface-variant mt-1">
            {formatDate(new Date())} · Chào buổi sáng, Tuấn!
          </p>
        </div>
      </div>

      {/* ── KPI Cards (4 columns — exact Stitch Section 1 layout) ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <StatCard
          label="Chi tiêu tháng này"
          value={formatCurrency(walletSummary.monthlyExpense).replace("₫", "").trim()}
          unit="VND"
          change={walletSummary.expenseChange}
          icon="wallet"
          accent="amber"
        />
        <StatCard
          label="Tiết kiệm hiện tại"
          value={formatCurrency(walletSummary.monthlySaving).replace("₫", "").trim()}
          unit="VND"
          change={walletSummary.incomeChange}
          changeLabel="tăng trưởng"
          icon="savings"
          accent="green"
        />
        <StatCard
          label="Tiền có thể đầu tư"
          value={formatCurrency(aiInvestmentSuggestions[2].amount).replace("₫", "").trim()}
          unit="VND"
          icon="bolt"
          accent="blue"
        />
        <StatCard
          label="Tiến độ mục tiêu"
          value={walletSummary.savingRate.toFixed(0) + "%"}
          unit="Tổng"
          icon="flag"
          accent="purple"
        />
      </section>

      {/* ── AI Insight Panel (Stitch Section 2 — ai-insight-border) ── */}
      <section>
        <div className="ai-insight-card flex flex-col lg:flex-row items-start gap-xl p-xl rounded-lg">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-stitch-primary-container/20 text-brand-blue-dark px-3 py-1 rounded-full text-label-caps flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                ĐỘ TIN CẬY AI: 98%
              </span>
              <span className="text-stitch-on-surface-variant text-body-sm">Phân tích 2 phút trước</span>
            </div>
            <h3 className="font-heading text-h2-kpi text-stitch-on-surface">
              Cơ Hội Tối Ưu Tài Chính
            </h3>
            <p className="text-body-lg text-stitch-on-surface-variant">
              Chúng tôi phát hiện khoản thặng dư{" "}
              <strong className="text-stitch-primary-container">{formatCurrency(aiInvestmentSuggestions[2].amount)}</strong>{" "}
              trong tài khoản của bạn. Chuyển sang{" "}
              <strong className="text-stitch-primary-container">Gửi tiết kiệm 6 tháng (6.1%/năm)</strong>{" "}
              có thể tăng số dư cuối năm lên ~{" "}
              <strong>12.4%</strong> dựa trên xu hướng hiện tại.
            </p>
            <button className="btn-primary flex items-center gap-2">
              Gửi {formatCurrency(aiInvestmentSuggestions[2].amount)} ngay
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {/* Mini trend chart */}
          <div className="w-full lg:w-72 bg-stitch-surface rounded-lg p-lg border border-stitch-outline-variant">
            <div className="flex justify-between items-center mb-3">
              <span className="text-label-caps text-stitch-on-surface-variant">Xu Hướng Thu Chi</span>
              <span className="text-success text-data-tabular">+{walletSummary.incomeChange}% tháng</span>
            </div>
            <ResponsiveContainer width="100%" height={128}>
              <AreaChart data={monthlyTrend.slice(-5)} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5BAAEC" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#5BAAEC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="thuNhap" stroke="#5BAAEC" strokeWidth={2} fill="url(#dashGrad)" />
                <Area type="monotone" dataKey="chiTieu" stroke="#F59E0B" strokeWidth={2} fill="none" strokeDasharray="4 2" />
                <Tooltip content={<CustomTooltip />} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Analytics + Goals (Stitch Section 3 / 4 layout) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Monthly Chart */}
        <div className="stitch-card p-lg">
          <h3 className="section-title mb-lg">Phân Tích Thu Chi</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5BAAEC" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#5BAAEC" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#404750" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="thuNhap" stroke="#5BAAEC" strokeWidth={2.5} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="chiTieu" stroke="#F59E0B" strokeWidth={2.5} fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3 text-body-sm text-stitch-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-stitch-primary-container rounded-full inline-block" />
              Thu nhập
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-warning rounded-full inline-block" />
              Chi tiêu
            </span>
          </div>
        </div>

        {/* Goals Preview */}
        <div className="stitch-card p-lg">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="section-title">Mục Tiêu Tài Chính</h3>
            <Link to="/goals" className="text-body-sm text-brand-blue-dark font-semibold hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-6">
            {goalDisplay.map((goal) => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.emoji}</span>
                      <div>
                        <div className="font-semibold text-base text-stitch-on-surface">{goal.title}</div>
                        <div className="text-body-sm text-stitch-on-surface-variant">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)} VND
                        </div>
                      </div>
                    </div>
                    <span className={`text-base font-bold ${goal.status === "at-risk" ? "text-warning" : "text-success"}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-stitch-surface-container-high h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: goal.status === "at-risk" ? "#F59E0B" : goal.status === "achieved" ? "#22C55E" : "#5BAAEC",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Transactions + AI Cards ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Transactions */}
        <div className="stitch-card p-lg">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="section-title">Giao Dịch Gần Đây</h3>
            <Link to="/analytics" className="text-body-sm text-brand-blue-dark font-semibold hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="divide-y divide-stitch-outline-variant/60">
            {recentTransactions.slice(0, 6).map((txn) => (
              <div key={txn.id} className="flex items-center gap-3 py-3">
                <div className="w-10 h-10 rounded-lg bg-stitch-surface-container flex items-center justify-center text-lg flex-shrink-0">
                  {txn.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-stitch-on-surface truncate">{txn.description}</div>
                  <div className="text-body-sm text-stitch-on-surface-variant">{txn.category}</div>
                </div>
                <div className={`text-base font-bold font-heading tabular-nums ${txn.type === "income" ? "text-success" : "text-stitch-on-surface"}`}>
                  {txn.type === "income" ? "+" : ""}{formatCurrency(Math.abs(txn.amount))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Copilot Panel */}
        <div className="ai-insight-card p-lg rounded-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-stitch-primary-container flex items-center justify-center shadow-ai-glow">
              <Zap className="w-5 h-5 text-stitch-on-primary-container" />
            </div>
            <div>
              <div className="font-heading font-semibold text-base text-stitch-on-surface">AI Copilot</div>
              <div className="text-body-sm text-stitch-on-surface-variant">3 gợi ý mới hôm nay</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-stitch-outline-variant/60">
              <p className="font-semibold text-base text-stitch-on-surface mb-1">💡 Tỷ lệ tiết kiệm tuyệt vời!</p>
              <p className="text-body-sm text-stitch-on-surface-variant leading-relaxed">
                Tháng này bạn tiết kiệm <strong className="text-success">{walletSummary.savingRate}%</strong> thu nhập —
                vượt trung bình quốc gia. Tiếp tục đà này!
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-200/60">
              <p className="font-semibold text-base text-stitch-on-surface mb-1">⚠️ Cảnh báo ăn uống</p>
              <p className="text-body-sm text-stitch-on-surface-variant leading-relaxed">
                Chi tiêu ăn uống tháng này cao hơn trung bình 3 tháng <strong className="text-warning">15%</strong>.
                Cân nhắc tự nấu ăn thêm.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-stitch-outline-variant/60">
              <p className="font-semibold text-base text-stitch-on-surface mb-1">📈 Gợi ý đầu tư</p>
              <p className="text-body-sm text-stitch-on-surface-variant leading-relaxed">
                Bạn có <strong className="text-stitch-primary-container">{formatCurrency(aiInvestmentSuggestions[2].amount)}</strong> nhàn rỗi.
                AI khuyến nghị gửi tiết kiệm kỳ hạn 6 tháng (6.1%/năm).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
