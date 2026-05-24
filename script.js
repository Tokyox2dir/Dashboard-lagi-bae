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
let selectedLogContext = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initAppNavigation() {
  const navItems = document.querySelectorAll("[data-page]");
  const navToggles = document.querySelectorAll(".nav-parent:not([data-page])");
  const monitoringPage = document.getElementById("page-monitoring");
  const placeholderPage = document.getElementById("page-placeholder");
  const pageSlot = document.getElementById("pageSlot");
  const pageTitle = document.getElementById("pageTitle");

  const renderFallbackPage = (title) => {
    if (!pageSlot) return;
    pageSlot.innerHTML = `
      <div class="module-page">
        <div class="module-head">
          <span>Workspace</span>
          <h2>${title}</h2>
          <p>File halaman belum ditemukan. Struktur shell sudah siap untuk isi tabel, chart, dan workflow production.</p>
        </div>
      </div>
    `;
  };

  const keepSidebarGroupVisible = (group) => {
    if (!group) return;
    window.setTimeout(() => {
      group.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 20);
  };

  const loadMenuPage = async (page, title) => {
    monitoringPage?.classList.remove("active");
    placeholderPage?.classList.add("active");
    if (pageTitle) pageTitle.textContent = title;
    if (!pageSlot) return;

    pageSlot.innerHTML = '<div class="page-loading">Loading page...</div>';
    try {
      const response = await fetch(`pages/${page}.html`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Page ${page} not found`);
      pageSlot.innerHTML = await response.text();
      initLoadedPage(page, title);
    } catch (error) {
      renderFallbackPage(title);
    }
  };

  window.navigateToPage = async (page, title) => {
    navItems.forEach((nav) => nav.classList.remove("active"));
    const target = document.querySelector(`[data-page="${page}"]`);
    target?.classList.add("active");
    target?.closest(".nav-group")?.classList.add("open");
    keepSidebarGroupVisible(target?.closest(".nav-group"));

    if (page === "monitoring") {
      monitoringPage?.classList.add("active");
      placeholderPage?.classList.remove("active");
      if (pageTitle) pageTitle.textContent = "Monitoring Overview";
      return;
    }

    await loadMenuPage(page, title);
  };

  navToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const group = toggle.closest(".nav-group");
      if (group?.querySelector(".nav-children")) {
        group.classList.toggle("open");
        keepSidebarGroupVisible(group);
      }
    });
  });

  navItems.forEach((item) => {
    item.addEventListener("click", async () => {
      const label =
        item.querySelector(".nav-text")?.textContent.trim() ||
        item.textContent.trim().replace(/\s+/g, " ");
      const group = item.closest(".nav-group");
      const isParent = item.classList.contains("nav-parent");
      const hasChildren = !!group?.querySelector(".nav-children");
      const wasOpen = !!group?.classList.contains("open");

      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
      if (group && hasChildren) {
        group.classList.toggle("open", !(isParent && wasOpen));
        keepSidebarGroupVisible(group);
      }

      if (item.dataset.page === "monitoring") {
        monitoringPage?.classList.add("active");
        placeholderPage?.classList.remove("active");
        if (pageTitle) pageTitle.textContent = "Monitoring Overview";
        return;
      }

      await loadMenuPage(item.dataset.page, label);
    });
  });
}

initAppNavigation();

function toggleSidebar() {
  const shell = document.querySelector(".app-shell");
  const toggle = document.querySelector(".sidebar-toggle");
  if (!shell) return;

  const isCollapsed = shell.classList.toggle("sidebar-collapsed");
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(!isCollapsed));
  }
}

window.toggleSidebar = toggleSidebar;

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

function normalizeOperatorName(name) {
  return normalizeFilterValue(name) === "axis" ? "XL" : name;
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
  const tickColor = isDark ? "#e6edf3" : "#1a202c";
  const timeTickColor = tickColor;

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

const fakeOperatorsRT = ["TELKOMSEL", "THREE", "SMARTFREN", "INDOSAT", "XL"];

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

function openLogsFromDetail(index) {
  const detail = window.currentDetailRows?.[index];
  if (!detail) return;

  selectedLogContext = {
    account: detail.acc,
    supplier: detail.sup,
    sender: detail.sender,
    time: detail.t,
    records: detail.rec,
    sent: detail.sent,
    delivered: detail.delivered,
    undeliv: detail.undeliv,
    operator: detail.operator,
    gateway: detail.gateway,
  };

  closeDetailModal();
  window.navigateToPage?.("logs", "Logs");
}

window.openLogsFromDetail = openLogsFromDetail;

function toggleDetail(index) {
  const oldModal = document.getElementById("detailModal");

  if (oldModal) oldModal.remove();

  const grouped = groupRowsByTime();

  const times = Object.keys(grouped).sort().reverse();

  const detailRows = grouped[times[index]];

  if (!detailRows) return;
  window.currentDetailRows = detailRows.map((detail) => normalizeTrafficRow({ ...detail }));

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

          ${window.currentDetailRows
            .map(
              (d, rowIndex) => {

                return `

            <tr>

              <td>
                <button
                  class="account-log-link"
                  type="button"
                  onclick="openLogsFromDetail(${rowIndex})"
                  title="Open matching logs">
                  ${escapeHtml(d.acc)}
                </button>
              </td>

              <td>${escapeHtml(d.sup)}</td>

              <td>${escapeHtml(d.sender)}</td>

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

window.toggleDetail = toggleDetail;
window.closeDetailModal = closeDetailModal;

function getLogContextRows(context) {
  if (!context) return rows.slice(0, 12);

  const matches = rows.filter(
    (row) =>
      matchesFilter(row.acc, context.account) &&
      matchesFilter(row.sup, context.supplier) &&
      matchesFilter(row.sender, context.sender),
  );

  return matches.length ? matches : [context];
}

function buildDummyLogEntries(context) {
  const sourceRows = getLogContextRows(context);
  const entries = [];

  sourceRows.slice(0, 8).forEach((row, rowIndex) => {
    const normalized = normalizeTrafficRow({ ...row });
    const statuses = [
      { label: "sent", count: normalized.sent, tone: "sent" },
      { label: "delivered", count: normalized.delivered, tone: "delivered" },
      { label: "undelivered", count: normalized.undeliv, tone: "undeliv" },
    ].filter((item) => item.count > 0);

    statuses.forEach((status, statusIndex) => {
      const chunk = Math.max(1, Math.min(status.count, Math.ceil(normalized.rec / 5)));
      entries.push({
        id: `246${randomInt(700, 999)}-${rowIndex}${statusIndex}${randomInt(1000, 9999)}`,
        time: `${formatInputDate()} ${normalized.t}:${String(10 + rowIndex + statusIndex).padStart(2, "0")}`,
        sender: normalized.sender,
        account: normalized.acc,
        supplier: normalized.sup,
        operator: normalized.operator || "Telkomsel",
        gateway: normalized.gateway || "TOG_DOM_DIR",
        destination: `628${randomInt(1000000000, 9999999999)}`,
        message:
          normalized.sender === "Bukalapak"
            ? "Kode OTP Bukalapak Anda berlaku 10 menit. Jangan bagikan kode ini kepada siapa pun."
            : `Pesan ${normalized.sender} untuk transaksi dummy monitoring dashboard.`,
        status: status.label,
        tone: status.tone,
        count: chunk,
      });
    });
  });

  return entries.slice(0, 14);
}

function renderTransactionLogs() {
  const context = selectedLogContext;
  const tbody = document.getElementById("logTransactionRows");
  const countEl = document.getElementById("logRecordCount");

  if (!tbody) return;

  const entries = buildDummyLogEntries(context);
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);
  const delivered = entries
    .filter((entry) => entry.status === "delivered")
    .reduce((sum, entry) => sum + entry.count, 0);
  const sent = entries
    .filter((entry) => entry.status === "sent")
    .reduce((sum, entry) => sum + entry.count, 0);
  const undeliv = entries
    .filter((entry) => entry.status === "undelivered")
    .reduce((sum, entry) => sum + entry.count, 0);

  if (countEl) {
    countEl.textContent = `${total.toLocaleString()} records: sent ${sent}, delivered ${delivered}, undelivered ${undeliv}`;
  }

  const accountInput = document.getElementById("logFilterAccount");
  const senderInput = document.getElementById("logFilterSender");
  const supplierInput = document.getElementById("logFilterSupplier");
  const telcoInput = document.getElementById("logFilterTelco");
  const gatewayInput = document.getElementById("logFilterGateway");
  const statusInput = document.getElementById("logFilterStatus");
  const msgInput = document.getElementById("logFilterMsg");
  const messageInput = document.getElementById("logFilterMessage");

  if (accountInput) accountInput.value = context?.account || "";
  if (senderInput) senderInput.value = context?.sender || "";
  if (supplierInput) supplierInput.value = context?.supplier || "";
  if (telcoInput) telcoInput.value = context?.operator || "";
  if (gatewayInput) gatewayInput.value = context?.gateway || "";
  if (statusInput) statusInput.value = context ? "delivered,sent,undelivered" : "";
  if (msgInput) msgInput.value = context ? `${context.account}-${context.sender}-${context.time}` : "";
  if (messageInput) {
    messageInput.value = context
      ? `supplier=${context.supplier}; sender=${context.sender}; time=${context.time}`
      : "";
  }

  tbody.innerHTML = entries
    .map(
      (entry, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(entry.time)}<br><span class="log-muted">(${escapeHtml(entry.sender)})</span></td>
          <td><a class="log-id-link" href="#log-${escapeHtml(entry.id)}">${escapeHtml(entry.id)}</a><br><span class="log-muted">${entry.count} message</span></td>
          <td><span class="log-status ${entry.tone}">${escapeHtml(entry.status)}</span><br><span class="log-muted">${entry.status === "delivered" ? "Delivered to phone" : entry.status === "sent" ? "Sent to SMSC" : "Final failed state"}</span></td>
          <td>${escapeHtml(entry.account)}<br><span class="log-muted">${escapeHtml(entry.supplier)}</span></td>
          <td>${escapeHtml(entry.destination)}<br><span class="log-muted">${escapeHtml(entry.operator)} [${escapeHtml(entry.gateway)}]</span></td>
          <td>${escapeHtml(entry.message)}</td>
        </tr>
      `,
    )
    .join("");
}

function initLoadedPage(page) {
  if (page === "logs") {
    renderTransactionLogs();
  }
  if (page === "users") {
    showUserList();
  }
  if (page === "snapshot") {
    renderSnapshotChart();
  }
  if (page === "custom-report") {
    renderCustomReportCharts();
  }
  if (page === "business-overview") {
    renderBusinessOverview();
  }
  if (page === "database-senderid") {
    initSenderDatabase();
  }
  if (page === "sid-readiness") {
    initSidReadiness();
  }
  if (page === "readiness-supplier") {
    initSupplierReadiness();
  }
}

window.initLoadedPage = initLoadedPage;
window.renderTransactionLogs = renderTransactionLogs;

function openUserDetail(username) {
  const list = document.getElementById("usersListView");
  const detail = document.getElementById("userDetailView");
  const usernameInput = document.getElementById("detailUsername");
  const emailInput = document.getElementById("detailEmail");

  if (usernameInput) usernameInput.value = username;
  if (emailInput) emailInput.value = `${String(username).toLowerCase()}@gmail.com`;
  list?.classList.add("hidden");
  detail?.classList.add("active");
}

function showUserList() {
  document.getElementById("usersListView")?.classList.remove("hidden");
  document.getElementById("userDetailView")?.classList.remove("active");
}

window.openUserDetail = openUserDetail;
window.showUserList = showUserList;

let senderDbRows = [];
let senderDbFilteredRows = [];
let senderDbPage = 1;
let senderDbBound = false;
let senderDbReadyCallbacks = [];
const senderDbOperators = ["Telkomsel", "Indosat", "Three", "XL", "Smartfren"];

function setSenderDbStatus(text) {
  const status = document.getElementById("senderDbStatus");
  if (status) status.textContent = text;
}

function uniqueSenderDbValues(key) {
  return [...new Set(senderDbRows.map((row) => row[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function fillSenderDbSelect(id, values, label) {
  const select = document.getElementById(id);
  if (!select) return;
  select.innerHTML = `<option value="">${label}</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
}

function normalizeSenderDbFilter(value) {
  const trimmedValue = String(value || "").trim();
  return trimmedValue ? normalizeFilterValue(trimmedValue) : "";
}

function updateSenderDbStats() {
  const total = document.getElementById("senderDbTotal");
  const senderTotal = document.getElementById("senderDbSenderTotal");
  const supplierTotal = document.getElementById("senderDbSupplierTotal");
  const operatorTotal = document.getElementById("senderDbOperatorTotal");

  if (total) total.textContent = senderDbRows.length.toLocaleString("en-US");
  if (senderTotal) senderTotal.textContent = new Set(senderDbRows.map((row) => row.senderId)).size.toLocaleString("en-US");
  if (supplierTotal) supplierTotal.textContent = new Set(senderDbRows.map((row) => row.supplierName)).size.toLocaleString("en-US");
  if (operatorTotal) operatorTotal.textContent = new Set(senderDbRows.map((row) => row.operator)).size.toLocaleString("en-US");
}

function hydrateSenderDbFilters() {
  fillSenderDbSelect("senderDbSupplier", uniqueSenderDbValues("supplierName"), "All Supplier");
  fillSenderDbSelect("senderDbCategory", uniqueSenderDbValues("category"), "All Category");
  fillSenderDbSelect("senderDbOperator", uniqueSenderDbValues("operator"), "All Operator");
  fillSenderDbSelect("senderDbContent", uniqueSenderDbValues("content"), "All Content");
}

function applySenderDbFilters() {
  const query = normalizeSenderDbFilter(document.getElementById("senderDbSearch")?.value || "");
  const supplier = normalizeSenderDbFilter(document.getElementById("senderDbSupplier")?.value || "");
  const category = normalizeSenderDbFilter(document.getElementById("senderDbCategory")?.value || "");
  const operator = normalizeSenderDbFilter(document.getElementById("senderDbOperator")?.value || "");
  const content = normalizeSenderDbFilter(document.getElementById("senderDbContent")?.value || "");

  senderDbFilteredRows = senderDbRows.filter((row) => {
    const haystack = normalizeFilterValue(`${row.senderId} ${row.supplierName} ${row.category} ${row.operator} ${row.content}`);
    return (
      (!query || haystack.includes(query)) &&
      (!supplier || normalizeFilterValue(row.supplierName) === supplier) &&
      (!category || normalizeFilterValue(row.category) === category) &&
      (!operator || normalizeFilterValue(row.operator) === operator) &&
      (!content || normalizeFilterValue(row.content) === content)
    );
  });
}

function renderSenderDbRows() {
  const tbody = document.getElementById("senderDbTbody");
  const pageInfo = document.getElementById("senderDbPageInfo");
  const prev = document.getElementById("senderDbPrev");
  const next = document.getElementById("senderDbNext");
  const rowsValue = document.getElementById("senderDbRows")?.value || "200";
  const rowsPerPage = rowsValue === "all" ? senderDbFilteredRows.length || 1 : Number(rowsValue);
  const totalPages = Math.max(1, Math.ceil(senderDbFilteredRows.length / rowsPerPage));

  senderDbPage = Math.min(Math.max(senderDbPage, 1), totalPages);
  const start = (senderDbPage - 1) * rowsPerPage;
  const visibleRows = senderDbFilteredRows.slice(start, start + rowsPerPage);

  if (!tbody) return;
  tbody.innerHTML = visibleRows.length
    ? visibleRows
        .map(
          (row) => `
            <tr>
              <td>${escapeHtml(row.senderId)}</td>
              <td>${escapeHtml(row.supplierName)}</td>
              <td><span class="sender-db-badge category">${escapeHtml(row.category)}</span></td>
              <td><span class="sender-db-badge operator">${escapeHtml(row.operator)}</span></td>
              <td>${escapeHtml(row.content)}</td>
            </tr>
          `,
        )
        .join("")
    : '<tr><td colspan="5">No sender data found</td></tr>';

  if (pageInfo) pageInfo.textContent = rowsValue === "all" ? "All rows" : `Page ${senderDbPage} / ${totalPages}`;
  if (prev) prev.disabled = rowsValue === "all" || senderDbPage <= 1;
  if (next) next.disabled = rowsValue === "all" || senderDbPage >= totalPages;
  setSenderDbStatus(
    `${senderDbRows.length.toLocaleString("en-US")} local rows loaded • ${senderDbFilteredRows.length.toLocaleString("en-US")} rows match filter • ${visibleRows.length.toLocaleString("en-US")} displayed`,
  );
}

function refreshSenderDbTable(resetPage = true) {
  if (resetPage) senderDbPage = 1;
  applySenderDbFilters();
  renderSenderDbRows();
}

function bindSenderDbControls() {
  if (senderDbBound) return;
  senderDbBound = true;
  ["senderDbSearch", "senderDbSupplier", "senderDbCategory", "senderDbOperator", "senderDbContent", "senderDbRows"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => refreshSenderDbTable(true));
    document.getElementById(id)?.addEventListener("change", () => refreshSenderDbTable(true));
  });
  document.getElementById("senderDbPrev")?.addEventListener("click", () => {
    senderDbPage -= 1;
    renderSenderDbRows();
  });
  document.getElementById("senderDbNext")?.addEventListener("click", () => {
    senderDbPage += 1;
    renderSenderDbRows();
  });
}

function loadSenderDatabase() {
  if (senderDbRows.length) {
    senderDbReadyCallbacks.splice(0).forEach((callback) => callback());
    return;
  }

  const localRows = Array.isArray(window.SENDER_ID_DATABASE) ? window.SENDER_ID_DATABASE : [];
  senderDbRows = localRows
    .map((row) => ({
      senderId: String(row.senderId || "").trim(),
      supplierName: String(row.supplierName || "").trim(),
      category: String(row.category || "").trim(),
      operator: String(row.operator || "").trim(),
      content: String(row.content || "").trim(),
    }))
    .filter((row) => row.senderId && row.senderId !== "Sender ID");

  if (!senderDbRows.length) {
    setSenderDbStatus("Local sender database file not found");
    return;
  }

  senderDbReadyCallbacks.splice(0).forEach((callback) => callback());
}

function initSenderDatabase() {
  senderDbBound = false;
  bindSenderDbControls();
  senderDbReadyCallbacks.push(() => {
    hydrateSenderDbFilters();
    updateSenderDbStats();
    refreshSenderDbTable(true);
  });
  loadSenderDatabase();
}

function buildSenderReadinessGroups() {
  const groups = new Map();
  senderDbRows.forEach((row) => {
    if (!groups.has(row.senderId)) {
      groups.set(row.senderId, {
        senderId: row.senderId,
        categories: new Set(),
        operators: new Map(senderDbOperators.map((operator) => [operator, new Set()])),
      });
    }
    const group = groups.get(row.senderId);
    if (row.category) group.categories.add(row.category);
    if (!group.operators.has(row.operator)) group.operators.set(row.operator, new Set());
    if (row.supplierName) group.operators.get(row.operator).add(row.supplierName);
  });
  return [...groups.values()].sort((a, b) => a.senderId.localeCompare(b.senderId));
}

function fillReadinessCategorySelect(id, groups) {
  const select = document.getElementById(id);
  if (!select) return;
  const categories = [...new Set(groups.flatMap((group) => [...group.categories]))].sort((a, b) => a.localeCompare(b));
  select.innerHTML = `<option value="">All Category</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
}

function filterReadinessGroups(groups, searchId, categoryId) {
  const rawQuery = document.getElementById(searchId)?.value || "";
  const queries = rawQuery
    .split(/[\n,;]+/)
    .map((value) => normalizeFilterValue(value))
    .filter(Boolean);
  const category = document.getElementById(categoryId)?.value || "";
  return groups.filter((group) => {
    const supplierText = [...group.operators.values()].flatMap((suppliers) => [...suppliers]).join(" ");
    const haystack = normalizeFilterValue(`${group.senderId} ${supplierText}`);
    const senderKey = normalizeFilterValue(group.senderId);
    const queryMatch = !queries.length || queries.some((query) => senderKey.includes(query) || haystack.includes(query));
    return queryMatch && (!category || group.categories.has(category));
  });
}

function renderSidReadinessRows(groups) {
  const tbody = document.getElementById("sidReadyTbody");
  const status = document.getElementById("sidReadyStatus");
  if (!tbody) return;
  tbody.innerHTML = groups.length
    ? groups
        .map(
          (group) => `
            <tr>
              <td>${escapeHtml(group.senderId)}</td>
              ${senderDbOperators
                .map((operator) => {
                  const ready = group.operators.get(operator)?.size > 0;
                  return `<td><span class="sid-ready-pill ${ready ? "ready" : "not-ready"}">${ready ? "Ready" : "Not Ready"}</span></td>`;
                })
                .join("")}
            </tr>
          `,
        )
        .join("")
    : '<tr><td colspan="6">No readiness data found</td></tr>';
  if (status) status.textContent = `${groups.length.toLocaleString("en-US")} unique Sender ID shown`;
}

function renderSupplierReadinessRows(groups) {
  const tbody = document.getElementById("supplierReadyTbody");
  const status = document.getElementById("supplierReadyStatus");
  if (!tbody) return;
  tbody.innerHTML = groups.length
    ? groups
        .map(
          (group) => `
            <tr>
              <td>${escapeHtml(group.senderId)}</td>
              ${senderDbOperators
                .map((operator) => {
                  const suppliers = [...(group.operators.get(operator) || [])].sort((a, b) => a.localeCompare(b));
                  return `<td>${
                    suppliers.length
                      ? suppliers.map((supplier) => `<span class="supplier-ready-pill">${escapeHtml(supplier)}</span>`).join("")
                      : '<span class="supplier-empty-dot"></span>'
                  }</td>`;
                })
                .join("")}
            </tr>
          `,
        )
        .join("")
    : '<tr><td colspan="6">No supplier readiness data found</td></tr>';
  if (status) status.textContent = `${groups.length.toLocaleString("en-US")} unique Sender ID shown`;
}

function initSidReadiness() {
  senderDbReadyCallbacks.push(() => {
    const groups = buildSenderReadinessGroups();
    fillReadinessCategorySelect("sidReadyCategory", groups);
    const render = () => renderSidReadinessRows(filterReadinessGroups(groups, "sidReadySearch", "sidReadyCategory"));
    document.getElementById("sidReadySearch")?.addEventListener("input", render);
    document.getElementById("sidReadyCategory")?.addEventListener("change", render);
    render();
  });
  loadSenderDatabase();
}

function initSupplierReadiness() {
  senderDbReadyCallbacks.push(() => {
    const groups = buildSenderReadinessGroups();
    fillReadinessCategorySelect("supplierReadyCategory", groups);
    const render = () => renderSupplierReadinessRows(filterReadinessGroups(groups, "supplierReadySearch", "supplierReadyCategory"));
    document.getElementById("supplierReadySearch")?.addEventListener("input", render);
    document.getElementById("supplierReadyCategory")?.addEventListener("change", render);
    render();
  });
  loadSenderDatabase();
}

let snapshotChart = null;

function renderSnapshotChart() {
  const canvas = document.getElementById("snapshotChart");
  if (!canvas || typeof Chart === "undefined") return;

  if (snapshotChart) {
    snapshotChart.destroy();
    snapshotChart = null;
  }

  const labels = Array.from({ length: 160 }, (_, index) => {
    const hour = 10 + Math.floor(index / 20);
    const minute = (44 + index) % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  });

  const smsCount = labels.map((_, index) => {
    if (index < 42) return randomInt(55, 225);
    if (index > 132) return randomInt(95, 165);
    return randomInt(5, 60);
  });
  const noDr = labels.map((_, index) => {
    const base = index < 42 ? randomInt(5, 18) : index > 132 ? randomInt(7, 20) : randomInt(0, 16);
    return clamp(base + randomInt(-4, 7), 0, 28);
  });
  const delivered = labels.map((_, index) => {
    const dip = index % 31 === 0 ? randomInt(55, 72) : randomInt(80, 98);
    return clamp(dip + randomInt(-8, 6), 45, 100);
  });

  snapshotChart = new Chart(canvas, {
    data: {
      labels,
      datasets: [
        {
          type: "line",
          label: "sms count",
          data: smsCount,
          borderColor: "#9ca3af",
          backgroundColor: "rgba(156,163,175,0.22)",
          borderWidth: 1,
          pointRadius: 0,
          tension: 0,
          yAxisID: "y",
        },
        {
          type: "line",
          label: "% No DR",
          data: noDr,
          borderColor: "#b91c1c",
          backgroundColor: "rgba(185,28,28,0.12)",
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.15,
          yAxisID: "y1",
        },
        {
          type: "line",
          label: "% Delivered",
          data: delivered,
          borderColor: "#00008b",
          backgroundColor: "rgba(0,0,139,0.1)",
          borderWidth: 4,
          pointRadius: 0,
          tension: 0.15,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { color: "rgba(100,116,139,0.25)" },
          ticks: {
            color: "#5b6475",
            maxTicksLimit: 18,
            maxRotation: 55,
            minRotation: 55,
          },
        },
        y: {
          min: 0,
          max: 250,
          grid: { color: "rgba(22,101,52,0.35)", borderDash: [4, 3] },
          ticks: { color: "#5b6475" },
        },
        y1: {
          position: "right",
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false },
          ticks: { color: "#5b6475" },
          title: { display: true, text: "%", color: "#111827" },
        },
      },
    },
  });
}

window.renderSnapshotChart = renderSnapshotChart;

let customReportCharts = [];

function destroyCustomReportCharts() {
  customReportCharts.forEach((chart) => chart.destroy());
  customReportCharts = [];
}

function createReportChart(canvasId, labels, smsCount, deliveredCount, undeliveredCount, sentCount) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === "undefined") return;

  const sentPercent = sentCount.map((value, index) => Math.round((value / Math.max(1, smsCount[index])) * 100));
  const deliveredPercent = deliveredCount.map((value, index) => Math.round((value / Math.max(1, smsCount[index])) * 100));
  const undeliveredPercent = undeliveredCount.map((value, index) => Math.round((value / Math.max(1, smsCount[index])) * 100));
  const dlr = deliveredPercent.map((value, index) => clamp(value + sentPercent[index], 0, 100));

  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "sent %", data: sentPercent, borderColor: "#f3b29e", backgroundColor: "transparent", yAxisID: "y1", borderWidth: 3, pointRadius: 3 },
        { label: "delivered %", data: deliveredPercent, borderColor: "#5b8f68", backgroundColor: "transparent", yAxisID: "y1", borderWidth: 3, pointRadius: 3 },
        { label: "undelivered %", data: undeliveredPercent, borderColor: "#3f5fa8", backgroundColor: "transparent", yAxisID: "y1", borderWidth: 3, pointRadius: 3 },
        { label: "DLR / DR %", data: dlr, borderColor: "#67267d", backgroundColor: "transparent", yAxisID: "y1", borderWidth: 4, pointRadius: 4 },
        { label: "sms count", data: smsCount, borderColor: "#f2d21b", backgroundColor: "transparent", yAxisID: "y", borderWidth: 4, pointRadius: 4 },
        { label: "sent count", data: sentCount, borderColor: "#a92222", backgroundColor: "transparent", yAxisID: "y", borderWidth: 4, pointRadius: 4 },
        { label: "delivered count", data: deliveredCount, borderColor: "#008000", backgroundColor: "transparent", yAxisID: "y", borderWidth: 4, pointRadius: 4 },
        { label: "undelivered count", data: undeliveredCount, borderColor: "#00008b", backgroundColor: "transparent", yAxisID: "y", borderWidth: 4, pointRadius: 4 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { boxWidth: 34, color: "#4b5563", font: { size: 12, weight: "700" } },
        },
      },
      scales: {
        x: { grid: { color: "rgba(100,116,139,0.2)" }, ticks: { color: "#6b7280", maxRotation: 45, minRotation: 0 } },
        y: { beginAtZero: true, grid: { color: "rgba(100,116,139,0.24)" }, ticks: { color: "#6b7280" } },
        y1: { position: "right", min: 0, max: 100, grid: { drawOnChartArea: false }, ticks: { color: "#6b7280" } },
      },
    },
  });
  customReportCharts.push(chart);
}

function createHourlyComparisonChart() {
  const canvas = document.getElementById("reportHourlyComparisonChart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = ["23", "22", "21", "20", "19", "18", "17", "16", "15", "14", "13", "12", "11", "10", "09", "08", "07", "06", "05", "04", "03", "02", "01", "00"];
  const smsCount = [1225, 948, 957, 745, 630, 955, 1762, 3031, 12221, 12760, 9080, 6340, 6020, 6120, 12140, 11820, 925, 675, 463, 406, 502, 544, 714, 867];
  const oneDayBefore = [883, 824, 558, 474, 396, 581, 709, 1030, 12273, 11860, 5420, 5680, 6020, 5420, 5860, 3270, 2180, 1810, 2320, 1450, 1720, 1540, 824, 883];
  const sevenDaysBefore = [1225, 948, 957, 745, 630, 955, 1762, 3031, 12221, 12760, 9080, 6340, 6020, 7800, 9200, 4200, 3280, 2700, 2200, 1560, 1690, 1580, 900, 1100];

  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "sms count", data: smsCount, borderColor: "#008000", backgroundColor: "transparent", borderWidth: 4, pointRadius: 3, tension: 0.32 },
        { label: "1 day before", data: oneDayBefore, borderColor: "#a92222", backgroundColor: "transparent", borderWidth: 4, pointRadius: 3, tension: 0.32 },
        { label: "7 days before", data: sevenDaysBefore, borderColor: "#00008b", backgroundColor: "transparent", borderWidth: 4, pointRadius: 3, tension: 0.32 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { boxWidth: 34, color: "#4b5563", font: { size: 12, weight: "700" } },
        },
      },
      scales: {
        x: { reverse: true, grid: { color: "rgba(100,116,139,0.22)" }, ticks: { color: "#6b7280" } },
        y: { position: "right", beginAtZero: true, max: 16000, grid: { color: "rgba(100,116,139,0.24)" }, ticks: { color: "#6b7280" } },
      },
    },
  });
  customReportCharts.push(chart);
}

function renderCustomReportCharts() {
  destroyCustomReportCharts();
  createReportChart(
    "reportHourlyChart",
    ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"],
    [720, 620, 540, 510, 380, 420, 560, 680, 11800, 11047, 6568, 6325, 3167, 2288, 2414, 2597, 4868, 12430, 258],
    [420, 380, 320, 300, 260, 280, 390, 450, 9992, 14813, 5750, 5533, 2767, 2035, 2171, 2253, 4163, 4809, 208],
    [200, 180, 150, 120, 90, 110, 130, 170, 1311, 2162, 627, 580, 301, 201, 190, 244, 456, 5476, 18],
    [80, 62, 45, 45, 30, 34, 55, 80, 458, 769, 193, 224, 99, 52, 55, 102, 251, 2145, 32],
  );
  createReportChart(
    "reportDailyChart",
    Array.from({ length: 20 }, (_, index) => `2026-05-${String(index + 1).padStart(2, "0")}`),
    [128000, 100000, 98000, 106000, 99000, 96000, 90000, 101000, 88000, 84000, 101000, 99000, 108000, 91000, 92000, 86000, 81000, 92265, 86140, 69614],
    [75000, 69000, 67000, 74000, 70000, 68000, 69000, 80000, 70000, 66000, 82000, 79000, 91000, 63800, 74000, 70000, 66863, 75356, 70374, 58730],
    [45000, 30000, 32000, 29000, 26000, 27000, 24000, 22000, 24000, 24000, 21000, 22000, 16000, 24580, 19283, 18039, 18455, 22166, 19256, 11906],
    [6000, 3500, 3600, 3700, 3200, 3400, 2800, 2500, 3200, 2800, 4600, 4000, 5300, 4639, 1678, 1180, 1328, 147, 758, 4489],
  );
  createReportChart(
    "reportWeeklyChart",
    ["2026-W18", "2026-W19", "2026-W20", "2026-W21"],
    [498764, 556420, 612840, 478215],
    [409775, 451260, 488750, 397112],
    [72105, 85050, 97170, 62873],
    [16884, 20110, 26920, 18230],
  );
  createReportChart(
    "reportMonthlyChart",
    ["2026 January", "2026 March", "2026 April", "2026 May"],
    [16852, 14, 610969, 1900013],
    [16848, 3, 202501, 1455857],
    [0, 4, 390302, 412710],
    [2, 0, 8682, 75629],
  );
  createHourlyComparisonChart();
  updateCustomReportPeriod();
}

window.renderCustomReportCharts = renderCustomReportCharts;

function updateCustomReportPeriod() {
  const selected = document.getElementById("customReportPeriod")?.value || "Daily";
  document.querySelectorAll(".report-period-view").forEach((section) => {
    section.classList.toggle("active", section.dataset.reportPeriod === selected);
  });

  customReportCharts.forEach((chart) => chart.resize());
}

window.updateCustomReportPeriod = updateCustomReportPeriod;

let businessOverviewChart = null;
let businessPickerMonth = new Date(2026, 4, 1);
let businessPickerStart = new Date(2026, 4, 1);
let businessPickerEnd = new Date(2026, 4, 21);

function formatBusinessDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function parseBusinessDate(value) {
  const [day, month, year] = String(value || "").split("/").map(Number);
  return new Date(year, month - 1, day);
}

function sameBusinessDay(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBusinessDateBetween(date, start, end) {
  if (!start || !end) return false;
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return day >= start.getTime() && day <= end.getTime();
}

function syncBusinessDateInput() {
  const input = document.getElementById("businessDateRange");
  if (!input || !businessPickerStart || !businessPickerEnd) return;
  input.value = `${formatBusinessDate(businessPickerStart)} - ${formatBusinessDate(businessPickerEnd)}`;
}

function readBusinessDateInput() {
  const rangeValue = document.getElementById("businessDateRange")?.value || "01/05/2026 - 21/05/2026";
  const [fromRaw, untilRaw] = rangeValue.split("-").map((value) => value.trim());
  const fromDate = parseBusinessDate(fromRaw);
  const untilDate = parseBusinessDate(untilRaw);
  if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(untilDate.getTime())) {
    businessPickerStart = fromDate;
    businessPickerEnd = untilDate;
    businessPickerMonth = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  }
}

function renderBusinessMonth(date) {
  const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const cells = [];

  for (let index = 0; index < 42; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const muted = day.getMonth() !== date.getMonth() ? " muted" : "";
    const selected = sameBusinessDay(day, businessPickerStart) || sameBusinessDay(day, businessPickerEnd) ? " selected" : "";
    const inRange = isBusinessDateBetween(day, businessPickerStart, businessPickerEnd) ? " in-range" : "";
    cells.push(`<button type="button" class="business-day${muted}${selected}${inRange}" data-date="${formatBusinessDate(day)}">${day.getDate()}</button>`);
  }

  return `
    <div class="business-picker-month">
      <div class="business-picker-title">${monthName}</div>
      <div class="business-picker-weekdays">
        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
      </div>
      <div class="business-picker-days">${cells.join("")}</div>
    </div>
  `;
}

function renderBusinessDatePicker() {
  const picker = document.getElementById("businessDatePicker");
  if (!picker) return;
  const nextMonth = new Date(businessPickerMonth.getFullYear(), businessPickerMonth.getMonth() + 1, 1);
  picker.innerHTML = `
    <div class="business-picker-nav">
      <button type="button" data-picker-nav="-12">&laquo;</button>
      <button type="button" data-picker-nav="-1">&lsaquo;</button>
      <span></span>
      <button type="button" data-picker-nav="1">&rsaquo;</button>
      <button type="button" data-picker-nav="12">&raquo;</button>
    </div>
    <div class="business-picker-calendars">
      ${renderBusinessMonth(businessPickerMonth)}
      ${renderBusinessMonth(nextMonth)}
    </div>
  `;
}

function initBusinessDateRangePicker() {
  const input = document.getElementById("businessDateRange");
  const picker = document.getElementById("businessDatePicker");
  if (!input || !picker || input.dataset.bound === "true") return;

  input.dataset.bound = "true";
  readBusinessDateInput();
  renderBusinessDatePicker();

  input.addEventListener("click", () => {
    readBusinessDateInput();
    renderBusinessDatePicker();
    picker.classList.toggle("active");
  });

  picker.addEventListener("click", (event) => {
    const nav = event.target.closest("[data-picker-nav]");
    const day = event.target.closest("[data-date]");

    if (nav) {
      businessPickerMonth = new Date(businessPickerMonth.getFullYear(), businessPickerMonth.getMonth() + Number(nav.dataset.pickerNav), 1);
      renderBusinessDatePicker();
      return;
    }

    if (!day) return;
    const selectedDate = parseBusinessDate(day.dataset.date);
    if (!businessPickerStart || (businessPickerStart && businessPickerEnd)) {
      businessPickerStart = selectedDate;
      businessPickerEnd = null;
      renderBusinessDatePicker();
      return;
    }

    businessPickerEnd = selectedDate;
    if (businessPickerEnd < businessPickerStart) {
      [businessPickerStart, businessPickerEnd] = [businessPickerEnd, businessPickerStart];
    }
    syncBusinessDateInput();
    renderBusinessDatePicker();
    picker.classList.remove("active");
    renderBusinessOverview();
  });

  document.addEventListener("click", (event) => {
    if (!picker.classList.contains("active")) return;
    if (event.target === input || picker.contains(event.target)) return;
    picker.classList.remove("active");
  });
}

function getBusinessDateLabels() {
  const rangeValue = document.getElementById("businessDateRange")?.value || "01/05/2026 - 21/05/2026";
  const [fromRaw, untilRaw] = rangeValue.split("-").map((value) => value.trim());
  const fromDate = parseBusinessDate(fromRaw);
  const untilDate = parseBusinessDate(untilRaw);
  const labels = [];

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(untilDate.getTime()) || fromDate > untilDate) {
    return Array.from({ length: 21 }, (_, index) => `${index + 1} May`);
  }

  const cursor = new Date(fromDate);
  while (cursor <= untilDate && labels.length < 45) {
    labels.push(cursor.toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
    cursor.setDate(cursor.getDate() + 1);
  }

  return labels;
}

function createBusinessTrafficSeries(labels) {
  return labels.reduce(
    (series, _, index) => {
      const wave = Math.sin(index / 2.7) * 5;
      const delivered = Math.round(78 + wave + (index % 6 === 0 ? -5 : 4));
      const sent = Math.round(7 + Math.sin(index / 3.3) * 2 + (index % 8 === 0 ? 1 : 0));
      const undelivered = Math.max(2, 100 - delivered - sent);

      series.sent.push(sent);
      series.delivered.push(Math.min(92, Math.max(64, delivered)));
      series.undelivered.push(Math.min(28, undelivered));
      return series;
    },
    { sent: [], delivered: [], undelivered: [] },
  );
}

function renderBusinessOverview() {
  initBusinessDateRangePicker();
  const canvas = document.getElementById("businessOverviewChart");
  if (canvas && typeof Chart !== "undefined") {
    if (businessOverviewChart) {
      businessOverviewChart.destroy();
      businessOverviewChart = null;
    }

    const labels = getBusinessDateLabels();
    const traffic = createBusinessTrafficSeries(labels);

    businessOverviewChart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Sent",
            data: traffic.sent,
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245,158,11,0.12)",
            borderWidth: 3,
            pointRadius: 3,
            tension: 0.32,
          },
          {
            label: "Delivered",
            data: traffic.delivered,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.12)",
            borderWidth: 3,
            pointRadius: 3,
            tension: 0.32,
            fill: true,
          },
          {
            label: "Undelivered",
            data: traffic.undelivered,
            borderColor: "#ef4444",
            backgroundColor: "rgba(239,68,68,0.08)",
            borderWidth: 3,
            pointRadius: 3,
            tension: 0.32,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 0, right: 4, bottom: 0, left: 0 },
        },
        plugins: {
          legend: {
            labels: { color: getComputedStyle(document.documentElement).getPropertyValue("--text").trim(), font: { weight: "800" } },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(100,116,139,0.18)" },
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue("--text").trim(),
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: "rgba(100,116,139,0.18)" },
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue("--text").trim(),
              callback: (value) => `${value}%`,
            },
          },
        },
      },
    });
  }

  renderOperators();
}

window.renderBusinessOverview = renderBusinessOverview;

function downloadTableCsv(tableId, filename = "export.csv") {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = Array.from(table.querySelectorAll("tr"));
  const csv = rows
    .map((row) =>
      Array.from(row.children)
        .map((cell) => {
          const value = cell.innerText.replace(/\s+/g, " ").trim().replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

window.downloadTableCsv = downloadTableCsv;

const reconcileClientRows = [
  { date: "2026-05-21", client: "GOT_OTP", account: "Cms_Wagen_OTP", product: "OTP", telco: "Three", parts: 101, price: 265, usage: 26765 },
  { date: "2026-05-21", client: "GOT_OTP", account: "Cms_Wagen_OTP", product: "OTP", telco: "XL", parts: 149, price: 270, usage: 40230 },
  { date: "2026-05-21", client: "YULORE_HTTP", account: "YULORE_SMPP", product: "OTP", telco: "Three", parts: 236, price: 255, usage: 60180 },
  { date: "2026-05-21", client: "YULORE_HTTP", account: "YULORE_SMPP", product: "OTP", telco: "Indosat", parts: 75, price: 250, usage: 18750 },
  { date: "2026-05-22", client: "YULORE_HTTP", account: "YULORE_SMPP", product: "OTP", telco: "XL", parts: 144, price: 270, usage: 38880 },
  { date: "2026-05-21", client: "SF_A2P_2", account: "SF_A2P_2", product: "Marketing", telco: "Three", parts: 186, price: 240, usage: 44640 },
  { date: "2026-05-21", client: "SF_A2P_2", account: "SF_A2P_2", product: "Marketing", telco: "Indosat", parts: 119, price: 245, usage: 29155 },
  { date: "2026-05-21", client: "SF_A2P_2", account: "SF_A2P_2", product: "Marketing", telco: "Telkomsel", parts: 545, price: 260, usage: 141700 },
  { date: "2026-05-21", client: "Sahridaya_Dom", account: "Sahridaya_WAGEN", product: "OTP", telco: "Three", parts: 8, price: 230, usage: 1840 },
  { date: "2026-05-21", client: "Sahridaya_Dom", account: "Sahridaya_Dom", product: "OTP", telco: "Telkomsel", parts: 3, price: 260, usage: 780 },
];

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let j = 0; j < 8; j += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    table[i] = crc >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
}

function writeString(view, offset, value) {
  for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function createZipBlob(files) {
  const encoder = new TextEncoder();
  const now = dosDateTime();
  const prepared = files.map((file) => {
    const nameBytes = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    return { ...file, nameBytes, data, crc: crc32(data) };
  });

  const localSize = prepared.reduce((sum, file) => sum + 30 + file.nameBytes.length + file.data.length, 0);
  const centralSize = prepared.reduce((sum, file) => sum + 46 + file.nameBytes.length, 0);
  const endSize = 22;
  const buffer = new ArrayBuffer(localSize + centralSize + endSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const central = [];
  let offset = 0;

  prepared.forEach((file) => {
    const localOffset = offset;
    view.setUint32(offset, 0x04034b50, true); offset += 4;
    view.setUint16(offset, 20, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, now.time, true); offset += 2;
    view.setUint16(offset, now.day, true); offset += 2;
    view.setUint32(offset, file.crc, true); offset += 4;
    view.setUint32(offset, file.data.length, true); offset += 4;
    view.setUint32(offset, file.data.length, true); offset += 4;
    view.setUint16(offset, file.nameBytes.length, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    bytes.set(file.nameBytes, offset); offset += file.nameBytes.length;
    bytes.set(file.data, offset); offset += file.data.length;
    central.push({ file, localOffset });
  });

  const centralOffset = offset;
  central.forEach(({ file, localOffset }) => {
    view.setUint32(offset, 0x02014b50, true); offset += 4;
    view.setUint16(offset, 20, true); offset += 2;
    view.setUint16(offset, 20, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, now.time, true); offset += 2;
    view.setUint16(offset, now.day, true); offset += 2;
    view.setUint32(offset, file.crc, true); offset += 4;
    view.setUint32(offset, file.data.length, true); offset += 4;
    view.setUint32(offset, file.data.length, true); offset += 4;
    view.setUint16(offset, file.nameBytes.length, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint32(offset, 0, true); offset += 4;
    view.setUint32(offset, localOffset, true); offset += 4;
    bytes.set(file.nameBytes, offset); offset += file.nameBytes.length;
  });

  view.setUint32(offset, 0x06054b50, true); offset += 4;
  view.setUint16(offset, 0, true); offset += 2;
  view.setUint16(offset, 0, true); offset += 2;
  view.setUint16(offset, prepared.length, true); offset += 2;
  view.setUint16(offset, prepared.length, true); offset += 2;
  view.setUint32(offset, offset - centralOffset, true); offset += 4;
  view.setUint32(offset, centralOffset, true); offset += 4;
  view.setUint16(offset, 0, true);

  return new Blob([buffer], { type: "application/zip" });
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function exportReconcileByClientZip() {
  const from = document.getElementById("reconcileFrom")?.value || "2026-05-21";
  const until = document.getElementById("reconcileUntil")?.value || "2026-05-22";
  const filtered = reconcileClientRows.filter((row) => row.date >= from && row.date <= until);
  const grouped = filtered.reduce((acc, row) => {
    acc[row.client] = acc[row.client] || [];
    acc[row.client].push(row);
    return acc;
  }, {});

  const header = ["Date", "Nama Client", "Account", "Product", "Telco", "Parts", "Price", "Usage"];
  const files = Object.entries(grouped).map(([client, rows]) => ({
    name: `${client.replace(/[^a-z0-9_-]+/gi, "_")}.csv`,
    content: [
      header.join(","),
      ...rows.map((row) =>
        [row.date, row.client, row.account, row.product, row.telco, row.parts, row.price, row.usage]
          .map(csvEscape)
          .join(","),
      ),
    ].join("\n"),
  }));

  if (!files.length) return;

  const blob = createZipBlob(files);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reconcile-by-client_${from}_to_${until}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

window.exportReconcileByClientZip = exportReconcileByClientZip;

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
    matchesFilter(normalizeOperatorName(row.operator), filters.operator) &&
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
];

function renderOperatorGrid(opGrid) {
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

function renderOperators() {
  ["operatorGrid", "businessOperatorGrid"].forEach((id) => {
    renderOperatorGrid(document.getElementById(id));
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
  const operatorMetrics = aggregateTrafficRows(sourceRows, (row) => normalizeOperatorName(row.operator));
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
        const deltaCount = sender.today - sender.yesterday;
        const deltaClass = delta >= 0 ? "pos" : "neg";

        return `
          <div class="sender-row ${sender.isLive ? "live-tick" : ""}">
            <div class="sender-client"><span class="sender-dot ${deltaClass}"></span>${formatEntityName(sender.name)}</div>
            <div class="sender-today">${sender.today.toLocaleString()} <span class="mini-delta ${deltaClass}">${deltaCount >= 0 ? "+" : ""}${deltaCount.toLocaleString()}</span></div>
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
