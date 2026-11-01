/* ORKÜTEK — etkileşimler (bağımlılık yok) */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CFG = window.ORKUTEK || {};

  $("#yr").textContent = new Date().getFullYear();

  /* ---------- nav ---------- */
  const nav = $("#nav"), burger = $("#burger");
  burger.addEventListener("click", () => {
    const o = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", o);
  });
  $$("#menu a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", false); }));

  /* ---------- reveal ---------- */
  const rvIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rvIO.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  $$(".rv").forEach(el => rvIO.observe(el));

  /* ---------- ticker ---------- */
  const words = ["DOĞA", "TEKNOLOJİ", "EĞİTİM", "DAYANIŞMA", "ESP32", "Yörük Çadırı", "LoRaWAN", "Kırsal Kodlama", "GIS", "Genç Maker", "Python", "Orhaneli", "Sensör", "Mobil Uygulama"];
  const tr = $("#tick");
  const row = words.map(w => `<span>${w}</span>`).join("");
  tr.innerHTML = row + row;

  /* ---------- hero terminal ---------- */
  const term = $("#term");
  const script = ["✔ doğa yüklendi", "✔ sensör ağı bağlandı", "✔ çocuklar kodluyor", "✔ üretici bilgilendirildi"];
  const cmd = "orkutek init --yer=orhaneli";
  const renderTerm = (typed, lines, caret = true) => {
    term.innerHTML = `<span class="l"><span class="p">$</span> ${typed}${lines.length || !caret ? "" : '<i class="caret"></i>'}</span>` +
      lines.map(l => `<span class="l ok">${l}</span>`).join("") +
      (lines.length ? '<span class="l"><span class="p">$</span> <i class="caret"></i></span>' : "");
  };
  if (reduce) renderTerm(cmd, script, false);
  else {
    let alive = true;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    (async function loop() {
      while (alive) {
        for (let i = 0; i <= cmd.length; i++) { renderTerm(cmd.slice(0, i), []); await sleep(55); }
        await sleep(350);
        const out = [];
        for (const s of script) { out.push(s); renderTerm(cmd, out); await sleep(520); }
        await sleep(3200);
      }
    })();
  }

  /* ---------- hero network canvas ---------- */
  (function net() {
    const cv = $("#net"); if (!cv) return;
    const ctx = cv.getContext("2d"); let W, H, dpr, nodes = [], packets = [], run = true;
    const mouse = { x: -999, y: -999 };
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = clamp(Math.round(W * H / 15000), 24, 80);
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: 1.6 + Math.random() * 2.2 }));
    };
    const link = 150;
    const spawn = () => {
      if (packets.length > 14) return;
      const a = nodes[Math.random() * nodes.length | 0];
      const near = nodes.filter(b => b !== a && Math.hypot(a.x - b.x, a.y - b.y) < link);
      if (near.length) packets.push({ a, b: near[Math.random() * near.length | 0], t: 0 });
    };
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of nodes) {
        if (!reduce) {
          p.x += p.vx; p.y += p.vy;
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
          if (d < 130) { p.x += dx / d * .6; p.y += dy / d * .6; }
          if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        }
      }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) { ctx.strokeStyle = `rgba(29,90,34,${.22 * (1 - d / link)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      for (const p of nodes) {
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 170) { ctx.strokeStyle = `rgba(238,138,11,${.5 * (1 - dm / 170)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        ctx.fillStyle = dm < 100 ? "rgba(238,138,11,.9)" : "rgba(29,90,34,.5)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
      packets = packets.filter(p => (p.t += .02) < 1);
      for (const p of packets) {
        const x = lerp(p.a.x, p.b.x, p.t), y = lerp(p.a.y, p.b.y, p.t);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12); g.addColorStop(0, "rgba(254,189,54,1)"); g.addColorStop(1, "rgba(254,189,54,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill();
      }
      if (!reduce && Math.random() < .08) spawn();
      if (run && !reduce) requestAnimationFrame(draw);
    }
    size(); draw();
    addEventListener("resize", () => { size(); if (reduce) draw(); });
    const hero = cv.parentElement;
    hero.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
    new IntersectionObserver(([e]) => { const was = run; run = e.isIntersecting; if (run && !was && !reduce) requestAnimationFrame(draw); }).observe(hero);
  })();

  /* ---------- manifesto (kelime kelime) ---------- */
  const man = $("#manifesto");
  const wd = [];
  (function splitWords() {
    const walk = (node, hl) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) frag.append(t);
            else { const s = document.createElement("span"); s.className = "wd" + (hl ? " hl" : ""); s.textContent = t; frag.append(s); wd.push(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n, hl || n.classList.contains("hl"));
      });
    };
    walk(man, false);
  })();

  /* ---------- pillars ---------- */
  const pillars = $$(".pillar");
  const setP = p => pillars.forEach(x => { const on = x === p; x.classList.toggle("active", on); x.setAttribute("aria-selected", on); });
  pillars.forEach(p => { p.addEventListener("mouseenter", () => matchMedia("(hover:hover) and (min-width:861px)").matches && setP(p)); p.addEventListener("click", () => setP(p)); p.addEventListener("focus", () => setP(p)); });

  /* ---------- scroll-driven: progress, rail, road, manifesto ---------- */
  const prog = $("#progress"), rail = $("#rail"), fill = $("#railFill");
  const stations = $$("section[data-st]"), dots = $$("a", rail);
  const road = $("#road"), roadFill = $("#roadFill"), roadDot = $("#roadDot");
  let ticking = false;
  function onScroll() {
    ticking = false;
    const vh = innerHeight, doc = document.documentElement;
    prog.style.width = (scrollY / (doc.scrollHeight - vh) * 100) + "%";

    // manifesto
    const mr = man.getBoundingClientRect();
    const mp = clamp((vh * .85 - mr.top) / (mr.height + vh * .25), 0, 1);
    const lit = Math.round(mp * wd.length * 1.15);
    wd.forEach((w, i) => w.classList.toggle("lit", i < lit));

    // rail
    let idx = -1;
    stations.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * .5) idx = i; });
    dots.forEach((d, i) => { d.classList.toggle("on", i === idx); d.classList.toggle("done", i < idx); });
    if (rail.offsetParent !== null && dots.length) {
      const c = d => d.offsetTop + d.offsetHeight / 2, first = c(dots[0]);
      let end = idx < 0 ? first : c(dots[idx]);
      if (idx >= 0 && idx < dots.length - 1) {
        const s = stations[idx].getBoundingClientRect();
        end = lerp(c(dots[idx]), c(dots[idx + 1]), clamp(-s.top / s.height, 0, 1));
      }
      fill.style.top = first + "px"; fill.style.height = Math.max(0, end - first) + "px";
    }
    // nav: topbar color on dark sections is fine as-is

    // road
    if (road && roadFill.offsetParent !== null) {
      const r = road.getBoundingClientRect();
      const p = clamp((vh * .7 - r.top) / (r.height * .85), 0, 1) * 100;
      roadFill.style.width = p + "%"; roadDot.style.left = p + "%";
    }
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); onScroll();

  /* ---------- counters ---------- */
  const cIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cIO.unobserve(e.target);
    const to = +e.target.dataset.count, t0 = performance.now(), dur = 1500;
    if (reduce) { e.target.textContent = to; return; }
    (function step(t) { const p = clamp((t - t0) / dur, 0, 1); e.target.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
  }), { threshold: .6 });
  $$("[data-count]").forEach(el => cIO.observe(el));

  /* ---------- programs: sürükle ---------- */
  const progs = $("#progs"); let down = false, sx = 0, sl = 0, moved = false;
  progs.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = progs.scrollLeft; });
  addEventListener("pointermove", e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; progs.classList.add("drag"); } progs.scrollLeft = sl - dx; });
  addEventListener("pointerup", () => { down = false; progs.classList.remove("drag"); });

  /* ---------- ekosistem ---------- */
  const eco = [
    ["ORKÜTEK Akademi", "Çocuk ve gençlere kodlama, yapay zekâ okuryazarlığı, elektronik, GIS ve girişimcilik eğitimi.", "Atölyeler · eğitim içerikleri · öğrenci portföyleri"],
    ["ORKÜTEK Kuluçka Programı", "Fikirleri ekip, iş modeli, prototip ve ilk müşteri aşamalarına taşır.", "Doğrulanmış ihtiyaç · iş modeli · prototip · müşteri görüşmeleri"],
    ["Üretim ve Prototipleme Atölyesi", "Sensör, IoT, yazılım, dijital tarım ve yerel problemlere yönelik çözümler geliştirir.", "Saha testleri · teknik dokümantasyon · MVP"],
    ["İş ve Yatırım Ağı", "Şirketleri, belediyeleri, üniversiteleri, kooperatifleri, uzmanları ve yatırımcıları bir araya getirir.", "Mentorluk · pilot alan · satın alma görüşmesi · sponsorluk"],
    ["Bölgesel Projeler", "Tarım, kırsal turizm, çevre, enerji, kültürel miras ve yerel işletmelerin dijitalleşmesine yönelik projeler yürütür.", "Pilot uygulamalar · çoğaltılabilir proje paketleri"]
  ];
  const ed = $("#ecoDetail"), hn = $$(".hn");
  const showEco = i => { hn.forEach((b, k) => b.classList.toggle("on", k === i)); const [t, d, o] = eco[i]; ed.innerHTML = `<b>${t}</b>${d}<small>ÇIKTI → ${o}</small>`; };
  hn.forEach(b => { const i = +b.dataset.e; b.addEventListener("click", () => showEco(i)); b.addEventListener("mouseenter", () => showEco(i)); b.addEventListener("focus", () => showEco(i)); });
  showEco(0);

  /* ---------- sekmeler ---------- */
  const tabs = $$(".tabs button"), panels = $$(".tabpanel");
  tabs.forEach(b => b.addEventListener("click", () => {
    tabs.forEach(x => x.setAttribute("aria-selected", x === b));
    panels.forEach(p => p.classList.toggle("on", p.dataset.p === b.dataset.t));
  }));

  /* ---------- tarla simülasyonu ---------- */
  (function sim() {
    const fieldEl = $("#field"), feed = $("#feed"); if (!fieldEl) return;
    const MAX = 10, rows = "ABC", cols = 4;
    const plots = [];
    const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
    const DRY = [138, 104, 58], WET = [28, 110, 46];
    for (let r = 0; r < 3; r++) for (let c = 1; c <= cols; c++) {
      const el = document.createElement("button");
      el.className = "plot nosense"; el.type = "button";
      el.innerHTML = '<span class="id"></span><span class="val"></span><span class="drops"></span>';
      fieldEl.append(el);
      plots.push({ id: rows[r] + c, el, m: 50 + Math.random() * 30, rate: .55 + Math.random() * .6, sensor: false, alerted: false });
    }
    let hinted = false, temp = 12, tLog = Array.from({ length: 30 }, (_, i) => 11 + 8 * Math.sin((i - 30) / 14)), t = 0, frost = false;
    const now = () => new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    function push(msg, cls = "") {
      const li = document.createElement("li"); if (cls) li.className = cls;
      li.innerHTML = `<i></i><div>${msg}<time>${now()}</time></div>`;
      feed.prepend(li); while (feed.children.length > 4) feed.lastChild.remove();
    }
    function drops(p) {
      const box = $(".drops", p.el);
      for (let i = 0; i < 9; i++) { const d = document.createElement("i"); d.className = "drop"; d.style.left = (8 + Math.random() * 84) + "%"; d.style.animationDelay = (Math.random() * .35) + "s"; box.append(d); setTimeout(() => d.remove(), 1200); }
    }
    plots.forEach(p => p.el.addEventListener("click", () => {
      const n = plots.filter(x => x.sensor).length;
      if (!p.sensor) {
        if (n >= MAX) { push("En fazla <b>10 sensör düğümü</b>: bu, ilk yıl hedefimiz.", "info"); return; }
        p.sensor = true; push(`Parsel <b>${p.id}</b> bağlandı · nem <b>%${Math.round(p.m)}</b>`, "info");
      } else {
        p.m = Math.min(100, p.m + 45); p.alerted = false; drops(p);
        push(`Parsel <b>${p.id}</b> sulandı → nem <b>%${Math.round(p.m)}</b>`);
      }
      render();
    }));
    function spark() {
      const mn = Math.min(...tLog) - 1, mx = Math.max(...tLog) + 1;
      const pts = tLog.map((v, i) => [i / (tLog.length - 1) * 200, 60 - (v - mn) / (mx - mn) * 54]);
      const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
      $("#sparkLine").setAttribute("d", d); $("#sparkArea").setAttribute("d", d + " L200 64 L0 64 Z");
      $("#tNow").textContent = temp.toFixed(1) + " °C";
    }
    function render() {
      const sensed = plots.filter(p => p.sensor);
      plots.forEach(p => {
        const m = clamp(p.m, 0, 100), el = p.el;
        el.classList.toggle("nosense", !p.sensor);
        el.classList.toggle("thirsty", p.sensor && m < 30);
        el.classList.toggle("alert", p.sensor && m < 30);
        const wet = p.sensor ? mix(DRY, WET, clamp((m - 10) / 70, 0, 1)) : [44, 74, 55];
        el.style.setProperty("--wet", `rgb(${wet.join(",")})`);
        $(".id", el).textContent = p.id;
        $(".val", el).innerHTML = p.sensor ? `%${Math.round(m)}<small> nem</small>` : "???";
        let nd = $(".node", el);
        if (p.sensor && !nd) { nd = document.createElement("span"); nd.className = "node"; el.append(nd); }
        el.setAttribute("aria-label", `Parsel ${p.id}: ${p.sensor ? "nem %" + Math.round(m) + ", sulamak için tıkla" : "sensör yok, sensör yerleştirmek için tıkla"}`);
      });
      const avg = sensed.length ? sensed.reduce((a, p) => a + p.m, 0) / sensed.length : null;
      const yld = plots.reduce((a, p) => a + Math.min(1, clamp(p.m, 0, 100) / 35), 0) / plots.length * 100;
      $("#nodeCount").textContent = `Sensör düğümü: ${sensed.length} / ${MAX}`;
      $("#mNodes").textContent = sensed.length; $("#bNodes").style.width = sensed.length / MAX * 100 + "%";
      $("#mMoist").textContent = avg == null ? "—" : "%" + Math.round(avg); $("#bMoist").style.width = (avg || 0) + "%";
      $("#mYield").textContent = Math.round(yld) + "%"; $("#bYield").style.width = yld + "%";
      return yld;
    }
    function tick() {
      t++;
      plots.forEach(p => {
        p.m = Math.max(0, p.m - p.rate * (temp > 14 ? 1.25 : .8));
        if (p.sensor && p.m < 30 && !p.alerted) { p.alerted = true; push(`⚠ Parsel <b>${p.id}</b> toprak nemi <b>%${Math.round(p.m)}</b> — sulama zamanı`, "warn"); }
        if (p.sensor && p.m > 45) p.alerted = false;
      });
      temp = 11 + 8 * Math.sin(t / 14) + (Math.random() - .5) * .8;
      tLog.push(temp); tLog.shift(); spark();
      if (temp < 5 && !frost) { frost = true; push(`❄ Don riski: hava <b>${temp.toFixed(1)} °C</b>. Genç fidelere örtü önerilir.`, "warn"); }
      if (temp > 8) frost = false;
      const y = render();
      if (!hinted && y < 72 && plots.some(p => !p.sensor)) { hinted = true; push("İpucu: verim düşüyor. <b>Sensörsüz parsellerin</b> nemini bilemezsin — düğüm ekle.", "info"); }
    }
    render(); spark();
    let timer = null;
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !timer) timer = setInterval(tick, 1000); else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; } }, { threshold: .15 }).observe($(".sim"));
  })();

  /* ---------- iletişim / bağış (config.js'ten) ---------- */
  (function contact() {
    const body = $("#contactBody"); let h = "";
    const mail = CFG.email;
    if (mail) {
      const s = encodeURIComponent("ORKÜTEK — İletişim");
      h += `<p>Mentor, gönüllü, sponsor, ekipman veya proje ortaklığı: bir e-posta uzağındayız.</p><a class="btn btn-dark" href="mailto:${mail}?subject=${s}">${mail} →</a>`;
    }
    if (CFG.iban) {
      h += `<p style="margin-top:14px"><b>${CFG.ibanOwner || ""}</b> ${CFG.bank ? "· " + CFG.bank : ""}</p><div class="row"><span id="ibanTxt">${CFG.iban}</span><button type="button" id="copyIban">Kopyala</button></div>`;
    }
    const soc = CFG.social || {}, names = { instagram: "Instagram", x: "X", youtube: "YouTube", linkedin: "LinkedIn", github: "GitHub" };
    const links = Object.keys(names).filter(k => soc[k]).map(k => `<a href="${soc[k]}" target="_blank" rel="noopener">${names[k]}</a>`).join("");
    if (links) h += `<div class="links">${links}</div>`;
    if (!h) h = `<p class="soon">Dernek tescil sürecimiz tamamlandığında banka hesap bilgilerimizi ve iletişim kanallarımızı burada yayımlayacağız. Haberdar kalın: bu sayfayı takip edin.</p>`;
    body.innerHTML = h;
    const cp = $("#copyIban");
    if (cp) cp.addEventListener("click", async () => { try { await navigator.clipboard.writeText(CFG.iban); cp.textContent = "Kopyalandı ✓"; setTimeout(() => cp.textContent = "Kopyala", 1800); } catch { cp.textContent = "Elle kopyalayın"; } });
    $("#joinCard").style.cursor = "pointer";
    $("#joinCard").addEventListener("click", () => $("#contactCard").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }));
  })();

  console.log("%cORKÜTEK%c  kırsalın sinyali, geleceğin kodu.\nKod yazmayı seviyorsan: gönüllü ol ✦", "background:#febd36;color:#2a1700;font:800 18px sans-serif;padding:4px 10px;border-radius:6px", "font:14px monospace;color:#1d5a22");
})();
