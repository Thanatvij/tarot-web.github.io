const CATEGORY_LABEL = {
  love: 'ความรัก', study: 'การเรียน', work: 'การทำงาน',
  money: 'การเงิน', general: 'ดวงชะตาภาพรวม'
};

const POSITIONS = [
  { icon: '🔮', title: 'เจ้าชะตา', desc: 'ตัวคุณ บุคลิก พลังงานในตัว' },
  { icon: '🌙', title: 'สถานการณ์', desc: 'สิ่งที่กำลังเผชิญ ปัจจัยรอบข้าง' },
  { icon: '⭐', title: 'บทสรุป', desc: 'ผลลัพธ์ คำชี้แนะ' }
];

const POSITIONS_FUTURE = [
  { icon: '🌅', title: 'อดีต', desc: 'สิ่งที่ผ่านมา ประสบการณ์ที่ส่งผลถึงปัจจุบัน' },
  { icon: '🌙', title: 'ปัจจุบัน', desc: 'สิ่งที่เกิดขึ้นตอนนี้ สถานการณ์ปัจจุบัน' },
  { icon: '✨', title: 'อนาคต', desc: 'สิ่งที่จะเกิดขึ้น 1-3 เดือน แนวโลคที่อาจเป็น' }
];

// Keywords สำหรับ detect คำถามเชิงอนาคต
const FUTURE_KEYWORDS = [
  // คำถามเชิงอนาคต
  'จะ', 'ไหม', 'มั้ย', 'อนาคต', 'หน้า', 'ต่อไป', 'รุ่ง',
  // คำถามเชิงผล/คำตอบ
  'เป้า', 'ทัน', 'ได้', 'เป็นยังไง', 'ผล',
  // คำถามเชิงความเป็นไปได้
  'รอด', 'สำเร็จ', 'ชนะ', 'ไปต่อ', 'แต่ง', 'รับ'
];

let selectedCategory = null;
let userQuestion = '';
let drawnCards = [];
let currentDrawIndex = 0;
let currentSpreadType = 'default'; // 'default' or 'future'
let TAROT_DATA = null; // Will be loaded from tarot-all.json

// ตรวจสอบว่าคำถามเป็นเชิงอนาคตหรือไม่
function isFutureQuestion(question) {
  if (!question) return false;
  const lowerQ = question.toLowerCase();
  return FUTURE_KEYWORDS.some(keyword => lowerQ.includes(keyword));
}

// ดึงตำแหน่งไพ่ตามประเภทคำถาม
function getCurrentPositions() {
  return currentSpreadType === 'future' ? POSITIONS_FUTURE : POSITIONS;
}

function createStarfield() {
  const sf = document.getElementById('starfield');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.2 + 0.5;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDuration = (Math.random() * 3 + 2) + 's';
    s.style.animationDelay = (Math.random() * 5) + 's';
    sf.appendChild(s);
  }
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToCategory() { showSection('section-category'); }

function goToDraw() {
  if (!selectedCategory) return;
  userQuestion = document.getElementById('questionInput').value.trim();

  // Detect ประเภทคำถามและเลือก spread
  currentSpreadType = isFutureQuestion(userQuestion) ? 'future' : 'default';

  drawnCards = [];
  currentDrawIndex = 0;
  buildFan();
  updateDrawStatus();
  showSection('section-draw');
}

function buildFan() {
  if (!TAROT_DATA) {
    console.error('Tarot data not loaded yet');
    return;
  }

  const wrap = document.getElementById('fanWrap');
  wrap.innerHTML = '';

  // Shuffle cards
  const shuffled = [...TAROT_DATA.cards].map(c => c.id);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const totalCards = shuffled.length;

  // Responsive radius & angle spread — คำนวณให้พอดีกับ container height ทุก breakpoint
  const vw = window.innerWidth;
  const radius = vw > 1024 ? 220 : vw > 768 ? 160 : vw > 480 ? 115 : 95;

  // Mobile: ลด angle spread เพื่อไม่ให้เกินจอ
  const angleSpread = vw < 480 ? 100 : 140; // ลดเหลือ 100° บน mobile
  const angleStart = -angleSpread / 2;
  const angleStep = angleSpread / (totalCards - 1);

  shuffled.forEach((cardId, idx) => {
    const angle = angleStart + angleStep * idx;

    const rad = angle * (Math.PI / 180);

    const x = Math.sin(rad) * radius;
    const y = Math.cos(rad) * radius;

    const cardEl = document.createElement('div');
    cardEl.className = 'tarot-card';
    cardEl.dataset.id = cardId;

    // ไพ่ขวา (idx สูง) อยู่บนสุด → มองเห็นเต็มใบ
    cardEl.style.zIndex = idx;

    cardEl.style.setProperty('--rot', angle + 'deg');

    cardEl.style.transform =
      `translate(${x}px, ${-y}px) rotate(${angle}deg)`;

    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">${cardBackSVG()}</div>
      </div>
    `;

    cardEl.addEventListener('click', () => onCardPick(cardEl, cardId));
    wrap.appendChild(cardEl);
  });
}

function cardBackSVG() {
  return `
    <svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#4a1f7a" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#2a0d4a" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#0a0014" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="gold-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd700" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#d4af37" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#ffd700" stop-opacity="0.3"/>
        </linearGradient>
      </defs>

      <!-- Main card background -->
      <rect x="2" y="2" width="56" height="86" rx="4" fill="url(#bg-grad)"
            stroke="#d4af37" stroke-width="0.8"/>

      <!-- Inner decorative border -->
      <rect x="5" y="5" width="50" height="80" rx="2" fill="none"
            stroke="url(#gold-shine)" stroke-width="0.5"/>

      <!-- Center mystical emblem -->
      <g transform="translate(30, 45)">
        <!-- Outer star glow -->
        <circle cx="0" cy="0" r="18" fill="none"
                stroke="#d4af37" stroke-width="0.4" opacity="0.4"/>
        <circle cx="0" cy="0" r="14" fill="none"
                stroke="#d4af37" stroke-width="0.3" opacity="0.3"/>

        <!-- 8-point star -->
        <path d="M 0 -22 L 2.5 -6 L 22 0 L 2.5 6 L 0 22 L -2.5 6 L -22 0 L -2.5 -6 Z"
              fill="#d4af37" opacity="0.9"/>

        <!-- Inner circle with mystical eye -->
        <circle cx="0" cy="0" r="7" fill="#0a0014"
                stroke="#ffd700" stroke-width="0.8"/>
        <ellipse cx="0" cy="0" rx="4" ry="2.3" fill="#ffd700"/>
        <circle cx="0" cy="0" r="1.2" fill="#0a0014"/>

        <!-- Orbital rings -->
        <circle cx="0" cy="0" r="10" fill="none"
                stroke="#ffd700" stroke-width="0.4" opacity="0.5"/>
      </g>

      <!-- Corner decorations -->
      <g fill="#d4af37" opacity="0.65">
        <!-- Top corners -->
        <circle cx="8" cy="10" r="1.2"/>
        <circle cx="52" cy="10" r="1.2"/>
        <!-- Bottom corners -->
        <circle cx="8" cy="80" r="1.2"/>
        <circle cx="52" cy="80" r="1.2"/>
      </g>

      <!-- Mystical symbols -->
      <g fill="#d4af37" opacity="0.5" font-size="5">
        <text x="10" y="16">✧</text>
        <text x="45" y="16">✧</text>
        <text x="10" y="76">✧</text>
        <text x="45" y="76">✧</text>
      </g>

      <!-- Subtle corner accents -->
      <g stroke="#d4af37" stroke-width="0.3" opacity="0.4" fill="none">
        <path d="M 2 8 L 8 2 L 12 2"/>
        <path d="M 58 8 L 52 2 L 48 2"/>
        <path d="M 2 82 L 8 88 L 12 88"/>
        <path d="M 58 82 L 52 88 L 48 88"/>
      </g>

      <!-- Central vertical line -->
      <line x1="30" y1="20" x2="30" y2="70"
            stroke="#d4af37" stroke-width="0.25" opacity="0.25"/>
    </svg>
  `;
}

function onCardPick(cardEl, cardId) {
  if (cardEl.classList.contains('selected')) return;
  if (currentDrawIndex >= 3) return;

  const card = TAROT_DATA.cards.find(c => c.id === cardId);
  drawnCards.push(card);
  cardEl.classList.add('selected');
  currentDrawIndex++;

  if (currentDrawIndex < 3) {
    setTimeout(() => updateDrawStatus(), 400);
  } else {
    setTimeout(() => showResult(), 800);
  }
}

function updateDrawStatus() {
  const positions = getCurrentPositions();
  const pos = positions[currentDrawIndex];
  document.getElementById('drawPosition').textContent =
    `${pos.icon} ใบที่ ${currentDrawIndex + 1}: ${pos.title}`;
  document.getElementById('drawDesc').textContent = pos.desc;
  const dots = document.querySelectorAll('#drawProgress .progress-dot');
  dots.forEach((d, i) => {
    d.className = 'progress-dot';
    if (i < currentDrawIndex) d.classList.add('done');
    else if (i === currentDrawIndex) d.classList.add('active');
  });
}

function showResult() {
  const positions = getCurrentPositions();
  const sub = document.getElementById('resultSubtitle');
  let subText = `หมวด: ${CATEGORY_LABEL[selectedCategory]}`;
  if (userQuestion) subText += ` · "${userQuestion}"`;
  sub.textContent = subText;

  const cardsEl = document.getElementById('selectedCardsDisplay');
  cardsEl.innerHTML = drawnCards.map((card, i) => `
    <div class="selected-card-wrap">
      <div class="selected-card-display">
        <img src="${card.image}" alt="${card.nameEn}" loading="lazy">
      </div>
      <div class="selected-card-name">${card.nameTh}</div>
      <div class="selected-card-name-en">${card.nameEn}</div>
      <div class="position-label">${positions[i].icon} ${positions[i].title}</div>
    </div>
  `).join('');

  const readings = document.getElementById('readingsContainer');
  let html = '';
  drawnCards.forEach((card, i) => {
    // ใช้ meanings ปกติเสมอ (ไม่มี reversed)
    const meaning = card.meanings[selectedCategory];
    html += `
      <div class="reading-block">
        <div class="reading-header">
          <span class="reading-icon">${positions[i].icon}</span>
          <div class="reading-title">${positions[i].title}</div>
          <div class="reading-card-name">
            ${card.nameTh}
            <span class="en">${card.nameEn}</span>
          </div>
        </div>
        <div class="reading-text">${meaning}</div>
      </div>
    `;
  });

  const summary = generateSummary(drawnCards, selectedCategory);
  html += `
    <div class="reading-block reading-summary-block">
      <div class="reading-header">
        <span class="reading-icon">✨</span>
        <div class="reading-title">คำพยากรณ์รวม</div>
      </div>
      <div class="reading-text">${summary}</div>
    </div>
  `;

  readings.innerHTML = html;
  showSection('section-result');
}

function generateSummary(cards, category) {
  let majorCount = 0;
  const suitCount = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
  cards.forEach(c => {
    if (c.arcana === 'major') majorCount++;
    else if (c.suit) suitCount[c.suit]++;
  });

  const parts = [];
  if (majorCount === 3) {
    parts.push('ไพ่ Major Arcana ทั้ง 3 ใบบ่งชี้ว่าช่วงเวลานี้คือจุดเปลี่ยนครั้งสำคัญในชีวิต พลังจักรวาลกำลังขับเคลื่อนเรื่องราวที่ลึกซึ้งและมีความหมายเกินกว่าเรื่องธรรมดา');
  } else if (majorCount === 2) {
    parts.push('ไพ่ Major Arcana 2 ใบสะท้อนว่าช่วงนี้คือจุดเปลี่ยนสำคัญ มีพลังจากเบื้องบนกำลังนำทางคุณ');
  } else if (majorCount === 1) {
    parts.push('ไพ่ Major Arcana 1 ใบที่ปรากฏชี้ว่ามีบทเรียนสำคัญหนึ่งอย่างกำลังเข้ามาในชีวิต');
  } else {
    parts.push('ไพ่ Minor Arcana ทั้งหมดบ่งบอกว่าเรื่องราวขณะนี้เป็นเรื่องในชีวิตประจำวัน ที่คุณมีอำนาจในการกำหนดทิศทางได้ด้วยตนเอง');
  }

  const suitMessages = {
    wands: 'พลังแห่งไฟลุกโชนชัดเจน เรื่องนี้เกี่ยวพันกับความหลงใหล แรงบันดาลใจ และการกระทำที่มีพลัง',
    cups: 'ธาตุน้ำหลั่งไหลเป็นแกนหลัก เรื่องราวนี้สั่นสะเทือนถึงอารมณ์ ความรัก และจิตใจอันลึกซึ้ง',
    swords: 'ลมแห่งความคิดพัดผ่านทุกประเด็น คุณกำลังเผชิญเรื่องที่ต้องใช้ปัญญา การตัดสินใจ และสัจจะ',
    pentacles: 'ธาตุดินมั่นคงโดดเด่น เรื่องนี้แตะถึงรากฐานของชีวิต ทรัพย์สิน หน้าที่การงาน และความมั่นคงทางวัตถุ'
  };

  const dominantSuit = Object.entries(suitCount).find(([s, c]) => c >= 2);
  if (dominantSuit) {
    parts.push(suitMessages[dominantSuit[0]]);
  } else if (Object.values(suitCount).filter(v => v > 0).length >= 2) {
    parts.push('ไพ่จากหลายธาตุปรากฏพร้อมกัน แสดงให้เห็นว่าเรื่องนี้มีหลายมิติเกี่ยวพันกัน ต้องมองหลายด้านและสมดุลพลังงานทั้งหมด');
  }

  const categoryAdvice = {
    love: 'จงเปิดใจรับสัญญาณจากจักรวาล ความรักที่แท้จริงต้องอาศัยทั้งความกล้าหาญและความอ่อนโยน',
    study: 'ความรู้ที่แสวงหาด้วยใจรักจะเปิดประตูสู่ปัญญาที่ลึกซึ้ง อย่าเร่งรีบให้ทุกขั้นตอนได้สอนคุณ',
    work: 'เส้นทางอาชีพคือการเดินทางอันยาวไกล ก้าวที่มั่นคงและซื่อตรงต่อตนเองคือกุญแจสำคัญ',
    money: 'ความมั่งคั่งที่ยั่งยืนเริ่มจากความสมดุลระหว่างการให้และการรับ จงรู้คุณค่าของสิ่งที่มี',
    general: 'จักรวาลกำลังจัดเรียงสิ่งต่างๆ ให้เข้าที่ จงไว้วางใจใจจังหวะของชีวิตและฟังเสียงจากภายใน'
  };
  parts.push(categoryAdvice[category]);

  return parts.join(' ');
}

function resetAll() {
  selectedCategory = null;
  userQuestion = '';
  drawnCards = [];
  currentDrawIndex = 0;
  currentSpreadType = 'default';
  document.getElementById('questionInput').value = '';
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('btnStartDraw').disabled = true;
  showSection('section-landing');
}

// Load tarot data from JSON file
async function loadTarotData() {
  try {
    const response = await fetch('tarot-all.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    TAROT_DATA = await response.json();
    console.log('Tarot data loaded successfully:', TAROT_DATA.cards.length, 'cards');
  } catch (error) {
    console.error('Error loading tarot data:', error);
    // Show error message to user
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: 'Noto Serif Thai', serif; color: #f5e6d3;">
        <h1 style="color: #d4af37; margin-bottom: 20px;">ขออภัย</h1>
        <p style="font-size: 1.2rem;">ไม่สามารถโหลดข้อมูลไพ่ทาโรต์ได้</p>
        <p style="margin-top: 20px; opacity: 0.7;">กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ</p>
      </div>
    `;
  }
}

// ========================
// Share Image Feature
// ========================

// Load image with CORS for canvas
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// Generate share image canvas (1080x1080)
async function generateShareImage() {
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 600));

  const scale = 2;
  const w = 1080, h = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // ===== BACKGROUND =====
  const bg = ctx.createRadialGradient(w/2, h/2, 200, w/2, h/2, 800);
  bg.addColorStop(0, '#2a0047');
  bg.addColorStop(0.5, '#150024');
  bg.addColorStop(1, '#0a0010');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Stars
  const drawStar = (x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.4+0.4})`;
    ctx.fill();
  };
  for (let i = 0; i < 70; i++) {
    drawStar(Math.random()*w, Math.random()*h, Math.random()*1.5+0.5);
  }

  // ===== MOON =====
  const mx = 940, my = 85, mr = 50;
  const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr*3);
  mg.addColorStop(0, 'rgba(255,215,0,0.4)');
  mg.addColorStop(1, 'transparent');
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(mx, my, mr*3, 0, Math.PI*2); ctx.fill();

  const mb = ctx.createRadialGradient(mx-10, my-10, 0, mx, my, mr);
  mb.addColorStop(0, '#ffffd8');
  mb.addColorStop(0.7, '#ffd700');
  mb.addColorStop(1, '#c9a227');
  ctx.fillStyle = mb;
  ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI*2); ctx.fill();

  // ===== HEADER =====
  ctx.save();
  ctx.shadowColor = 'rgba(255,215,0,0.7)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#ffe44d';
  ctx.font = 'bold 60px "Cinzel","Georgia",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('พยากรณ์แห่งดวงดาว', w/2, 72);
  ctx.restore();

  // Divider line
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 105);
  ctx.lineTo(930, 105);
  ctx.stroke();

  // Category badge
  ctx.fillStyle = 'rgba(212,175,55,0.2)';
  ctx.beginPath();
  ctx.roundRect(w/2 - 130, 120, 260, 40, 20);
  ctx.fill();
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 26px "Noto Serif Thai","Thonburi","Microsoft Sans Serif",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(CATEGORY_LABEL[selectedCategory], w/2, 142);

  // ===== CARDS (CENTERED PROPERLY) =====
  const cw = 210;  // Card width
  const ch = 336;  // Card height
  const gap = 35;  // Gap between cards

  // Calculate center position: total width of all cards + gaps
  const totalWidth = (cw * 3) + (gap * 2);
  const startX = (w - totalWidth) / 2;
  const cy = 200;  // Card Y position

  try {
    const imgs = await Promise.all(drawnCards.map(c => loadImage(c.image)));
    const pos = getCurrentPositions();

    imgs.forEach((img, i) => {
      const cx = startX + (i * (cw + gap));

      // Purple glow behind card
      const gg = ctx.createRadialGradient(cx + cw/2, cy + ch/2, 0, cx + cw/2, cy + ch/2, 180);
      gg.addColorStop(0, 'rgba(147,51,234,0.25)');
      gg.addColorStop(1, 'transparent');
      ctx.fillStyle = gg;
      ctx.fillRect(cx - 50, cy - 50, cw + 100, ch + 100);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(cx + 12, cy + 12, cw, ch);

      // Card border - outer gold
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.strokeRect(cx - 3, cy - 3, cw + 6, ch + 6);

      // Card border - inner gold
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cw, ch);

      // Card image
      ctx.drawImage(img, cx, cy, cw, ch);

      // Card name background (bigger to fit text)
      ctx.fillStyle = 'rgba(10,0,20,0.9)';
      ctx.beginPath();
      ctx.roundRect(cx - 12, cy + ch + 8, cw + 24, 40, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(212,175,55,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Card name
      ctx.fillStyle = '#f5e6d3';
      ctx.font = 'bold 20px "Noto Serif Thai","Thonburi","Microsoft Sans Serif",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(drawnCards[i].nameTh, cx + cw/2, cy + ch + 30);

      // Position indicator (moved down more)
      const iy = cy + ch + 62;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 17px "Noto Serif Thai","Thonburi","Microsoft Sans Serif",sans-serif';
      ctx.fillText(`${pos[i].icon} ${pos[i].title}`, cx + cw/2, iy);
    });

    // ===== FOOTER =====
    const fy = h - 75;

    // Top line
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(170, fy);
    ctx.lineTo(910, fy);
    ctx.stroke();

    // Center diamond
    const drawDiamond = (x, y, s) => {
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + s);
      ctx.lineTo(x - s, y);
      ctx.closePath();
      ctx.fill();
    };

    ctx.fillStyle = '#ffd700';
    drawDiamond(w/2, fy, 10);
    ctx.fillStyle = '#d4af37';
    drawDiamond(w/2 - 50, fy, 6);
    drawDiamond(w/2 + 50, fy, 6);

    // Side stars
    drawStar(300, fy, 3);
    drawStar(780, fy, 3);

    // Watermark
    ctx.fillStyle = 'rgba(212,175,55,0.4)';
    ctx.font = '18px "Cinzel","Georgia",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ thanatvij.github.io ✦', w/2, fy + 35);

    // Corner ornaments
    const drawCorner = (x, y, r) => {
      ctx.strokeStyle = 'rgba(212,175,55,0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + r + 5, y);
      ctx.lineTo(x + r + 30, y);
      ctx.moveTo(x, y + r + 5);
      ctx.lineTo(x, y + r + 30);
      ctx.stroke();
    };

    drawCorner(40, 40, 8);
    drawCorner(w-40, 40, 8);
    drawCorner(40, h-40, 8);
    drawCorner(w-40, h-40, 8);

    return canvas;
  } catch (error) {
    console.error('Error generating share image:', error);
    throw error;
  }
}

// Share or download the generated image
async function shareResult() {
  const btn = document.getElementById('btnShare');
  if (!btn) return;

  // Update button state
  const originalText = btn.textContent;
  btn.textContent = 'กำลังสร้างภาพ...';
  btn.disabled = true;

  try {
    const canvas = await generateShareImage();

    // Convert to blob with high quality
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create blob'));
      }, 'image/png', 1.0);
    });

    const fileName = `tarot-${Date.now()}.png`;

    // Check if native share is available (mobile)
    if (navigator.canShare && navigator.share) {
      try {
        const file = new File([blob], fileName, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'พยากรณ์แห่งดวงดาว',
          text: `ผลการอ่านไพ่ทาโรต์ - ${CATEGORY_LABEL[selectedCategory]}`
        });
      } catch (shareError) {
        // If share fails (user cancelled), fallback to download
        console.log('Share cancelled or failed, downloading instead');
        downloadImage(blob, fileName);
      }
    } else {
      // Desktop - download directly
      downloadImage(blob, fileName);
    }
  } catch (error) {
    console.error('Error sharing image:', error);
    alert('ไม่สามารถสร้างภาพได้ กรุณาลองใหม่อีกครั้ง');
  } finally {
    // Restore button state
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// Helper function to download image
function downloadImage(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);

  // Trigger download
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  await loadTarotData();
  createStarfield();
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedCategory = card.dataset.category;
      document.getElementById('btnStartDraw').disabled = false;
    });
  });

  // Setup share button
  const shareBtn = document.getElementById('btnShare');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareResult);
  }
});

// Rebuild fan เมื่อหมุนมือถือ
window.addEventListener('resize', () => {
  if (document.getElementById('section-draw').classList.contains('active')) {
    buildFan();
  }
});