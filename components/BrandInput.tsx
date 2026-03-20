"use client";

import { useState } from "react";

interface BrandInputProps {
  onSubmit: (brandName: string) => void;
  disabled: boolean;
}

export default function BrandInput({ onSubmit, disabled }: BrandInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="브랜드명 입력 (예: 스타벅스, 다이슨, 무신사)"
        disabled={disabled}
        className="flex-1 rounded-lg border border-gray-700 bg-[#1E1E1E] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-[#8BC34A] disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-lg bg-[#8BC34A] px-6 py-3 font-bold text-black transition hover:bg-[#9CCC65] disabled:cursor-not-allowed disabled:opacity-50"
      >
        분석하기
      </button>
    </form>
  );
}
