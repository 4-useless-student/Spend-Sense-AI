// ===== TỔNG QUAN / DASHBOARD =====
export const walletSummary = {
  balance: 45_800_000,
  monthlyIncome: 25_000_000,
  monthlyExpense: 13_400_000,
  monthlySaving: 11_600_000,
  savingRate: 46.4,
  incomeChange: 5.2,
  expenseChange: -3.1,
};

// ===== GIAO DỊCH GẦN ĐÂY =====
export const recentTransactions = [
  {
    id: "txn-001",
    type: "expense" as const,
    amount: -125_000,
    category: "Ăn uống",
    description: "Grab Food - Cơm văn phòng",
    date: "2026-05-08T11:30:00",
    icon: "🍱",
  },
  {
    id: "txn-002",
    type: "income" as const,
    amount: 25_000_000,
    category: "Lương",
    description: "Lương tháng 5/2026",
    date: "2026-05-08T09:00:00",
    icon: "💼",
  },
  {
    id: "txn-003",
    type: "expense" as const,
    amount: -350_000,
    category: "Di chuyển",
    description: "Đổ xăng - Shell Nguyễn Văn Linh",
    date: "2026-05-07T18:45:00",
    icon: "⛽",
  },
  {
    id: "txn-004",
    type: "expense" as const,
    amount: -1_200_000,
    category: "Mua sắm",
    description: "Shopee - Quần áo hè",
    date: "2026-05-07T14:20:00",
    icon: "🛍️",
  },
  {
    id: "txn-005",
    type: "expense" as const,
    amount: -85_000,
    category: "Giải trí",
    description: "Netflix - Gói gia đình",
    date: "2026-05-06T20:00:00",
    icon: "🎬",
  },
  {
    id: "txn-006",
    type: "income" as const,
    amount: 500_000,
    category: "Thưởng",
    description: "Thưởng KPI tháng 4",
    date: "2026-05-05T10:00:00",
    icon: "🎁",
  },
  {
    id: "txn-007",
    type: "expense" as const,
    amount: -2_500_000,
    category: "Nhà ở",
    description: "Tiền điện + nước tháng 4",
    date: "2026-05-04T09:00:00",
    icon: "🏠",
  },
  {
    id: "txn-008",
    type: "expense" as const,
    amount: -450_000,
    category: "Sức khỏe",
    description: "Khám sức khỏe định kỳ",
    date: "2026-05-03T14:30:00",
    icon: "🏥",
  },
];

// ===== PHÂN TÍCH CHI TIÊU =====
export const expenseByCategory = [
  { name: "Ăn uống", value: 3_200_000, percent: 23.9, color: "#5BAAEC" },
  { name: "Nhà ở", value: 2_500_000, percent: 18.7, color: "#22C55E" },
  { name: "Di chuyển", value: 1_800_000, percent: 13.4, color: "#F59E0B" },
  { name: "Mua sắm", value: 1_900_000, percent: 14.2, color: "#A78BFA" },
  { name: "Giải trí", value: 1_100_000, percent: 8.2, color: "#FB923C" },
  { name: "Sức khỏe", value: 850_000, percent: 6.3, color: "#34D399" },
  { name: "Khác", value: 2_050_000, percent: 15.3, color: "#94A3B8" },
];

export const monthlyTrend = [
  { month: "Th11/25", thuNhap: 24_000_000, chiTieu: 15_200_000 },
  { month: "Th12/25", thuNhap: 30_000_000, chiTieu: 18_500_000 },
  { month: "Th1/26", thuNhap: 25_000_000, chiTieu: 14_800_000 },
  { month: "Th2/26", thuNhap: 25_000_000, chiTieu: 12_300_000 },
  { month: "Th3/26", thuNhap: 27_000_000, chiTieu: 14_100_000 },
  { month: "Th4/26", thuNhap: 25_500_000, chiTieu: 13_700_000 },
  { month: "Th5/26", thuNhap: 25_000_000, chiTieu: 13_400_000 },
];

export const weeklyExpense = [
  { day: "T2", amount: 320_000 },
  { day: "T3", amount: 185_000 },
  { day: "T4", amount: 540_000 },
  { day: "T5", amount: 210_000 },
  { day: "T6", amount: 890_000 },
  { day: "T7", amount: 1_250_000 },
  { day: "CN", amount: 430_000 },
];

// ===== MỤC TIÊU TÀI CHÍNH =====
export const financialGoals = [
  {
    id: "goal-001",
    title: "Quỹ Khẩn Cấp",
    emoji: "🛡️",
    targetAmount: 50_000_000,
    currentAmount: 32_500_000,
    deadline: "2026-09-01",
    status: "on-track" as const,
    monthlyTarget: 3_500_000,
    aiNote: "Bạn đang đi đúng hướng. Tiếp tục dành 14% thu nhập hàng tháng để đạt mục tiêu đúng hạn.",
  },
  {
    id: "goal-002",
    title: "Du lịch Châu Âu",
    emoji: "✈️",
    targetAmount: 80_000_000,
    currentAmount: 18_000_000,
    deadline: "2027-06-01",
    status: "at-risk" as const,
    monthlyTarget: 5_500_000,
    aiNote: "Chi tiêu tháng 4 tăng 8% khiến bạn chậm mục tiêu 2 tháng. Hãy cắt giảm ăn ngoài để bù đắp.",
  },
  {
    id: "goal-003",
    title: "Mua Xe Ô tô",
    emoji: "🚗",
    targetAmount: 300_000_000,
    currentAmount: 45_000_000,
    deadline: "2029-01-01",
    status: "on-track" as const,
    monthlyTarget: 8_000_000,
    aiNote: "Mức tiết kiệm hiện tại có thể đạt mục tiêu trước hạn 5 tháng. Tuyệt vời!",
  },
  {
    id: "goal-004",
    title: "Học Thạc Sĩ",
    emoji: "🎓",
    targetAmount: 120_000_000,
    currentAmount: 92_000_000,
    deadline: "2026-08-01",
    status: "achieved" as const,
    monthlyTarget: 0,
    aiNote: "Xuất sắc! Bạn đã đạt 76.7% mục tiêu và sẽ hoàn thành trước tháng 8.",
  },
];

// ===== ĐẦU TƯ =====
export const portfolio = {
  totalValue: 185_600_000,
  change: 4_200_000,
  changePercent: 2.32,
  idleCash: 11_800_000,
  riskLevel: "moderate" as const,
};

export const assets = [
  {
    id: "asset-001",
    name: "Cổ phiếu VNM",
    symbol: "VNM",
    type: "stock",
    allocation: 35,
    value: 64_960_000,
    change: 3.2,
    color: "#5BAAEC",
  },
  {
    id: "asset-002",
    name: "Vàng SJC",
    symbol: "GOLD",
    type: "gold",
    allocation: 25,
    value: 46_400_000,
    change: 1.8,
    color: "#F59E0B",
  },
  {
    id: "asset-003",
    name: "Gửi tiết kiệm",
    symbol: "SAVING",
    type: "saving",
    allocation: 30,
    value: 55_680_000,
    change: 0.6,
    color: "#22C55E",
  },
  {
    id: "asset-004",
    name: "Bitcoin",
    symbol: "BTC",
    type: "crypto",
    allocation: 10,
    value: 18_560_000,
    change: -1.4,
    color: "#FB923C",
  },
];

export const portfolioHistory = [
  { month: "T11/25", value: 155_000_000 },
  { month: "T12/25", value: 162_000_000 },
  { month: "T1/26", value: 158_000_000 },
  { month: "T2/26", value: 170_000_000 },
  { month: "T3/26", value: 174_000_000 },
  { month: "T4/26", value: 181_400_000 },
  { month: "T5/26", value: 185_600_000 },
];

export const aiInvestmentSuggestions = [
  {
    id: "sug-001",
    asset: "Cổ phiếu VN30",
    action: "Mua thêm",
    allocation: 5,
    amount: 5_900_000,
    reasoning: "Thị trường VN30 đang phục hồi mạnh (+4.2% tuần qua). Phù hợp với profile rủi ro trung bình của bạn.",
    risk: "medium" as const,
  },
  {
    id: "sug-002",
    asset: "Vàng SJC",
    action: "Giữ nguyên",
    allocation: 0,
    amount: 0,
    reasoning: "Giá vàng đang ở vùng kháng cự 110 triệu/lượng. Nên chờ điều chỉnh trước khi tăng tỷ trọng.",
    risk: "low" as const,
  },
  {
    id: "sug-003",
    asset: "Gửi tiết kiệm kỳ hạn 6 tháng",
    action: "Gửi thêm",
    allocation: 5,
    amount: 5_900_000,
    reasoning: "Lãi suất BIDV đang ở mức 6.1%/năm kỳ hạn 6 tháng. Nên đặt vào để bảo toàn vốn.",
    risk: "low" as const,
  },
];

// ===== CÀI ĐẶT =====
export const userProfile = {
  name: "Nguyễn Minh Tuấn",
  email: "tuan.nguyen@example.com",
  phone: "0901 234 567",
  avatar: "https://ui-avatars.com/api/?name=Nguyen+Minh+Tuan&background=5BAAEC&color=fff&size=128",
  joinDate: "2025-01-15",
  riskLevel: "moderate" as const,
};

export const aiPreferences = [
  {
    id: "pref-weekly",
    label: "Báo cáo AI hàng tuần",
    description: "Nhận bản tóm tắt thông minh về chi tiêu và xu hướng của bạn mỗi thứ Hai.",
    enabled: true,
  },
  {
    id: "pref-rebalance",
    label: "Gợi ý tái cân bằng danh mục",
    description: "AI đề xuất điều chỉnh danh mục khi thị trường có biến động lớn.",
    enabled: false,
  },
  {
    id: "pref-alert",
    label: "Cảnh báo chi tiêu bất thường",
    description: "Thông báo ngay khi AI phát hiện giao dịch vượt ngưỡng hoặc bất thường.",
    enabled: true,
  },
  {
    id: "pref-goal",
    label: "Nhắc nhở mục tiêu tiết kiệm",
    description: "Gửi thông báo khi tiến độ mục tiêu chậm hơn kế hoạch.",
    enabled: true,
  },
];
