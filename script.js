const $ = (s) => document.querySelector(s);
const fmt = (n) => "$" + n.toLocaleString("es-CO");
const CATS = Object.fromEntries(MENU.map((c) => [c.categoria, c.productos]));
const cart = {};
// Si alguna imagen ya falló antes de cargar este script, aplicar el respaldo
document.querySelectorAll("img").forEach((i) => { if (i.getAttribute("src") && i.complete && i.naturalWidth === 0) imgFallback(i); });

/* ===== Enlaces y año ===== */
$("#mapsLink").href = MAPS; $("#igLink").href = INSTAGRAM; $("#year").textContent = new Date().getFullYear();

/* ===== Menú: pestañas y tarjetas ===== */
const tabs = $("#tabs"), grid = $("#grid");
function showCategory(cat, animate = true) {
  [...tabs.children].forEach((b) => b.setAttribute("aria-selected", b.textContent === cat));
  grid.innerHTML = CATS[cat].map((it) => `
    <article class="card">
      <div class="photo" data-ver="${it.nombre}">${it.etiqueta ? `<span class="label">${it.etiqueta}</span>` : ""}
        <img src="${it.foto || ""}" alt="${it.nombre}" loading="lazy" onerror="imgFallback(this)"></div>
      <div class="body"><h3>${it.nombre}</h3><p>${it.descripcion}</p>
        <div class="row"><span class="price">${fmt(it.precio)}</span>
        <span class="btns"><button class="ver" data-ver="${it.nombre}">Ingredientes</button>
        <button class="add" data-n="${it.nombre}">Agregar</button></span></div></div>
    </article>`).join("");
  if (window.gsap && animate)
    gsap.from(".card", { y: 70, opacity: 0, filter: "blur(10px)", duration: 1.1, stagger: 0.12, ease: "expo.out" });
}
Object.keys(CATS).forEach((cat) => {
  const b = document.createElement("button");
  b.className = "tab"; b.role = "tab"; b.textContent = cat; b.onclick = () => showCategory(cat);
  tabs.append(b);
});
showCategory(Object.keys(CATS)[0], false);

/* ===== Carrito -> WhatsApp (guarda ingredientes quitados, extras y notas) ===== */
const ALL = MENU.flatMap((c) => c.productos);
const find = (n) => ALL.find((p) => p.nombre === n);
let toastT;
function addToCart(prod, sin = [], extras = [], nota = "") {
  const sig = [prod.nombre, sin.join(","), extras.map((e) => e.n).join(","), nota].join("|");
  const unit = prod.precio + extras.reduce((t, e) => t + e.p, 0);
  cart[sig] = cart[sig] ? { ...cart[sig], q: cart[sig].q + 1 } : { n: prod.nombre, p: unit, q: 1, sin, extras, nota };
  render();
  $("#toast").classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => $("#toast").classList.remove("on"), 1600);
  if (window.gsap) gsap.fromTo("#cartBtn", { scale: 1.25 }, { scale: 1, duration: 0.8, ease: "elastic.out(1,.5)" });
}
grid.addEventListener("click", (e) => {
  const add = e.target.closest(".add"), ver = e.target.closest("[data-ver]");
  if (add) addToCart(find(add.dataset.n));
  else if (ver) openModal(find(ver.dataset.ver));
});
$("#cartList").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const k = decodeURIComponent(b.dataset.k), it = cart[k]; it.q += b.dataset.act === "+" ? 1 : -1;
  if (it.q <= 0) delete cart[k];
  render();
});
function render() {
  const entries = Object.entries(cart), items = entries.map((x) => x[1]);
  const count = items.reduce((t, i) => t + i.q, 0), total = items.reduce((t, i) => t + i.q * i.p, 0);
  $("#cartCount").textContent = count; $("#cartTotal").textContent = fmt(total);
  $("#cartList").innerHTML = entries.length
    ? entries.map(([k, i]) => `<li><span>${i.n}<br><small>${fmt(i.p * i.q)}</small>
        ${i.sin.length ? `<small class="det">✗ Sin: ${i.sin.join(", ")}</small>` : ""}
        ${i.extras.length ? `<small class="det ex">+ ${i.extras.map((e) => e.n).join(", ")}</small>` : ""}
        ${i.nota ? `<small class="det ex">📝 ${i.nota}</small>` : ""}</span>
        <span class="qty"><button data-act="-" data-k="${encodeURIComponent(k)}">−</button> ${i.q}
        <button data-act="+" data-k="${encodeURIComponent(k)}">+</button></span></li>`).join("")
    : `<li class="empty">Aún no has agregado nada. Escoge algo del menú.</li>`;
  const name = $("#clientName").value.trim();
  const lines = items.map((i) => {
    let l = `• ${i.q} x ${i.n} (${fmt(i.p * i.q)})`;
    if (i.sin.length) l += `\n   ✗ SIN: ${i.sin.join(", ")}`;
    if (i.extras.length) l += `\n   + EXTRA: ${i.extras.map((e) => e.n).join(", ")}`;
    if (i.nota) l += `\n   Nota: ${i.nota}`;
    return l;
  }).join("\n");
  const msg = `Hola Kanayas, soy ${name || "un cliente"}. Quiero pedir:\n${lines}\nTotal: ${fmt(total)}`;
  $("#sendWa").href = items.length ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}` : "#menu";
}
$("#clientName").addEventListener("input", render); render();
const openCart = (v) => { $("#drawer").classList.toggle("open", v); $("#scrim").classList.toggle("on", v); };
$("#cartBtn").onclick = () => openCart(true);
$("#closeCart").onclick = $("#scrim").onclick = () => openCart(false);

/* ===== Ventana de ingredientes ===== */
const modal = $("#modal"); let cur = null; const off = new Set(), ext = new Set();
const splitIng = (s) => { const i = s.indexOf(" "); return [s.slice(0, i), s.slice(i + 1)]; };
const modalPrice = () => { $("#mPrice").textContent = fmt(cur.precio + [...ext].reduce((t, i) => t + cur.extras[i].p, 0)); };
function openModal(p) {
  cur = p; off.clear(); ext.clear();
  $("#mImg").style.visibility = "visible"; $("#mImg").src = p.foto || ""; $("#mName").textContent = p.nombre; $("#mDesc").textContent = p.descripcion; $("#mNote").value = "";
  $("#mIngs").innerHTML = (p.ingredientes || []).map((s, i) => { const [e, n] = splitIng(s);
    return `<li><button class="ing" data-i="${i}" aria-pressed="true"><span class="em">${e}</span><span class="nm">${n}</span><span class="st">Incluido</span></button></li>`; }).join("");
  $("#mExtras").innerHTML = (p.extras || []).length ? `<p class="hint">Agrega extras</p>` + p.extras.map((x, i) => `<button class="xt" data-i="${i}">+ ${x.n} <b>${fmt(x.p)}</b></button>`).join("") : "";
  modalPrice(); modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); window.lenis && lenis.stop();
  if (window.gsap) {
    gsap.fromTo(".m-card", { y: 90, scale: 0.92, opacity: 0, filter: "blur(14px)" }, { y: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.1, ease: "expo.out", clearProps: "transform,opacity,filter" });
    gsap.fromTo("#mImg", { scale: 1.35, rotate: -8 }, { scale: 1, rotate: 0, duration: 1.8, ease: "expo.out" });
    gsap.from(".m-info > :not(#mIngs)", { y: 30, opacity: 0, duration: 0.9, stagger: 0.07, ease: "expo.out", delay: 0.15, clearProps: "transform,opacity" });
    gsap.fromTo(".ing", { scale: 0, y: 60, rotate: () => gsap.utils.random(-25, 25), opacity: 0 }, { scale: 1, y: 0, rotate: 0, opacity: 1, duration: 0.9, stagger: 0.09, ease: "back.out(1.8)", delay: 0.3, clearProps: "transform,opacity" });
    gsap.to(".ing .em", { y: -4, repeat: -1, yoyo: true, duration: 1.4, stagger: 0.18, ease: "sine.inOut", delay: 1.4 });
  }
}
function closeModal() {
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); window.lenis && lenis.start();
  window.gsap && gsap.killTweensOf(".ing .em");
}
$("#mIngs").addEventListener("click", (e) => {
  const b = e.target.closest(".ing"); if (!b) return; const i = +b.dataset.i;
  off.has(i) ? off.delete(i) : off.add(i);
  const o = off.has(i); b.classList.toggle("off", o); b.setAttribute("aria-pressed", !o); b.querySelector(".st").textContent = o ? "Sin esto" : "Incluido";
  if (window.gsap) { gsap.fromTo(b, { scale: 0.9 }, { scale: 1, duration: 0.7, ease: "elastic.out(1,.4)" });
    gsap.fromTo(b.querySelector(".em"), { rotate: 0, scale: 1.5 }, { rotate: o ? 360 : 0, scale: 1, duration: 0.7, ease: "back.out(2)" }); }
});
$("#mExtras").addEventListener("click", (e) => {
  const b = e.target.closest(".xt"); if (!b) return; const i = +b.dataset.i;
  ext.has(i) ? ext.delete(i) : ext.add(i); b.classList.toggle("on", ext.has(i)); modalPrice();
  window.gsap && gsap.fromTo(b, { scale: 0.9 }, { scale: 1, duration: 0.6, ease: "elastic.out(1,.4)" });
});
$("#mAdd").onclick = () => {
  const sin = [...off].sort((a, b) => a - b).map((i) => splitIng(cur.ingredientes[i])[1]);
  addToCart(cur, sin, [...ext].map((i) => cur.extras[i]), $("#mNote").value.trim());
  closeModal();
};
$("#mClose").onclick = closeModal;
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { openCart(false); closeModal(); } });


/* ===== PEDIDO POR QR PARA MESERO ===== */
function encodeOrderForQR(order) {
  const json = JSON.stringify(order);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}
function makeOrderCode() {
  const now = new Date();
  const stamp = now.toISOString().replace(/\D/g, "").slice(6, 14);
  const rnd = Math.floor(100 + Math.random() * 900);
  return `KAN-${stamp}-${rnd}`;
}
function getOrderItems() {
  return Object.values(cart).map(i => ({
    nombre: i.n,
    cantidad: i.q,
    precioUnitario: i.p,
    sin: i.sin || [],
    extras: (i.extras || []).map(e => ({nombre:e.n, precio:e.p})),
    nota: i.nota || ""
  }));
}
const qrModal = $("#qrModal");
function closeQR() {
  qrModal.classList.remove("open");
  qrModal.setAttribute("aria-hidden", "true");
}
function showOrderQR() {
  const items = getOrderItems();
  if (!items.length) {
    openCart(true);
    $("#toast").textContent = "Primero agrega algo al pedido";
    $("#toast").classList.add("on");
    setTimeout(() => { $("#toast").classList.remove("on"); $("#toast").textContent = "Agregado al pedido ✓"; }, 1800);
    return;
  }

  const code = makeOrderCode();
  const total = items.reduce((sum, i) => sum + i.precioUnitario * i.cantidad, 0);
  const order = {
    v: 1,
    codigo: code,
    fecha: new Date().toISOString(),
    cliente: $("#clientName").value.trim() || "Cliente",
    items,
    total
  };

  // El QR apunta a la página del mesero y lleva el pedido codificado.
  const waiterUrl = new URL("mesero.html", window.location.href);
  waiterUrl.searchParams.set("order", encodeOrderForQR(order));

  $("#orderQR").innerHTML = "";
  new QRCode(document.getElementById("orderQR"), {
    text: waiterUrl.toString(),
    width: 260,
    height: 260,
    colorDark: "#0c0b0a",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });

  $("#orderCode").textContent = code;
  $("#qrSummary").innerHTML = items.map(i => `
    <div><b>${i.cantidad}× ${i.nombre}</b><span>${fmt(i.precioUnitario*i.cantidad)}</span></div>
    ${i.sin.length ? `<small>Sin: ${i.sin.join(", ")}</small>` : ""}
    ${i.extras.length ? `<small>Extra: ${i.extras.map(e=>e.nombre).join(", ")}</small>` : ""}
    ${i.nota ? `<small>Nota: ${i.nota}</small>` : ""}
  `).join("");

  openCart(false);
  qrModal.classList.add("open");
  qrModal.setAttribute("aria-hidden", "false");
}
$("#generateQR").addEventListener("click", showOrderQR);
$("#qrClose").addEventListener("click", closeQR);
$("#qrDone").addEventListener("click", closeQR);
qrModal.addEventListener("click", e => { if (e.target === qrModal) closeQR(); });

/* ===== Animaciones (si GSAP no carga, la página sigue funcionando) ===== */
const loader = $("#loader");
if (!window.gsap || !window.ScrollTrigger) { loader.remove(); }
else {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll suave con inercia
  if (window.Lenis && !reduce) {
    const lenis = (window.lenis = new Lenis({ lerp: 0.08 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href"); if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -60 }); }
    }));
  }

  // Estados iniciales del hero (antes de que se vaya la pantalla de carga)
  gsap.set(".hw em", { yPercent: 115, filter: "blur(14px)" });
  gsap.set(".hero-photo", { scale: 0.55, rotate: -18, opacity: 0, filter: "blur(18px)" });
  gsap.set(".hero-foot", { opacity: 0, y: 30 });

  // Pantalla de carga: contador + salida
  const counter = { v: 0 };
  const tl = gsap.timeline();
  tl.to(counter, { v: 100, duration: 2.4, ease: "power1.inOut",
      onUpdate() { const n = Math.round(counter.v); $("#ldNum").textContent = String(n).padStart(2, "0"); $("#ldBar").style.transform = `scaleX(${n / 100})`; } })
    .to(".ld-wrap", { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" }, "+=0.15")
    .to(loader, { yPercent: -100, duration: 1.2, ease: "expo.inOut" })
    .to(".hw em", { yPercent: 0, filter: "blur(0px)", duration: 1.6, stagger: 0.15, ease: "expo.out" }, "-=0.6")
    .to(".hero-photo", { scale: 1, rotate: 0, opacity: 1, filter: "blur(0px)", duration: 2, ease: "expo.out" }, "<")
    .to(".hero-foot", { opacity: 1, y: 0, duration: 1.2, ease: "expo.out" }, "-=1.2")
    .add(() => loader.remove());

  if (!reduce) {
    // Hero: foto gira y crece, palabras se van en sentidos opuestos
    const hs = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 };
    gsap.to(".hero-photo", { scrollTrigger: hs, rotate: 14, scale: 1.2, y: 80, ease: "none" });
    gsap.to(".hw:nth-child(1) em", { scrollTrigger: hs, xPercent: -18, ease: "none" });
    gsap.to(".hw:nth-child(2) em", { scrollTrigger: hs, xPercent: 12, ease: "none" });
    gsap.to(".hw:nth-child(3) em", { scrollTrigger: hs, xPercent: -10, ease: "none" });
    gsap.to(".hero-words", { scrollTrigger: hs, opacity: 0.2, ease: "none" });

    // Texto de historia: palabra por palabra
    const big = $("#bigText");
    big.innerHTML = big.textContent.split(" ").map((w) => `<span>${w}</span>`).join(" ");
    gsap.to("#bigText span", { opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: "#bigText", start: "top 80%", end: "bottom 45%", scrub: 1 } });

    // Fotos con parallax
    document.querySelectorAll(".story-imgs figure").forEach((f, i) => {
      gsap.from(f, { y: 120, opacity: 0, filter: "blur(12px)", duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: f, start: "top 88%" } });
      gsap.to(f.querySelector("img"), { yPercent: i ? -10 : -14, ease: "none", scrollTrigger: { trigger: f, scrub: true } });
    });

    // Títulos y pie gigante
    document.querySelectorAll("h2, .addr, .links").forEach((el) =>
      gsap.from(el, { y: 60, opacity: 0, filter: "blur(10px)", duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
    gsap.from("#giant", { yPercent: 40, scale: 0.85, ease: "none", scrollTrigger: { trigger: "footer", start: "top bottom", end: "bottom bottom", scrub: 1 } });
  }
}
