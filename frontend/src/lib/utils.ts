import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "VND"): string {
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

export function formatNumberToVietnameseWords(num: number): string {
  if (isNaN(num) || num <= 0) return "";
  
  const cleanNum = Math.round(num);
  const bill = Math.floor(cleanNum / 1000000000);
  const remainderBill = cleanNum % 1000000000;
  const million = Math.floor(remainderBill / 1000000);
  const remainderMillion = remainderBill % 1000000;
  const thousand = Math.floor(remainderMillion / 1000);
  const remainderThousand = remainderMillion % 1000;

  const parts: string[] = [];
  if (bill > 0) {
    parts.push(`${bill} tỷ`);
  }
  if (million > 0) {
    parts.push(`${million} triệu`);
  }
  if (thousand > 0) {
    parts.push(`${thousand} nghìn`);
  }
  if (remainderThousand > 0) {
    parts.push(`${remainderThousand}`);
  }

  if (parts.length === 0) {
    return "0 đồng";
  }
  return parts.join(" ") + " đồng";
}
