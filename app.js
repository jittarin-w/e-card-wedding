const WEDDING_MAP = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3777.0494546441264!2d99.02940807593176!3d18.795949260703186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da2543d24c3695%3A0xcfa8e0647662b975!2z4LiE4Lij4Li04Liq4LiV4LiI4Lix4LiB4Lij4Lih4Lir4Liy4Lin4Li04LiX4Lii4Liy4Lil4Lix4Lii4Lie4Liy4Lii4Lix4LieIOC5gOC4iuC4teC4ouC4h-C5g-C4q-C4oeC5iA!5e0!3m2!1sen!2sth!4v1782022848015!5m2!1sen!2sth" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
const AFTER_MAP = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3775.9939132190175!2d99.0269996759324!3d18.842938459246273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da25287a88439b%3A0x49ee5d4e75ce49c!2sSlow%20Bar%20Rooftop!5e0!3m2!1sen!2sth!4v1782024069800!5m2!1sen!2sth" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

const PHOTOS = [
  "0plo2713.webp",
  "0plo2719.webp",
  "0plo2733.webp",
  "0plo2812.webp",
  "0plo2830.webp",
  "boat_sunflower.webp",
  "chair_wink.webp",
  "field_sit.webp",
  "field_flowers.webp",
  "field_lift.webp",
];

const THEME_COLORS = [
  { name: "PANTONE", color: "#B9D0E6" },
  { name: "Rookwood Jade", color: "#989F7F" },
  { name: "Navy Blue", color: "#354D73" },
];

const DEFAULT_TABLES = Array.from({ length: 12 }, (_, index) => ({
  id: `T${String(index + 1).padStart(2, "0")}`,
  name: `Table ${index + 1}`,
  capacity: 10,
}));

const STORE_KEY = "wedding-ecard-state-v1";
const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

function uid(prefix) {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

function defaultState() {
  return {
    guests: [],
    afterGuests: [],
    tables: DEFAULT_TABLES,
    afterCodes: ["AFTER0512", "SLOWROOF", "JS2026"],
    adminPin: "1205",
  };
}

function loadState() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return defaultState();
  try {
    const state = { ...defaultState(), ...JSON.parse(raw) };
    let changed = false;
    state.guests.forEach((guest) => {
      if (!guest.luckyNumber) {
        guest.luckyNumber = generateLuckyNumber(state);
        changed = true;
      }
    });
    if (changed) saveState(state);
    return state;
  } catch {
    return defaultState();
  }
}

function saveState(nextState) {
  localStorage.setItem(STORE_KEY, JSON.stringify(nextState));
}

function setState(mutator) {
  const next = loadState();
  mutator(next);
  saveState(next);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function totalSeats(guest) {
  return Number(guest.companions || 0) + 1;
}

function tableUsage(state, tableId) {
  return state.guests
    .filter((guest) => guest.table === tableId)
    .reduce((sum, guest) => sum + totalSeats(guest), 0);
}

function assignTable(state, size) {
  const table = state.tables.find((item) => tableUsage(state, item.id) + size <= Number(item.capacity));
  return table ? table.id : "WAITLIST";
}

function tableName(state, tableId) {
  const table = state.tables.find((item) => item.id === tableId);
  return table ? table.name : "Waiting list";
}

function generateLuckyNumber(state) {
  const used = new Set(state.guests.map((guest) => String(guest.luckyNumber || "")));
  for (let attempt = 0; attempt < 1400; attempt += 1) {
    const candidate = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    if (!used.has(candidate)) return candidate;
  }
  return String(state.guests.length + 1).padStart(4, "0");
}

function renderThemeDots() {
  return THEME_COLORS.map(
    (item) => `
      <span class="theme-dot" style="--dot:${item.color}">
        <i></i>
        <b>${item.name}</b>
      </span>
    `,
  ).join("");
}

function nav() {
  return `
    <nav class="nav">
      <a class="brand" href="#/home" aria-label="Wedding home">
        <span class="brand-mark">J</span>
        <span>Jittarin & Sirikanya</span>
      </a>
      <div class="nav-links">
        <a href="#/home">Invitation</a>
        <a href="#/register">ลงทะเบียน</a>
        <a href="#/seating">Seat Check</a>
        <a href="#/admin">Admin</a>
      </div>
    </nav>
  `;
}

function pageShell(title, subtitle, body) {
  return `
    ${nav()}
    <section class="form-page">
      <div class="page-shell">
        <header class="page-head reveal">
          <div>
            <p class="eyebrow">${subtitle}</p>
            <h1>${title}</h1>
          </div>
          <a class="ghost-btn" href="#/home">Back to invitation</a>
        </header>
        ${body}
      </div>
    </section>
  `;
}

function renderWelcome() {
  app.innerHTML = `
    <section class="screen welcome">
      <div class="welcome-stage">
        <span class="floating-petal"></span>
        <span class="floating-petal"></span>
        <span class="floating-petal"></span>
        <div class="welcome-title">
          <p class="eyebrow">You are invited</p>
          <h1>Jittarin & Sirikanya</h1>
          <p>เปิดซองคำเชิญ และก้าวเข้าสู่วันสำคัญของเรา</p>
        </div>
        <button class="envelope-wrap" id="openEnvelope" aria-label="Open wedding invitation">
          <span class="arrow-cue">
            <span>แตะตรงนี้</span>
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <path d="M18 10c18 8 25 20 25 37" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
              <path d="M31 38l13 12 9-15" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="flap"></span>
          <span class="envelope"></span>
          <span class="seal">JS</span>
        </button>
      </div>
    </section>
  `;
  document.querySelector("#openEnvelope").addEventListener("click", (event) => {
    event.currentTarget.style.transform = "translateY(-18px) scale(1.04)";
    showToast("Welcome to our wedding");
    setTimeout(() => {
      location.hash = "#/home";
    }, 520);
  });
}

function renderHome() {
  const gallery = PHOTOS.reduce((html, photo, index) => {
    if (index % 2 === 0) html += `<div class="photo-pair">`;
    const tilt = index % 2 === 0 ? "-1.4deg" : "1.6deg";
    html += `
      <figure class="photo-card" style="--tilt:${tilt}">
        <img src="assets/images/${photo}" alt="Pre-wedding photo ${index + 1}" loading="${index < 2 ? "eager" : "lazy"}" />
      </figure>
    `;
    if (index % 2 === 1) html += `</div>`;
    return html;
  }, "");

  app.innerHTML = `
    ${nav()}
    <section class="hero">
      <img src="assets/images/chair_wink.webp" alt="Jittarin and Sirikanya" />
      <div class="hero-content">
        <p class="eyebrow">Wedding Celebration</p>
        <h1 class="hero-title">Jittarin Wongnangsue & Sirikanya Somsri</h1>
        <div class="hero-meta">
          <div class="meta-item"><span>Date</span><strong>05 December 2026</strong></div>
          <div class="meta-item"><span>Time</span><strong>09:00 เริ่มเข้างาน</strong></div>
          <div class="meta-item"><span>Venue</span><strong>โบสถ์กลางน้ำมหาวิทยาลัยพายัพเชียงใหม่</strong></div>
        </div>
        <div class="action-row">
          <a class="btn" href="#/register">ลงทะเบียนร่วมงาน</a>
          <a class="ghost-btn" href="#gallery">ดูภาพ Pre-wedding</a>
        </div>
      </div>
    </section>

    <section class="section theme-section" id="theme">
      <div class="section-inner theme-grid">
        <div class="reveal">
          <p class="section-kicker">Wedding Theme</p>
          <h2 class="section-title">Color of the celebration</h2>
          <p class="lead">ธีมสีหลักของงานถูกวางให้ดูสุขุม อบอุ่น และร่วมสมัย ใช้เป็น mood หลักของ invitation และบรรยากาศในวันงาน</p>
          <div class="theme-dots" aria-label="Wedding color theme">
            ${renderThemeDots()}
          </div>
        </div>
        <aside class="lucky-panel reveal">
          <span class="icon-dot">#</span>
          <h3>Lucky Number Mini Game</h3>
          <p>แขกที่ลงทะเบียน 1 รายการจะได้รับ Lucky Number 1 เลข สำหรับกิจกรรมสุ่มของรางวัลในงาน</p>
          <a class="btn" href="#/register">รับ Lucky Number</a>
        </aside>
      </div>
    </section>

    <section id="gallery" class="section">
      <div class="section-inner">
        <p class="section-kicker reveal">Pre-wedding Gallery</p>
        <h2 class="section-title reveal">A quiet little story, told two photos at a time.</h2>
        <p class="lead reveal">ทุกภาพจะค่อย ๆ ปรากฏตอนเลื่อนหน้า เพื่อให้ e-card รู้สึกเหมือนกำลังเปิดอัลบั้มทีละหน้า</p>
        <div class="gallery">${gallery}</div>
      </div>
    </section>

    <section class="section" id="schedule">
      <div class="section-inner">
        <p class="section-kicker reveal">Wedding Schedule</p>
        <h2 class="section-title reveal">กำหนดการคร่าว ๆ</h2>
        <div class="timeline">
          ${[
            ["09:00 AM", "เริ่มเข้างาน", "ลงทะเบียน ต้อนรับแขก และถ่ายภาพร่วมกัน"],
            ["10:00 AM", "เริ่มพิธีการ", "เริ่มพิธีสำคัญทางศาสนา"],
            ["11:30 AM", "เริ่มรับประทานอาหาร", "ร่วมรับประทานอาหารและพูดคุยในบรรยากาศอบอุ่น"],
          ]
            .map(
              ([time, title, detail]) => `
              <article class="timeline-item reveal">
                <div class="timeline-time">${time}</div>
                <div><strong>${title}</strong><br />${detail}</div>
              </article>
            `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section" id="venue">
      <div class="section-inner">
        <p class="section-kicker reveal">Venue</p>
        <h2 class="section-title reveal">โบสถ์กลางน้ำมหาวิทยาลัยพายัพเชียงใหม่</h2>
        <div class="map-grid">
          <div class="panel reveal">
            <h3>Wedding Venue</h3>
            <p>สถานที่หลักสำหรับพิธีแต่งงานและงานเลี้ยง สามารถเปิดแผนที่เพื่อดูเส้นทางได้จากหน้านี้โดยตรง</p>
            <div class="action-row">
              <a class="btn" href="#/register">ลงทะเบียนร่วมงาน</a>
              <a class="ghost-btn" href="#/seating">Check Seat</a>
            </div>
          </div>
          <div class="map-frame reveal">${WEDDING_MAP}</div>
        </div>
      </div>
    </section>
  `;
  initReveals();
}

function renderRegister() {
  const body = `
    <div class="grid-2">
      <form class="panel reveal" id="guestForm">
        <h2>ข้อมูลผู้มาร่วมงาน</h2>
        <div class="field">
          <label for="guestName">ชื่อผู้มาร่วมงาน</label>
          <input id="guestName" name="name" required autocomplete="name" />
        </div>
        <div class="field">
          <label for="companions">จำนวนผู้ติดตาม</label>
          <input id="companions" name="companions" type="number" min="0" max="9" value="0" required />
        </div>
        <div class="field">
          <label for="travel">การเดินทาง</label>
          <select id="travel" name="travel" required>
            <option value="">เลือกวิธีเดินทาง</option>
            <option>รถยนต์ส่วนตัว</option>
            <option>Grab / Taxi</option>
            <option>รถโดยสาร</option>
            <option>มากับเพื่อนหรือครอบครัว</option>
          </select>
        </div>
        <div class="field">
          <label for="side">แขกฝ่าย</label>
          <select id="side" name="side" required>
            <option value="">เลือกฝ่าย</option>
            <option>เจ้าบ่าว</option>
            <option>เจ้าสาว</option>
            <option>ทั้งสองฝ่าย</option>
          </select>
        </div>
        <button class="btn" type="submit">ลงทะเบียนและรับ Code ID</button>
      </form>
      <aside class="panel reveal">
        <h2>หลังลงทะเบียน</h2>
        <p>ระบบจะออก Code ID และจัดโต๊ะให้อัตโนมัติ โดยนับรวมผู้ติดตามให้นั่งโต๊ะเดียวกันเสมอเมื่อจำนวนที่นั่งยังพอ</p>
        <div class="code-box" id="registerResult">
          <span>Code ID จะแสดงตรงนี้</span>
        </div>
      </aside>
    </div>
  `;
  app.innerHTML = pageShell("RSVP Registration", "Wedding Guest", body);
  document.querySelector("#guestForm").addEventListener("submit", handleGuestSubmit);
  initReveals();
}

function handleGuestSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const guest = {
    id: uid("JS"),
    name: form.get("name").trim(),
    companions: Number(form.get("companions") || 0),
    travel: form.get("travel"),
    side: form.get("side"),
    createdAt: new Date().toISOString(),
  };

  setState((state) => {
    guest.luckyNumber = generateLuckyNumber(state);
    guest.table = assignTable(state, totalSeats(guest));
    state.guests.push(guest);
  });

  const state = loadState();
  document.querySelector("#registerResult").innerHTML = `
    <span>Code ID ของคุณ</span>
    <strong class="code">${guest.id}</strong>
    <span class="lucky-number">Lucky Number ${guest.luckyNumber}</span>
    <span class="seat-badge">${tableName(state, guest.table)}</span>
    <small>จำนวนที่นั่งรวม ${totalSeats(guest)} ที่</small>
  `;
  event.currentTarget.reset();
  document.querySelector("#companions").value = 0;
  showToast("ลงทะเบียนสำเร็จ จัดที่นั่งให้แล้ว");
}

function renderSeating() {
  const state = loadState();
  const tableCards = state.tables
    .map((table) => {
      const used = tableUsage(state, table.id);
      const guests = state.guests.filter((guest) => guest.table === table.id);
      return `
        <article class="table-card reveal">
          <h3>${escapeHtml(table.name)}</h3>
          <div>${used}/${table.capacity} seats</div>
          <div class="capacity"><span style="width:${Math.min(100, (used / table.capacity) * 100)}%"></span></div>
          <ul class="guest-list">
            ${guests
              .map((guest) => `<li>${escapeHtml(guest.name)} (${totalSeats(guest)} seats)</li>`)
              .join("") || "<li>ยังไม่มีแขก</li>"}
          </ul>
        </article>
      `;
    })
    .join("");

  const body = `
    <div class="grid-2">
      <form class="panel reveal" id="seatForm">
        <h2>ตรวจสอบที่นั่ง</h2>
        <div class="field">
          <label for="seatCode">Code ID</label>
          <input id="seatCode" name="code" placeholder="เช่น JS..." required />
        </div>
        <button class="btn" type="submit">ค้นหาที่นั่ง</button>
      </form>
      <div class="panel reveal booking-result" id="seatResult">
        <h2>Booking Result</h2>
        <p>กรอก Code ID ที่ได้รับหลังลงทะเบียนเพื่อดูโต๊ะของคุณและผู้ติดตาม</p>
      </div>
    </div>
    <section class="section-inner" style="margin-top:34px">
      <h2 class="section-title reveal">Table Overview</h2>
      <div class="table-grid">${tableCards}</div>
    </section>
  `;
  app.innerHTML = pageShell("Table Booking", "Seat Check", body);
  document.querySelector("#seatForm").addEventListener("submit", handleSeatSearch);
  initReveals();
}

function handleSeatSearch(event) {
  event.preventDefault();
  const code = new FormData(event.currentTarget).get("code").trim().toUpperCase();
  const state = loadState();
  const guest = state.guests.find((item) => item.id.toUpperCase() === code);
  const result = document.querySelector("#seatResult");
  if (!guest) {
    result.innerHTML = `<h2>ไม่พบ Code ID</h2><p>กรุณาตรวจสอบรหัสอีกครั้ง หรือติดต่อคู่บ่าวสาว</p>`;
    showToast("ไม่พบ Code ID");
    return;
  }
  result.innerHTML = `
    <h2>${escapeHtml(guest.name)}</h2>
    <span class="lucky-number">Lucky Number ${escapeHtml(guest.luckyNumber || "-")}</span>
    <span class="seat-badge">${tableName(state, guest.table)}</span>
    <p>จำนวนที่นั่งรวม ${totalSeats(guest)} ที่ รวมผู้ติดตาม ${guest.companions} คน</p>
    <p>แขกฝ่าย${escapeHtml(guest.side)} เดินทางโดย ${escapeHtml(guest.travel)}</p>
  `;
  showToast("พบข้อมูลที่นั่งแล้ว");
}

function renderAfterCode() {
  const body = `
    <div class="grid-2">
      <form class="panel reveal" id="afterCodeForm">
        <h2>After Party Access</h2>
        <p>หน้านี้สำหรับแขกที่ได้รับรหัสจาก Jittarin และ Sirikanya เท่านั้น</p>
        <div class="field">
          <label for="afterCode">Access Code</label>
          <input id="afterCode" name="code" required />
        </div>
        <button class="btn" type="submit">เข้าสู่หน้าลงทะเบียน</button>
      </form>
      <aside class="panel reveal">
        <h2>Slow Bar Rooftop</h2>
        <p>After party สำหรับช่วงค่ำหลังพิธีหลัก กรุณาลงทะเบียนเพิ่มเพื่อช่วยจัดการการเดินทางและจำนวนที่นั่ง</p>
        <div class="map-frame">${AFTER_MAP}</div>
      </aside>
    </div>
  `;
  app.innerHTML = pageShell("After Party", "Private RSVP", body);
  document.querySelector("#afterCodeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get("code").trim().toUpperCase();
    const allowed = loadState().afterCodes.map((item) => item.toUpperCase());
    if (!allowed.includes(code)) {
      showToast("รหัสไม่ถูกต้อง");
      return;
    }
    sessionStorage.setItem("after-party-access", "yes");
    location.hash = "#/after-party";
  });
  initReveals();
}

function renderAfterParty() {
  if (sessionStorage.getItem("after-party-access") !== "yes") {
    location.hash = "#/after-code";
    return;
  }
  const body = `
    <div class="grid-2">
      <form class="panel reveal" id="afterForm">
        <h2>ลงทะเบียน After Party</h2>
        <div class="field">
          <label for="afterName">ชื่อแขก</label>
          <input id="afterName" name="name" required autocomplete="name" />
        </div>
        <div class="field">
          <label for="afterCompanions">จำนวนผู้ติดตาม</label>
          <input id="afterCompanions" name="companions" type="number" min="0" max="9" value="0" required />
        </div>
        <div class="field">
          <label for="afterTravel">เดินทางมายังไง</label>
          <select id="afterTravel" name="travel" required>
            <option value="">เลือกวิธีเดินทาง</option>
            <option>รถยนต์ส่วนตัว</option>
            <option>Grab / Taxi</option>
            <option>เดินทางร่วมกับเพื่อน</option>
            <option>ให้ทีมงานช่วยประสานรถ</option>
          </select>
        </div>
        <div class="field">
          <label for="hotel">พักที่ไหน</label>
          <input id="hotel" name="hotel" placeholder="ชื่อโรงแรมหรือย่านที่พัก" required />
        </div>
        <button class="btn" type="submit">ยืนยันเข้าร่วม After Party</button>
      </form>
      <aside class="panel reveal">
        <h2>Slow Bar Rooftop</h2>
        <p>ระบบจะบันทึกข้อมูลไว้ให้ admin ดูจำนวนแขกและวางแผนการเดินทาง</p>
        <div class="map-frame">${AFTER_MAP}</div>
      </aside>
    </div>
  `;
  app.innerHTML = pageShell("Slow Bar Rooftop", "After Party RSVP", body);
  document.querySelector("#afterForm").addEventListener("submit", handleAfterSubmit);
  initReveals();
}

function handleAfterSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const guest = {
    id: uid("AP"),
    name: form.get("name").trim(),
    companions: Number(form.get("companions") || 0),
    travel: form.get("travel"),
    hotel: form.get("hotel").trim(),
    createdAt: new Date().toISOString(),
  };
  setState((state) => state.afterGuests.push(guest));
  event.currentTarget.reset();
  document.querySelector("#afterCompanions").value = 0;
  showToast(`ลงทะเบียน After Party สำเร็จ รหัส ${guest.id}`);
}

function adminStats(state) {
  const guestSeats = state.guests.reduce((sum, guest) => sum + totalSeats(guest), 0);
  const afterSeats = state.afterGuests.reduce((sum, guest) => sum + totalSeats(guest), 0);
  return `
    <div class="stats reveal">
      <div class="stat"><span>Main guests</span><strong>${state.guests.length}</strong></div>
      <div class="stat"><span>Main seats</span><strong>${guestSeats}</strong></div>
      <div class="stat"><span>After guests</span><strong>${state.afterGuests.length}</strong></div>
      <div class="stat"><span>After seats</span><strong>${afterSeats}</strong></div>
    </div>
  `;
}

function renderAdmin() {
  const authed = sessionStorage.getItem("admin-ok") === "yes";
  if (!authed) {
    const body = `
      <form class="panel reveal" id="adminLogin" style="max-width:520px">
        <h2>Admin Login</h2>
        <p>รหัสเริ่มต้นสำหรับ prototype คือ 1205 และสามารถเปลี่ยนในไฟล์ script หรือเชื่อมระบบ auth จริงภายหลังได้</p>
        <div class="field">
          <label for="pin">Admin PIN</label>
          <input id="pin" name="pin" type="password" required />
        </div>
        <button class="btn" type="submit">เข้าสู่ระบบ</button>
      </form>
    `;
    app.innerHTML = pageShell("Admin", "Manage Wedding Data", body);
    document.querySelector("#adminLogin").addEventListener("submit", (event) => {
      event.preventDefault();
      if (new FormData(event.currentTarget).get("pin") === loadState().adminPin) {
        sessionStorage.setItem("admin-ok", "yes");
        renderAdmin();
      } else {
        showToast("PIN ไม่ถูกต้อง");
      }
    });
    initReveals();
    return;
  }

  const state = loadState();
  const active = new URLSearchParams(location.hash.split("?")[1] || "").get("tab") || "guests";
  const body = `
    ${adminStats(state)}
    <section class="panel reveal">
      <div class="admin-tabs">
        ${[
          ["guests", "Wedding Guests"],
          ["tables", "Tables"],
          ["after", "After Party"],
          ["codes", "After Codes"],
        ]
          .map(
            ([id, label]) =>
              `<a class="chip ${active === id ? "is-active" : ""}" href="#/admin?tab=${id}">${label}</a>`,
          )
          .join("")}
      </div>
      <div id="adminPanel">${adminPanel(active, state)}</div>
    </section>
  `;
  app.innerHTML = pageShell("Admin Dashboard", "Manage Wedding Data", body);
  bindAdmin(active);
  initReveals();
}

function adminPanel(active, state) {
  if (active === "tables") return tableAdmin(state);
  if (active === "after") return afterAdmin(state);
  if (active === "codes") return codesAdmin(state);
  return guestAdmin(state);
}

function guestAdmin(state) {
  return `
    <form id="addGuestForm" class="grid-2">
      <div class="field"><label>ชื่อ</label><input name="name" required /></div>
      <div class="field"><label>ผู้ติดตาม</label><input name="companions" type="number" min="0" value="0" /></div>
      <div class="field"><label>เดินทาง</label><input name="travel" required /></div>
      <div class="field"><label>ฝ่าย</label><input name="side" required /></div>
      <button class="btn" type="submit">เพิ่มแขก</button>
    </form>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Code</th><th>Lucky</th><th>Name</th><th>Comp.</th><th>Travel</th><th>Side</th><th>Table</th><th>Actions</th></tr></thead>
        <tbody>
          ${state.guests
            .map(
              (guest) => `
              <tr data-id="${guest.id}">
                <td>${guest.id}</td>
                <td><strong>${escapeHtml(guest.luckyNumber || "-")}</strong></td>
                <td><input data-field="name" value="${escapeHtml(guest.name)}" /></td>
                <td><input data-field="companions" type="number" min="0" value="${guest.companions}" /></td>
                <td><input data-field="travel" value="${escapeHtml(guest.travel)}" /></td>
                <td><input data-field="side" value="${escapeHtml(guest.side)}" /></td>
                <td>
                  <select data-field="table">
                    ${state.tables
                      .map(
                        (table) =>
                          `<option value="${table.id}" ${guest.table === table.id ? "selected" : ""}>${escapeHtml(table.name)}</option>`,
                      )
                      .join("")}
                    <option value="WAITLIST" ${guest.table === "WAITLIST" ? "selected" : ""}>Waiting list</option>
                  </select>
                </td>
                <td class="mini-actions">
                  <button class="icon-btn" data-action="save-guest" title="Save" type="button">✓</button>
                  <button class="icon-btn danger" data-action="delete-guest" title="Delete" type="button">×</button>
                </td>
              </tr>
            `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function tableAdmin(state) {
  return `
    <form id="addTableForm" class="grid-2">
      <div class="field"><label>ชื่อโต๊ะ</label><input name="name" required /></div>
      <div class="field"><label>จำนวนที่นั่ง</label><input name="capacity" type="number" min="1" value="10" required /></div>
      <button class="btn" type="submit">เพิ่มโต๊ะ</button>
    </form>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Capacity</th><th>Used</th><th>Actions</th></tr></thead>
        <tbody>
          ${state.tables
            .map(
              (table) => `
              <tr data-id="${table.id}">
                <td>${table.id}</td>
                <td><input data-field="name" value="${escapeHtml(table.name)}" /></td>
                <td><input data-field="capacity" type="number" min="1" value="${table.capacity}" /></td>
                <td>${tableUsage(state, table.id)}</td>
                <td class="mini-actions">
                  <button class="icon-btn" data-action="save-table" title="Save" type="button">✓</button>
                  <button class="icon-btn danger" data-action="delete-table" title="Delete" type="button">×</button>
                </td>
              </tr>
            `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function afterAdmin(state) {
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Code</th><th>Name</th><th>Comp.</th><th>Travel</th><th>Hotel</th><th>Actions</th></tr></thead>
        <tbody>
          ${state.afterGuests
            .map(
              (guest) => `
              <tr data-id="${guest.id}">
                <td>${guest.id}</td>
                <td><input data-field="name" value="${escapeHtml(guest.name)}" /></td>
                <td><input data-field="companions" type="number" min="0" value="${guest.companions}" /></td>
                <td><input data-field="travel" value="${escapeHtml(guest.travel)}" /></td>
                <td><input data-field="hotel" value="${escapeHtml(guest.hotel)}" /></td>
                <td class="mini-actions">
                  <button class="icon-btn" data-action="save-after" title="Save" type="button">✓</button>
                  <button class="icon-btn danger" data-action="delete-after" title="Delete" type="button">×</button>
                </td>
              </tr>
            `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function codesAdmin(state) {
  return `
    <form id="addCodeForm" class="grid-2">
      <div class="field"><label>After Party Access Code</label><input name="code" required /></div>
      <button class="btn" type="submit">เพิ่ม Code</button>
    </form>
    <div class="table-grid">
      ${state.afterCodes
        .map(
          (code) => `
          <article class="table-card" data-code="${escapeHtml(code)}">
            <h3>${escapeHtml(code)}</h3>
            <button class="ghost-btn danger" data-action="delete-code" type="button">ลบ code</button>
          </article>
        `,
        )
        .join("")}
    </div>
  `;
}

function bindAdmin(active) {
  const panel = document.querySelector("#adminPanel");
  panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const row = button.closest("tr");
    const action = button.dataset.action;

    if (action === "save-guest" && row) saveGuestRow(row);
    if (action === "delete-guest" && row) deleteItem("guests", row.dataset.id);
    if (action === "save-table" && row) saveTableRow(row);
    if (action === "delete-table" && row) deleteTable(row.dataset.id);
    if (action === "save-after" && row) saveAfterRow(row);
    if (action === "delete-after" && row) deleteItem("afterGuests", row.dataset.id);
    if (action === "delete-code") deleteCode(button.closest("[data-code]").dataset.code);
  });

  if (active === "guests") {
    document.querySelector("#addGuestForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const guest = {
        id: uid("JS"),
        name: form.get("name").trim(),
        companions: Number(form.get("companions") || 0),
        travel: form.get("travel").trim(),
        side: form.get("side").trim(),
        createdAt: new Date().toISOString(),
      };
      setState((state) => {
        guest.luckyNumber = generateLuckyNumber(state);
        guest.table = assignTable(state, totalSeats(guest));
        state.guests.push(guest);
      });
      showToast("เพิ่มแขกแล้ว");
      renderAdmin();
    });
  }

  if (active === "tables") {
    document.querySelector("#addTableForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      setState((state) =>
        state.tables.push({
          id: `T${String(state.tables.length + 1).padStart(2, "0")}-${Date.now().toString(36).slice(-3)}`,
          name: form.get("name").trim(),
          capacity: Number(form.get("capacity")),
        }),
      );
      showToast("เพิ่มโต๊ะแล้ว");
      renderAdmin();
    });
  }

  if (active === "codes") {
    document.querySelector("#addCodeForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const code = new FormData(event.currentTarget).get("code").trim().toUpperCase();
      setState((state) => {
        if (!state.afterCodes.map((item) => item.toUpperCase()).includes(code)) state.afterCodes.push(code);
      });
      showToast("เพิ่ม access code แล้ว");
      renderAdmin();
    });
  }
}

function rowValues(row) {
  return [...row.querySelectorAll("[data-field]")].reduce((values, input) => {
    values[input.dataset.field] = input.type === "number" ? Number(input.value || 0) : input.value.trim();
    return values;
  }, {});
}

function saveGuestRow(row) {
  const values = rowValues(row);
  setState((state) => {
    const guest = state.guests.find((item) => item.id === row.dataset.id);
    if (guest) Object.assign(guest, values);
  });
  showToast("บันทึกข้อมูลแขกแล้ว");
  renderAdmin();
}

function saveTableRow(row) {
  const values = rowValues(row);
  setState((state) => {
    const table = state.tables.find((item) => item.id === row.dataset.id);
    if (table) Object.assign(table, values);
  });
  showToast("บันทึกข้อมูลโต๊ะแล้ว");
  renderAdmin();
}

function saveAfterRow(row) {
  const values = rowValues(row);
  setState((state) => {
    const guest = state.afterGuests.find((item) => item.id === row.dataset.id);
    if (guest) Object.assign(guest, values);
  });
  showToast("บันทึก After Party แล้ว");
  renderAdmin();
}

function deleteItem(collection, id) {
  setState((state) => {
    state[collection] = state[collection].filter((item) => item.id !== id);
  });
  showToast("ลบข้อมูลแล้ว");
  renderAdmin();
}

function deleteTable(id) {
  setState((state) => {
    state.tables = state.tables.filter((table) => table.id !== id);
    state.guests = state.guests.map((guest) => (guest.table === id ? { ...guest, table: "WAITLIST" } : guest));
  });
  showToast("ลบโต๊ะแล้ว แขกในโต๊ะเดิมถูกย้ายไป Waiting list");
  renderAdmin();
}

function deleteCode(code) {
  setState((state) => {
    state.afterCodes = state.afterCodes.filter((item) => item !== code);
  });
  showToast("ลบ access code แล้ว");
  renderAdmin();
}

function initReveals() {
  const targets = document.querySelectorAll(".reveal, .photo-card");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -60px 0px" },
  );
  targets.forEach((target) => observer.observe(target));
}

function route() {
  const path = location.hash.replace("#", "") || "/";
  const cleanPath = location.pathname.replace(/\/$/, "").toLowerCase();
  window.scrollTo({ top: 0, behavior: "instant" });
  if (cleanPath.endsWith("/afterparty")) return renderAfterCode();
  if (path.startsWith("/home")) return renderHome();
  if (path.startsWith("/register")) return renderRegister();
  if (path.startsWith("/seating")) return renderSeating();
  if (path.startsWith("/after-code")) return renderAfterCode();
  if (path.startsWith("/after-party")) return renderAfterParty();
  if (path.startsWith("/admin")) return renderAdmin();
  return renderWelcome();
}

window.addEventListener("hashchange", route);
route();
