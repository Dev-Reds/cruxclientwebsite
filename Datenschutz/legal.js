(() => {
  "use strict";

  /* Kopier- und Vervielfaeltigungsschutz fuer die Rechtsseiten.
     Hinweis: Das ist eine technische Erschwerung, kein absoluter Schutz –
     Quellcode und Seiteninhalt bleiben im Browser abrufbar. */

  const MSG = "Kopieren ist nicht gestattet – die Inhalte sind urheberrechtlich geschützt.";

  const toast = document.createElement("div");
  toast.className = "guard-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = MSG;
  document.body.appendChild(toast);

  let timer = null;
  const showToast = () => {
    toast.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };

  /* Rechtsklick unterbinden */
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showToast();
  });

  /* Ziehen von Text/Bildern unterbinden */
  document.addEventListener("dragstart", (e) => e.preventDefault());

  /* Kopieren / Ausschneiden unterbinden */
  ["copy", "cut"].forEach((type) =>
    document.addEventListener(type, (e) => {
      e.preventDefault();
      showToast();
    })
  );

  /* Tastenkürzel: Strg+C, Strg+X, Strg+A (Auswahl markieren) */
  document.addEventListener("keydown", (e) => {
    const key = (e.key || "").toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (key === "c" || key === "x" || key === "a")) {
      e.preventDefault();
      showToast();
    }
  });

  /* Auswahl per Touch / Doppelklick unterbinden */
  document.addEventListener("selectstart", (e) => {
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0 && !e.target.closest?.(".allow-select")) {
      e.preventDefault();
    }
  });
})();
