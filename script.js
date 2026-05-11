// ── DARK MODE ──────────────────────────────────────
function toggleDark(el) {
  document.documentElement.setAttribute(
    "data-theme",
    el.checked ? "dark" : "light",
  );
  document.getElementById("toggleIcon").textContent = el.checked ? "🌙" : "☀️";
  updateChartTheme();
}

// ── CLOCK ──────────────────────────────────────────
function updateClock() {
  document.getElementById("clock").textContent = new Date()
    .toTimeString()
    .slice(0, 8);
}
setInterval(updateClock, 1000);
updateClock();

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
            color: tickColor,
            font: { family: "JetBrains Mono", size: 8 },
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

let currentPage = 1;

const rowsPerPage = 10;

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

            <th>Sender</th>

            <th>Supplier</th>

            <th>Account</th>

            <th>Records</th>

            <th>No DR</th>

          </tr>

        </thead>

        <tbody>

          ${detailRows
            .map(
              (d) => `

            <tr>

              <td>${d.sender}</td>

              <td>${d.sup}</td>

              <td>${d.acc}</td>

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

  const totalPages = Math.ceil(times.length / rowsPerPage);

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

    tr.innerHTML = `

      <td>${start + index + 1}</td>

      <td class="td-time">
        ${time}
      </td>

      <td>${totalRecords}</td>

      <td>${detailRows.length}</td>

      <td class="td-nodr ${avgNoDr > 15 ? "high" : "ok"}">

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
  currentPage += direction;

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
if (opGrid) {
  operators.forEach((op) => {
    const el = document.createElement("div");
    el.className = "operator-item";
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
        <span><span class="legend-dot undeliv"></span>Fail <span class="legend-val">${op.undeliv}%</span></span>
      </div>
    `;
    opGrid.appendChild(el);
  });
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
  data.forEach((d) => {
    let level = "low";
    if (d.val >= 80) level = "high";
    else if (d.val >= 40) level = "medium";
    const div = document.createElement("div");
    div.className = "alert-item";
    div.innerHTML = `<div class="alert-dot ${level}"></div><div class="alert-name">${d.name}</div><div class="alert-val">${d.val}%</div>`;
    el.appendChild(div);
  });
}
renderNoDr(senderNoDrData, "senderNoDr");
renderNoDr(gatewayNoDrData, "gatewayNoDr");

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
  data.forEach((d) => {
    const div = document.createElement("div");
    div.className = "perf-item";
    div.innerHTML = `
      <div class="perf-name">${d.name}<div class="perf-pct-trio"><span class="pct-g">${d.g}%</span>·<span class="pct-y">${d.y}%</span>·<span class="pct-r">${d.r}%</span></div></div>
      <div class="perf-bar-wrap"><div class="perf-bar g" style="width:${d.g}%"></div><div class="perf-bar y" style="width:${d.y}%"></div><div class="perf-bar r" style="width:${d.r}%"></div></div>
    `;
    el.appendChild(div);
  });
}
renderPerf(clients, "clientPerf");
renderPerf(suppliers, "supplierPerf");

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
  document.getElementById("filterStatus").value = "active";
  document.getElementById("filterOperator").value = "all";
  document.getElementById("filterAccount").value = "all";
  document.getElementById("filterSender").value = "all";
  document.getElementById("filterSupplier").value = "all";
  document.getElementById("filterGateway").value = "all";
  applyFilter();
}

// ── ⚡ UPDATE DATA SINKRON TIAP 1 MENIT ─────────────────
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
    trafficChart.data.labels.push(timeStr);
    trafficChart.data.labels.shift();
    trafficChart.data.datasets[0].data.push(sms);
    trafficChart.data.datasets[0].data.shift();
    trafficChart.data.datasets[1].data.push(deliv);
    trafficChart.data.datasets[1].data.shift();
    trafficChart.data.datasets[2].data.push(nodr);
    trafficChart.data.datasets[2].data.shift();
    trafficChart.update("none");
  }

  const tbody = document.getElementById("latestTable");
  if (!tbody) return;

  const sender = sendersRT[Math.floor(Math.random() * sendersRT.length)];
  const sup = suppliersRT[Math.floor(Math.random() * suppliersRT.length)];
  const acc = accountsRT[Math.floor(Math.random() * accountsRT.length)];
  const rec = Math.floor(Math.random() * 10) + 1;

  const tr = document.createElement("tr");
  const cls = nodr > 70 ? "high" : "ok";
  tr.onclick = () => showDetail(sender, acc);

  tr.innerHTML = `<td class="td-num">1</td><td class="td-time">${timeStr}</td><td class="sender-col">${sender}</td><td class="sup-col">${sup}</td><td class="acc-col">${acc}</td><td class="td-num">${rec}</td><td class="td-nodr ${cls}">${nodr}%</td>`;

  if (!checkMatch(sender, acc, sup)) {
    tr.style.display = "none";
  }

  tbody.insertBefore(tr, tbody.firstChild);
  if (tbody.children.length > 15) tbody.removeChild(tbody.lastChild);

  let count = 1;
  [...tbody.children].forEach((row) => {
    row.children[0].textContent = count++;
  });
}

setInterval(addLiveData, 60000);

// ── FITUR AUTO-SCROLL ──
let isAutoScrollEnabled = true;
function toggleAutoScroll(el) {
  isAutoScrollEnabled = el.checked;
  document.getElementById("scrollToggleIcon").textContent = el.checked
    ? "🔄"
    : "⏸️";
}
function initAutoScroll() {
  const panels = document.querySelectorAll(".auto-scroll");
  panels.forEach((panel) => {
    setInterval(() => {
      if (!isAutoScrollEnabled) return;
      panel.scrollTop += 1;
      if (panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1) {
        setTimeout(() => {
          if (isAutoScrollEnabled) panel.scrollTop = 0;
        }, 2000);
      }
    }, 50);
  });
}
window.addEventListener("load", initAutoScroll);
