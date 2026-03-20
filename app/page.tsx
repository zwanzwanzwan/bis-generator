"use client";

import { useState } from "react";
import BrandInput from "@/components/BrandInput";
import StatusIndicator from "@/components/StatusIndicator";
import AnalysisResult from "@/components/AnalysisResult";
import { BISData } from "@/lib/types";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "analyzing" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<BISData | null>(null);

  const handleAnalyze = async (brandName: string) => {
    setStatus("analyzing");
    setMessage("웹 검색으로 브랜드를 리서치하고 있습니다...");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setStatus("error");
        setMessage(json.error || "분석에 실패했습니다.");
        return;
      }

      setResult(json.data);
      setStatus("success");
      setMessage("분석이 완료되었습니다!");
    } catch {
      setStatus("error");
      setMessage("서버와 통신할 수 없습니다. 다시 시도해주세요.");
    }
  };

  const handleReanalyze = () => {
    setResult(null);
    setStatus("idle");
    setMessage("");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-[#8BC34A]">BIS</span> Generator
        </h1>
        <p className="mt-1 text-lg text-gray-400">Brand Identity System</p>
        <p className="mt-2 text-sm text-gray-500">
          브랜드명을 입력하면 자동 분석하여 PPT를 생성합니다
        </p>
      </header>

      <BrandInput onSubmit={handleAnalyze} disabled={status === "analyzing"} />

      <StatusIndicator status={status} message={message} />

      {result && (
        <AnalysisResult data={result} onReanalyze={handleReanalyze} />
      )}
    </main>
  );
}
