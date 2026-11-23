import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);
const news = JSON.parse(readFileSync(join(root, "news.json"), "utf8"));

const COLORS = {
  OCE: "#0E6A6A",
  EAS: "#9C2B24",
  SAS: "#8A5600",
  AFR: "#1E6B45",
  MEA: "#6A3A86",
  EUR: "#1F4E8C",
  AME: "#3E4C22",
};
const NAMES = {
  OCE: "OCEANIA",
  EAS: "EAST ASIA",
  SAS: "SOUTH ASIA",
  AFR: "AFRICA",
  MEA: "MIDDLE EAST",
  EUR: "EUROPE",
  AME: "AMERICAS",
};
const COLUMNS = [
  ["OCE", "MEA"],
  ["EAS", "EUR"],
  ["SAS", "AFR", "AME"],
];
const SHORT = {
  OFFICIAL: "OFF",
  CONFIRMED: "CONF",
  REPORTED: "REP",
  CLAIM: "CLAIM",
  SCHEDULED: "SCHED",
  FORECAST: "FCST",
  "IN PLAY": "IN PLAY",
  ANALYSIS: "NOTE",
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}
function br(s) {
  return esc(s).replaceAll("\n", "<br>");
}

function regionCounts(stories) {
  const order = news.regionOrder;
  const counts = Object.fromEntries(order.map((code) => [code, 0]));
  for (const story of stories) {
    if (!(story.region in counts)) throw new Error(`Unknown region on ${story.id}`);
    counts[story.region] += 1;
  }
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  if (total !== 45) throw new Error(`Expected 45 stories, found ${total}`);
  return order.map((code) => ({ code, count: counts[code] }));
}

function star(cx, cy, r, fill) {
  const p = [
    [cx, cy - r],
    [cx + r * 0.32, cy - r * 0.32],
    [cx + r, cy],
    [cx + r * 0.32, cy + r * 0.32],
    [cx, cy + r],
    [cx - r * 0.32, cy + r * 0.32],
    [cx - r, cy],
    [cx - r * 0.32, cy - r * 0.32],
  ];
  return `<polygon points="${p.map((pair) => pair.join(",")).join(" ")}" fill="${fill}"/>`;
}

function banner(inner) {
  return `<svg viewBox="0 0 192 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="192" height="60" fill="#EFE2CC"/>${inner}</svg>`;
}

const MID_ART = {
  M5: banner(`
    <rect x="28" y="14" width="46" height="34" rx="6" fill="#F7F1E6" stroke="#1C1612" stroke-width="1.4"/>
    <rect x="36" y="8" width="30" height="10" rx="2" fill="#9C2B24"/>
    <rect x="40" y="22" width="22" height="14" rx="2" fill="#F4E4C4" stroke="#1C1612" stroke-width="1"/>
    <path d="M78 18 h34 l8 8 v20 h-42 z" fill="#F7F1E6" stroke="#1C1612" stroke-width="1.4"/>
    <text x="86" y="40" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#9C2B24">A$25</text>
    <circle cx="132" cy="40" r="10" fill="none" stroke="#1C1612" stroke-width="1.3"/>
    <path d="M132 34 v8 M128 40 h8" stroke="#1C1612" stroke-width="1.2"/>`),
  M6: banner(`
    <rect x="36" y="18" width="22" height="26" fill="#9C2B24"/>
    <rect x="84" y="18" width="22" height="26" fill="#C47B00"/>
    <rect x="132" y="23" width="22" height="21" fill="#1F4E8C"/>
    <text x="47" y="15" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#1C1612">27</text>
    <text x="95" y="15" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#1C1612">27</text>
    <text x="143" y="16" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#1C1612">22</text>
    <text x="47" y="54" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" fill="#3A342C">Labor</text>
    <text x="95" y="54" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" fill="#3A342C">ON</text>
    <text x="143" y="54" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" fill="#3A342C">LNP</text>`),
  M7: banner(`
    <rect width="192" height="34" fill="#D5E6F0"/>
    <path d="M0 34 L70 28 H192 V60 H0 Z" fill="#3E7A45"/>
    <rect x="78" y="22" width="3" height="26" fill="#F3E6C8" stroke="#1C1612" stroke-width="0.6"/>
    <rect x="88" y="18" width="3" height="30" fill="#F3E6C8" stroke="#1C1612" stroke-width="0.6"/>
    <rect x="98" y="22" width="3" height="26" fill="#F3E6C8" stroke="#1C1612" stroke-width="0.6"/>
    <rect x="76" y="18" width="10" height="2.2" fill="#F7F1E6" stroke="#1C1612" stroke-width="0.5"/>
    <rect x="94" y="18" width="10" height="2.2" fill="#F7F1E6" stroke="#1C1612" stroke-width="0.5"/>
    <circle cx="118" cy="40" r="4" fill="#B23A32" stroke="#1C1612" stroke-width="0.6"/>`),
  M8: banner(`
    <rect x="18" y="28" width="120" height="20" rx="3" fill="#C0392B" stroke="#1C1612" stroke-width="1.2"/>
    <path d="M108 28 L138 32 V48 H108 Z" fill="#E8D5A3" stroke="#1C1612" stroke-width="1.2"/>
    <rect x="28" y="32" width="22" height="10" fill="#D7EEF6" stroke="#1C1612" stroke-width="0.8"/>
    <rect x="56" y="32" width="22" height="10" fill="#D7EEF6" stroke="#1C1612" stroke-width="0.8"/>
    <circle cx="46" cy="50" r="7" fill="#1C1612"/>
    <circle cx="46" cy="50" r="3" fill="#EFE2CC"/>
    <circle cx="100" cy="50" r="7" fill="#1C1612"/>
    <circle cx="100" cy="50" r="3" fill="#EFE2CC"/>
    <rect x="126" y="10" width="52" height="14" fill="#1C1612"/>
    <text x="152" y="20" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="700" fill="#F5F0E6">STRIKE</text>`),
  M9: banner(`
    <rect x="36" y="8" width="78" height="46" fill="#FBF7EF" stroke="#1C1612" stroke-width="1.3"/>
    <path d="M46 20 h58 M46 28 h58 M46 36 h40" stroke="#C4B49A" stroke-width="1.4"/>
    <path d="M118 40 L150 14" stroke="#C47B00" stroke-width="4" stroke-linecap="round"/>
    <path d="M146 12 l10 2 -6 8 z" fill="#E0B15A" stroke="#1C1612" stroke-width="0.8"/>
    <path d="M112 44 l8 6" stroke="#C47B00" stroke-width="3" stroke-linecap="round"/>`),
  M10: banner(`
    <path d="M34 14 L70 12 L92 22 L96 40 L78 50 L40 48 L28 30 Z" fill="#E7C56A" stroke="#1C1612" stroke-width="1.2"/>
    <circle cx="128" cy="30" r="5" fill="none" stroke="#8A5600" stroke-width="2"/>
    <circle cx="142" cy="30" r="5" fill="none" stroke="#8A5600" stroke-width="2"/>
    <circle cx="156" cy="30" r="5" fill="none" stroke="#8A5600" stroke-width="2"/>
    <circle cx="142" cy="44" r="7" fill="#F2D56A" stroke="#1C1612" stroke-width="1.2"/>
    <path d="M142 40 v8 M138 44 h8" stroke="#1C1612" stroke-width="1"/>`),
  M11: banner(`
    <rect x="14" y="12" width="40" height="28" fill="#111" stroke="#1C1612" stroke-width="0.8"/>
    <rect x="14" y="21" width="40" height="6" fill="#fff"/>
    <rect x="14" y="27" width="40" height="6" fill="#BB1E2D"/>
    <rect x="14" y="33" width="40" height="7" fill="#1E6B45"/>
    <rect x="138" y="12" width="40" height="28" fill="#2E6CB5" stroke="#1C1612" stroke-width="0.8"/>
    <path d="M138 12 L178 40" stroke="#D7263D" stroke-width="6"/>
    <polygon points="150,18 152,23 157,23 153,26 155,31 150,28 145,31 147,26 143,23 148,23" fill="#F2D56A"/>
    <path d="M70 34 C78 22, 92 22, 96 32" fill="none" stroke="#1C1612" stroke-width="2" stroke-linecap="round"/>
    <path d="M122 34 C114 22, 100 22, 96 32" fill="none" stroke="#1C1612" stroke-width="2" stroke-linecap="round"/>
    <circle cx="84" cy="30" r="4" fill="#F3D2B5" stroke="#1C1612" stroke-width="0.8"/>
    <circle cx="108" cy="30" r="4" fill="#F3D2B5" stroke="#1C1612" stroke-width="0.8"/>`),
  M12: banner(`
    <rect x="28" y="36" width="22" height="8" rx="3" fill="#6B4A32"/>
    <rect x="54" y="36" width="22" height="8" rx="3" fill="#8A5A3A"/>
    <rect x="40" y="42" width="10" height="6" fill="#1C1612"/>
    <rect x="62" y="42" width="10" height="6" fill="#1C1612"/>
    <g stroke="#1C1612" stroke-width="3">
      <path d="M24 8 v44 M48 8 v44 M72 8 v44 M96 8 v44 M120 8 v44"/>
    </g>`),
  M13: banner(`
    <g fill="#1C1612">
      <rect x="36" y="8" width="4" height="36"/>
      <rect x="48" y="8" width="4" height="36"/>
      <rect x="60" y="8" width="4" height="36"/>
      <rect x="72" y="8" width="4" height="36"/>
      <rect x="84" y="8" width="4" height="36"/>
      <rect x="34" y="16" width="56" height="3"/>
      <rect x="34" y="26" width="56" height="3"/>
      <polygon points="36,44 40,52 32,52"/>
      <polygon points="48,44 52,52 44,52"/>
      <polygon points="60,44 64,52 56,52"/>
      <polygon points="72,44 76,52 68,52"/>
      <polygon points="84,44 88,52 80,52"/>
    </g>
    <rect x="104" y="18" width="74" height="22" fill="#FBF7EF" stroke="#9C2B24" stroke-width="1.3"/>
    <text x="141" y="32" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" font-weight="700" fill="#9C2B24">FINANCE BILL</text>`),
  M14: banner(`
    <path d="M20 50 A76 76 0 0 1 172 50" fill="none" stroke="#1F4E8C" stroke-width="8"/>
    <path d="M36 50 A60 60 0 0 1 156 50" fill="none" stroke="#4E86C4" stroke-width="5"/>
    <circle cx="96" cy="46" r="8" fill="#F2D56A" stroke="#1C1612" stroke-width="1"/>
    <rect x="88" y="46" width="16" height="8" fill="#1C1612"/>`),
};

function meldrum() {
  const stars = [
    star(168, 78, 5, "#F2D56A"),
    star(186, 86, 4, "#F2D56A"),
    star(154, 90, 3.5, "#F7F1E6"),
    star(176, 98, 3, "#F2D56A"),
  ].join("");
  return `<svg viewBox="0 0 242 140" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="242" height="140" fill="#E7D3B0"/>
    <circle cx="74" cy="96" r="34" fill="#1A1612"/>
    <circle cx="74" cy="96" r="26" fill="none" stroke="#3A342C" stroke-width="1.2"/>
    <circle cx="74" cy="96" r="16" fill="none" stroke="#4A4038" stroke-width="1"/>
    <circle cx="74" cy="96" r="11" fill="#9C2B24"/>
    <circle cx="74" cy="96" r="2.4" fill="#F5F0E6"/>
    <rect x="132" y="62" width="86" height="58" rx="4" fill="#2A241C"/>
    <rect x="140" y="70" width="70" height="40" fill="#141820"/>
    ${stars}
    <text x="175" y="104" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" font-weight="700" fill="#F5F0E6" letter-spacing="0.6">COUNTDOWN</text>
    <rect x="146" y="120" width="5" height="10" fill="#2A241C"/>
    <rect x="198" y="120" width="5" height="10" fill="#2A241C"/>
    <ellipse cx="118" cy="58" rx="86" ry="14" fill="#6B3A22"/>
    <ellipse cx="118" cy="54" rx="74" ry="9" fill="#8A4E2C"/>
    <path d="M86 54 C90 18, 146 16, 152 54 Z" fill="#7A4324"/>
    <path d="M118 22 C110 30, 112 40, 118 44 C124 40, 126 30, 118 22 Z" fill="#5C3018"/>
    <rect x="96" y="46" width="44" height="6" rx="1" fill="#3A2418"/>
  </svg>`;
}

const LAND = [
  [[-168, 66], [-162, 64], [-153, 59], [-140, 60], [-130, 55], [-125, 49], [-124, 40], [-120, 34], [-115, 32], [-109, 24], [-105, 22], [-97, 16], [-90, 15], [-87, 21], [-81, 25], [-80, 31], [-76, 35], [-70, 41], [-64, 44], [-56, 52], [-62, 58], [-70, 60], [-80, 63], [-90, 66], [-110, 68], [-140, 70], [-158, 71], [-166, 68], [-168, 66]],
  [[-73, 78], [-62, 82], [-48, 83], [-22, 80], [-20, 72], [-44, 60], [-55, 65], [-68, 76], [-73, 78]],
  [[-81, 8], [-77, 6], [-70, 12], [-61, 10], [-50, 5], [-48, 0], [-38, -5], [-35, -10], [-40, -16], [-43, -23], [-48, -28], [-54, -33], [-62, -38], [-66, -42], [-68, -48], [-71, -55], [-74, -52], [-73, -46], [-71, -36], [-70, -18], [-74, -12], [-76, -6], [-78, 0], [-81, 8]],
  [[-9, 37], [-9, 42], [-8, 44], [-2, 43], [0, 44], [-5, 48], [-4, 50], [0, 50], [2, 51], [4, 53], [8, 54], [12, 55], [14, 54], [16, 54], [14, 50], [12, 46], [8, 44], [6, 44], [3, 42], [-2, 36], [-6, 36], [-9, 37]],
  [[8, 44], [12, 42], [16, 41], [18, 40], [16, 38], [12, 42], [10, 44], [8, 44]],
  [[5, 58], [5, 62], [8, 63], [12, 65], [16, 68], [20, 70], [26, 71], [28, 70], [24, 65], [18, 60], [12, 58], [7, 58], [5, 58]],
  [[-10, 51], [-8, 55], [-6, 58], [-3, 58], [0, 56], [2, 53], [1, 50], [-5, 50], [-6, 54], [-10, 51]],
  [[-10, 52], [-10, 54], [-8, 55], [-6, 53], [-8, 51], [-10, 52]],
  [[-17, 15], [-16, 21], [-13, 28], [-9, 32], [-6, 35], [0, 36], [10, 37], [11, 33], [20, 32], [25, 32], [32, 31], [35, 30], [43, 12], [51, 12], [44, 2], [42, -2], [39, -12], [35, -20], [32, -26], [28, -33], [25, -34], [20, -35], [18, -32], [14, -22], [12, -17], [13, -8], [12, -5], [9, 4], [4, 6], [-5, 5], [-8, 4], [-14, 8], [-17, 12], [-17, 15]],
  [[43, -12], [50, -16], [48, -25], [44, -25], [43, -16], [43, -12]],
  [[26, 41], [28, 36], [32, 31], [35, 31], [36, 36], [40, 41], [44, 41], [48, 37], [44, 36], [48, 30], [54, 26], [58, 25], [62, 25], [66, 25], [70, 25], [72, 22], [73, 16], [72, 10], [75, 8], [77, 8], [80, 6], [82, 9], [80, 16], [85, 20], [88, 22], [92, 22], [96, 16], [99, 10], [102, 6], [104, 1], [103, 1], [101, 6], [104, 12], [106, 14], [109, 14], [109, 21], [106, 22], [102, 22], [108, 24], [114, 22], [118, 24], [122, 30], [122, 32], [126, 34], [129, 35], [129, 38], [127, 41], [130, 43], [135, 45], [140, 48], [145, 52], [150, 60], [156, 62], [162, 66], [170, 67], [178, 68], [178, 64], [168, 62], [160, 58], [150, 55], [142, 48], [138, 42], [134, 38], [130, 34], [126, 32], [122, 28], [118, 26], [112, 22], [108, 20], [105, 16], [100, 18], [96, 22], [90, 26], [84, 28], [78, 30], [72, 32], [66, 36], [60, 40], [52, 44], [44, 46], [36, 46], [30, 44], [26, 41]],
  [[131, 31], [134, 33], [138, 35], [140, 36], [142, 39], [145, 43], [141, 45], [139, 41], [137, 36], [134, 34], [131, 32], [131, 31]],
  [[120, 18], [122, 18], [125, 14], [126, 8], [124, 6], [121, 7], [119, 10], [120, 14], [120, 18]],
  [[95, -6], [102, -2], [108, 0], [114, 2], [118, 4], [116, -2], [109, -4], [102, -4], [96, -8], [95, -6]],
  [[141, -2], [146, -5], [151, -8], [148, -10], [141, -8], [141, -2]],
  [[113, -22], [122, -17], [129, -14], [136, -12], [142, -11], [146, -14], [150, -20], [153, -25], [153, -32], [150, -37], [146, -39], [140, -38], [135, -34], [128, -32], [124, -34], [115, -34], [114, -28], [113, -25], [113, -22]],
  [[146, -41], [148, -41], [148, -43], [146, -43]],
  [[166, -41], [168, -39], [172, -37], [175, -37], [178, -39], [175, -41], [171, -43], [168, -46], [166, -46], [166, -41]],
];

function worldMap(stories) {
  const w = 314;
  const h = 195;
  const worldH = w / 2;
  const yOff = (h - worldH) / 2;
  const project = (lon, lat) => [
    ((lon + 180) / 360) * w,
    yOff + ((90 - lat) / 180) * worldH,
  ];
  const land = LAND.map((ring) => {
    const d = ring.map(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join("");
    return `<path d="${d} Z" fill="#E4D3B4" stroke="#7A6854" stroke-width="0.6" stroke-linejoin="round"/>`;
  }).join("");

  const callouts = [
    ["New York", -78, 47],
    ["Iowa", -108, 46],
    ["London", -16, 57],
    ["Helsinki", 32, 68],
    ["Delhi", 62, 20],
    ["Seoul", 108, 44],
    ["Tokyo", 152, 30],
    ["Manila", 104, 8],
    ["Canberra", 126, -28],
    ["NZ", 158, -50],
    ["Africa", 8, 10],
    ["Argentina", -70, -18],
  ];
  const placed = [];
  const labels = [];
  for (const [name, lon, lat] of callouts) {
    const [px, py] = project(lon, lat);
    const tw = name.length * 4.6 + 4;
    let x = px;
    let y = py;
    if (x - tw / 2 < 3) x = 3 + tw / 2;
    if (x + tw / 2 > w - 3) x = w - 3 - tw / 2;
    if (y < 9) y = 9;
    if (y > h - 3) y = h - 3;
    const hit = placed.some((p) => Math.abs(p.x - x) < (tw + p.tw) / 2 && Math.abs(p.y - y) < 11);
    if (hit) continue;
    placed.push({ x, y, tw });
    labels.push(`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" fill="#1C1612" stroke="#F4EFE6" stroke-width="2" paint-order="stroke" stroke-linejoin="round">${esc(name)}</text>`);
  }

  const badges = [];
  const pins = stories.map((story) => {
    const [x, y] = project(story.lon, story.lat);
    const color = COLORS[story.region];
    if (story.kind !== "lead") {
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${color}" stroke="#F5F0E6" stroke-width="0.6"/>`;
    }
    let bx = x;
    let by = y;
    const shifts = [[0, 0], [11, -9], [-12, -8], [10, 10], [-11, 9]];
    for (const [dx, dy] of shifts) {
      const nx = x + dx;
      const ny = y + dy;
      const clear = badges.every((b) => Math.hypot(b.x - nx, b.y - ny) >= 13);
      const inside = nx > 8 && nx < w - 8 && ny > 8 && ny < h - 8;
      if (clear && inside) {
        bx = nx;
        by = ny;
        break;
      }
    }
    badges.push({ x: bx, y: by });
    const n = story.id.slice(1);
    const dot = (bx !== x || by !== y)
      ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="${color}"/>`
      : "";
    return `${dot}<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="6" fill="${color}" stroke="#F5F0E6" stroke-width="1"/><text x="${bx.toFixed(1)}" y="${(by + 2.4).toFixed(1)}" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="700" fill="#F5F0E6">${n}</text>`;
  }).join("");

  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="World map with story pins">
    <rect width="${w}" height="${h}" fill="#C5D7E6"/>
    ${land}
    ${pins}
    ${labels.join("")}
  </svg>`;
}

function leadCard(story) {
  const art = story.photo
    ? `<img src="../${esc(story.photo)}" alt="${esc(story.credit)}" style="object-position:${esc(story.photoPosition || "center")}"/>`
    : meldrum();
  const chip = story.chip
    ? `<div class="chip"><svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path d="M1 1.5 H7 L4 6.5 Z" fill="#F5F0E6"/></svg><span>${esc(story.chip)}</span></div>`
    : "";
  const fileChip = story.photo ? `<div class="filechip">FILE PHOTO</div>` : "";
  const credit = story.credit ? `<p class="credit">${esc(story.credit)}</p>` : `<p class="credit"></p>`;
  return `<article class="lead">
    <div class="art">${art}${fileChip}${chip}</div>
    ${credit}
    <p class="kicker" style="color:${COLORS[story.region]}">${esc(story.kicker)}</p>
    <h2>${br(story.headline)}</h2>
    <p class="deck">${esc(story.deck)}</p>
    <p class="meta"><span class="src">${esc(story.source)}</span><span class="tag" style="color:${tagColor(story.certainty)}">${esc(story.certainty)}</span></p>
  </article>`;
}

function tagColor(certainty) {
  return {
    OFFICIAL: "#1E6B45",
    CONFIRMED: "#1E6B45",
    REPORTED: "#1F4E8C",
    CLAIM: "#9C2B24",
    SCHEDULED: "#8A5600",
    FORECAST: "#0E6A6A",
    "IN PLAY": "#8A5600",
    ANALYSIS: "#5C564C",
  }[certainty] || "#1C1612";
}

function midCard(story) {
  return `<article class="mid">
    <div class="art">${MID_ART[story.id]}</div>
    <h3>${esc(story.headline)}</h3>
    <p class="deck"><span class="txt">${esc(story.deck)}</span><span class="tag" style="color:${tagColor(story.certainty)}">${esc(story.certainty)}</span></p>
  </article>`;
}

function briefColumns(stories) {
  const briefs = stories.filter((story) => story.kind === "brief");
  return COLUMNS.map((regions) => {
    const blocks = regions.map((region) => {
      const items = briefs.filter((story) => story.region === region);
      const lines = items.map((story) => {
        const tag = SHORT[story.certainty] || story.certainty;
        return `<p>${esc(story.brief)} <span class="tag" style="color:${tagColor(story.certainty)}">${esc(tag)}</span></p>`;
      }).join("");
      return `<h3 style="color:${COLORS[region]}">${NAMES[region]}</h3>${lines}`;
    }).join("");
    return `<div class="bcol">${blocks}</div>`;
  }).join("");
}

function page(stories) {
  const counts = regionCounts(stories);
  const leads = stories.filter((story) => story.kind === "lead").map(leadCard).join("");
  const mids = stories.filter((story) => story.kind === "mid").map(midCard).join("");
  const zones = news.zones.map((zone) => `<div><b>${esc(zone.place)}</b><i>${esc(zone.label)}</i></div>`).join("");
  const bar = counts.map((item) => `<span style="background:${COLORS[item.code]}">${esc(item.code)} ${item.count}</span>`).join("");
  const dateBody = news.dateCheck.replace("DATE CHECK — not shown as Monday news: ", "");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${esc(news.title)}</title>
<style>
  html, body { margin: 0; padding: 0; width: 1024px; height: 1024px; background: #F5F0E6; overflow: hidden; }
  * { box-sizing: border-box; }
  .plate {
    width: 1024px; height: 1024px; padding: 16px; background: #F5F0E6;
    display: grid;
    grid-template-rows: 14px 74px 16px 2px 57px 2px 30px 2px 274px 3px 240px 2px 211px 2px 51px 12px;
    font-family: Inter, "Source Sans 3", "Source Sans Pro", Roboto, sans-serif;
    color: #1C1612;
  }
  .plate > * { min-width: 0; min-height: 0; }
  .kicker-row { display: grid; grid-template-columns: 1fr 1fr; align-items: center; font-size: 11px; line-height: 1.2; letter-spacing: 0.04em; }
  .kicker-row .left { text-align: left; font-weight: 650; }
  .kicker-row .right { text-align: right; font-weight: 500; }
  h1.date { margin: 0; font-family: "Playfair Display", "Source Serif Pro", serif; font-weight: 600; font-size: 64px; line-height: 1.15; letter-spacing: -0.015em; }
  .stand { margin: 0; font-family: "Source Serif Pro", serif; font-size: 12px; line-height: 1.3; color: #3A342C; }
  .rule { background: linear-gradient(#1C1612, #1C1612) 0 50% / 100% 1px no-repeat; }
  .zones { height: 57px; padding: 8px 0; background: #EFE6D4; }
  .zones-title { height: 12px; text-align: center; font-size: 10px; line-height: 12px; letter-spacing: 0.08em; font-weight: 650; }
  .zones-row { margin-top: 2px; display: grid; grid-template-columns: repeat(6, 1fr); }
  .zones-row div { text-align: center; }
  .zones-row b, .zones-row i { display: block; font-style: normal; }
  .zones-row b { height: 12px; font-size: 10px; line-height: 12px; font-weight: 600; }
  .zones-row i { margin-top: 2px; height: 13px; font-size: 10px; line-height: 13px; font-weight: 400; color: #3A342C; }
  .regions { display: grid; grid-template-columns: repeat(7, 1fr); height: 30px; }
  .regions span { display: block; height: 30px; padding: 8px 6px; text-align: left; color: #F5F0E6; font-size: 11px; line-height: 1.2; font-weight: 650; white-space: nowrap; }
  .leads { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; height: 274px; }
  .lead, .mid { min-width: 0; }
  .lead { height: 274px; padding: 8px; background: #FBF7EF; box-shadow: inset 0 0 0 1px #E0D5C4; display: flex; flex-direction: column; overflow: hidden; }
  .lead .art, .mid .art { position: relative; background: #E7D3B0; overflow: hidden; min-width: 0; }
  .lead .art { height: 132px; flex: 0 0 132px; margin: 0 -8px; width: calc(100% + 16px); }
  .lead .art img, .lead .art svg, .mid .art svg { width: 100%; height: 100%; min-width: 0; display: block; object-fit: cover; }
  .filechip { position: absolute; top: 6px; left: 6px; background: #F5F0E6; color: #1C1612; font-size: 8px; line-height: 1.3; letter-spacing: 0.04em; font-weight: 700; padding: 1px 4px; }
  .chip { position: absolute; left: 6px; bottom: 6px; display: flex; align-items: center; gap: 4px; background: #9C2B24; color: #F5F0E6; font-size: 9px; line-height: 1.2; font-weight: 650; padding: 3px 6px 3px 4px; }
  .lead .credit { margin: 8px 0 0; height: 11px; font-size: 8px; line-height: 11px; color: #5E584E; white-space: nowrap; }
  .lead .kicker { margin: 8px 0 0; height: 12px; font-size: 10px; line-height: 12px; letter-spacing: 0.06em; font-weight: 700; text-transform: uppercase; text-align: left; }
  .lead h2 { margin: 0; height: 40px; font-family: "Playfair Display", "Source Serif Pro", serif; font-weight: 600; font-size: 17px; line-height: 20px; text-align: left; }
  .lead .deck { margin: 4px 0 0; height: 30px; font-family: "Source Serif Pro", serif; font-size: 11px; line-height: 15px; text-align: left; }
  .lead .meta { margin: 0; height: 13px; display: flex; justify-content: flex-start; align-items: baseline; gap: 6px; font-size: 10px; line-height: 13px; text-align: left; }
  .lead .src { color: #5E584E; }
  .mids { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); grid-auto-rows: 116px; gap: 8px; height: 240px; }
  .mid { height: 116px; padding: 8px; background: #FBF7EF; box-shadow: inset 0 0 0 1px #E0D5C4; overflow: hidden; display: flex; flex-direction: column; }
  .mid .art { height: 60px; flex: 0 0 60px; margin: 0 -8px; width: calc(100% + 16px); }
  .mid h3 { margin: 8px 0 0; font-family: "Playfair Display", "Source Serif Pro", serif; font-weight: 600; font-size: 13px; line-height: 1.2; text-align: left; white-space: nowrap; overflow: hidden; }
  .mid .deck { margin: 3px 0 0; display: flex; align-items: baseline; gap: 6px; min-width: 0; font-family: "Source Serif Pro", serif; font-size: 10px; line-height: 1.3; text-align: left; color: #2A241E; }
  .mid .deck .txt { min-width: 0; overflow: hidden; white-space: nowrap; }
  .mid .deck .tag { flex: none; white-space: nowrap; }
  .tag { font-weight: 700; letter-spacing: 0.02em; }
  .bottom { display: grid; grid-template-columns: 330px 8px 1fr; height: 211px; }
  .map { height: 211px; padding: 8px; background: #C5D7E6; box-shadow: inset 0 0 0 1px #E0D5C4; overflow: hidden; }
  .briefs { height: 211px; padding: 8px; background: #FBF7EF; box-shadow: inset 0 0 0 1px #E0D5C4; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; overflow: hidden; }
  .bcol { display: flex; flex-direction: column; gap: 2px; text-align: left; }
  .bcol h3 { margin: 0; font-size: 10px; line-height: 1.2; font-weight: 700; letter-spacing: 0.04em; text-align: left; }
  .bcol p { margin: 0; font-size: 10px; line-height: 1.3; text-align: left; }
  .datecheck { margin: 0; padding: 6px 8px; background: #9C2B24; color: #F5F0E6; font-size: 10px; line-height: 1.3; overflow: hidden; }
  .datecheck strong { font-weight: 700; }
  footer { margin: 0; height: 12px; font-size: 8px; line-height: 1.3; color: #5E584E; }
</style>
</head>
<body>
  <div class="plate">
    <div class="kicker-row"><div class="left">${esc(news.kickerLeft)}</div><div class="right">${esc(news.kickerRight)}</div></div>
    <h1 class="date">${esc(news.title)}</h1>
    <p class="stand">${esc(news.standfirst)}</p>
    <div class="rule"></div>
    <section class="zones">
      <div class="zones-title">MONDAY ACROSS THE ZONES</div>
      <div class="zones-row">${zones}</div>
    </section>
    <div></div>
    <div class="regions">${bar}</div>
    <div></div>
    <section class="leads">${leads}</section>
    <div></div>
    <section class="mids">${mids}</section>
    <div></div>
    <section class="bottom">
      <div class="map">${worldMap(stories)}</div>
      <div></div>
      <div class="briefs">${briefColumns(stories)}</div>
    </section>
    <div></div>
    <p class="datecheck"><strong>DATE CHECK — not shown as Monday news:</strong> ${esc(dateBody)}</p>
    <footer>${esc(news.footer)}</footer>
  </div>
</body>
</html>`;
}

function rgbPng(shot, entry, preview) {
  const py = join(here, "_to_rgb.py");
  writeFileSync(py, `import os, sys
from PIL import Image
src, entry, preview = sys.argv[1:4]
im = Image.open(src).convert("RGB")
paper = (245, 240, 230)
if im.size != (1024, 1024):
    canvas = Image.new("RGB", (1024, 1024), paper)
    crop = im.crop((0, 0, min(1024, im.width), min(1024, im.height)))
    canvas.paste(crop, (0, 0))
    im = canvas
out = Image.new("RGB", im.size)
out.paste(im)
out.save(entry, "PNG", optimize=True)
out.resize((300, 300), Image.Resampling.LANCZOS).save(preview, "PNG", optimize=True)
size = os.path.getsize(entry)
print(f"{entry} {out.size[0]}x{out.size[1]} {size}")
if size > 1048576:
    q = out.quantize(colors=192, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    q.save(entry, "PNG", optimize=True)
    q.resize((300, 300), Image.Resampling.LANCZOS).save(preview, "PNG", optimize=True)
    print("quantized", os.path.getsize(entry))
`);
  execFileSync("python3", [py, shot, entry, preview], { stdio: "inherit" });
  unlinkSync(py);
}

const html = page(news.stories);
const poster = join(here, "poster.html");
writeFileSync(poster, html);
const shot = join(here, "shot.png");
execFileSync("google-chrome", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  "--allow-file-access-from-files",
  "--window-size=1024,1024",
  `--screenshot=${shot}`,
  `file://${poster}`,
], { stdio: "inherit" });
rgbPng(shot, join(root, "entry.png"), join(here, "preview-300.png"));
if (existsSync(shot)) unlinkSync(shot);
const previewMap = join(here, "map-preview.png");
if (existsSync(previewMap)) unlinkSync(previewMap);
console.log("plate written");
