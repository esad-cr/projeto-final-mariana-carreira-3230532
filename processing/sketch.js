// Mostrador 390 x 450: indicador de minutos percorre o contorno arredondado

let blockOutFont; // variável global da fonte
let respiraStart = null;      // Date do início
let lastHourTriggered = null; // última hora em que disparou
let dayColors = [];           // será inicializado em setup()
let escalaDoRelogio = 2;

function preload() {
  // certifica-te que o ficheiro BlockOut.ttf está em "assets/block_out.ttf"
  blockOutFont = loadFont('assets/block_out.ttf');
}

function setup() {
  createCanvas(390, 450);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  frameRate(60);
  textFont(blockOutFont);

  // inicializa paleta de cores após p5 estar pronto
  dayColors = [
    color('#4727FF'), // 00h - 04h
    color('#EECCBB'), // 04h - 08h
    color('#F1731F'), // 08h - 12h
    color('#E03E36'), // 12h - 16h
    color('#BD0D59'), // 16h - 20h
    color('#730662')  // 20h - 24h
  ];
}

function draw() {
  // Hora actual (usa real ou fixa para demo)
  const now = new Date();
  //const now = new Date(2025, 10, 21, 19, 05, 0);
  const hr = now.getHours();
  const minutes = now.getMinutes();
  const sec = now.getSeconds();
  const ms = now.getMilliseconds();
  const day = now.getDate();

  // cada faixa tem 4 horas
  const faixa = floor(hr / 4);
  const corAtual = dayColors[faixa];
  const corSeguinte = dayColors[(faixa + 1) % dayColors.length];

  // progresso dentro da faixa (0..1)
  const progresso = (hr % 4 + minutes / 60 + sec / 3600) / 4;

  // cor interpolada entre atual e seguinte
  const bgColor = lerpColor(corAtual, corSeguinte, progresso);

  // Dimensões do mostrador
  const w = width;
  const h = height;
  const r = 50;
  const inset = 50;

  // --- FUNDO COM DEGRADÊ ANIMADO ---
  drawVerticalGradient(corAtual, bgColor);

  // recorte arredondado por cima
  noStroke();
  fill(255, 0); // transparente
  rect(0, 6, w, h, r);

  // Traço do contorno interior
  stroke(0, 0);
  strokeWeight(3);
  noFill();
  rect(inset, inset, w - inset * 2, h - inset * 2, r);

  // indicador dos minutos
  const minuteProgress = (minutes + (sec + ms / 1000) / 60) / 60;
  const p = pointOnRoundedRect(inset, inset, w - inset * 2, h - inset * 2, r, minuteProgress);
  noStroke();
  fill(255);
  ellipse(p.x, p.y, 25, 25);

  // horas no centro
  fill(255);
  textSize(230);
  text(nf(hr, 2), width / 2, height / 2 - 12);

  // --- LÓGICA DO "RESPIRA" ---
  if (minutes === 0 && hr !== lastHourTriggered) {
    respiraStart = new Date(now.getTime());
    lastHourTriggered = hr;
  }

  let isBreathing = false;
  if (respiraStart !== null) {
    const elapsed = now.getTime() - respiraStart.getTime();
    isBreathing = elapsed < 5 * 60 * 1000;
  }

  if (isBreathing) {
    const t = millis() / 1000;   // tempo do sketch em segundos
    const cycle = 0.5;             // duração de um ciclo inspirar+expirar (s)
    const base = 30;             // tamanho base
    const amplitude = 30;        // amplitude (renomeado de 'amp' para evitar conflito)
    const breatheSize = base + amplitude * sin(TWO_PI * (t / cycle));

    fill(255);
    textSize(breatheSize);
    text("respira", width / 2, height / 1.6 - 180);
  } else {
    respiraStart = null;
  }

  // marcas fixas
  const marks = [0, 0.25, 0.5, 0.75];
  fill(255, 180);
  noStroke();
  for (let i = 0; i < marks.length; i++) {
    const mp = pointOnRoundedRect(inset, inset, w - inset * 2, h - inset * 2, r, marks[i]);
    ellipse(mp.x, mp.y, 20, 20);
  }

  // dia e semana
  const num_dia_semana = new Date().getDay();
  const nomes_dia_semana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  textSize(60);
  textAlign(CENTER, CENTER);
  text(day.toString() + " " + nomes_dia_semana[num_dia_semana], width / 2, 330);
}

// gradiente vertical entre duas cores
function drawVerticalGradient(c1, c2) {
  for (let y = 0; y < height; y++) {
    const inter = map(y, 0, height, 0, 1);
    const c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

// Função auxiliar para calcular ponto no contorno arredondado
function pointOnRoundedRect(x0, y0, w, h, r, t) {
  r = constrain(r, 0, min(w, h) / 2);
  const straightW = max(0, w - 2 * r);
  const straightH = max(0, h - 2 * r);
  const perim = 2 * straightW + 2 * straightH + 2 * PI * r;
  let d = t * perim;

  const cx = x0 + w / 2;
  const left = x0;
  const right = x0 + w;
  const top = y0;
  const bottom = y0 + h;

  const tr_cx = right - r;
  const tr_cy = top + r;
  const br_cx = right - r;
  const br_cy = bottom - r;
  const bl_cx = left + r;
  const bl_cy = bottom - r;
  const tl_cx = left + r;
  const tl_cy = top + r;

  const segTopHalf = straightW / 2;
  const segTopCorner = (PI / 2) * r;
  const segRight = straightH;
  const segBottomCorner = (PI / 2) * r;
  const segBottom = straightW;
  const segBottomLeftCorner = (PI / 2) * r;
  const segLeft = straightH;
  const segTopLeftCorner = (PI / 2) * r;
  const segTopHalf2 = straightW / 2;

  if (d <= segTopHalf) {
    const x = cx + map(d, 0, segTopHalf, 0, (w / 2) - r);
    return { x: x, y: top };
  }
  d -= segTopHalf;

  if (d <= segTopCorner) {
    const ang = map(d, 0, segTopCorner, -90, 0);
    return { x: tr_cx + cos(ang) * r, y: tr_cy + sin(ang) * r };
  }
  d -= segTopCorner;

  if (d <= segRight) {
    return { x: right, y: tr_cy + map(d, 0, segRight, 0, straightH) };
  }
  d -= segRight;

  if (d <= segBottomCorner) {
    const ang = map(d, 0, segBottomCorner, 0, 90);
    return { x: br_cx + cos(ang) * r, y: br_cy + sin(ang) * r };
  }
  d -= segBottomCorner;

  if (d <= segBottom) {
    return { x: (right - r) - map(d, 0, segBottom, 0, straightW), y: bottom };
  }
  d -= segBottom;

  if (d <= segBottomLeftCorner) {
    const ang = map(d, 0, segBottomLeftCorner, 90, 180);
    return { x: bl_cx + cos(ang) * r, y: bl_cy + sin(ang) * r };
  }
  d -= segBottomLeftCorner;

  if (d <= segLeft) {
    return { x: left, y: (bottom - r) - map(d, 0, segLeft, 0, straightH) };
  }
  d -= segLeft;

  if (d <= segTopLeftCorner) {
    const ang = map(d, 0, segTopLeftCorner, 180, 270);
    return { x: tl_cx + cos(ang) * r, y: tl_cy + sin(ang) * r };
  }
  d -= segTopLeftCorner;

  const x = (left + r) + map(d, 0, segTopHalf2, 0, (w / 2) - r);
  return { x: x, y: top };
}

function getPartOfDay(h) {
  if (h >= 4 && h < 8) return '04h - 08h Tranquilidade';
  if (h >= 8 && h < 12) return '08h - 12h Energia';
  if (h >= 12 && h < 16) return '12h - 16h Paixão';
  if (h >= 16 && h < 20) return '16h - 20h Emoção';
  if (h >= 20 && h < 24) return '20h - 00h Mistério';
  return '00h - 04h Serenidade';
}