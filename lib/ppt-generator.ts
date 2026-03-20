import PptxGenJS from "pptxgenjs";
import sharp from "sharp";
import { BISData } from "./types";
import { generatePyramidSVG } from "./pyramid-svg";

const LEFT_LABELS = [
  { title: "Brand Vision", desc: "가 추구하는 비전" },
  { title: "Brand Mission", desc: "비전을 이루기 위한 미션" },
  { title: "Brand Essence", desc: "브랜드를 함축하는 본질" },
  { title: "Brand Value", desc: "브랜드가 추구하는 가치" },
  {
    title: "Functional Benefit",
    desc: "브랜드가 기능적으로 제공하는 혜택",
  },
  {
    title: "Emotional Benefit",
    desc: "브랜드가 정서적으로 제공하는 혜택",
  },
  {
    title: "Brand Attributes & Symbol",
    desc: "브랜드가 내세우는 상징 혹은 소비자가 떠올리는 브랜드 연상 이미지",
  },
];

// Tier Y positions (in inches)
const TIER_Y_POSITIONS = [0.5, 1.32, 2.13, 2.95, 3.77, 4.58, 5.4];

export async function generatePPT(data: BISData): Promise<Buffer> {
  // Generate SVG and convert to PNG
  const svgString = generatePyramidSVG(data);
  const svgBuffer = Buffer.from(svgString);
  const pngBuffer = await sharp(svgBuffer, { density: 150 })
    .resize(1660, 980)
    .png()
    .toBuffer();
  const pngBase64 = "image/png;base64," + pngBuffer.toString("base64");

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "CUSTOM", width: 10, height: 5.625 });
  pptx.layout = "CUSTOM";

  const slide = pptx.addSlide();
  slide.background = { color: "1A1A1A" };

  // Title
  slide.addText("Brand Identity System", {
    x: 0.3,
    y: 0.1,
    w: 3,
    h: 0.4,
    fontSize: 20,
    fontFace: "Arial Black",
    color: "8BC34A",
    bold: true,
  });

  // Pyramid image
  slide.addImage({
    data: pngBase64,
    x: 0,
    y: 0,
    w: 10,
    h: 5.625,
  });

  // Left labels
  for (let i = 0; i < LEFT_LABELS.length; i++) {
    const label = LEFT_LABELS[i];
    // For Value tier (index 3), we show Brand Value
    // For Benefit tiers (index 4 and 5), we show Functional/Emotional Benefit
    // For Attributes (index 6), we show Attributes & Symbol

    // Map label index to tier index for Y positioning
    let tierIdx: number;
    if (i <= 3) {
      tierIdx = i;
    } else if (i === 4 || i === 5) {
      tierIdx = 4; // Both benefits in tier 4
    } else {
      tierIdx = 5; // Attributes in tier 5
    }

    const y1 = TIER_Y_POSITIONS[tierIdx];
    const y2 = TIER_Y_POSITIONS[tierIdx + 1];
    const midY = (y1 + y2) / 2;

    // Adjust Y for Functional/Emotional benefit labels
    let labelY = midY - 0.15;
    if (i === 4) labelY = y1 + (y2 - y1) * 0.25 - 0.15;
    if (i === 5) labelY = y1 + (y2 - y1) * 0.75 - 0.15;

    // White vertical bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.2,
      y: labelY,
      w: 0.03,
      h: 0.25,
      fill: { color: "FFFFFF" },
    });

    // Label title
    const descText =
      i === 0 ? `${data.brandNameKo}${label.desc}` : label.desc;

    slide.addText(
      [
        {
          text: label.title,
          options: {
            fontSize: 9,
            bold: true,
            color: "FFFFFF",
            fontFace: "Arial",
          },
        },
        {
          text: `\n${descText}`,
          options: { fontSize: 7, color: "888888", fontFace: "Arial" },
        },
      ],
      {
        x: 0.28,
        y: labelY,
        w: 1.7,
        h: 0.35,
        valign: "middle",
      }
    );
  }

  // Tagline at bottom
  if (data.tagline) {
    slide.addText(`"${data.tagline}"`, {
      x: 0,
      y: 5.2,
      w: 10,
      h: 0.3,
      fontSize: 8,
      fontFace: "Arial",
      color: "555555",
      italic: true,
      align: "center",
    });
  }

  const arrayBuffer = await pptx.write({ outputType: "arraybuffer" });
  return Buffer.from(arrayBuffer as ArrayBuffer);
}
