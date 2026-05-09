import { useState } from "react";
import { User, Bell, Shield, Sparkles, Save, Camera } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { userProfile, aiPreferences } from "@/data/mockData";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Hồ Sơ", icon: User },
  { id: "notifications", label: "Thông Báo", icon: Bell },
  { id: "security", label: "Bảo Mật", icon: Shield },
  { id: "ai", label: "AI Copilot", icon: Sparkles },
];

const riskOptions = [
  { value: "conservative", label: "Thận trọng", desc: "Ưu tiên bảo toàn vốn" },
  { value: "moderate", label: "Trung bình", desc: "Cân bằng tăng trưởng và an toàn" },
  { value: "aggressive", label: "Tăng trưởng", desc: "Tối đa hóa lợi nhuận" },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [prefs, setPrefs] = useState(aiPreferences);
  const [riskLevel, setRiskLevel] = useState<string>(userProfile.riskLevel);

  const togglePref = (id: string) =>
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));

  return (
    <div className="space-y-xxl">
      <div>
        <h1 className="font-heading text-h2-kpi text-stitch-on-surface">Cài Đặt</h1>
        <p className="text-body-lg text-stitch-on-surface-variant mt-1">Quản lý tài khoản và tùy chỉnh AI Copilot</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-xl">
        {/* Sidebar */}
        <div className="lg:w-56 flex-shrink-0 space-y-4">
          {/* Profile summary */}
          <div className="stitch-card p-lg flex flex-col items-center text-center">
            <div className="relative">
              <img src={userProfile.avatar} alt={userProfile.name} className="w-18 h-18 rounded-full border-2 border-stitch-primary-container/40" style={{ width: 72, height: 72 }} />
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-stitch-primary-container text-stitch-on-primary-container flex items-center justify-center shadow-soft hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-heading font-semibold text-base text-stitch-on-surface mt-3">{userProfile.name}</p>
            <p className="text-body-sm text-stitch-on-surface-variant">{userProfile.email}</p>
          </div>

          {/* Tabs */}
          <nav className="flex flex-row lg:flex-col gap-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("nav-link w-full text-left", activeTab === tab.id && "active")}>
                <tab.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="stitch-card p-lg space-y-5">
              <div>
                <h3 className="section-title">Thông Tin Cá Nhân</h3>
                <p className="text-body-sm text-stitch-on-surface-variant mt-1">Cập nhật tên, email và thông tin liên hệ</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-label-caps text-stitch-on-surface-variant">Họ và tên</label>
                  <input type="text" defaultValue={userProfile.name} className="stitch-input" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-caps text-stitch-on-surface-variant">Email</label>
                  <input type="email" defaultValue={userProfile.email} className="stitch-input" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-label-caps text-stitch-on-surface-variant">Số điện thoại</label>
                <input type="tel" defaultValue={userProfile.phone} className="stitch-input" />
              </div>

              {/* Risk Profile */}
              <div className="space-y-3 pt-4 border-t border-stitch-outline-variant/60">
                <label className="text-label-caps text-stitch-on-surface-variant">Hồ sơ rủi ro đầu tư</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {riskOptions.map((opt) => (
                    <button key={opt.value} onClick={() => setRiskLevel(opt.value)}
                      className={cn("p-4 rounded-lg border text-left transition-all",
                        riskLevel === opt.value ? "border-stitch-primary-container bg-stitch-primary-container/5 shadow-ai-glow" : "border-stitch-outline-variant hover:border-stitch-primary-container/50")}>
                      <div className="font-semibold text-base text-stitch-on-surface">{opt.label}</div>
                      <div className="text-body-sm text-stitch-on-surface-variant mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Lưu Thay Đổi
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="stitch-card p-lg space-y-4">
              <div>
                <h3 className="section-title">Tùy Chỉnh Thông Báo</h3>
                <p className="text-body-sm text-stitch-on-surface-variant mt-1">Chọn loại thông báo bạn muốn nhận</p>
              </div>
              {[
                { label: "Giao dịch mới", desc: "Thông báo khi có giao dịch thu/chi mới" },
                { label: "Vượt ngân sách", desc: "Cảnh báo khi chi tiêu vượt hạn mức đặt ra" },
                { label: "Mục tiêu chậm tiến độ", desc: "Nhắc nhở khi mục tiêu tiết kiệm bị chậm" },
                { label: "Gợi ý đầu tư mới", desc: "Khi AI phát hiện cơ hội đầu tư phù hợp" },
                { label: "Báo cáo tuần", desc: "Tóm tắt tình hình tài chính mỗi thứ Hai" },
              ].map((n, i) => (
                <div key={n.label} className="flex items-center justify-between p-4 rounded-lg border border-stitch-outline-variant/60 hover:bg-stitch-surface-container-low transition-colors">
                  <div>
                    <p className="font-semibold text-base text-stitch-on-surface">{n.label}</p>
                    <p className="text-body-sm text-stitch-on-surface-variant">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={i !== 3} />
                </div>
              ))}
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div className="stitch-card p-lg space-y-5">
              <div>
                <h3 className="section-title">Bảo Mật Tài Khoản</h3>
                <p className="text-body-sm text-stitch-on-surface-variant mt-1">Quản lý mật khẩu và xác thực 2 lớp</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-label-caps text-stitch-on-surface-variant">Mật khẩu hiện tại</label>
                <input type="password" placeholder="••••••••" className="stitch-input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-label-caps text-stitch-on-surface-variant">Mật khẩu mới</label>
                  <input type="password" placeholder="••••••••" className="stitch-input" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-caps text-stitch-on-surface-variant">Xác nhận mật khẩu</label>
                  <input type="password" placeholder="••••••••" className="stitch-input" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-stitch-outline-variant/60">
                <div>
                  <p className="font-semibold text-base text-stitch-on-surface">Xác thực 2 lớp (2FA)</p>
                  <p className="text-body-sm text-stitch-on-surface-variant">Thêm lớp bảo vệ với Google Authenticator</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-label-caps font-bold">Chưa bật</span>
                  <button className="btn-outline text-sm px-4 py-2">Bật ngay</button>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </div>
          )}

          {/* AI COPILOT */}
          {activeTab === "ai" && (
            <div className="stitch-card p-lg space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-stitch-primary-container flex items-center justify-center shadow-ai-glow">
                  <Sparkles className="w-5 h-5 text-stitch-on-primary-container" />
                </div>
                <div>
                  <h3 className="section-title leading-none">Tùy Chỉnh AI Copilot</h3>
                  <p className="text-body-sm text-stitch-on-surface-variant mt-0.5">Điều chỉnh cách AI phân tích và tư vấn</p>
                </div>
              </div>
              {prefs.map((pref) => (
                <div key={pref.id} className="flex items-center justify-between p-4 rounded-lg border border-stitch-outline-variant/60 hover:border-stitch-primary-container/30 hover:bg-blue-50/20 transition-all">
                  <div className="flex-1 mr-5">
                    <p className="font-semibold text-base text-stitch-on-surface">{pref.label}</p>
                    <p className="text-body-sm text-stitch-on-surface-variant mt-0.5">{pref.description}</p>
                  </div>
                  <Switch checked={pref.enabled} onCheckedChange={() => togglePref(pref.id)} />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
