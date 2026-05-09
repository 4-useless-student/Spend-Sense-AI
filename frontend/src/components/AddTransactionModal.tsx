import { useState, useRef, useCallback } from "react";
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

const categories = [
  { value: "an-uong", label: "🍱 Ăn uống" },
  { value: "di-chuyen", label: "🚗 Di chuyển" },
  { value: "mua-sam", label: "🛍️ Mua sắm" },
  { value: "nha-o", label: "🏠 Nhà ở" },
  { value: "suc-khoe", label: "🏥 Sức khỏe" },
  { value: "giai-tri", label: "🎬 Giải trí" },
  { value: "giao-duc", label: "📚 Giáo dục" },
  { value: "dau-tu", label: "📈 Đầu tư" },
  { value: "luong", label: "💼 Lương" },
  { value: "thuong", label: "🎁 Thưởng" },
  { value: "khac", label: "💸 Khác" },
];

type TxType = "expense" | "income";
type Step = "form" | "receipt" | "success";
type CameraState = "idle" | "active" | "captured";

export function AddTransactionModal({ open, onClose }: Readonly<AddTransactionModalProps>) {
  const [step, setStep] = useState<Step>("form");
  const [txType, setTxType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [receiptTab, setReceiptTab] = useState<"upload" | "camera">("upload");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const resetAndClose = useCallback(() => {
    setStep("form");
    setAmount("");
    setDescription("");
    setCategory("");
    setReceiptPreview(null);
    setCameraState("idle");
    setIsSaving(false);
    stopCamera();
    onClose();
  }, [onClose]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraState("idle");
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraState("active");
    } catch {
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền trình duyệt.");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setReceiptPreview(dataUrl);
    setCameraState("captured");
    stopCamera();
  }, [stopCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate API
    setIsSaving(false);
    setStep("success");
    setTimeout(() => resetAndClose(), 1800);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetAndClose()}>
      <div className="modal-panel">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stitch-outline-variant">
          <div>
            <h2 className="font-heading text-xl font-bold text-stitch-on-surface">
              {step === "form" && "Thêm Giao Dịch"}
              {step === "receipt" && "Chụp / Tải Hóa Đơn"}
              {step === "success" && "Thành Công!"}
            </h2>
            {step === "form" && (
              <p className="text-sm text-stitch-on-surface-variant mt-0.5">
                Nhập thông tin hoặc chụp hóa đơn để AI tự điền
              </p>
            )}
          </div>
          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stitch-on-surface-variant hover:bg-stitch-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── SUCCESS ── */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-heading text-lg font-semibold text-stitch-on-surface">Đã lưu giao dịch!</p>
            <p className="text-base text-stitch-on-surface-variant text-center">
              AI Copilot sẽ phân tích và cập nhật báo cáo của bạn.
            </p>
          </div>
        )}

        {/* ── RECEIPT STEP ── */}
        {step === "receipt" && (
          <div className="p-6 space-y-5">
            {/* Tabs */}
            <div className="flex gap-2 bg-stitch-surface-container p-1 rounded-lg">
              <button
                onClick={() => { setReceiptTab("upload"); stopCamera(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${receiptTab === "upload" ? "bg-white shadow-soft text-stitch-on-surface" : "text-stitch-on-surface-variant"}`}
              >
                <Upload className="w-4 h-4" />
                Tải ảnh lên
              </button>
              <button
                onClick={() => { setReceiptTab("camera"); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${receiptTab === "camera" ? "bg-white shadow-soft text-stitch-on-surface" : "text-stitch-on-surface-variant"}`}
              >
                <Camera className="w-4 h-4" />
                Mở Camera
              </button>
            </div>

            {/* Upload area */}
            {receiptTab === "upload" && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {receiptPreview ? (
                  <div className="space-y-3">
                    <img
                      src={receiptPreview}
                      alt="Hóa đơn"
                      className="w-full rounded-lg border border-stitch-outline-variant object-cover max-h-64"
                    />
                    <button
                      onClick={() => setReceiptPreview(null)}
                      className="text-sm text-brand-blue-dark underline"
                    >
                      Chọn ảnh khác
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-44 rounded-lg border-2 border-dashed border-stitch-outline-variant flex flex-col items-center justify-center gap-3 text-stitch-on-surface-variant hover:border-brand-blue hover:text-brand-blue-dark hover:bg-blue-50/50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-stitch-surface-container flex items-center justify-center">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-base">Nhấn để chọn ảnh</p>
                      <p className="text-sm">PNG, JPG, WEBP tối đa 10MB</p>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Camera area */}
            {receiptTab === "camera" && (
              <div className="space-y-3">
                {cameraState === "idle" && !receiptPreview && (
                  <button
                    onClick={startCamera}
                    className="w-full h-44 rounded-lg border-2 border-dashed border-stitch-outline-variant flex flex-col items-center justify-center gap-3 text-stitch-on-surface-variant hover:border-brand-blue hover:text-brand-blue-dark hover:bg-blue-50/50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-stitch-surface-container flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-base">Mở camera</p>
                      <p className="text-sm">Chụp hóa đơn, AI sẽ tự điền thông tin</p>
                    </div>
                  </button>
                )}

                {cameraState === "active" && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-lg border border-stitch-outline-variant"
                      style={{ maxHeight: "280px", objectFit: "cover" }}
                    />
                    <div className="absolute inset-0 border-2 border-brand-blue rounded-lg pointer-events-none" />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={capturePhoto}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Chụp ảnh
                      </button>
                      <button onClick={stopCamera} className="btn-outline px-4">
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {cameraState === "captured" && receiptPreview && (
                  <div className="space-y-3">
                    <img
                      src={receiptPreview}
                      alt="Hóa đơn đã chụp"
                      className="w-full rounded-lg border border-stitch-outline-variant object-cover max-h-64"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setReceiptPreview(null); setCameraState("idle"); }}
                        className="flex-1 btn-outline text-sm"
                      >
                        Chụp lại
                      </button>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* AI analyzing indicator */}
            {receiptPreview && (
              <div className="flex items-center gap-3 bg-stitch-secondary-container/30 rounded-lg px-4 py-3">
                <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✨</span>
                </div>
                <p className="text-sm text-stitch-on-surface-variant">
                  AI đang phân tích hóa đơn và tự điền thông tin giao dịch…
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep("form")} className="flex-1 btn-outline">
                ← Quay lại
              </button>
              <button onClick={() => setStep("form")} className="flex-1 btn-primary">
                Áp dụng
              </button>
            </div>
          </div>
        )}

        {/* ── FORM STEP ── */}
        {step === "form" && (
          <div className="p-6 space-y-5">

            {/* Type Toggle */}
            <div className="flex gap-2 bg-stitch-surface-container p-1 rounded-lg">
              {(["expense", "income"] as TxType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTxType(t)}
                  className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all ${txType === t
                    ? t === "expense"
                      ? "bg-white shadow-soft text-red-600"
                      : "bg-white shadow-soft text-green-600"
                    : "text-stitch-on-surface-variant"
                    }`}
                >
                  {t === "expense" ? "💸 Chi tiêu" : "💰 Thu nhập"}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stitch-on-surface-variant uppercase tracking-wide">
                Số tiền (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="stitch-input pr-16 text-2xl font-bold font-heading tabular-nums"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stitch-on-surface-variant font-medium">
                  VND
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stitch-on-surface-variant uppercase tracking-wide">
                Danh mục
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="stitch-input appearance-none pr-10"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stitch-on-surface-variant pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stitch-on-surface-variant uppercase tracking-wide">
                Mô tả
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Cơm trưa văn phòng..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="stitch-input"
              />
            </div>

            {/* Receipt upload shortcut */}
            <div
              onClick={() => setStep("receipt")}
              className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-stitch-outline-variant cursor-pointer hover:border-brand-blue hover:bg-blue-50/40 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-stitch-surface-container flex items-center justify-center flex-shrink-0">
                {receiptPreview ? (
                  <img src={receiptPreview} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <Camera className="w-5 h-5 text-stitch-on-surface-variant" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-stitch-on-surface">
                  {receiptPreview ? "Hóa đơn đã tải ✓" : "Thêm hóa đơn / chụp ảnh"}
                </p>
                <p className="text-sm text-stitch-on-surface-variant">
                  {receiptPreview ? "Nhấn để thay đổi" : "AI sẽ tự điền thông tin từ ảnh"}
                </p>
              </div>
              <Upload className="w-4 h-4 text-stitch-on-surface-variant" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={resetAndClose} className="flex-1 btn-outline">
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={!amount || !category || isSaving}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu Giao Dịch"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
