const ENV_API_URL = import.meta.env.VITE_API_URL as string | undefined;
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_TIMEOUT_MS ?? 15000);
const API_URLS = ENV_API_URL
  ? [ENV_API_URL]
  : ["http://localhost:8080", "http://127.0.0.1:8080"];
const TOKEN_KEY = "spendsense_demo_token";
const DEMO_EMAIL = "demo@spendsense.dev";
const DEMO_PASSWORD = "demo-password";

export interface AnalyzeReceiptResult {
  insight: {
    insight_id: string;
    receipt_id: string;
    summary: string;
    category: string;
    tips: string[];
    source: "cache" | "llm";
    similarity_score: number | null;
  };
  vector_id: string | null;
  receipt: ReceiptDraft | null;
  suggested_transaction: SuggestedTransaction | null;
  detected_fields: DetectedField[];
}

export interface DetectedField {
  id: string;
  class_name: string;
  text: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ReceiptDraftItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  source_token_ids: Record<string, string | null>;
}

export interface ReceiptDraft {
  receipt_id: string;
  merchant: string;
  purchase_date: string | null;
  total_amount: number;
  currency: string;
  raw_text: string;
  items: ReceiptDraftItem[];
}

export interface SuggestedTransaction {
  type: "expense" | "income";
  amount: number;
  currency: string;
  category: string;
  description: string;
  merchant: string;
  transaction_date: string | null;
  receipt_id: string | null;
}

export interface CreateTransactionPayload {
  type: "expense" | "income";
  amount: number;
  currency: string;
  category: string;
  description: string;
  merchant: string;
  transaction_date: string | null;
  receipt_items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
  }>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithFallback(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function loginDemoUser(): Promise<string> {
  type AuthResponse = { access_token: string };
  const body = JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD });

  try {
    const registered = await request<AuthResponse>("/auth/register", {
      method: "POST",
      body,
    });
    return registered.access_token;
  } catch {
    const loggedIn = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body,
    });
    return loggedIn.access_token;
  }
}

async function getDemoToken(): Promise<string> {
  const existing = localStorage.getItem(TOKEN_KEY);
  if (existing) {
    const response = await fetchWithFallback("/auth/me", {
      headers: { Authorization: `Bearer ${existing}` },
    });
    if (response.ok) return existing;
    localStorage.removeItem(TOKEN_KEY);
  }

  const token = await loginDemoUser();
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

export async function getHealth(): Promise<{ status: string }> {
  return request<{ status: string }>("/health");
}

export async function analyzeReceipt(file: File): Promise<AnalyzeReceiptResult> {
  return postReceipt(file);
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<unknown> {
  const token = await getDemoToken();
  return request<unknown>("/transactions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

async function postReceipt(file: File): Promise<AnalyzeReceiptResult> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetchWithFallback("/receipts/analyze", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Analyze failed: ${response.status}`);
  }

  return response.json() as Promise<AnalyzeReceiptResult>;
}

async function fetchWithFallback(path: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (const baseUrl of API_URLS) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
      });
    } catch (error) {
      lastError = error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw new Error(
    `Không kết nối được backend. Hãy chạy FastAPI ở một trong các cổng: ${API_URLS.join(", ")}. ` +
    `Lỗi gốc: ${lastError instanceof Error ? lastError.message : "Failed to fetch"}`,
  );
}
