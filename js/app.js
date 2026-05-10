const CATEGORY_LABEL = {
  love: 'ความรัก', study: 'การเรียน', work: 'การทำงาน',
  money: 'การเงิน', general: 'ดวงชะตาภาพรวม'
};

const POSITIONS = [
  { icon: '🔮', title: 'เจ้าชะตา', desc: 'ตัวคุณ บุคลิก พลังงานในตัว' },
  { icon: '🌙', title: 'สถานการณ์', desc: 'สิ่งที่กำลังเผชิญ ปัจจัยรอบข้าง' },
  { icon: '⭐', title: 'บทสรุป', desc: 'ผลลัพธ์ คำชี้แนะ' }
];

let selectedCategory = null;
let userQuestion = '';
let drawnCards = [];
let currentDrawIndex = 0;
let TAROT_DATA = null; // Will be loaded from tarot-all.json

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
  drawnCards = [];
  currentDrawIndex = 0;
  buildFan();
  updateDrawStatus();
  showSection('section-draw');
}

/* ============================================
   CINEMATIC TAROT FAN - Perfectly Symmetrical Spread
   ============================================
   Creates a mathematically perfect symmetrical fan:
   - Middle card(s) act as true center origin (0° angle)
   - Perfect mirroring: equal cards on left and right sides
   - Uniform rotation spacing throughout entire arc
   - Handles odd/even card counts correctly
   - Responsive radius (40-48% of screen width)
   ============================================ */
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

  // ===== FAN GEOMETRY CONSTANTS =====
  const ARC_DEGREES = 110; // Flatter, wider cinematic arc
  const MAX_ROTATION = 55; // Clamp extreme edge rotation

  // Larger radius for flatter, more elegant spread
  const viewportWidth = window.innerWidth;
  const baseRadius = Math.min(
    Math.max(viewportWidth * 0.55, 450),
    Math.max(viewportWidth * 0.60, 700)
  );

  // Card dimensions - smaller to prevent overflow
  const cardWidth = 60;
  const cardHeight = 96;

  // Overlap factor: less than 1.0 creates card overlap
  // 0.65 = 35% overlap between adjacent cards
  const OVERLAP_FACTOR = 0.65;

  // ===== PERFECT SYMMETRY CALCULATION =====
  // Determine center point based on odd/even card count
  const isOddCards = totalCards % 2 !== 0;
  const centerIndex = Math.floor(totalCards / 2);

  // Calculate how many cards on each side
  // For odd: (78-1)/2 = 38 cards on each side + 1 center
  // For even: 78/2 = 39 cards on each side
  const cardsPerSide = Math.floor(totalCards / 2);

  // Calculate angle step - divide total arc by number of gaps between cards
  // For symmetry, we need consistent spacing throughout
  const angleStep = ARC_DEGREES / (totalCards - 1);

  shuffled.forEach((cardId, idx) => {
    // ===== PERFECTLY SYMMETRICAL ANGLE CALCULATION =====
    // Calculate distance from center (always positive)
    let distanceFromCenter;
    let isLeftSide;

    if (isOddCards) {
      // Odd cards: center card at index 'centerIndex' has 0 distance
      // Cards before center are on left side, after center are on right side
      if (idx < centerIndex) {
        distanceFromCenter = centerIndex - idx;
        isLeftSide = true;
      } else if (idx > centerIndex) {
        distanceFromCenter = idx - centerIndex;
        isLeftSide = false;
      } else {
        distanceFromCenter = 0;
        isLeftSide = false; // Center card
      }
    } else {
      // Even cards: two center cards
      // First half are on left side, second half on right side
      if (idx < centerIndex) {
        distanceFromCenter = centerIndex - idx - 1; // Distance from left center card
        isLeftSide = true;
      } else {
        distanceFromCenter = idx - centerIndex; // Distance from right center card
        isLeftSide = false;
      }
    }

    // Calculate angle: negative for left, positive for right, 0 for center
    const angle = isLeftSide ? -distanceFromCenter * angleStep : distanceFromCenter * angleStep;

    // ===== POSITION ALONG ARC =====
    // Convert angle to radians for trig
    const angleRad = angle * Math.PI / 180;

    // Calculate position along the arc
    // x moves cards left/right from center
    // y moves cards up along the arc
    // Apply overlap factor to x for proper card stacking
    const x = Math.sin(angleRad) * baseRadius * OVERLAP_FACTOR;
    const y = Math.cos(angleRad) * baseRadius - baseRadius;

    // ===== DEPTH & PERSPECTIVE =====
    // Normalized distance for uniform effects (0 at center, 1 at edges)
    const maxDistance = cardsPerSide;
    const normalizedDistance = distanceFromCenter / maxDistance;

    // Scale: center cards slightly larger (1.0), edge cards slightly smaller (0.92)
    const scale = 1 - (normalizedDistance * 0.08);

    // Brightness: center cards brighter (1.0), edge cards slightly dimmer (0.88)
    const brightness = 1 - (normalizedDistance * 0.12);

    // Z-index: center cards in front, edge cards behind
    // For overlapping effect, cards closer to center should be on top
    // Higher z-index for cards closer to center
    const zIndex = Math.round(50 - (normalizedDistance * 30));

    // ===== SUBTLE VERTICAL CURVATURE =====
    // Outer cards rise slightly for natural fan effect
    const riseOffset = normalizedDistance * 12;

    // ===== CREATE CARD ELEMENT =====
    const cardEl = document.createElement('div');
    cardEl.className = 'tarot-card';
    cardEl.dataset.id = cardId;

    // Store base transform for hover animations
    cardEl.style.setProperty('--base-x', `${x}px`);
    cardEl.style.setProperty('--base-y', `${y}px`);
    cardEl.style.setProperty('--base-rot', `${angle}deg`);
    cardEl.style.setProperty('--base-scale', scale);

    // Apply all transforms
    cardEl.style.left = `${x - cardWidth / 2}px`;
    cardEl.style.bottom = `${y + riseOffset}px`;
    cardEl.style.transform = `
      translateZ(0)
      rotate(${angle}deg)
      scale(${scale})
    `;
    cardEl.style.zIndex = zIndex;
    cardEl.style.filter = `brightness(${brightness})`;

    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">${cardBackSVG()}</div>
      </div>
    `;

    // Enhanced hover effect
    cardEl.addEventListener('mouseenter', () => {
      cardEl.style.transform = `
        translateZ(20px)
        rotate(${angle}deg)
        scale(${scale * 1.08})
        translateY(-15px)
      `;
    });

    cardEl.addEventListener('mouseleave', () => {
      cardEl.style.transform = `
        translateZ(0)
        rotate(${angle}deg)
        scale(${scale})
      `;
    });

    cardEl.addEventListener('click', () => onCardPick(cardEl, cardId));
    wrap.appendChild(cardEl);
  });

  // Add ambient glow effect
  wrap.style.filter = 'drop-shadow(0 0 30px rgba(147, 51, 234, 0.15))';
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
  const pos = POSITIONS[currentDrawIndex];
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
      <div class="position-label">${POSITIONS[i].icon} ${POSITIONS[i].title}</div>
    </div>
  `).join('');

  const readings = document.getElementById('readingsContainer');
  let html = '';
  drawnCards.forEach((card, i) => {
    const meaning = card.meanings[selectedCategory];
    html += `
      <div class="reading-block">
        <div class="reading-header">
          <span class="reading-icon">${POSITIONS[i].icon}</span>
          <div class="reading-title">${POSITIONS[i].title}</div>
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
});
