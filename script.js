// ── DARK MODE ──────────────────────────────────────
function toggleDark(el) {
  document.documentElement.setAttribute(
    "data-theme",
    el.checked ? "dark" : "light",
  );
  document.getElementById("toggleIcon").textContent = el.checked ? "🌙" : "☀️";
  updateChartTheme();
}

let highlightedTime = null;

function formatClockTime(date = new Date()) {
  return date.toTimeString().slice(0, 8);
}

function updateLastUpdated(date = new Date()) {
  const el = document.getElementById("lastUpdated");
  if (el) el.textContent = `Updated ${formatClockTime(date)}`;
}

function getNoDrLevel(value) {
  if (value > 50) return "high";
  if (value >= 20) return "medium";
  return "ok";
}

function getSeverityLabel(level) {
  if (level === "high") return "High";
  if (level === "medium") return "Medium";
  return "Low";
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatPercent(value) {
  return Number(value).toFixed(2).replace(/\.00$/, "");
}

function formatEntityName(name) {
  return String(name).replace(
    /^([A-Za-z0-9_]+(?:-[A-Z])?)-(.+)$/,
    "$1 - $2",
  );
}

// ── CLOCK ──────────────────────────────────────────
function updateClock() {
  document.getElementById("clock").textContent = formatClockTime();
}
setInterval(updateClock, 1000);
updateClock();
updateLastUpdated();

// ── TRAFFIC CHART (Waktu Nyata) ────────────────────
const labels = [];
const smsData = [],
  delivData = [],
  nodrData = [];

const currentTime = new Date();
for (let i = 35; i >= 0; i--) {
  const t = new Date(currentTime.getTime() - i * 60000);
  labels.push(
    `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`,
  );
  smsData.push(Math.floor(Math.random() * 35) + 5);
  delivData.push(Math.floor(Math.random() * 20) + 70);
  nodrData.push(Math.floor(Math.random() * 18) + 1);
}

let trafficChart;
function buildChart() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tickColor = isDark ? "#6e7681" : "#718096";
  const timeTickColor = isDark ? "#cbd5e1" : "#334155";

  const ctx = document.getElementById("trafficChart").getContext("2d");
  if (trafficChart) trafficChart.destroy();
  trafficChart = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "SMS Count",
          data: smsData,
          backgroundColor: "rgba(59,130,246,0.5)",
          borderColor: "rgba(59,130,246,0.8)",
          borderWidth: 1,
          yAxisID: "y",
          borderRadius: 3,
          order: 2,
        },
        {
          type: "line",
          label: "% Delivered",
          data: delivData,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.08)",
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          yAxisID: "y1",
          pointRadius: 0,
          order: 1,
        },
        {
          type: "line",
          label: "% No DR",
          data: nodrData,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.08)",
          borderWidth: 1.5,
          tension: 0.4,
          fill: false,
          borderDash: [4, 2],
          yAxisID: "y1",
          pointRadius: 0,
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: {
            color: tickColor,
            font: { family: "JetBrains Mono", size: 9 },
            boxWidth: 12,
            padding: 12,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: timeTickColor,
            font: { family: "JetBrains Mono", size: 13, weight: "900" },
            maxRotation: 0,
          },
          grid: { color: gridColor },
        },
        y: {
          position: "left",
          ticks: {
            color: tickColor,
            font: { family: "JetBrains Mono", size: 8 },
          },
          grid: { color: gridColor },
        },
        y1: {
          position: "right",
          min: 0,
          max: 100,
          ticks: {
            color: tickColor,
            font: { family: "JetBrains Mono", size: 8 },
          },
          grid: { drawOnChartArea: false },
        },
      },
    },
  });
}
function updateChartTheme() {
  buildChart();
}
buildChart();

// ── LATEST TABLE DATA AWAL ────────────────────────

const rows = [];

const fakeSenders = [
  "Bukalapak",
  "Cashcepat",
  "RupiahCepat",
  "UangMe",
  "SINGA.ID",
  "BRI-NOTIF",
  "Kredivo",
  "Akulaku",
  "Dana",
  "ShopeePay",
  "Jago",
  "Livin",
];

const fakeSuppliers = [
  "TOG_DOM_DIR",
  "HTTP_YULORE",
  "HEYLOO_SIM_MKT",
  "OMNI_WAGEN",
  "INFOBIP_DOM",
];

const fakeAccounts = [
  "GOT_OTP",
  "YULORE_HTTP",
  "SF_A2P_2",
  "OMNI_WAGEN",
  "INFOBIP",
];

for (let minute = 0; minute < 30; minute++) {
  const now = new Date();

  now.setMinutes(now.getMinutes() - minute);

  const timeStr =
    `${String(now.getHours()).padStart(2, "0")}:` +
    `${String(now.getMinutes()).padStart(2, "0")}`;

  const totalTransactions = Math.floor(Math.random() * 5) + 2;

  for (let i = 0; i < totalTransactions; i++) {
    rows.push({
      t: timeStr,

      sender: fakeSenders[Math.floor(Math.random() * fakeSenders.length)],

      sup: fakeSuppliers[Math.floor(Math.random() * fakeSuppliers.length)],

      acc: fakeAccounts[Math.floor(Math.random() * fakeAccounts.length)],

      rec: Math.floor(Math.random() * 10) + 1,

      nodr: Math.floor(Math.random() * 100),
    });
  }
}

highlightedTime = null;

let currentPage = 1;

let rowsPerPage = 10;

function buildAccountLogUrl(account, detail) {
  const params = new URLSearchParams({
    account,
    supplier: detail.sup,
    sender: detail.sender,
    time: detail.t,
  });

  return `#log?${params.toString()}`;
}

function toggleDetail(index) {
  const oldModal = document.getElementById("detailModal");

  if (oldModal) oldModal.remove();

  const grouped = {};

  rows.forEach((r) => {
    if (!grouped[r.t]) {
      grouped[r.t] = [];
    }

    grouped[r.t].push(r);
  });

  const times = Object.keys(grouped).sort().reverse();

  const detailRows = grouped[times[index]];

  const modal = document.createElement("div");

  modal.id = "detailModal";

  modal.className = "detail-modal";

  modal.innerHTML = `

    <div class="detail-modal-content">

      <div class="detail-modal-header">

        <div>

          <div class="modal-title">
            Transaction Detail
          </div>

          <div class="modal-subtitle">
            ${times[index]}
          </div>

        </div>

        <button
          class="close-modal"
          onclick="closeDetailModal()">

          ✕

        </button>

      </div>

      <table class="detail-popup-table">

        <thead>

          <tr>

            <th>Account</th>

            <th>Supplier</th>

            <th>Sender</th>

            <th>Records</th>

            <th>No DR</th>

          </tr>

        </thead>

        <tbody>

          ${detailRows
            .map(
              (d) => `

            <tr>

              <td>
                <a class="account-log-link" href="${buildAccountLogUrl(d.acc, d)}">
                  ${d.acc}
                </a>
              </td>

              <td>${d.sup}</td>

              <td>${d.sender}</td>

              <td>${d.rec}</td>

              <td class="td-nodr ${d.nodr > 15 ? "high" : "ok"}">

                ${d.nodr}%

              </td>

            </tr>

          `,
            )
            .join("")}

        </tbody>

      </table>

    </div>
  `;

  document.body.appendChild(modal);
}

function closeDetailModal() {
  const modal = document.getElementById("detailModal");

  if (modal) modal.remove();
}

function renderLatestSummary() {
  const tbody = document.getElementById("latestSummary");

  if (!tbody) return;

  tbody.innerHTML = "";

  const grouped = {};

  rows.forEach((r) => {
    if (!grouped[r.t]) {
      grouped[r.t] = [];
    }

    grouped[r.t].push(r);
  });

  const times = Object.keys(grouped).sort().reverse();

  const totalPages = Math.max(1, Math.ceil(times.length / rowsPerPage));

  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * rowsPerPage;

  const end = start + rowsPerPage;

  const paginatedTimes = times.slice(start, end);

  paginatedTimes.forEach((time, index) => {
    const detailRows = grouped[time];

    let totalRecords = 0;

    let totalNoDr = 0;

    detailRows.forEach((d) => {
      totalRecords += d.rec;

      totalNoDr += d.nodr;
    });

    const avgNoDr = Math.round(totalNoDr / detailRows.length);

    const delivered = 100 - avgNoDr;

    const tr = document.createElement("tr");
    if (time === highlightedTime && currentPage === 1) {
      tr.className = "row-new";
    }

    tr.innerHTML = `

      <td>${start + index + 1}</td>

      <td class="td-time">
        ${time}
      </td>

      <td>${totalRecords}</td>

      <td>${detailRows.length}</td>

      <td class="td-nodr ${getNoDrLevel(avgNoDr)}">

        ${avgNoDr}%

      </td>

      <td>

        <div class="delivered-wrap">

          <span class="td-nodr ok">

            ${delivered}%

          </span>

          <button
            class="btn-detail"
            onclick="toggleDetail(${start + index})">

            Detail

          </button>

        </div>

      </td>
    `;

    tbody.appendChild(tr);
  });

  renderPagination(totalPages);

  document
    .querySelector(".table-wrap")
    ?.classList.toggle("is-scrollable", rowsPerPage > 10);
}

function renderPagination(totalPages) {
  let pagination = document.getElementById("pagination");

  if (!pagination) {
    pagination = document.createElement("div");

    pagination.id = "pagination";

    pagination.className = "pagination-wrap";

    document.querySelector(".latest-toolbar").appendChild(pagination);
  }

  pagination.innerHTML = `

    <button
      class="page-btn"
      ${currentPage === 1 ? "disabled" : ""}
      onclick="changePage(-1)">

      Prev

    </button>

    <span class="page-info">

      Page ${currentPage} / ${totalPages}

    </span>

    <button
      class="page-btn"
      ${currentPage === totalPages ? "disabled" : ""}
      onclick="changePage(1)">

      Next

    </button>
  `;
}

function changePage(direction) {
  const grouped = {};

  rows.forEach((r) => {
    if (!grouped[r.t]) grouped[r.t] = [];
    grouped[r.t].push(r);
  });

  const totalPages = Math.max(
    1,
    Math.ceil(Object.keys(grouped).length / rowsPerPage),
  );

  currentPage = Math.min(Math.max(currentPage + direction, 1), totalPages);

  renderLatestSummary();
}

function changeRowsPerPage(el) {
  rowsPerPage = Number(el.value) || 10;
  currentPage = 1;
  renderLatestSummary();
}

renderLatestSummary();

// ── OPERATOR PERFORMANCE ───────────────────────────
const operators = [
  { name: "TELKOMSEL", total: 12430, delivered: 78, sent: 13, undeliv: 9 },
  { name: "THREE", total: 7540, delivered: 71, sent: 18, undeliv: 11 },
  { name: "SMARTFREN", total: 4120, delivered: 82, sent: 10, undeliv: 8 },
  { name: "INDOSAT", total: 9210, delivered: 69, sent: 20, undeliv: 11 },
  { name: "XL", total: 6780, delivered: 74, sent: 15, undeliv: 11 },
  { name: "AXIS", total: 3200, delivered: 65, sent: 22, undeliv: 13 },
];
const opGrid = document.getElementById("operatorGrid");
function renderOperators() {
  if (!opGrid) return;
  opGrid.innerHTML = "";
  operators.forEach((op) => {
    const el = document.createElement("div");
    el.className = `operator-item ${op.isLive ? "live-tick" : ""}`;
    el.innerHTML = `
      <div class="operator-header">
        <div class="operator-name">${op.name}</div>
        <div class="operator-total">${op.total.toLocaleString()}<span> sms</span></div>
      </div>
      <div class="operator-bar-wrap">
        <div class="op-bar delivered" style="width:${op.delivered}%"></div>
        <div class="op-bar sent" style="width:${op.sent}%"></div>
        <div class="op-bar undeliv" style="width:${op.undeliv}%"></div>
      </div>
      <div class="operator-legend">
        <span><span class="legend-dot delivered"></span>Dlvr <span class="legend-val">${op.delivered}%</span></span>
        <span><span class="legend-dot sent"></span>Sent <span class="legend-val">${op.sent}%</span></span>
        <span><span class="legend-dot undeliv"></span>Undelivered <span class="legend-val">${op.undeliv}%</span></span>
      </div>
    `;
    opGrid.appendChild(el);
  });
}
renderOperators();

function updateOperatorTraffic() {
  operators.forEach((op) => {
    op.total = Math.max(500, op.total + randomInt(-320, 520));
    op.delivered = clamp(op.delivered + randomInt(-4, 5), 45, 92);
    op.sent = clamp(op.sent + randomInt(-3, 3), 4, 35);
    op.undeliv = Math.max(0, 100 - op.delivered - op.sent);
    op.isLive = true;
  });
  renderOperators();
  window.setTimeout(() => {
    operators.forEach((op) => {
      op.isLive = false;
    });
    renderOperators();
  }, 900);
}

// ── SENDER & GATEWAY NO DR (DATA YANG KEMARIN HILANG) ──
const senderNoDrData = [
  { name: "Bukalapak", val: 12 },
  { name: "Cashcepat", val: 45 },
  { name: "RupiahCepat", val: 20 },
  { name: "UangMe", val: 100 },
  { name: "SINGA.ID", val: 5 },
  { name: "BRI-NOTIF", val: 78 },
  { name: "Indosaku", val: 85 },
  { name: "Kredivo", val: 42 },
  { name: "Akulaku", val: 18 },
  { name: "ShopeePay", val: 95 },
  { name: "GoPay_OTP", val: 8 },
  { name: "OVO_Alert", val: 55 },
  { name: "Dana_Promo", val: 32 },
  { name: "LinkAja", val: 11 },
  { name: "BCA_Mobile", val: 3 },
  { name: "Mandiri_Livin", val: 25 },
  { name: "BNI_Notif", val: 66 },
  { name: "Jago_App", val: 92 },
  { name: "Jenius", val: 14 },
  { name: "KopiKenangan", val: 48 },
];

const gatewayNoDrData = [
  { name: "TOG_DOM_DIR", val: 60 },
  { name: "HEYLOO_SIM_MKT", val: 40 },
  { name: "HTTP_YULORE", val: 100 },
  { name: "OMNI_WAGEN", val: 15 },
  { name: "INFOBIP_DOM", val: 85 },
  { name: "MACRO_KIOSK", val: 25 },
  { name: "TMA_BYPASS_LOC", val: 92 },
  { name: "RBM_MONTNETS", val: 8 },
  { name: "GPI_INT_DIR", val: 52 },
  { name: "COMMSOL_INT", val: 75 },
  { name: "MCT_WAGEN_2", val: 18 },
  { name: "TIG_DOM_SVR", val: 88 },
  { name: "NX_SMS_PRO", val: 35 },
  { name: "TWILIO_INT", val: 95 },
  { name: "MESSAGEBIRD", val: 42 },
  { name: "VONAGE_API", val: 12 },
];

function renderNoDr(data, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  data.slice(0, 8).forEach((d) => {
    const level = getNoDrLevel(d.val);
    const severity = getSeverityLabel(level);
    const div = document.createElement("div");
    div.className = `alert-item ${level}`;
    div.dataset.severity = level;
    div.innerHTML = `<div class="alert-dot ${level}"></div><div class="alert-name">${d.name}</div><span class="severity-badge ${level}">${severity}</span><div class="alert-val">${d.val}%</div>`;
    el.appendChild(div);
  });
}
renderNoDr(senderNoDrData, "senderNoDr");
renderNoDr(gatewayNoDrData, "gatewayNoDr");

function updateNoDrTraffic() {
  [senderNoDrData, gatewayNoDrData].forEach((data) => {
    data.forEach((d) => {
      d.val = clamp(d.val + randomInt(-18, 22), 0, 100);
    });
    data.sort((a, b) => b.val - a.val);
  });

  renderNoDr(senderNoDrData, "senderNoDr");
  renderNoDr(gatewayNoDrData, "gatewayNoDr");
  updateAlertSummary();
}

function enhanceStaticAlerts() {
  document.querySelectorAll(".alert-section").forEach((section) => {
    const title = section.querySelector(".alert-section-title")?.textContent || "";
    let level = "";
    if (title.includes("Sender Stop")) level = "high";
    if (title.includes("Account Stop")) level = "medium";
    if (!level) return;

    section.querySelectorAll(".alert-item").forEach((item) => {
      if (item.querySelector(".severity-badge")) return;
      item.classList.add(level);
      item.dataset.severity = level;

      const badge = document.createElement("span");
      badge.className = `severity-badge ${level}`;
      badge.textContent = getSeverityLabel(level);

      const time = item.querySelector(".alert-time, .alert-val");
      item.insertBefore(badge, time);
    });
  });
}

const senderStopPool = [
  "YULORE_HTTP-IVOJI",
  "SPOLIVE_WAGEN-wagen",
  "GOT_OTP-Akulaku",
  "Omniwara_INT-SAMSUNG",
  "SF_A2P_2-IVOJI",
  "Sahridaya_WAGEN-wagen",
  "TIG_DOM-SAMIR",
  "HTTP_YULORE-UangMe",
  "SF_A2P_2-Cashcepat",
  "TOG_DOM-Bukalapak",
];

const accountStopPool = [
  "SPOLIVE_WAGEN",
  "Omniwara_INT",
  "Sahridaya_WAGEN",
  "YULORE_HTTP",
  "SF_A2P_2",
  "GOT_OTP",
  "TIG_DOM",
  "HTTP_YULORE",
];

function randomRecentTime() {
  const date = new Date(Date.now() - randomInt(0, 1000 * 60 * 45));
  return formatClockTime(date);
}

function renderStopAlerts(title, pool, level, size = 7) {
  const section = [...document.querySelectorAll(".alert-section")].find((item) =>
    item.querySelector(".alert-section-title")?.textContent.includes(title),
  );
  const panel = section?.querySelector(".scroll-panel");
  if (!panel) return;

  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, size);
  panel.innerHTML = shuffled
    .map(
      (name) => `
        <div class="alert-item ${level}" data-severity="${level}">
          <div class="alert-dot ${level}"></div>
          <div class="alert-name">${formatEntityName(name)}</div>
          <span class="severity-badge ${level}">${getSeverityLabel(level)}</span>
          <div class="alert-time">${randomRecentTime()}</div>
        </div>
      `,
    )
    .join("");
}

function updateStopAlerts() {
  renderStopAlerts("Sender Stop", senderStopPool, "high", 7);
  renderStopAlerts("Account Stop", accountStopPool, "medium", 6);
  updateAlertSummary();
}

function updateAlertSummary() {
  const critical = document.querySelectorAll('.alert-item[data-severity="high"]').length;
  const warning = document.querySelectorAll('.alert-item[data-severity="medium"]').length;

  const criticalEl = document.getElementById("criticalCount");
  const warningEl = document.getElementById("warningCount");

  if (criticalEl) criticalEl.textContent = `${critical} High`;
  if (warningEl) warningEl.textContent = `${warning} Medium`;
}

enhanceStaticAlerts();
updateStopAlerts();
updateAlertSummary();

// ── CLIENT & SUPPLIER PERF (DATA YANG KEMARIN HILANG) ──
const clients = [
  { name: "Cms_Wagen_OTP", g: 75.08, y: 24.92, r: 0 },
  { name: "EnjoyMV_Dir_Dom", g: 82.35, y: 5.88, r: 16.78 },
  { name: "GOT_OTP", g: 80.82, y: 16.7, r: 0 },
  { name: "GPI_INT", g: 100, y: 0, r: 0 },
  { name: "Omniwara_INT", g: 100, y: 0, r: 0 },
  { name: "ptest001", g: 11.76, y: 88.24, r: 0 },
  { name: "Sahridaya_Dom", g: 95.83, y: 4.17, r: 0 },
  { name: "Sahridaya_WAGEN", g: 71.67, y: 28.33, r: 0 },
  { name: "SF_A2P_2", g: 85.99, y: 5.96, r: 7.63 },
  { name: "SME_Direct_OTP", g: 28.74, y: 52.14, r: 18.89 },
  { name: "SPOLIVE_WAGEN", g: 0, y: 22, r: 78 },
];
const suppliers = [
  { name: "Arta WA Gen", g: 75.08, y: 24.92, r: 0 },
  { name: "Commsol INT", g: 100, y: 0, r: 0 },
  { name: "GPI Dom Dir", g: 100, y: 0, r: 0 },
  { name: "GPI_SMKT_HQ_Dir", g: 99.89, y: 0, r: 0.11 },
  { name: "HTTP_YULORE", g: 71.25, y: 17.48, r: 9.92 },
  { name: "Infobip_Dom", g: 9.38, y: 90.63, r: 0 },
  { name: "OMNI_WAGEN", g: 69.12, y: 30.88, r: 0 },
  { name: "RBM Montnets", g: 29.28, y: 53.93, r: 17.39 },
  { name: "TMA_Bypass_Loc", g: 50, y: 50, r: 0 },
  { name: "TOG_Dom_Dir", g: 82.65, y: 7.83, r: 9.52 },
];

function renderPerf(data, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  data.forEach((d) => {
    const div = document.createElement("div");
    div.className = `perf-item ${d.isLive ? "live-tick" : ""}`;
    div.innerHTML = `
      <div class="perf-name">${d.name}<div class="perf-pct-trio"><span class="pct-g">${formatPercent(d.g)}%</span>·<span class="pct-y">${formatPercent(d.y)}%</span>·<span class="pct-r">${formatPercent(d.r)}%</span></div></div>
      <div class="perf-bar-wrap"><div class="perf-bar g" style="width:${d.g}%"></div><div class="perf-bar y" style="width:${d.y}%"></div><div class="perf-bar r" style="width:${d.r}%"></div></div>
    `;
    el.appendChild(div);
  });
}
renderPerf(clients, "clientPerf");
renderPerf(suppliers, "supplierPerf");

function rebalancePerformance(item) {
  const delivered = clamp(item.g + randomInt(-8, 9), 5, 100);
  const sent = clamp(item.y + randomInt(-7, 7), 0, 100 - delivered);
  const undeliv = Math.max(0, 100 - delivered - sent);

  item.g = Number(delivered.toFixed(2));
  item.y = Number(sent.toFixed(2));
  item.r = Number(undeliv.toFixed(2));
}

function updatePerformanceTraffic() {
  clients.forEach((item) => {
    rebalancePerformance(item);
    item.isLive = true;
  });
  suppliers.forEach((item) => {
    rebalancePerformance(item);
    item.isLive = true;
  });
  renderPerf(clients, "clientPerf");
  renderPerf(suppliers, "supplierPerf");
  window.setTimeout(() => {
    [...clients, ...suppliers].forEach((item) => {
      item.isLive = false;
    });
    renderPerf(clients, "clientPerf");
    renderPerf(suppliers, "supplierPerf");
  }, 900);
}

const senderStats = [...document.querySelectorAll(".sender-item")].map((item) => {
  const name = item.querySelector(".sender-name")?.textContent.trim() || "";
  const arrow = item.querySelector(".sender-arrow")?.textContent.trim() || "0 → 0";
  const values = arrow.match(/\d+/g) || ["0", "0"];

  return {
    name,
    yesterday: Number(values[0]),
    today: Number(values[1]),
  };
});

function renderSenderStats() {
  const list = document.querySelector(".sender-list");
  if (!list) return;

  list.innerHTML = `
    <div class="sender-table-head">
      <span>Client</span>
      <span>Today</span>
      <span>Yesterday</span>
      <span>Delta</span>
    </div>
    ${senderStats
      .map((sender) => {
        const delta = sender.yesterday
          ? ((sender.today - sender.yesterday) / sender.yesterday) * 100
          : 0;
        const deltaClass = delta >= 0 ? "pos" : "neg";

        return `
          <div class="sender-row ${sender.isLive ? "live-tick" : ""}">
            <div class="sender-client"><span class="sender-dot ${deltaClass}"></span>${formatEntityName(sender.name)}</div>
            <div class="sender-today">${sender.today.toLocaleString()} <span class="mini-delta ${deltaClass}">${delta >= 0 ? "+" : ""}${delta.toFixed(0)}</span></div>
            <div class="sender-yesterday">${sender.yesterday.toLocaleString()}</div>
            <div><span class="delta-pill ${deltaClass}">${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%</span></div>
          </div>
        `;
      })
      .join("")}
  `;
}

function updateSenderStatsTraffic() {
  senderStats.forEach((sender) => {
    sender.yesterday = sender.today;
    sender.today = Math.max(0, sender.today + randomInt(-420, 520));
    sender.isLive = true;
  });

  senderStats.sort((a, b) => b.today - a.today);
  renderSenderStats();
  window.setTimeout(() => {
    senderStats.forEach((sender) => {
      sender.isLive = false;
    });
    renderSenderStats();
  }, 900);
}
renderSenderStats();

// ── 🔥 LOGIKA FILTER GLOBAL ──
function checkMatch(textSender, textAcc, textSup) {
  const fSender =
    document.getElementById("filterSender")?.value.toLowerCase() || "all";
  const fAccount =
    document.getElementById("filterAccount")?.value.toLowerCase() || "all";
  const fSupplier =
    document.getElementById("filterSupplier")?.value.toLowerCase() || "all";

  let match = true;
  if (fSender !== "all" && !textSender.toLowerCase().includes(fSender))
    match = false;
  if (fAccount !== "all" && !textAcc.toLowerCase().includes(fAccount))
    match = false;
  if (fSupplier !== "all" && !textSup.toLowerCase().includes(fSupplier))
    match = false;

  return match;
}

function applyFilter() {
  const items = document.querySelectorAll(
    ".sender-item, .alert-item, .perf-item",
  );
  items.forEach((item) => {
    const text = item.innerText || "";
    item.style.display = checkMatch(text, text, text) ? "flex" : "none";
  });

  const tableRows = document.querySelectorAll("#latestTable tr");
  tableRows.forEach((row) => {
    const sName = row.querySelector(".sender-col")?.innerText || "";
    const aName = row.querySelector(".acc-col")?.innerText || "";
    const pName = row.querySelector(".sup-col")?.innerText || "";
    row.style.display = checkMatch(sName, aName, pName) ? "" : "none";
  });

  if (trafficChart) {
    trafficChart.data.datasets.forEach((dataset) => {
      dataset.data = dataset.data.map(() => Math.floor(Math.random() * 80) + 5);
    });
    trafficChart.update();
  }

  document.querySelectorAll(".operator-total").forEach((el) => {
    el.innerHTML =
      Math.floor(Math.random() * 3000 + 500).toLocaleString() +
      "<span> sms</span>";
  });
}

function clearFilter() {
  setDefaultFilterDate();
  document.getElementById("filterOperator").value = "all";
  document.getElementById("filterAccount").value = "all";
  document.getElementById("filterSender").value = "all";
  document.getElementById("filterSupplier").value = "all";
  document.getElementById("filterGateway").value = "all";
  applyFilter();
}

function setDefaultFilterDate() {
  const dateInput = document.getElementById("filterDate");
  if (!dateInput) return;
  dateInput.value = new Date().toISOString().slice(0, 10);
}

setDefaultFilterDate();

// ── ⚡ UPDATE DATA SINKRON LIVE ─────────────────
const sendersRT = [
  "Bukalapak",
  "Cashcepat",
  "RupiahCepat",
  "UangMe",
  "SINGA.ID",
  "BRI-NOTIF",
];
const suppliersRT = [
  "TOG_DOM_DIR",
  "HEYLOO_SIM_MKT",
  "HTTP_YULORE",
  "OMNI_WAGEN",
];
const accountsRT = ["GOT_OTP", "YULORE_HTTP", "SF_A2P_2", "OMNI_WAGEN"];

function addLiveData() {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const sms = Math.floor(Math.random() * 35) + 5;
  const nodr = Math.floor(Math.random() * 100);
  const deliv = 100 - nodr;

  if (trafficChart) {
    const lastIndex = trafficChart.data.labels.length - 1;

    if (trafficChart.data.labels[lastIndex] === timeStr) {
      trafficChart.data.datasets[0].data[lastIndex] = sms;
      trafficChart.data.datasets[1].data[lastIndex] = deliv;
      trafficChart.data.datasets[2].data[lastIndex] = nodr;
    } else {
      trafficChart.data.labels.push(timeStr);
      trafficChart.data.labels.shift();
      trafficChart.data.datasets[0].data.push(sms);
      trafficChart.data.datasets[0].data.shift();
      trafficChart.data.datasets[1].data.push(deliv);
      trafficChart.data.datasets[1].data.shift();
      trafficChart.data.datasets[2].data.push(nodr);
      trafficChart.data.datasets[2].data.shift();
    }

    trafficChart.update("none");
  }

  const sender = sendersRT[Math.floor(Math.random() * sendersRT.length)];
  const sup = suppliersRT[Math.floor(Math.random() * suppliersRT.length)];
  const acc = accountsRT[Math.floor(Math.random() * accountsRT.length)];
  const rec = Math.floor(Math.random() * 10) + 1;

  rows.unshift({
    t: timeStr,
    sender,
    sup,
    acc,
    rec,
    nodr,
  });

  if (rows.length > 180) rows.length = 180;

  highlightedTime = timeStr;
  currentPage = 1;
  updateLastUpdated(now);
  renderLatestSummary();

  window.setTimeout(() => {
    if (highlightedTime === timeStr) {
      highlightedTime = null;
      renderLatestSummary();
    }
  }, 6000);

}

function simulateDashboardTraffic() {
  updateSenderStatsTraffic();
  updateOperatorTraffic();
  updateNoDrTraffic();
  updatePerformanceTraffic();

  if (Math.random() > 0.35) updateStopAlerts();
  updateLastUpdated();
}

setInterval(addLiveData, 8000);
setInterval(simulateDashboardTraffic, 5000);
simulateDashboardTraffic();
