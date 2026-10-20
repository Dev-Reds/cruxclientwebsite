(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Mobile Navigation ---------- */
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");

  navToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  });

  $$("#navLinks a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Sticky nav state ---------- */
  const nav = $("#nav");
  const onScroll = () => nav?.classList.toggle("is-stuck", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          entry.target.style.transitionDelay = `${Math.min(i * 70, 350)}ms`;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$("[data-count]");
  const animate = (el, targetOverride) => {
    const target = targetOverride ?? Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("de-DE") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          animate(e.target);
          co.unobserve(e.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- Download-Tracker (echte Zahlen aus den GitHub-Releases) ---------- */
  const REPO = "Dev-Reds/crux-client";
  const countEl = $("#downloadCount");
  const hintEl = $("#downloadHint");
  const CACHE_KEY = "crux:downloads";
  const assetSizes = new Map();

  const formatSize = (bytes) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
  };

  const setTotal = (total) => {
    if (!countEl) return;
    countEl.dataset.count = String(total);
    const start = () => animate(countEl, total);
    if ("IntersectionObserver" in window) {
      const to = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            start();
            obs.unobserve(e.target);
          });
        },
        { threshold: 0.4 }
      );
      to.observe(countEl);
    } else {
      start();
    }
  };

  const useFallback = () => {
    let cached = null;
    try {
      cached = localStorage.getItem(CACHE_KEY);
    } catch (e) {
      cached = null;
    }
    if (cached && Number(cached) > 0) {
      setTotal(Number(cached));
      if (hintEl) hintEl.textContent = "Installer-Downloads (letzter Stand)";
    } else if (countEl) {
      countEl.textContent = "–";
      if (hintEl) hintEl.textContent = "GitHub-API nicht erreichbar";
    }
  };

  const loadDownloads = async () => {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const releases = await res.json();
      if (!Array.isArray(releases)) throw new Error("unerwartetes Format");
      const total = releases.reduce(
        (sum, rel) =>
          sum + (rel.assets || []).reduce((s, asset) => s + (asset.download_count || 0), 0),
        0
      );
      const latest = releases.find((rel) => !rel.draft && !rel.prerelease);
      (latest?.assets || []).forEach((asset) => {
        if (asset.name && asset.size) assetSizes.set(asset.name, asset.size);
      });
      if (total > 0) {
        setTotal(total);
        if (hintEl) hintEl.textContent = "Installer-Downloads gesamt";
        try {
          localStorage.setItem(CACHE_KEY, String(total));
        } catch (e) {
          /* ignore */
        }
      } else {
        useFallback();
      }
      renderFileCaption();
    } catch (e) {
      useFallback();
    }
  };

  loadDownloads();

  /* ---------- Download: Version -> Betriebssystem ---------- */
  const VERSIONS = {
    mini: { label: "Version 1", name: "Mini", state: "soon" },
    full: { label: "Version 2", name: "Full Launcher", state: "ready" },
    custom: { label: "Version 3", name: "Customizable", state: "soon" }
  };

  const versionPicks = $$("#pickVersion .pick");
  const osPicks = $$("#pickOs .pick");
  const panelOs = $("#panelOs");
  const versionHint = $("#versionHint");
  const osHint = $("#osHint");
  const startBtn = $("#startDownload");
  const summary = $("#downloadSummary");
  const stepperItems = $$("#stepper .stepper__item");

  const state = { version: null, os: null, variant: "appimage" };

  /* ---------- Alternative Builds je Betriebssystem (Overlay) ---------- */
  const RELEASE_URL = "https://github.com/Dev-Reds/crux-client/releases/latest/download/";
  const VARIANTS = {
    linux: [
      { id: "appimage", label: "AppImage", file: "Crux-Client-Linux-x64.AppImage", desc: "Einfach ausführen – keine Installation nötig" },
      { id: "deb", label: "DEB", file: "Crux-Client-Linux-x64.deb", desc: "Paket für Debian, Ubuntu und Linux Mint" },
      { id: "rpm", label: "RPM", file: "Crux-Client-Linux-x64.rpm", desc: "Paket für Fedora, openSUSE und RHEL" },
      { id: "tar", label: "TAR.GZ", file: "Crux-Client-Linux-x64.tar.gz", desc: "Archiv für jede Distribution" }
    ]
  };

  const variantToggle = $("#variantToggle");
  const variantModal = $("#variantModal");
  const variantList = $("#variantList");
  const linuxPick = osPicks.find((p) => p.dataset.os === "linux");
  const fileEl = $("#downloadFile");

  /* nur Dateien anbieten, die zum gewaehlten Betriebssystem passen */
  const variantsFor = (os) => VARIANTS[os] || [];

  const renderFileCaption = () => {
    if (!fileEl) return;
    const osPick = osPicks.find((p) => p.dataset.os === state.os);
    if (!osPick || !osPick.dataset.file) {
      fileEl.textContent = "";
      return;
    }
    const size = formatSize(assetSizes.get(osPick.dataset.file));
    fileEl.innerHTML = "";
    const arrow = document.createElement("span");
    arrow.textContent = "↓";
    const name = document.createElement("b");
    name.textContent = osPick.dataset.file;
    fileEl.appendChild(arrow);
    fileEl.appendChild(name);
    if (size) {
      const sizeEl = document.createElement("span");
      sizeEl.textContent = size;
      fileEl.appendChild(sizeEl);
    }
  };

  const applyVariant = (id) => {
    const list = variantsFor(state.os);
    const v = list.find((x) => x.id === id) || list[0];
    if (!v) return;
    state.variant = v.id;
    const pick = osPicks.find((p) => p.dataset.os === state.os);
    if (pick) {
      pick.dataset.file = v.file;
      pick.dataset.url = RELEASE_URL + v.file;
      const el = pick.querySelector(".pick__state");
      if (el) el.textContent = v.file;
    }
    refresh();
  };

  const buildVariantList = () => {
    if (!variantList) return;
    variantList.innerHTML = "";
    variantsFor(state.os).forEach((v) => {
      const btn = document.createElement("button");
      const on = state.variant === v.id;
      btn.type = "button";
      btn.className = "variant" + (on ? " is-selected" : "");
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", String(on));
      btn.dataset.variant = v.id;
      btn.innerHTML =
        '<span class="variant__icon"><svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 19h16"/></svg></span>' +
        '<span class="variant__body"><span class="variant__label"></span>' +
        '<span class="variant__desc"></span></span>' +
        '<span class="variant__file"></span>';
      btn.querySelector(".variant__label").textContent = v.label;
      btn.querySelector(".variant__desc").textContent = v.desc;
      btn.querySelector(".variant__file").textContent = v.file;
      btn.addEventListener("click", () => {
        applyVariant(v.id);
        closeVariants();
      });
      variantList.appendChild(btn);
    });
  };

  const openVariants = () => {
    if (!variantModal) return;
    const osPick = osPicks.find((p) => p.dataset.os === state.os);
    const osName = osPick?.dataset.name || "";
    const title = $("#variantTitle");
    const lead = $("#variantLead");
    if (title) title.textContent = `${osName}-Format wählen`;
    if (lead) {
      lead.textContent =
        state.os === "linux"
          ? "Der Launcher ist in allen Varianten identisch – wähle das Paket, das zu deiner Distribution passt."
          : "Wähle die Datei, die zu deinem Betriebssystem passt.";
    }
    buildVariantList();
    variantModal.hidden = false;
    document.body.style.overflow = "hidden";
    variantToggle?.setAttribute("aria-expanded", "true");
    variantList?.querySelector(".is-selected")?.focus();
  };

  const closeVariants = () => {
    if (!variantModal || variantModal.hidden) return;
    variantModal.hidden = true;
    document.body.style.overflow = "";
    variantToggle?.setAttribute("aria-expanded", "false");
    variantToggle?.focus();
  };

  variantToggle?.addEventListener("click", () => {
    if (variantModal?.hidden) openVariants();
    else closeVariants();
  });

  $$("[data-variant-close]").forEach((el) => el.addEventListener("click", closeVariants));

  const setStep = (n) => {
    stepperItems.forEach((item) => {
      const step = Number(item.dataset.step);
      item.classList.toggle("is-active", step === n);
      item.classList.toggle("is-done", step < n);
    });
  };

  const updateSummary = () => {
    const v = state.version ? VERSIONS[state.version] : null;
    const osPick = osPicks.find((p) => p.dataset.os === state.os);
    if (!v) {
      summary.textContent = "Noch keine Auswahl getroffen.";
      renderFileCaption();
      return;
    }
    if (v.state === "soon") {
      summary.textContent = `${v.label} (${v.name}) ist noch in Entwicklung – noch kein Download.`;
      renderFileCaption();
      return;
    }
    if (!osPick) {
      summary.textContent = `${v.label} (${v.name}) gewählt – jetzt das Betriebssystem wählen.`;
      renderFileCaption();
      return;
    }
    summary.textContent = `${v.label} (${v.name}) · ${osPick.dataset.name}`;
    renderFileCaption();
  };

  const refresh = () => {
    const v = state.version ? VERSIONS[state.version] : null;
    const ready = v && v.state === "ready";

    panelOs.classList.toggle("is-locked", !ready);
    panelOs.setAttribute("aria-disabled", String(!ready));
    startBtn.disabled = !(ready && state.os);
    if (variantToggle) variantToggle.hidden = !(ready && state.os === "linux");

    if (!v) {
      versionHint.textContent = "Wähle eine Version, um fortzufahren.";
      versionHint.classList.remove("is-warn");
      osHint.textContent = "Zuerst eine Version auswählen.";
      osHint.classList.remove("is-warn");
      setStep(1);
    } else if (v.state === "soon") {
      versionHint.textContent = `${v.label} (${v.name}) wird gerade entwickelt und ist noch nicht verfügbar.`;
      versionHint.classList.add("is-warn");
      osHint.textContent = "Für diese Version gibt es noch keinen Installer.";
      osHint.classList.add("is-warn");
      setStep(1);
    } else {
      versionHint.textContent = `${v.label} (${v.name}) ist verfügbar – weiter mit dem Betriebssystem.`;
      versionHint.classList.remove("is-warn");
      osHint.textContent = state.os ? "Du kannst die Auswahl oben ändern." : "Jetzt dein Betriebssystem wählen.";
      osHint.classList.remove("is-warn");
      setStep(2);
    }

    updateSummary();
  };

  /* ---------- Auto-scroll to the OS panel after picking a version ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scrollToOs = () => {
    if (!panelOs) return;
    panelOs.classList.remove("is-highlight");
    void panelOs.offsetWidth;
    panelOs.classList.add("is-highlight");
    panelOs.focus({ preventScroll: true });
    panelOs.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center"
    });
  };

  /* ---------- Back navigation: land on the footer again ---------- */
  const footer = $("#footer");
  const BACK_FLAG = "crux:backToFooter";

  const scrollToFooter = () => {
    if (!footer) return;
    footer.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
  };

  const consumeBackFlag = () => {
    let flag = null;
    try {
      flag = sessionStorage.getItem(BACK_FLAG);
      if (flag === "1") sessionStorage.removeItem(BACK_FLAG);
    } catch (e) {
      return;
    }
    if (flag !== "1") return;
    setTimeout(scrollToFooter, 80);
  };

  $$('a[href^="Datenschutz/"]').forEach((a) =>
    a.addEventListener("click", () => {
      try {
        sessionStorage.setItem(BACK_FLAG, "1");
      } catch (e) {
        /* ignore */
      }
    })
  );

  window.addEventListener("pageshow", consumeBackFlag);
  window.addEventListener("popstate", consumeBackFlag);

  versionPicks.forEach((pick) => {
    pick.addEventListener("click", () => {
      state.version = pick.dataset.version;
      versionPicks.forEach((p) => {
        const on = p === pick;
        p.classList.toggle("is-selected", on);
        p.setAttribute("aria-checked", String(on));
      });
      if (VERSIONS[state.version].state !== "ready") {
        state.os = null;
        osPicks.forEach((p) => {
          p.classList.remove("is-selected");
          p.setAttribute("aria-checked", "false");
        });
      }
      refresh();
      scrollToOs();
    });
  });

  osPicks.forEach((pick) => {
    const stateEl = pick.querySelector(".pick__state");
    if (stateEl && pick.dataset.file) stateEl.textContent = pick.dataset.file;
    pick.addEventListener("click", () => {
      state.os = pick.dataset.os;
      osPicks.forEach((p) => {
        const on = p === pick;
        p.classList.toggle("is-selected", on);
        p.setAttribute("aria-checked", String(on));
      });
      refresh();
    });
  });

  /* ---------- Detect operating system (hint only) ---------- */  const ua = navigator.userAgent.toLowerCase();
  const detected = /macintosh|mac os x/.test(ua)
    ? "mac"
    : /linux|x11/.test(ua) && !/android/.test(ua)
      ? "linux"
      : /windows|win32/.test(ua)
        ? "win"
        : null;
  if (detected) {
    osPicks.find((p) => p.dataset.os === detected)?.classList.add("is-detected");
  }

  /* ---------- Download modal ---------- */
  const modal = $("#modal");
  const progressBar = $("#progressBar");
  const modalHint = $("#modalHint");
  const modalText = $("#modalText");
  let timer = null;

  const closeModal = () => {
    modal.hidden = true;
    clearInterval(timer);
    progressBar.style.width = "0%";
    document.body.style.overflow = "";
  };

  const openModal = (osName, href, versionLabel) => {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modalText.innerHTML = `Crux Client ${versionLabel} für <strong>${osName}</strong> …`;
    progressBar.style.width = "0%";
    modalHint.textContent = "Verbindung zu github.com …";

    let pct = 0;
    timer = setInterval(() => {
      pct += Math.random() * 16 + 6;
      if (pct >= 100) {
        pct = 100;
        clearInterval(timer);
        modalHint.textContent = "Starte Download …";
        setTimeout(() => {
          window.location.href = href;
          setTimeout(closeModal, 1200);
        }, 350);
      }
      progressBar.style.width = pct + "%";
    }, 180);
  };

  startBtn?.addEventListener("click", () => {
    const pick = osPicks.find((p) => p.dataset.os === state.os);
    if (!pick || !state.version) return;
    const v = VERSIONS[state.version];
    openModal(pick.dataset.name, pick.dataset.url, `${v.label} (${v.name})`);
  });

  $$("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (variantModal && !variantModal.hidden) {
      closeVariants();
      return;
    }
    if (modal && !modal.hidden) closeModal();
  });

  /* ---------- Smooth scroll for in-page links ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Year ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  refresh();
})();
