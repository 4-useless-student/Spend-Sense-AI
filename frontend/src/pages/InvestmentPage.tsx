import { ArrowUpRight, ArrowDownRight, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { portfolio, assets, portfolioHistory, aiInvestmentSuggestions } from "@/data/mockData";

const riskLabels = { conservative: "Thận trọng", moderate: "Trung bình", aggressive: "Tăng trưởng" };
const riskClasses = { conservative: "bg-blue-50 text-blue-700", moderate: "bg-amber-50 text-amber-700", aggressive: "bg-red-50 text-red-700" } as const;
const actionRiskCls = { low: "bg-green-50 text-green-700", medium: "bg-amber-50 text-amber-700", high: "bg-red-50 text-red-700" } as const;

export function InvestmentPage() {
  return (
    <div className="space-y-xxl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-h2-kpi text-stitch-on-surface">Danh Mục Đầu Tư</h1>
        <p className="text-body-lg text-stitch-on-surface-variant mt-1 flex items-center gap-2">
          Hồ sơ rủi ro:&nbsp;
          <span className={`px-3 py-1 rounded-full text-label-caps font-bold ${riskClasses[portfolio.riskLevel]}`}>
            {riskLabels[portfolio.riskLevel]}
          </span>
        </p>
      </div>

      {/* KPI Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="stitch-card stitch-card-hover p-lg">
          <p className="text-body-sm text-stitch-on-surface-variant">Tổng giá trị danh mục</p>
          <h2 className="font-heading text-h2-kpi text-stitch-on-surface mt-xs">{formatCurrency(portfolio.totalValue)}</h2>
          <div className="mt-3 flex items-center gap-1 text-label-caps text-success">
            <TrendingUp className="w-4 h-4" />
            <span>{formatPercent(portfolio.changePercent)} tháng này</span>
          </div>
        </div>
        <div className="stitch-card stitch-card-hover p-lg">
          <p className="text-body-sm text-stitch-on-surface-variant">Lợi nhuận tháng này</p>
          <h2 className="font-heading text-h2-kpi text-success mt-xs">+{formatCurrency(portfolio.change)}</h2>
          <p className="text-body-sm text-stitch-on-surface-variant mt-3">Thực tế đã ghi nhận</p>
        </div>
        <div className="stitch-card stitch-card-hover p-lg">
          <p className="text-body-sm text-stitch-on-surface-variant">Tiền nhàn rỗi</p>
          <h2 className="font-heading text-h2-kpi text-stitch-primary-container mt-xs">{formatCurrency(portfolio.idleCash)}</h2>
          <div className="mt-3 flex items-center gap-1 text-label-caps text-stitch-primary-container">
            <Zap className="w-4 h-4" />
            <span>AI sẵn sàng phân bổ</span>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Area */}
        <div className="stitch-card p-lg">
          <h3 className="section-title mb-lg">Tăng Trưởng Danh Mục</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={portfolioHistory} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5BAAEC" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#5BAAEC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#404750" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v: unknown) => [formatCurrency(Number(v ?? 0)), "Giá trị"]} />
              <Area type="monotone" dataKey="value" stroke="#5BAAEC" strokeWidth={2.5} fill="url(#portGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie + legend */}
        <div className="stitch-card p-lg">
          <h3 className="section-title mb-lg">Phân Bổ Tài Sản</h3>
          <div className="flex items-center">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={assets} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="allocation">
                    {assets.map((a) => <Cell key={a.id} fill={a.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-body-sm text-stitch-on-surface-variant">Tổng</div>
                <div className="font-heading text-base font-bold">100%</div>
              </div>
            </div>
            <div className="space-y-3 ml-4 flex-1">
              {assets.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                  <span className="text-body-sm text-stitch-on-surface-variant truncate flex-1">{a.name}</span>
                  <span className="font-semibold text-base pl-2">{a.allocation}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Asset List */}
      <div className="stitch-card p-lg">
        <h3 className="section-title mb-lg">Danh Sách Tài Sản</h3>
        <div className="divide-y divide-stitch-outline-variant/60">
          {assets.map((asset) => {
            const isUp = asset.change >= 0;
            return (
              <div key={asset.id} className="flex items-center gap-4 py-4">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-white text-sm font-bold font-heading flex-shrink-0" style={{ backgroundColor: asset.color }}>
                  {asset.symbol.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-stitch-on-surface truncate">{asset.name}</div>
                  <div className="text-body-sm text-stitch-on-surface-variant">{asset.allocation}% danh mục</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-semibold tabular-nums">{formatCurrency(asset.value)}</div>
                  <div className={`text-body-sm tabular-nums flex items-center justify-end gap-0.5 ${isUp ? "text-success" : "text-danger"}`}>
                    {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {formatPercent(asset.change)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investment Suggestions (matches Stitch Section 5) */}
      <section className="space-y-lg">
        <div className="flex justify-between items-end">
          <h3 className="section-title">Gợi Ý Đầu Tư Từ AI</h3>
          <a className="text-body-sm text-stitch-primary-container font-semibold hover:underline" href="#">
            Tùy chỉnh hồ sơ
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {aiInvestmentSuggestions.map((sug) => {
            const riskCls = actionRiskCls[sug.risk];
            const ActionIcon = sug.risk === "low" ? ShieldCheck : sug.risk === "medium" ? TrendingUp : Zap;
            return (
              <div key={sug.id} className="stitch-card stitch-card-hover p-lg flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <ActionIcon className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-label-caps font-bold ${riskCls}`}>{sug.action}</span>
                </div>
                <h4 className="font-heading text-base font-bold text-stitch-on-surface mb-2">{sug.asset}</h4>
                <p className="text-body-sm text-stitch-on-surface-variant leading-relaxed mb-5 flex-grow">{sug.reasoning}</p>
                {sug.amount > 0 && (
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-stitch-outline-variant/60">
                    <span className="text-body-sm text-stitch-on-surface-variant">Số tiền đề xuất</span>
                    <span className="font-heading font-bold text-base text-stitch-primary-container">{formatCurrency(sug.amount)}</span>
                  </div>
                )}
                <button className="btn-outline w-full mt-3 text-sm">Xem chiến lược</button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
