(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const content = window.PORTFOLIO_CONTENT || {};
  const nav = document.getElementById("main-nav");
  const menu = document.querySelector(".menu-toggle");
  let lastFocusedElement = null;

  function setMenuOpen(open) {
    nav.classList.toggle("is-open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }
  menu.addEventListener("click", () => setMenuOpen(menu.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenuOpen(false)));
  document.addEventListener("click", event => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) setMenuOpen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menu.focus();
    }
  });
  window.matchMedia("(max-width: 680px)").addEventListener("change", () => setMenuOpen(false));

  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog || dialog.open) return;
    lastFocusedElement = document.activeElement;
    dialog.showModal();
    document.body.classList.add("dialog-open");
    setMenuOpen(false);
  }
  document.querySelectorAll("[data-open-dialog]").forEach(button => {
    button.addEventListener("click", () => openDialog(button.dataset.openDialog));
  });
  document.querySelectorAll(".site-dialog").forEach(dialog => {
    dialog.querySelectorAll("[data-close-dialog], [data-close-on-navigate]").forEach(control => {
      control.addEventListener("click", () => dialog.close());
    });
    dialog.addEventListener("click", event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      if (lastFocusedElement && document.contains(lastFocusedElement)) lastFocusedElement.focus({ preventScroll: true });
      if (dialog.id === "login-dialog") {
        document.getElementById("login-password").value = "";
        document.getElementById("login-feedback").textContent = "";
      }
    });
  });

  // Frontend-only sign-in form. No credentials are stored or transmitted.
  document.getElementById("login-form").addEventListener("submit", event => {
    event.preventDefault();
    document.getElementById("login-feedback").textContent = "Sign-in is not available yet. Contact me if you need access.";
    document.getElementById("login-password").value = "";
  });

  function safeHref(value, allowLocal = false) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      if (url.protocol === "http:" || url.protocol === "https:") return url.href;
      if (allowLocal && url.protocol === "file:" && !/^[a-z]+:/i.test(value)) return value;
    } catch (_) { /* Invalid author-provided URL: retain the safe default. */ }
    return null;
  }
  const email = typeof content.email === "string" ? content.email.trim() : "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.querySelectorAll("[data-email]").forEach(node => { node.textContent = email; });
    document.querySelectorAll(".email-link, [data-contact-email]").forEach(link => { link.href = `mailto:${email}`; });
  }
  if (typeof content.phone === "string") document.querySelector("[data-phone]").textContent = content.phone;
  if (/^\+?[0-9]{7,15}$/.test(content.phoneHref || "")) document.querySelector(".phone-link").href = `tel:${content.phoneHref}`;

  document.querySelectorAll("[data-social]").forEach(control => {
    const name = control.dataset.social;
    const href = safeHref(content.socials?.[name]);
    if (href && control.tagName === "BUTTON") {
      const link = document.createElement("a");
      link.className = control.className;
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Contact on ${name === "linkedin" ? "LinkedIn" : "Instagram"}`);
      while (control.firstChild) link.appendChild(control.firstChild);
      control.replaceWith(link);
    } else if (href && control.tagName === "A") {
      control.href = href;
    } else if (control.tagName === "BUTTON") {
      control.addEventListener("click", () => openDialog("contact-dialog"));
    }
  });
  const whatsapp = safeHref(content.socials?.whatsapp);
  if (whatsapp) document.querySelector("[data-contact-whatsapp]").href = whatsapp;

  const projects = Array.isArray(content.projects) ? content.projects.filter(project => project && typeof project.title === "string") : [];
  function makeProject(project, compact = false) {
    const href = safeHref(project.url, true);
    const card = document.createElement(href ? "a" : "article");
    if (href) {
      card.href = href;
      if (/^https?:/i.test(href)) {
        card.target = "_blank";
        card.rel = "noopener noreferrer";
      }
    }
    if (!compact) {
      card.className = "project-card";
      const visual = document.createElement("div");
      visual.className = "project-visual";
      const imageHref = safeHref(project.image, true);
      if (imageHref) {
        const image = document.createElement("img");
        image.src = imageHref;
        image.alt = "";
        image.loading = "lazy";
        visual.appendChild(image);
      } else {
        const mark = document.createElement("span");
        mark.className = "project-code-mark";
        mark.textContent = "</>";
        mark.setAttribute("aria-hidden", "true");
        visual.appendChild(mark);
      }
      card.appendChild(visual);
    }
    const caption = document.createElement("div");
    if (!compact) caption.className = "project-caption";
    const title = document.createElement("h3");
    title.textContent = project.title;
    caption.appendChild(title);
    if (typeof project.description === "string" && project.description) {
      const description = document.createElement("p");
      description.textContent = project.description;
      caption.appendChild(description);
    }
    card.appendChild(caption);
    return card;
  }
  if (projects.length) {
    const grid = document.getElementById("project-grid");
    const list = document.getElementById("all-projects");
    grid.replaceChildren(...projects.slice(0, 3).map(project => makeProject(project)));
    list.replaceChildren(...projects.map(project => makeProject(project, true)));
  }
})();
