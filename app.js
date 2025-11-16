// SIGATC Weather App — Versão Front-end SPA
// Inicialização do mapa, zonas de risco, dashboard e previsão

const CENTER = [-16.6869, -49.2648];

// Dados demonstrativos (opção 1: embutidos)
const weatherData = {
  currentConditions: {
    temperature: 21.5,
    precipitation: 0.0,
    humidity: 91,
    windSpeed: 6.2,
    riskLevel: "yellow",
    riskScore: 0.383,
    description: "Risco moderado — instabilidade possível",
    timestamp: "2025-12-01 02:00",
  },
  forecast: [
    { time: "2025-11-30 07:00", temp: 19.9, precip: 0.0, risk: "green" },
    { time: "2025-11-30 08:00", temp: 19.7, precip: 0.0, risk: "green" },
    { time: "2025-11-30 09:00", temp: 20.5, precip: 0.0, risk: "green" },
    { time: "2025-11-30 10:00", temp: 22.1, precip: 0.0, risk: "green" },
    { time: "2025-11-30 11:00", temp: 24.0, precip: 0.0, risk: "green" },
    { time: "2025-11-30 12:00", temp: 25.1, precip: 0.0, risk: "green" },
    { time: "2025-11-30 13:00", temp: 26.3, precip: 0.0, risk: "green" },
    { time: "2025-11-30 14:00", temp: 27.4, precip: 0.0, risk: "green" },
    { time: "2025-11-30 15:00", temp: 28.0, precip: 0.1, risk: "green" },
    { time: "2025-11-30 16:00", temp: 28.8, precip: 0.1, risk: "green" },
    { time: "2025-11-30 17:00", temp: 29.2, precip: 0.2, risk: "green" },
    { time: "2025-11-30 18:00", temp: 29.6, precip: 0.2, risk: "green" },
    { time: "2025-11-30 19:00", temp: 28.4, precip: 0.3, risk: "yellow" },
    { time: "2025-11-30 20:00", temp: 27.2, precip: 0.5, risk: "yellow" },
    { time: "2025-11-30 21:00", temp: 25.9, precip: 0.6, risk: "yellow" },
    { time: "2025-11-30 22:00", temp: 24.4, precip: 0.7, risk: "yellow" },
    { time: "2025-11-30 23:00", temp: 23.3, precip: 0.8, risk: "yellow" },
    { time: "2025-12-01 00:00", temp: 22.2, precip: 0.9, risk: "yellow" },
    { time: "2025-12-01 01:00", temp: 21.7, precip: 1.2, risk: "red" },
    { time: "2025-12-01 02:00", temp: 21.5, precip: 1.5, risk: "red" },
    { time: "2025-12-01 03:00", temp: 21.0, precip: 1.3, risk: "red" },
    { time: "2025-12-01 04:00", temp: 20.6, precip: 0.8, risk: "yellow" },
    { time: "2025-12-01 05:00", temp: 20.2, precip: 0.3, risk: "green" },
    { time: "2025-12-01 06:00", temp: 19.9, precip: 0.0, risk: "green" },
  ],
};

// Zonas de risco
const ZONES = {
  red: [
    { name: "Marginal Botafogo", desc: "Alagamentos severos recorrentes", lat: -16.7103, lng: -49.2539 },
    { name: "Av. Feira de Santana", desc: "Transbordamento do Córrego Serrinha", lat: -16.6731, lng: -49.2394 },
    { name: "Avenida 87 (Setor Sul)", desc: "Histórico de vias bloqueadas", lat: -16.7072, lng: -49.2706 },
    { name: "Vila Redenção", desc: "Alagamentos do Córrego Botafogo", lat: -16.7289, lng: -49.2656 },
    { name: "Residencial Goiânia Viva", desc: "Enxurradas recorrentes", lat: -16.6569, lng: -49.3031 },
    { name: "Pedro Ludovico", desc: "Inundação intensa", lat: -16.7267, lng: -49.2967 },
    { name: "Parque Industrial João Braz", desc: "Risco elevado", lat: -16.7439, lng: -49.3111 },
    { name: "Setor Finsocial", desc: "Enchentes crônicas", lat: -16.6872, lng: -49.3097 },
  ],
  yellow: [
    { name: "Centro — Av. Paranaíba", desc: "Alagamentos em pancadas rápidas", lat: -16.6789, lng: -49.2553 },
    { name: "Ginásio Rio Vermelho", desc: "Episódios de alagamento", lat: -16.6992, lng: -49.2650 },
    { name: "Av. Dona Gercina Borges", desc: "Enxurradas moderadas", lat: -16.6900, lng: -49.2789 },
    { name: "Alameda dos Buritis", desc: "Incidência média", lat: -16.6911, lng: -49.2656 },
    { name: "Bairro Feliz", desc: "Invasões d'água repetidas", lat: -16.7011, lng: -49.2817 },
    { name: "Av. José Rodrigues", desc: "Situações moderadas", lat: -16.6722, lng: -49.2392 },
    { name: "Av. Anhanguera", desc: "Tráfego prejudicado", lat: -16.7056, lng: -49.2686 },
  ],
  green: [
    { name: "Região Norte", desc: "Baixo risco", lat: -16.6450, lng: -49.2700 },
    { name: "Região Leste", desc: "Risco mínimo", lat: -16.6800, lng: -49.2200 },
    { name: "Cidade Jardim", desc: "Ocorrência menos frequente", lat: -16.7200, lng: -49.2400 },
    { name: "Mendanha", desc: "Baixa intensidade", lat: -16.7400, lng: -49.2800 },
    { name: "Setor Sudoeste", desc: "Risco mínimo", lat: -16.7500, lng: -49.2900 },
  ],
};

// Mapa Leaflet
let map;
let tileLayer;

function initMap() {
  map = L.map("map", {
    center: CENTER,
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
    zoomControl: true,
  });

  tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    crossOrigin: true,
    updateWhenIdle: true,
  });

  tileLayer.on("load", () => hideMapLoading());
  tileLayer.on("tileerror", () => showTileError());
  tileLayer.addTo(map);

  L.control.scale({ position: "bottomleft" }).addTo(map);

  document.getElementById("retryTiles").addEventListener("click", () => {
    hideTileError();
    tileLayer.redraw();
  });

  addRiskZones();

  // Acessibilidade: teclas de zoom e setas para previsão
  window.addEventListener("keydown", (ev) => {
    const k = ev.key;
    if (k === "+" || k === "=") map.zoomIn();
    if (k === "-" || k === "_") map.zoomOut();
  });
}

function showMapLoading() {
  const el = document.getElementById("mapLoading");
  el.setAttribute("aria-hidden", "false");
  el.classList.remove("hidden");
}
function hideMapLoading() {
  const el = document.getElementById("mapLoading");
  el.setAttribute("aria-hidden", "true");
  el.classList.add("hidden");
}
function showTileError() {
  document.getElementById("mapError").classList.remove("hidden");
}
function hideTileError() {
  document.getElementById("mapError").classList.add("hidden");
}

// Zonas de risco com círculos e padrões de borda (simulação de acessibilidade)
function addRiskZones() {
  // Vermelho — raio 300m
  ZONES.red.forEach((z) => {
    const c = L.circle([z.lat, z.lng], {
      radius: 300,
      color: getCssVar("--red-stroke"),
      weight: 2,
      dashArray: "6,4",
      fillColor: getCssVar("--red"),
      fillOpacity: 0.3,
    });
    c.bindPopup(zonePopupHTML(z, "ALTO", "red"), { offset: [0, -6] });
    c.addTo(map).on("click", () => map.setView([z.lat, z.lng], 15));
  });

  // Amarelo — raio 250m
  ZONES.yellow.forEach((z) => {
    const c = L.circle([z.lat, z.lng], {
      radius: 250,
      color: getCssVar("--yellow-stroke"),
      weight: 2,
      dashArray: "1,6",
      fillColor: getCssVar("--yellow"),
      fillOpacity: 0.25,
    });
    c.bindPopup(zonePopupHTML(z, "MODERADO", "yellow"), { offset: [0, -6] });
    c.addTo(map).on("click", () => map.setView([z.lat, z.lng], 15));
  });

  // Verde — raio 400m
  ZONES.green.forEach((z) => {
    const c = L.circle([z.lat, z.lng], {
      radius: 400,
      color: getCssVar("--green-stroke"),
      weight: 2,
      fillColor: getCssVar("--green"),
      fillOpacity: 0.2,
    });
    c.bindPopup(zonePopupHTML(z, "BAIXO", "green"), { offset: [0, -6] });
    c.addTo(map).on("click", () => map.setView([z.lat, z.lng], 15));
  });
}

function zonePopupHTML(z, levelText, levelColor) {
  const badgeClass = levelColor === "red" ? "badge-red" : levelColor === "yellow" ? "badge-yellow" : "badge-green";
  return `
    <div role="dialog" aria-label="Zona de risco">
      <div style="display:flex;align-items:center;gap:8px;">
        <span aria-hidden="true">💧</span>
        <strong style="font-size:16px;">${z.name}</strong>
      </div>
      <div style="margin-top:6px;">
        <span class="badge ${badgeClass}">RISCO ${levelText}</span>
      </div>
      <p style="margin-top:6px;">${z.desc}</p>
    </div>
  `;
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Dashboard e risco
function initDashboard() {
  const c = weatherData.currentConditions;
  document.getElementById("currentTemp").textContent = `${c.temperature.toFixed(1)}°C`;
  document.getElementById("currentTime").textContent = formatBRDateTime(c.timestamp);
  document.getElementById("mPrecip").textContent = `${c.precipitation.toFixed(1)} mm`;
  document.getElementById("mHumidity").textContent = `${c.humidity}%`;
  document.getElementById("mWind").textContent = `${c.windSpeed.toFixed(1)} km/h`;
  document.getElementById("riskDesc").textContent = c.description;

  const badge = document.getElementById("riskBadge");
  badge.textContent = c.riskLevel === "red" ? "Risco alto" : c.riskLevel === "yellow" ? "Risco moderado" : "Baixo risco";
  badge.className = `badge ${riskToBadgeClass(c.riskLevel)}`;

  const icon = document.getElementById("currentIcon");
  icon.textContent = pickIcon(c);

  const riskLevelText = document.getElementById("riskLevelText");
  riskLevelText.textContent = badge.textContent;
  const riskExplain = document.getElementById("riskExplain");
  riskExplain.textContent = c.description;

  const traffic = document.querySelectorAll(".traffic .light");
  traffic.forEach((t) => (t.style.opacity = 0.35));
  const idx = c.riskLevel === "red" ? 0 : c.riskLevel === "yellow" ? 1 : 2;
  traffic[idx].style.opacity = 1;
}

function riskToBadgeClass(level) {
  if (level === "red") return "badge-red";
  if (level === "yellow") return "badge-yellow";
  return "badge-green";
}

function pickIcon(c) {
  if (c.precipitation >= 1.0) return "🌧";
  if (c.riskLevel === "red") return "⛈";
  if (c.riskLevel === "yellow") return "🌦";
  if (c.humidity > 80) return "☁";
  return "☀";
}

function formatBRDateTime(s) {
  // Entrada: "YYYY-MM-DD HH:mm" → Saída: "DD/MM/YYYY HH:mm"
  const [d, t] = s.split(" ");
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y} ${t}`;
}

// Previsão 24h
function initForecast() {
  const list = document.getElementById("forecastList");
  list.innerHTML = "";
  weatherData.forecast.forEach((f, i) => {
    const item = document.createElement("div");
    item.className = "forecast-item";
    item.tabIndex = 0;
    item.setAttribute("role", "article");
    item.setAttribute("aria-label", `Hora ${formatBRDateTime(f.time)}; Temp ${f.temp.toFixed(1)}°C; Precip ${f.precip.toFixed(1)} mm; Risco ${riskLabelPT(f.risk)}`);

    const miniRiskClass = f.risk === "red" ? "risk-red" : f.risk === "yellow" ? "risk-yellow" : "risk-green";

    item.innerHTML = `
      <div class="hour">${formatBRDateTime(f.time).slice(11)}</div>
      <div class="mini-row"><span class="mini-icon">${forecastIcon(f)}</span><strong>${f.temp.toFixed(1)}°C</strong></div>
      <div class="mini-row"><span>💧 ${f.precip.toFixed(1)} mm</span><span class="mini-risk ${miniRiskClass}">${riskLabelPT(f.risk)}</span></div>
    `;

    item.addEventListener("mouseenter", () => item.classList.add("hover"));
    item.addEventListener("mouseleave", () => item.classList.remove("hover"));
    item.addEventListener("click", () => highlightRiskOnMap(f.risk));
    list.appendChild(item);
  });

  // Navegação por teclado: setas para rolar a lista
  list.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowRight") list.scrollBy({ left: 150, behavior: "smooth" });
    if (ev.key === "ArrowLeft") list.scrollBy({ left: -150, behavior: "smooth" });
  });
}

function forecastIcon(f) {
  if (f.risk === "red") return "⛈";
  if (f.precip >= 1.0) return "🌧";
  if (f.risk === "yellow") return "🌦";
  return "☀";
}

function riskLabelPT(r) {
  if (r === "red") return "Alto";
  if (r === "yellow") return "Moderado";
  return "Baixo";
}

// Destacar zonas no mapa conforme risco clicado
function highlightRiskOnMap(risk) {
  const zoomLevel = risk === "red" ? 13 : risk === "yellow" ? 12 : 11;
  map.setZoom(zoomLevel);
}

// Simular atualização de dados (protótipo)
function simulateUpdate() {
  const c = weatherData.currentConditions;
  const delta = (Math.random() - 0.5) * 1.0;
  c.temperature = Math.max(15, Math.min(40, c.temperature + delta));
  c.precipitation = Math.max(0, c.precipitation + Math.random() * 0.2);
  c.humidity = Math.max(30, Math.min(100, c.humidity + Math.round((Math.random() - 0.5) * 4)));
  c.windSpeed = Math.max(0, c.windSpeed + (Math.random() - 0.5));
  // Recalcular risco simples
  const score = Math.min(1, (c.precipitation / 5) + (c.humidity / 100) * 0.4 + (c.windSpeed / 30) * 0.2);
  c.riskScore = score;
  c.riskLevel = score > 0.6 ? "red" : score > 0.35 ? "yellow" : "green";
  c.description = c.riskLevel === "red" ? "Risco alto — tempestades possíveis" : c.riskLevel === "yellow" ? "Risco moderado — instabilidade possível" : "Baixo risco — tempo relativamente estável";
  const now = new Date();
  c.timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  initDashboard();
}

// Botões
function initActions() {
  const btnRefresh = document.getElementById("btnRefresh");
  btnRefresh.addEventListener("click", () => {
    simulateUpdate();
  });

  const btnLocate = document.getElementById("btnLocate");
  btnLocate.addEventListener("click", () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 14);
        L.marker([latitude, longitude], { title: "Minha localização" }).addTo(map).bindPopup("Minha localização").openPopup();
      },
      () => {
        alert("Não foi possível obter sua localização.");
      }
    );
  });
}

// Inicialização geral
function initializeApp() {
  showMapLoading();
  initMap();
  initDashboard();
  initForecast();
  initActions();
}

document.addEventListener("DOMContentLoaded", initializeApp);