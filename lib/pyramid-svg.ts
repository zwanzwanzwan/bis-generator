import { BISData } from "./types";

const TIER_COLORS = [
  "#2A2A2A", // Vision
  "#333328", // Mission
  "#3D3D22", // Essence
  "#4A4A1C", // Value
  "#5A5A18", // Benefit
  "#6B6B14", // Attributes
];

// Pyramid geometry (in pixels, scaled from inches at ~166px/inch for 1660x980)
const CX = 1046; // 6.3" center
const TOP_Y = 83; // 0.5"
const BOT_Y = 896; // 5.4"
const TOP_HW = 8; // 0.05" half-width at top
const BOT_HW = 689; // 4.15" half-width at bottom
const TIERS = 6;

function tierY(i: number): number {
  return TOP_Y + (BOT_Y - TOP_Y) * (i / TIERS);
}

function halfWidthAt(y: number): number {
  const t = (y - TOP_Y) / (BOT_Y - TOP_Y);
  return TOP_HW + (BOT_HW - TOP_HW) * t;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generatePyramidSVG(data: BISData): string {
  const W = 1660;
  const H = 980;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  svg += `<rect width="${W}" height="${H}" fill="#1A1A1A"/>`;

  // Draw tier trapezoids
  for (let i = 0; i < TIERS; i++) {
    const y1 = tierY(i);
    const y2 = tierY(i + 1);
    const hw1 = halfWidthAt(y1);
    const hw2 = halfWidthAt(y2);

    const points = [
      `${CX - hw1},${y1}`,
      `${CX + hw1},${y1}`,
      `${CX + hw2},${y2}`,
      `${CX - hw2},${y2}`,
    ].join(" ");

    svg += `<polygon points="${points}" fill="${TIER_COLORS[i]}" stroke="#444" stroke-width="0.5"/>`;
  }

  // Center dashed line
  svg += `<line x1="${CX}" y1="${TOP_Y}" x2="${CX}" y2="${BOT_Y}" stroke="#555" stroke-width="1" stroke-dasharray="6,4"/>`;

  // Tier content
  const tiers = buildTierContent(data);

  for (let i = 0; i < TIERS; i++) {
    const y1 = tierY(i);
    const y2 = tierY(i + 1);
    const midY = (y1 + y2) / 2;
    const tier = tiers[i];

    // Tier label (small gray)
    svg += `<text x="${CX}" y="${y1 + 16}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#888">${escapeXml(tier.label)}</text>`;

    // Content
    if (tier.lines) {
      const lineHeight = tier.fontSize ? tier.fontSize + 4 : 18;
      const startY = midY - ((tier.lines.length - 1) * lineHeight) / 2 + 4;
      for (let j = 0; j < tier.lines.length; j++) {
        const line = tier.lines[j];
        svg += `<text x="${CX}" y="${startY + j * lineHeight}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${line.size || tier.fontSize || 14}" fill="${line.color || "#fff"}" font-weight="${line.bold ? "bold" : "normal"}">${escapeXml(line.text)}</text>`;
      }
    }

    // Left/right split content (for Value and Benefit tiers)
    if (tier.left && tier.right) {
      const leftX = CX - 100;
      const rightX = CX + 100;

      for (const side of [
        { items: tier.left, x: leftX },
        { items: tier.right, x: rightX },
      ]) {
        const lineHeight = 16;
        const startY = midY - ((side.items.length - 1) * lineHeight) / 2 + 4;
        for (let j = 0; j < side.items.length; j++) {
          const item = side.items[j];
          svg += `<text x="${side.x}" y="${startY + j * lineHeight}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${item.size || 12}" fill="${item.color || "#fff"}" font-weight="${item.bold ? "bold" : "normal"}">${escapeXml(item.text)}</text>`;
        }
      }
    }
  }

  svg += `</svg>`;
  return svg;
}

interface TextLine {
  text: string;
  size?: number;
  color?: string;
  bold?: boolean;
}

interface TierContent {
  label: string;
  lines?: TextLine[];
  left?: TextLine[];
  right?: TextLine[];
  fontSize?: number;
}

function buildTierContent(data: BISData): TierContent[] {
  return [
    // Tier 0: Vision
    {
      label: "BRAND VISION",
      fontSize: 13,
      lines: [{ text: data.vision, size: 13, bold: true }],
    },
    // Tier 1: Mission
    {
      label: "BRAND MISSION",
      fontSize: 12,
      lines: [{ text: data.mission, size: 12, bold: true }],
    },
    // Tier 2: Essence
    {
      label: "BRAND ESSENCE",
      fontSize: 15,
      lines: [
        { text: data.essenceKeyword, size: 15, bold: true },
        { text: data.essenceDesc, size: 10, color: "#aaa" },
      ],
    },
    // Tier 3: Value (left/right split)
    {
      label: "BRAND VALUE",
      left: [
        { text: "Functional Value", size: 10, color: "#888" },
        ...data.valueFunctional.map((v) => ({
          text: `${v.ko} / ${v.en}`,
          size: 12,
          bold: true,
        })),
      ],
      right: [
        { text: "Emotional Value", size: 10, color: "#888" },
        ...data.valueEmotional.map((v) => ({
          text: `${v.ko} / ${v.en}`,
          size: 12,
          bold: true,
        })),
      ],
    },
    // Tier 4: Benefit (left/right split)
    {
      label: "BRAND BENEFIT",
      left: [
        { text: "Functional Benefit", size: 10, color: "#888" },
        { text: data.benefitFunctional, size: 11 },
      ],
      right: [
        { text: "Emotional Benefit", size: 10, color: "#888" },
        { text: data.benefitEmotional, size: 11 },
      ],
    },
    // Tier 5: Attributes
    {
      label: "BRAND ATTRIBUTES & SYMBOL",
      fontSize: 11,
      lines: [{ text: data.attributes, size: 11, color: "#ccc" }],
    },
  ];
}
