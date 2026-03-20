"use client";

import { BISData } from "@/lib/types";
import { useState } from "react";

interface AnalysisResultProps {
  data: BISData;
  onReanalyze: () => void;
}

export default function AnalysisResult({
  data,
  onReanalyze,
}: AnalysisResultProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/generate-ppt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bisData: data }),
      });

      if (!res.ok) {
        throw new Error("PPT 생성에 실패했습니다.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.brandName}_BIS.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "다운로드 실패");
    } finally {
      setDownloading(false);
    }
  };

  const items = [
    { label: "Brand Vision", value: data.vision },
    { label: "Brand Mission", value: data.mission },
    {
      label: "Brand Essence",
      value: `${data.essenceKeyword}\n${data.essenceDesc}`,
    },
    {
      label: "Functional Value",
      value: data.valueFunctional
        .map((v) => `${v.ko} / ${v.en}`)
        .join(", "),
    },
    {
      label: "Emotional Value",
      value: data.valueEmotional
        .map((v) => `${v.ko} / ${v.en}`)
        .join(", "),
    },
    { label: "Functional Benefit", value: data.benefitFunctional },
    { label: "Emotional Benefit", value: data.benefitEmotional },
    { label: "Attributes & Symbol", value: data.attributes },
  ];

  return (
    <div className="mt-8 rounded-xl border border-gray-700 bg-[#1E1E1E] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {data.brandNameKo} ({data.brandName})
          </h2>
          <p className="text-sm text-gray-400">BIS 분석 결과</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReanalyze}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 transition hover:border-gray-400 hover:text-white"
          >
            재분석
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#9CCC65] disabled:opacity-50"
          >
            {downloading ? "생성 중..." : "PPT 다운로드"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-700/50 bg-[#252525] p-3"
          >
            <span className="text-xs font-bold text-[#8BC34A]">
              {item.label}
            </span>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-200">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {data.tagline && (
        <div className="mt-4 text-center">
          <span className="text-sm italic text-gray-500">
            &ldquo;{data.tagline}&rdquo;
          </span>
        </div>
      )}
    </div>
  );
}
