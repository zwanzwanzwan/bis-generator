"use client";

interface StatusIndicatorProps {
  status: "idle" | "analyzing" | "error" | "success";
  message?: string;
}

export default function StatusIndicator({
  status,
  message,
}: StatusIndicatorProps) {
  if (status === "idle") return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      {status === "analyzing" && (
        <>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8BC34A] border-t-transparent" />
          <span className="text-gray-300">
            {message || "브랜드를 분석하고 있습니다..."}
          </span>
        </>
      )}
      {status === "error" && (
        <span className="text-red-400">{message || "오류가 발생했습니다."}</span>
      )}
      {status === "success" && (
        <span className="text-[#8BC34A]">
          {message || "분석이 완료되었습니다!"}
        </span>
      )}
    </div>
  );
}
