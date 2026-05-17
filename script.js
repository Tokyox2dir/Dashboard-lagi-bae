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

function formatInputDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function formatCountPercent(count, total) {
  const percent = total ? Math.round((count / total) * 100) : 0;
  return `${count} (${percent}%)`;
}

function createTrafficBreakdown(records) {
  const healthy = Math.random() > 0.18;
  const deliveredRate = healthy ? randomInt(72, 94) : randomInt(38, 68);
  const sentRate = healthy ? randomInt(3, 14) : randomInt(8, 22);
  let delivered = Math.round((records * deliveredRate) / 100);
  let sent = Math.round((records * sentRate) / 100);

  delivered = clamp(delivered, 1, records);
  sent = clamp(sent, 0, Math.max(0, records - delivered));

  const undeliv = Math.max(0, records - delivered - sent);
  const nodr = records ? Math.round((undeliv / records) * 100) : 0;

  return { sent, delivered, undeliv, nodr };
}

function normalizeTrafficRow(row) {
  if (
    Number.isFinite(row.sent) &&
    Number.isFinite(row.delivered) &&
    Number.isFinite(row.undeliv)
  ) {
    return row;
  }

  const fallback = createTrafficBreakdown(row.rec || 1);
  row.sent = fallback.sent;
  row.delivered = fallback.delivered;
  row.undeliv = fallback.undeliv;
  row.nodr = fallback.nodr;
  return row;
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
  smsData.push(randomInt(1500, 6000));
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
          min: 0,
          max: 6000,
          ticks: {
            color: tickColor,
            font: { family: "JetBrains Mono", size: 11, weight: "900" },
            stepSize: 1500,
          },
          grid: { color: gridColor },
        },
        y1: {
          position: "right",
          min: 0,
          max: 100,
          ticks: {
            color: tickColor,
            font: { family: "JetBrains Mono", size: 11, weight: "900" },
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

const fakeOperatorsRT = ["TELKOMSEL", "THREE", "SMARTFREN", "INDOSAT", "XL", "AXIS"];

const accountSenderPairs = [
  ["YULORE_HTTP", "UangMe"],
  ["SF_A2P_2", "UangMe"],
  ["YULORE_HTTP", "SINGA.ID"],
  ["SF_A2P_2", "SINGA.ID"],
  ["TIG_DOM-B", "SULSELBAR"],
  ["GOT_OTP", "Bukalapak"],
  ["SF_A2P_2", "Cashcepat"],
  ["YULORE_HTTP", "MOKA"],
  ["SF_A2P_2", "BantuSaku"],
  ["GOT_OTP", "Akulaku"],
  ["OMNI_WAGEN", "BRI-NOTIF"],
  ["YULORE_HTTP", "Indosaku"],
];

const fakeGatewaysRT = [
  "TOG_DOM_DIR",
  "HTTP_YULORE",
  "HEYLOO_SIM_MKT",
  "OMNI_WAGEN",
  "INFOBIP_DOM",
];

for (let minute = 0; minute < 30; minute++) {
  const now = new Date();

  now.setMinutes(now.getMinutes() - minute);

  const timeStr =
    `${String(now.getHours()).padStart(2, "0")}:` +
    `${String(now.getMinutes()).padStart(2, "0")}`;

  const minuteRecords = randomInt(1500, 6000);
  const totalTransactions = Math.floor(Math.random() * 5) + 4;
  let remainingRecords = minuteRecords;

  for (let i = 0; i < totalTransactions; i++) {
    const remainingRows = totalTransactions - i;
    const pair = accountSenderPairs[Math.floor(Math.random() * accountSenderPairs.length)];
    const rec = Math.min(
      remainingRecords - (remainingRows - 1),
      i === totalTransactions - 1
        ? remainingRecords
        : randomInt(
            Math.max(1, Math.floor(remainingRecords / remainingRows / 2)),
            Math.max(1, Math.floor(remainingRecords / remainingRows * 1.5)),
          ),
    );
    remainingRecords -= rec;
    const breakdown = createTrafficBreakdown(rec);

    rows.push({
      t: timeStr,

      date: formatInputDate(now),

      sender: pair[1],

      sup: fakeSuppliers[Math.floor(Math.random() * fakeSuppliers.length)],

      acc: pair[0],

      operator: fakeOperatorsRT[Math.floor(Math.random() * fakeOperatorsRT.length)],

      gateway: fakeGatewaysRT[Math.floor(Math.random() * fakeGatewaysRT.length)],

      rec,

      sent: breakdown.sent,

      delivered: breakdown.delivered,

      undeliv: breakdown.undeliv,

      nodr: breakdown.nodr,
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

  const grouped = groupRowsByTime();

  const times = Object.keys(grouped).sort().reverse();

  const detailRows = grouped[times[index]];

  if (!detailRows) return;

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

            <th>Sent</th>

            <th>Delivered</th>

            <th>Undelivered</th>

          </tr>

        </thead>

        <tbody>

          ${detailRows
            .map(
              (detail) => {
                const d = normalizeTrafficRow(detail);

                return `

            <tr>

              <td>
                <a class="account-log-link" href="${buildAccountLogUrl(d.acc, d)}">
                  ${d.acc}
                </a>
              </td>

              <td>${d.sup}</td>

              <td>${d.sender}</td>

              <td>${d.rec}</td>

              <td class="td-sent">${formatCountPercent(d.sent, d.rec)}</td>

              <td class="td-delivered">${formatCountPercent(d.delivered, d.rec)}</td>

              <td class="td-undeliv">${formatCountPercent(d.undeliv, d.rec)}</td>

            </tr>

          `;
              },
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

function normalizeFilterValue(value) {
  return String(value || "all")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function getFilterValue(id) {
  return normalizeFilterValue(document.getElementById(id)?.value);
}

function getActiveFilters() {
  return {
    date: document.getElementById("filterDate")?.value || "",
    operator: getFilterValue("filterOperator"),
    account: getFilterValue("filterAccount"),
    sender: getFilterValue("filterSender"),
    supplier: getFilterValue("filterSupplier"),
    gateway: getFilterValue("filterGateway"),
  };
}

function hasActiveFilter(filters = getActiveFilters()) {
  return Object.entries(filters).some(([key, value]) =>
    key === "date" ? value && value !== formatInputDate() : value !== "all",
  );
}

function matchesFilter(value, filterValue) {
  if (filterValue === "all") return true;
  return normalizeFilterValue(value).includes(filterValue);
}

function rowMatchesFilters(row, filters = getActiveFilters()) {
  return (
    (!filters.date || row.date === filters.date) &&
    matchesFilter(row.operator, filters.operator) &&
    matchesFilter(row.acc, filters.account) &&
    matchesFilter(row.sender, filters.sender) &&
    matchesFilter(row.sup, filters.supplier) &&
    matchesFilter(row.gateway, filters.gateway)
  );
}

function getFilteredRows() {
  const filters = getActiveFilters();
  return rows.filter((row) => rowMatchesFilters(row, filters));
}

function groupRowsByTime(sourceRows = getFilteredRows()) {
  const grouped = {};

  sourceRows.forEach((r) => {
    if (!grouped[r.t]) {
      grouped[r.t] = [];
    }

    grouped[r.t].push(r);
  });

  return grouped;
}

function renderEmptyState(el, message) {
  if (!el) return;
  if (el.tagName === "TBODY") {
    el.innerHTML = `<tr><td class="empty-state" colspan="7">${message}</td></tr>`;
    return;
  }
  el.innerHTML = `<div class="empty-state">${message}</div>`;
}

function entityMatchesFilters(name, filters = getActiveFilters(), scope = {}) {
  const fullName = normalizeFilterValue(name);

  return (
    matchesFilter(scope.operator || fullName, filters.operator) &&
    matchesFilter(scope.account || fullName, filters.account) &&
    matchesFilter(scope.sender || fullName, filters.sender) &&
    matchesFilter(scope.supplier || fullName, filters.supplier) &&
    matchesFilter(scope.gateway || fullName, filters.gateway)
  );
}

function filterByRows(data, key, fallbackMatcher) {
  const filters = getActiveFilters();
  const filteredRows = getFilteredRows();
  const active = hasActiveFilter(filters);
  const rowValues = new Set(filteredRows.map((row) => normalizeFilterValue(row[key])));

  return data.filter((item) => {
    if (!active) return true;
    if (rowValues.size && rowValues.has(normalizeFilterValue(item.name))) return true;
    return fallbackMatcher ? fallbackMatcher(item, filters) : false;
  });
}

function getRecentTrafficRows() {
  const today = formatInputDate();
  return rows.filter((row) => row.date === today).slice(0, 180);
}

function aggregateTrafficRows(sourceRows, keyFn) {
  const metrics = new Map();

  sourceRows.forEach((row) => {
    normalizeTrafficRow(row);
    const key = keyFn(row);
    if (!key) return;

    if (!metrics.has(key)) {
      metrics.set(key, {
        name: key,
        records: 0,
        sent: 0,
        delivered: 0,
        undeliv: 0,
      });
    }

    const metric = metrics.get(key);
    metric.records += row.rec;
    metric.sent += row.sent;
    metric.delivered += row.delivered;
    metric.undeliv += row.undeliv;
  });

  return metrics;
}

function toPercent(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function assignTrafficPercentages(target, metric) {
  const total = Math.max(1, metric?.records || 0);
  target.total = metric?.records || 0;
  target.sent = toPercent(metric?.sent || 0, total);
  target.delivered = toPercent(metric?.delivered || 0, total);
  target.undeliv = Math.max(0, 100 - target.delivered - target.sent);
}

function renderLatestSummary() {
  const tbody = document.getElementById("latestSummary");

  if (!tbody) return;

  tbody.innerHTML = "";

  const grouped = groupRowsByTime();

  const times = Object.keys(grouped).sort().reverse();

  if (!times.length) {
    renderEmptyState(tbody, "No traffic for selected filter");
    renderPagination(1);
    return;
  }

  const totalPages = Math.max(1, Math.ceil(times.length / rowsPerPage));

  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * rowsPerPage;

  const end = start + rowsPerPage;

  const paginatedTimes = times.slice(start, end);

  paginatedTimes.forEach((time, index) => {
    const detailRows = grouped[time];

    let totalRecords = 0;

    let totalSent = 0;

    let totalDelivered = 0;

    let totalUndeliv = 0;

    detailRows.forEach((d) => {
      normalizeTrafficRow(d);

      totalRecords += d.rec;

      totalSent += d.sent;

      totalDelivered += d.delivered;

      totalUndeliv += d.undeliv;
    });

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

      <td class="td-sent">${formatCountPercent(totalSent, totalRecords)}</td>

      <td class="td-delivered">${formatCountPercent(totalDelivered, totalRecords)}</td>

      <td class="td-undeliv">${formatCountPercent(totalUndeliv, totalRecords)}</td>

      <td>

        <div class="delivered-wrap">

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
  const grouped = groupRowsByTime();

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
  const filters = getActiveFilters();
  const visibleOperators = operators.filter((op) => matchesFilter(op.name, filters.operator));

  if (!visibleOperators.length) {
    renderEmptyState(opGrid, "No operator for selected filter");
    return;
  }

  visibleOperators.forEach((op) => {
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
  syncDashboardMetrics();
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
  const key = containerId === "gatewayNoDr" ? "gateway" : "sender";
  const visibleData = filterByRows(data, key, (item, filters) =>
    entityMatchesFilters(item.name, filters, { [key]: item.name }),
  );

  if (!visibleData.length) {
    renderEmptyState(el, "No alert for selected filter");
    return;
  }

  visibleData.slice(0, 8).forEach((d) => {
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
  syncDashboardMetrics();
  renderNoDr(senderNoDrData, "senderNoDr");
  renderNoDr(gatewayNoDrData, "gatewayNoDr");
  updateAlertSummary();
}

function enhanceStaticAlerts() {
  document.querySelectorAll(".alert-section").forEach((section) => {
    const title = section.querySelector(".alert-section-title")?.textContent || "";
    let level = "";
    if (title.includes("Sender Stop")) level = "high";
    if (title.includes("Account Stop")) level = "high";
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

  section.classList.add("stop-alert-section", "stop-critical");

  const filters = getActiveFilters();
  const filteredPool = pool.filter((name) => entityMatchesFilters(name, filters));
  const shuffled = [...filteredPool].sort(() => Math.random() - 0.5).slice(0, size);

  if (!shuffled.length) {
    renderEmptyState(panel, "No stop alert for selected filter");
    return;
  }

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
  renderStopAlerts("Account Stop", accountStopPool, "high", 6);
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
  const key = containerId === "supplierPerf" ? "sup" : "acc";
  const filterKey = containerId === "supplierPerf" ? "supplier" : "account";
  const visibleData = filterByRows(data, key, (item, filters) =>
    entityMatchesFilters(item.name, filters, { [filterKey]: item.name }),
  );

  if (!visibleData.length) {
    renderEmptyState(el, "No performance for selected filter");
    return;
  }

  visibleData.forEach((d) => {
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
  syncDashboardMetrics();
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

function upsertNamedMetric(list, name, defaults = {}) {
  let item = list.find((entry) => normalizeFilterValue(entry.name) === normalizeFilterValue(name));
  if (!item) {
    item = { name, ...defaults };
    list.push(item);
  }
  return item;
}

function syncPerformanceList(list, metrics) {
  metrics.forEach((metric, name) => {
    const item = upsertNamedMetric(list, name, { g: 0, y: 0, r: 0 });
    const total = Math.max(1, metric.records);
    item.g = toPercent(metric.delivered, total);
    item.y = toPercent(metric.sent, total);
    item.r = Math.max(0, 100 - item.g - item.y);
    item.isLive = true;
  });

  list.sort((a, b) => (b.g || 0) - (a.g || 0));
}

function syncNoDrList(list, metrics) {
  list.length = 0;
  metrics.forEach((metric, name) => {
    list.push({
      name,
      val: toPercent(metric.undeliv, Math.max(1, metric.records)),
    });
  });
  list.sort((a, b) => b.val - a.val);
}

function syncStopPools(accountMetrics, senderMetrics) {
  const accountStops = [...accountMetrics.values()]
    .sort((a, b) => b.undeliv / Math.max(1, b.records) - a.undeliv / Math.max(1, a.records))
    .slice(0, 10)
    .map((metric) => metric.name);
  const senderStops = [...senderMetrics.values()]
    .sort((a, b) => b.undeliv / Math.max(1, b.records) - a.undeliv / Math.max(1, a.records))
    .slice(0, 10)
    .map((metric) => metric.name);

  if (accountStops.length) accountStopPool.splice(0, accountStopPool.length, ...accountStops);
  if (senderStops.length) senderStopPool.splice(0, senderStopPool.length, ...senderStops);
}

function syncDashboardMetrics() {
  const sourceRows = getRecentTrafficRows();
  const operatorMetrics = aggregateTrafficRows(sourceRows, (row) => row.operator);
  const senderMetrics = aggregateTrafficRows(sourceRows, (row) => row.sender);
  const gatewayMetrics = aggregateTrafficRows(sourceRows, (row) => row.gateway);
  const accountMetrics = aggregateTrafficRows(sourceRows, (row) => row.acc);
  const supplierMetrics = aggregateTrafficRows(sourceRows, (row) => row.sup);
  const senderStatMetrics = aggregateTrafficRows(
    sourceRows,
    (row) => `${row.acc}-${row.sender}`,
  );

  operators.forEach((op) => {
    const metric = operatorMetrics.get(op.name);
    const previousTotal = op.total;
    assignTrafficPercentages(op, metric || { records: 0, sent: 0, delivered: 0, undeliv: 0 });
    op.isLive = op.total !== previousTotal;
  });

  const previousSenderStats = new Map(
    senderStats.map((sender) => [normalizeFilterValue(sender.name), sender]),
  );
  senderStats.length = 0;
  senderStatMetrics.forEach((metric, name) => {
    const previous = previousSenderStats.get(normalizeFilterValue(name));
    senderStats.push({
      name,
      yesterday:
        previous?.yesterday ||
        Math.max(1, Math.round(metric.records * (0.72 + Math.random() * 0.24))),
      today: metric.records,
      isLive: !previous || previous.today !== metric.records,
    });
  });
  senderStats.sort((a, b) => b.today - a.today);

  syncPerformanceList(clients, accountMetrics);
  syncPerformanceList(suppliers, supplierMetrics);
  syncNoDrList(senderNoDrData, senderMetrics);
  syncNoDrList(gatewayNoDrData, gatewayMetrics);
  syncStopPools(accountMetrics, senderStatMetrics);
}

function renderSenderStats() {
  const list = document.querySelector(".sender-list");
  if (!list) return;
  const filters = getActiveFilters();
  const activeRows = getFilteredRows();
  const activeNames = new Set(activeRows.map((row) => normalizeFilterValue(`${row.acc}-${row.sender}`)));
  const visibleStats = senderStats.filter((sender) => {
    if (hasActiveFilter(filters)) return activeNames.has(normalizeFilterValue(sender.name));
    return entityMatchesFilters(sender.name, filters);
  });

  list.innerHTML = `
    <div class="sender-table-head">
      <span>Client</span>
      <span>Today</span>
      <span>Yesterday</span>
      <span>Delta</span>
    </div>
    ${
      visibleStats.length
        ? visibleStats
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
      .join("")
        : '<div class="empty-state sender-empty">No sender for selected filter</div>'
    }
  `;
}

function updateSenderStatsTraffic() {
  syncDashboardMetrics();
  renderSenderStats();
  window.setTimeout(() => {
    senderStats.forEach((sender) => {
      sender.isLive = false;
    });
    renderSenderStats();
  }, 900);
}
syncDashboardMetrics();
renderOperators();
renderNoDr(senderNoDrData, "senderNoDr");
renderNoDr(gatewayNoDrData, "gatewayNoDr");
updateStopAlerts();
renderPerf(clients, "clientPerf");
renderPerf(suppliers, "supplierPerf");
renderSenderStats();

// ── 🔥 LOGIKA FILTER GLOBAL ──
function applyFilter() {
  currentPage = 1;
  syncDashboardMetrics();
  renderLatestSummary();
  renderSenderStats();
  renderOperators();
  renderNoDr(senderNoDrData, "senderNoDr");
  renderNoDr(gatewayNoDrData, "gatewayNoDr");
  updateStopAlerts();
  renderPerf(clients, "clientPerf");
  renderPerf(suppliers, "supplierPerf");

  if (trafficChart) {
    const active = hasActiveFilter();
    trafficChart.data.datasets.forEach((dataset) => {
      dataset.data = dataset.data.map((value, index) => {
        if (!active) return value;
        const wave = (index % 5) * 3;
        if (dataset.label === "SMS Count") return Math.max(1, Math.round(value * 0.55 + wave));
        if (dataset.label === "% Delivered") return clamp(value + randomInt(-6, 6), 35, 98);
        return clamp(value + randomInt(-5, 7), 0, 100);
      });
    });
    trafficChart.update("none");
  }
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
  dateInput.value = formatInputDate();
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
const accountsRT = ["GOT_OTP", "YULORE_HTTP", "SF_A2P_2", "OMNI_WAGEN", "TIG_DOM-B"];

function pickLiveValue(pool, filterValue) {
  if (filterValue !== "all") {
    const matched = pool.find((item) => matchesFilter(item, filterValue));
    if (matched) return matched;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickLiveAccountSender(filters) {
  const candidates = accountSenderPairs.filter(
    ([account, sender]) =>
      matchesFilter(account, filters.account) && matchesFilter(sender, filters.sender),
  );

  if (candidates.length) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  return [
    pickLiveValue(accountsRT, filters.account),
    pickLiveValue(sendersRT, filters.sender),
  ];
}

function addLiveData() {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const sms = randomInt(1500, 6000);
  const chartBreakdown = createTrafficBreakdown(sms);
  const nodr = chartBreakdown.nodr;
  const deliv = sms ? Math.round((chartBreakdown.delivered / sms) * 100) : 0;

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

  const filters = getActiveFilters();
  const [acc, sender] = pickLiveAccountSender(filters);
  const sup = pickLiveValue(suppliersRT, filters.supplier);
  const operator = pickLiveValue(fakeOperatorsRT, filters.operator);
  const gateway = pickLiveValue(fakeGatewaysRT, filters.gateway);
  const rec = sms;
  const breakdown = chartBreakdown;

  rows.unshift({
    t: timeStr,
    date: formatInputDate(now),
    sender,
    sup,
    acc,
    operator,
    gateway,
    rec,
    sent: breakdown.sent,
    delivered: breakdown.delivered,
    undeliv: breakdown.undeliv,
    nodr: breakdown.nodr,
  });

  if (rows.length > 180) rows.length = 180;

  highlightedTime = timeStr;
  currentPage = 1;
  syncDashboardMetrics();
  updateLastUpdated(now);
  renderLatestSummary();
  renderSenderStats();
  renderOperators();
  renderNoDr(senderNoDrData, "senderNoDr");
  renderNoDr(gatewayNoDrData, "gatewayNoDr");
  updateStopAlerts();
  renderPerf(clients, "clientPerf");
  renderPerf(suppliers, "supplierPerf");

  window.setTimeout(() => {
    if (highlightedTime === timeStr) {
      highlightedTime = null;
      renderLatestSummary();
    }
  }, 6000);

}

function simulateDashboardTraffic() {
  syncDashboardMetrics();
  renderSenderStats();
  renderOperators();
  renderNoDr(senderNoDrData, "senderNoDr");
  renderNoDr(gatewayNoDrData, "gatewayNoDr");
  updateStopAlerts();
  renderPerf(clients, "clientPerf");
  renderPerf(suppliers, "supplierPerf");
  updateLastUpdated();
}

setInterval(addLiveData, 8000);
setInterval(simulateDashboardTraffic, 5000);
simulateDashboardTraffic();
