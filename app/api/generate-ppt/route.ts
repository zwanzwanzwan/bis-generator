import { NextRequest, NextResponse } from "next/server";
import { generatePPT } from "@/lib/ppt-generator";
import { BISData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { bisData } = (await request.json()) as { bisData: BISData };

    if (!bisData || !bisData.brandName) {
      return NextResponse.json(
        { error: "BIS 데이터가 필요합니다." },
        { status: 400 }
      );
    }

    const pptBuffer = await generatePPT(bisData);

    return new NextResponse(new Uint8Array(pptBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(bisData.brandName)}_BIS.pptx"`,
      },
    });
  } catch (error) {
    console.error("PPT generation error:", error);
    const message =
      error instanceof Error ? error.message : "PPT 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
