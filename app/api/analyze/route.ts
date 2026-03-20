import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { BIS_SYSTEM_PROMPT } from "@/lib/prompts";
import { BISData } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { brandName } = await request.json();

    if (!brandName || typeof brandName !== "string") {
      return NextResponse.json(
        { success: false, error: "브랜드명을 입력해주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "서버에 API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: BIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `"${brandName}" 브랜드의 BIS JSON을 생성해줘. 이 브랜드의 비전, 미션, 본질, 핵심 가치, 혜택, 속성을 분석해서 반영해줘.`,
        },
      ],
    });

    const responseText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    if (!responseText) {
      return NextResponse.json(
        { success: false, error: "브랜드 분석 결과를 가져오지 못했습니다." },
        { status: 500 }
      );
    }

    // Parse JSON (handle markdown code blocks)
    let jsonStr = responseText.trim();
    jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
    jsonStr = jsonStr.trim();

    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let bisData: BISData;
    try {
      bisData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { success: false, error: "분석 결과 파싱에 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: bisData });
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
