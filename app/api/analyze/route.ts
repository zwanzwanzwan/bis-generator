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

    // Single API call: web search + BIS generation combined
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are a brand strategist. First, search the web for information about the given brand. Then, based on your research, generate a Brand Identity System JSON.

${BIS_SYSTEM_PROMPT}

IMPORTANT: After researching, output ONLY the JSON object. No other text.`,
      tools: [
        {
          type: "web_search_20250305" as const,
          name: "web_search",
          max_uses: 3,
        },
      ],
      messages: [
        {
          role: "user",
          content: `"${brandName}" 브랜드를 웹 검색으로 조사한 후, BIS JSON을 생성해줘. 브랜드 비전, 미션, 핵심 가치, 슬로건, 주요 제품/서비스, 타겟 고객, 차별점을 조사해서 반영해줘. 결과는 반드시 JSON만 출력해.`,
        },
      ],
    });

    // Extract text blocks from response
    const responseText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    if (!responseText) {
      return NextResponse.json(
        {
          success: false,
          error: "브랜드 분석 결과를 가져오지 못했습니다.",
        },
        { status: 500 }
      );
    }

    // Parse JSON (handle markdown code blocks)
    let jsonStr = responseText.trim();
    jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
    jsonStr = jsonStr.trim();

    // Try to extract JSON if there's extra text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let bisData: BISData;
    try {
      bisData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "분석 결과 파싱에 실패했습니다. 다시 시도해주세요.",
        },
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
