import { Plus, Sparkles, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { financialGoals } from "@/data/mockData";

const statusConfig = {
  "on-track": { label: "Đúng tiến độ", cls: "bg-green-50 text-green-700", Icon: CheckCircle2 },
  "at-risk": { label: "Cần chú ý", cls: "bg-amber-50 text-amber-700", Icon: AlertTriangle },
  achieved: { label: "Hoàn thành", cls: "bg-green-50 text-green-700", Icon: CheckCircle2 },
};

const barColor = { "on-track": "#5BAAEC", "at-risk": "#F59E0B", achieved: "#22C55E" };

function GoalCard({ goal }: Readonly<{ goal: (typeof financialGoals)[0] }>) {
  const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const { label, cls, Icon } = statusConfig[goal.status];

  return (
    <div className="stitch-card stitch-card-hover p-lg">
      {/* Goal Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{goal.emoji}</span>
          <div>
            <h4 className="font-heading text-h3-section text-stitch-on-surface">{goal.title}</h4>
            <p className="text-body-sm text-stitch-on-surface-variant mt-0.5">
              Hạn: {formatDate(goal.deadline)}
            </p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-label-caps font-bold shrink-0 ${cls}`}>
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-body-md">
          <span className="text-stitch-on-surface-variant">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)} VND
          </span>
          <span className="font-bold" style={{ color: barColor[goal.status] }}>
            {pct.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-stitch-surface-container-high h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: barColor[goal.status] }}
          />
        </div>
      </div>

      {/* Monthly target */}
      {goal.monthlyTarget > 0 && (
        <div className="flex items-center justify-between bg-stitch-surface-container-low rounded-lg px-4 py-3 mb-4">
          <div className="flex items-center gap-2 text-stitch-on-surface-variant">
            <Clock className="w-4 h-4" />
            <span className="text-body-sm">Tiết kiệm/tháng</span>
          </div>
          <span className="font-heading font-semibold text-base text-stitch-on-surface">
            {formatCurrency(goal.monthlyTarget)}
          </span>
        </div>
      )}

      {/* AI note */}
      <div className="bg-stitch-surface-container-low border border-stitch-secondary-container rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-stitch-primary-container mt-0.5 flex-shrink-0" />
          <p className="text-body-sm text-stitch-on-surface-variant leading-relaxed">{goal.aiNote}</p>
        </div>
      </div>
    </div>
  );
}

export function GoalsPage() {
  const totalSaved = financialGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = financialGoals.reduce((s, g) => s + g.targetAmount, 0);
  const achieved = financialGoals.filter((g) => g.status === "achieved").length;

  return (
    <div className="space-y-xxl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2-kpi text-stitch-on-surface">Mục Tiêu Tài Chính</h1>
          <p className="text-body-lg text-stitch-on-surface-variant mt-1">Theo dõi và chinh phục mục tiêu của bạn</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Thêm Mục Tiêu
        </button>
      </div>

      {/* Summary */}
      <section className="grid grid-cols-3 gap-lg">
        {[
          { label: "Tổng mục tiêu", value: `${financialGoals.length}`, color: "text-stitch-on-surface" },
          { label: "Đã hoàn thành", value: `${achieved}`, color: "text-success" },
          { label: "Tổng tiến độ", value: `${((totalSaved / totalTarget) * 100).toFixed(0)}%`, color: "text-stitch-primary-container" },
        ].map((s) => (
          <div key={s.label} className="stitch-card stitch-card-hover p-lg text-center">
            <div className={`font-heading text-h2-kpi font-bold ${s.color}`}>{s.value}</div>
            <div className="text-body-sm text-stitch-on-surface-variant mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {financialGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
      </div>
    </div>
  );
}
