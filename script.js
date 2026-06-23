const canvas = document.querySelector("#artCanvas");
const ctx = canvas.getContext("2d");

function paintSampleArtwork() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = "#eee4d3";
  ctx.fillRect(0, 0, w, h);

  const palette = ["#20201c", "#b96045", "#6d7f72", "#d3b05d", "#f4efe4"];
  const shapes = [
    [42, 56, 220, 260, 0],
    [235, 84, 205, 180, 1],
    [112, 314, 300, 120, 2],
    [58, 456, 188, 92, 3],
    [280, 405, 172, 174, 0],
  ];

  shapes.forEach(([x, y, sw, sh, color], index) => {
    ctx.save();
    ctx.translate(x + sw / 2, y + sh / 2);
    ctx.rotate((index - 2) * 0.045);
    ctx.fillStyle = palette[color];
    ctx.globalAlpha = index === 4 ? 0.92 : 0.86;
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
    ctx.restore();
  });

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#2a2722";
  ctx.lineWidth = 5;
  for (let i = 0; i < 9; i += 1) {
    ctx.beginPath();
    ctx.moveTo(42 + i * 52, 84);
    ctx.bezierCurveTo(88 + i * 28, 220, 24 + i * 58, 336, 104 + i * 43, 578);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const grainCanvas = document.createElement("canvas");
  grainCanvas.width = w;
  grainCanvas.height = h;
  const grainCtx = grainCanvas.getContext("2d");
  const grain = grainCtx.createImageData(w, h);
  for (let i = 0; i < grain.data.length; i += 4) {
    const value = 225 + Math.random() * 28;
    grain.data[i] = value;
    grain.data[i + 1] = value * 0.96;
    grain.data[i + 2] = value * 0.88;
    grain.data[i + 3] = 22;
  }
  grainCtx.putImageData(grain, 0, 0);
  ctx.drawImage(grainCanvas, 0, 0);
}

paintSampleArtwork();

const form = document.querySelector("#intakeForm");
const resetButton = document.querySelector("#resetReport");

const defaults = {
  verdict: "观望，除非价格低于 ¥15,000",
  risk: "中高",
  summaryTitle: "履历有基础，报价需要再压。",
  summaryBody:
    "这位青年艺术家的作品语言正在形成，但当前报价高于你的预算上限。若卖方不能补充同系列成交记录和展览证明，建议先观望。",
  scorePrice: 58,
  scoreTrust: 72,
  scoreWork: 64,
  scoreLong: 76,
};

function setReport(data) {
  document.querySelector("#verdictText").textContent = data.verdict;
  document.querySelector("#riskText").textContent = data.risk;
  document.querySelector("#summaryTitle").textContent = data.summaryTitle;
  document.querySelector("#summaryBody").textContent = data.summaryBody;
  document.querySelector("#scorePrice").textContent = data.scorePrice;
  document.querySelector("#scoreTrust").textContent = data.scoreTrust;
  document.querySelector("#scoreWork").textContent = data.scoreWork;
  document.querySelector("#scoreLong").textContent = data.scoreLong;
}

function showError(id, message) {
  document.querySelector(id).textContent = message;
}

function clearErrors() {
  ["#artistError", "#workError", "#priceError", "#budgetError"].forEach((id) => showError(id, ""));
}

function readNumber(id) {
  return Number.parseInt(document.querySelector(id).value.replace(/[^\d]/g, ""), 10);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  const artistName = document.querySelector("#artistName").value.trim();
  const workName = document.querySelector("#workName").value.trim();
  const price = readNumber("#price");
  const budget = readNumber("#budget");
  const source = document.querySelector("#source").value;

  let valid = true;
  if (!artistName) {
    showError("#artistError", "请填写艺术家姓名。");
    valid = false;
  }
  if (!workName) {
    showError("#workError", "请填写作品名称。");
    valid = false;
  }
  if (!Number.isFinite(price) || price <= 0) {
    showError("#priceError", "请输入有效报价。");
    valid = false;
  }
  if (!Number.isFinite(budget) || budget <= 0) {
    showError("#budgetError", "请输入有效预算。");
    valid = false;
  }
  if (!valid) return;

  const overBudget = price - budget;
  const priceScore = Math.max(42, Math.min(84, Math.round(82 - (overBudget / Math.max(budget, 1)) * 40)));
  const trustScore = source === "画廊推荐" ? 74 : source === "艺术家本人" ? 68 : 61;
  const workScore = price > budget ? 63 : 70;
  const longScore = trustScore > 70 ? 77 : 69;
  const recommendation =
    price <= budget
      ? `可以进入谈价，目标成交价控制在 ¥${Math.round(price * 0.92).toLocaleString("zh-CN")} 左右`
      : `观望，除非价格低于 ¥${budget.toLocaleString("zh-CN")}`;
  const risk = price > budget * 1.25 ? "中高" : price > budget ? "中" : "中低";

	setReport({
	    verdict: recommendation,
	    risk,
	    summaryTitle: `${artistName}可以关注，但这件作品要按价格谈。`,
	    summaryBody: `《${workName}》的报价为 ¥${price.toLocaleString("zh-CN")}，你的预算上限是 ¥${budget.toLocaleString("zh-CN")}。当前判断建议先确认成交记录、作品证书和同系列延续性，再决定是否出价。`,
	    scorePrice: priceScore,
	    scoreTrust: trustScore,
	    scoreWork: workScore,
	    scoreLong: longScore,
	  });

  document.querySelector("#report").scrollIntoView({ behavior: "smooth", block: "start" });
});

resetButton.addEventListener("click", () => {
  setReport(defaults);
});
