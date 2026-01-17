(function(){
  "use strict";

  // =========================
  // PRODUKT-LINKS (PRO) (HIER AENDERN)
  // =========================
  const PRODUCT_LINKS = {
    akteneinsicht_pro:   "https://ko-fi.com/s/deea689269",
    protokoll_pro:       "https://ko-fi.com/s/e6351f9887",
    beschleunigung_pro:  "https://ko-fi.com/s/ef7badc34c",
    dienstaufsicht_pro:  "https://ko-fi.com/s/ec6965e907",   // <- HIER deinen Dienstaufsicht-PRO Link rein (aktuell: dein alter fachaufsicht Link)
    durchsetzung_pro:    "https://ko-fi.com/s/0daa935e6c",
    gutachten_pro:       "https://ko-fi.com/s/c33c71ab3b",
    elternschutzpaket:   "https://ko-fi.com/s/7e0b24d2bb",
    default:             "https://ko-fi.com/rebellmitherz/shop"
  };

  // =========================
  // GRATIS-LINKS (FREEBIES) (HIER AENDERN)
  // =========================
  const FREE_HUB = "https://ko-fi.com/rebellmitherz/shop/kostenlos";

const FREE_LINKS = {
  free_default: FREE_HUB
};


  // Shop oben rechts:
  const KO_FI_SHOP_URL = "https://ko-fi.com/rebellmitherz/shop";

  // Lead (deaktiviert)
  const ENABLE_LEAD = false;
  const LEAD_ENDPOINT = ""; // leer = Demo/Frontend only

  const $ = (id) => document.getElementById(id);

  // ---------- URL Payload (robust bei file://) ----------
  function encodePayload(obj){
    const json = JSON.stringify(obj || {});
    return btoa(unescape(encodeURIComponent(json)));
  }
  function decodePayload(b64){
    try{
      const json = decodeURIComponent(escape(atob(b64)));
      return JSON.parse(json);
    }catch(e){
      return null;
    }
  }
  function getPayload(){
    const sp = new URLSearchParams(location.search);
    const d = sp.get("d");
    if (!d) return null;
    return decodePayload(d);
  }
  function gotoPage(page, payload){
    const d = encodePayload(payload);
    location.href = `${page}?d=${encodeURIComponent(d)}`;
  }

  function withParams(url, params){
    const u = new URL(url, location.href);
    Object.entries(params || {}).forEach(([k,v]) => {
      if (v !== undefined && v !== null && String(v).length) u.searchParams.set(k, String(v));
    });
    return u.toString();
  }

  function toastMsg(msg){
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function openShop(reason){
    const target = withParams(KO_FI_SHOP_URL, { src: reason || "" });
    window.open(target, "_blank", "noopener,noreferrer");
  }

  function openExternal(url, reason){
    const target = withParams(url, { src: reason || "" });
    window.open(target, "_blank", "noopener,noreferrer");
  }

  // ---------- Header ----------
  function initHeader(){
    const shopBtn = $("shopBtn");
    const imprintBtn = $("imprintBtn");
    if (shopBtn) shopBtn.addEventListener("click", () => openShop("header_shop"));
    if (imprintBtn) imprintBtn.addEventListener("click", () => location.href = "legal/imprint.html");
  }

  // ---------- START (index.html) ----------
  function initStart(){
    const gateBtn = $("gateBtn");
    const infoBtn = $("infoBtn");
    if (gateBtn) gateBtn.addEventListener("click", () => location.href = "orientierung.html");
    if (infoBtn) infoBtn.addEventListener("click", () => {
    });
  }

  // ---------- ORIENTIERUNG ----------
  function initOrientierung(){
    if (document.body.dataset.page !== "orientierung") return;

    const auswertenBtn = $("auswertenBtn");
    if (!auswertenBtn) return;

    auswertenBtn.addEventListener("click", () => {
      const kontakt  = document.querySelector('input[name="kontakt"]:checked')?.value;
      const symptom  = [...document.querySelectorAll('input[name="symptom"]:checked')].map(e => e.value);
      const arena    = document.querySelector('input[name="arena"]:checked')?.value;
      const urgency  = document.querySelector('input[name="urgency"]:checked')?.value;

      if (!kontakt || symptom.length === 0 || !arena || !urgency) {
        alert("Bitte Kontakt + Problem + Bereich + Frist auswählen.");
        return;
      }

      // --- Scoring ---
      const score = {
        akteneinsicht_pro:   0,
        protokoll_pro:       0,
        beschleunigung_pro:  0,
        dienstaufsicht_pro:  0,
        durchsetzung_pro:    0,
        gutachten_pro:       0,
        elternschutzpaket:   0
      };

      // Symptom -> Haupttreffer
      if (symptom.includes("kein_stand"))         score.akteneinsicht_pro += 6;
      if (symptom.includes("protokoll_falsch"))   score.protokoll_pro += 7;
      if (symptom.includes("verzoegerung"))       score.beschleunigung_pro += 7;
      if (symptom.includes("ja_blockt"))          score.dienstaufsicht_pro += 8; // <- HIER: statt Fachaufsicht
      if (symptom.includes("beschluss_ignoriert"))score.durchsetzung_pro += 8;
      if (symptom.includes("gutachten"))          score.gutachten_pro += 8;

      // Arena
      if (arena === "gericht") {
        score.akteneinsicht_pro += 2;
        score.protokoll_pro += 2;
        score.gutachten_pro += 2;
        score.beschleunigung_pro += 1;
        score.durchsetzung_pro += 1;
      } else if (arena === "jugendamt") {
        score.akteneinsicht_pro += 2;
        score.dienstaufsicht_pro += 3; // <- Jugendamt = Dienstaufsicht Default
      } else if (arena === "beides") {
        score.akteneinsicht_pro += 3;
        score.beschleunigung_pro += 2;
        score.gutachten_pro += 2;
        score.protokoll_pro += 1;
        score.durchsetzung_pro += 1;
        score.dienstaufsicht_pro += 2;
      }

      // Urgency
      if (urgency === "48h") {
        score.durchsetzung_pro += 2;
        score.protokoll_pro += 1;
        score.akteneinsicht_pro += 1;
        score.beschleunigung_pro += 1;
        score.dienstaufsicht_pro += 1;
      } else if (urgency === "7d") {
        score.akteneinsicht_pro += 1;
        score.beschleunigung_pro += 1;
        score.dienstaufsicht_pro += 1;
      }

      // Bundle Upsell (Elternschutzpaket)
      const vals = Object.entries(score)
        .filter(([k]) => k !== "elternschutzpaket")
        .map(([,v]) => v)
        .sort((a,b)=>b-a);

      const top1 = vals[0] || 0;
      const top2 = vals[1] || 0;
      if (top1 >= 6 && top2 >= 4) score.elternschutzpaket += 9;
      else if (top1 >= 7) score.elternschutzpaket += 4;

      const ranked = Object.entries(score).sort((a,b)=>b[1]-a[1]).slice(0,3);

      const payload = {
        kontakt, symptom, arena, urgency,
        ranked,
        bundle: score.elternschutzpaket > 0,
        ts: Date.now()
      };

      gotoPage("ergebnis.html", payload);
    });
  }

  // ---------- ERGEBNIS ----------
  function initErgebnis(){
    if (document.body.dataset.page !== "ergebnis") return;

    const payload = getPayload();
    if (!payload) return;

    const summaryText = $("summaryText");
    const needText = $("needText");
    const frameNeed = $("frameNeed");
    const ctaSolve = $("ctaSolve");
    const ctaFree = $("ctaFree");

    const mapKontakt = { ja:"Ja, regelmäßig", eingeschraenkt:"Unregelmäßig / eingeschränkt", nein:"Kein Kontakt" };
    const mapArena = { jugendamt:"Jugendamt", gericht:"Gericht", beides:"Beides" };
    const mapUrg = { "48h":"Heute / 48h", "7d":"In 7 Tagen","30d":"Über 30 Tage",
 "none":"Kein Termin" };
    const mapSym = {
      kein_stand:"Kein Stand / keine Unterlagen",
      protokoll_falsch:"Protokoll falsch / verdreht",
      verzoegerung:"Verfahren hängt / nichts passiert",
      ja_blockt:"Jugendamt blockt / unsauber",
      beschluss_ignoriert:"Beschluss wird ignoriert",
      gutachten:"Gutachten / Sachverständiger"
    };

    const symList = Array.isArray(payload.symptom) ? payload.symptom : [payload.symptom].filter(Boolean);
    const symText = symList.map(s => mapSym[s] || s).join(" · ");

    if (summaryText){
      summaryText.innerHTML = `
        <div class="summary-line"><b>Kontakt</b><span>${mapKontakt[payload.kontakt] || payload.kontakt}</span></div>
        <div class="summary-line"><b>Problem</b><span>${symText}</span></div>
        <div class="summary-line"><b>Bereich</b><span>${mapArena[payload.arena] || payload.arena}</span></div>
        <div class="summary-line"><b>Frist</b><span>${mapUrg[payload.urgency] || payload.urgency}</span></div>
      `;
    }

    const title = {
      akteneinsicht_pro:   "AKTENEINSICHT · PRO (JA & Gericht)",
      protokoll_pro:       "PROTOKOLLBERICHTIGUNG · PRO (Gericht)",
      beschleunigung_pro:  "BESCHLEUNIGUNGSRÜGE · PRO (§ 155b FamFG)",
      dienstaufsicht_pro:  "DIENSTAUFSICHTSBESCHWERDE · PRO (Jugendamt)",
      durchsetzung_pro:    "DURCHSETZUNG NACH BESCHLUSS (Klausel → Eskalation)",
      gutachten_pro:       "GUTACHTEN & SACHVERSTÄNDIGE",
      elternschutzpaket:   "ELTERNSCHUTZPAKET (alles drin, günstiger als einzeln)"
    };

    const ampel = (v) => (v >= 7 ? "🔴" : v >= 4 ? "🟡" : "🟢");

    if (needText && frameNeed){
      frameNeed.style.display = "";
      needText.innerHTML = (payload.ranked || []).map(([key,val]) => `
        <li class="step">
          <div class="num">${ampel(val)}</div>
          <p><strong>${title[key] || key}</strong><br><span style="color:rgba(230,237,243,.72)">Score: ${val}</span></p>
        </li>
      `).join("");
    }

    const topKey = (payload.ranked && payload.ranked[0] && payload.ranked[0][0]) ? payload.ranked[0][0] : "elternschutzpaket";

    if (ctaSolve){
      ctaSolve.addEventListener("click", () => {
        const url = PRODUCT_LINKS[topKey] || PRODUCT_LINKS.elternschutzpaket || PRODUCT_LINKS.default;
        openExternal(url, "cta_pro");
      });
    }

    if (ctaFree){
  ctaFree.addEventListener("click", () => {
    openExternal(FREE_LINKS.free_default, "cta_free");
  });
}


    const ctaBundle = document.getElementById("ctaBundle");
    if (ctaBundle) {
      ctaBundle.style.display = "inline-flex";
      ctaBundle.addEventListener("click", () => {
        openExternal(PRODUCT_LINKS.elternschutzpaket || PRODUCT_LINKS.default, "cta_bundle");
      });
    }
  }

  // ---------- LEAD (deaktiviert) ----------
  function initLead(){
    if (document.body.dataset.page !== "lead") return;

    if (!ENABLE_LEAD){
      location.href = "index.html";
      return;
    }

    const payload = getPayload();
    if (!payload){
      location.href = "index.html";
      return;
    }

    const leadForm = $("leadForm");
    const leadSkipShopBtn = $("leadSkipShopBtn");
    const topKey = (payload.ranked && payload.ranked[0] && payload.ranked[0][0]) ? payload.ranked[0][0] : "elternschutzpaket";

    if (leadSkipShopBtn){
      leadSkipShopBtn.addEventListener("click", () => {
        const url = PRODUCT_LINKS[topKey] || PRODUCT_LINKS.default;
        openExternal(url, "lead_solve");
      });
    }

    if (!leadForm) return;

    leadForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();

      const email = leadForm.email.value.trim();
      const consent = leadForm.consent.checked;

      if (!email || !consent){
        alert("Bitte E-Mail eintragen und der Zusendung zustimmen.");
        return;
      }

      if (!LEAD_ENDPOINT){
        toastMsg("Eingang gespeichert (Demo). Nach Anbindung kommt die PDF per Mail.");
        gotoPage("modul.html", payload);
        return;
      }

      try{
        const formData = new FormData(leadForm);
        const res = await fetch(LEAD_ENDPOINT, { method:"POST", body: formData, mode:"cors" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        toastMsg("Checkliste angefordert. Bitte E-Mails prüfen.");
        gotoPage("modul.html", payload);
      }catch(e){
        alert("Senden fehlgeschlagen. Endpoint prüfen oder später erneut versuchen.");
      }
    });
  }

  // ---------- MODUL ----------
  function initModul(){
    if (document.body.dataset.page !== "modul") return;

    const copyABtn = $("copyABtn");
    const copyBBtn = $("copyBBtn");
    const copyTextA = $("copyTextA");
    const copyTextB = $("copyTextB");
    const moduleShopBtn = $("moduleShopBtn");

    const payload = getPayload();
    const topKey = (payload && payload.ranked && payload.ranked[0] && payload.ranked[0][0]) ? payload.ranked[0][0] : "elternschutzpaket";

    async function copyFrom(el, okMsg){
      const text = (el.textContent || "").trim();
      if (!text) return;
      try{
        await navigator.clipboard.writeText(text);
        toastMsg(okMsg);
      }catch(e){
        const r = document.createRange();
        r.selectNodeContents(el);
        const s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
        toastMsg("Clipboard blockiert. Text markiert – Strg+C.");
      }
    }

    if (copyABtn && copyTextA) copyABtn.addEventListener("click", () => copyFrom(copyTextA, "Text A kopiert."));
    if (copyBBtn && copyTextB) copyBBtn.addEventListener("click", () => copyFrom(copyTextB, "Text B kopiert."));

    if (moduleShopBtn){
      moduleShopBtn.addEventListener("click", () => {
        const url = PRODUCT_LINKS[topKey] || PRODUCT_LINKS.elternschutzpaket || PRODUCT_LINKS.default;
        openExternal(url, "modul_pro");
      });
    }
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    const page = document.body?.dataset?.page || "";
    if (page === "start") initStart();
    if (page === "orientierung") initOrientierung();
    if (page === "ergebnis") initErgebnis();
    if (page === "lead") initLead();
    if (page === "modul") initModul();
  });

})();

