const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navItem = document.querySelectorAll(".nav__item"),
  header = document.getElementById("header");

// open and close menu
navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("nav__menu--open");
  changeIcon();
});

// close the menu when the user clicks the nav links
navItem.forEach((item) => {
  item.addEventListener("click", () => {
    if (navMenu.classList.contains("nav__menu--open")) {
      navMenu.classList.remove("nav__menu--open");
    }
    changeIcon();
  });
});

// Change nav toggle icon
function changeIcon() {
  if (navMenu.classList.contains("nav__menu--open")) {
    navToggle.classList.replace("ri-menu-3-line", "ri-close-line");
  } else {
    navToggle.classList.replace("ri-close-line", "ri-menu-3-line");
  }
}

// Testimonial Slide

const testimonialSlide = new Swiper(".testimonial__wrapper", {
  loop: true,
  spaceBetween: 30,
  centeredSlides: true,
  effect: "coverflow",
  grabCursor: true,
  slidesPerView: 1,
  coverflowEffect: {
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  breakpoints: {
    520: {
      slidesPerView: "auto",
    },
  },
});

// Horizontal drag scroll for timeline/project strips
const dragScrollContainers = document.querySelectorAll("[data-drag-scroll]");

dragScrollContainers.forEach((container) => {
  let isPointerDown = false;
  let hasDragged = false;
  let startX = 0;
  let startScrollLeft = 0;

  const endDrag = () => {
    isPointerDown = false;
    container.classList.remove("is-dragging");
  };

  container.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    isPointerDown = true;
    hasDragged = false;
    startX = event.clientX;
    startScrollLeft = container.scrollLeft;
    container.classList.add("is-dragging");
    if (typeof container.setPointerCapture === "function") {
      container.setPointerCapture(event.pointerId);
    }
  });

  container.addEventListener("pointermove", (event) => {
    if (!isPointerDown) return;
    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) > 3) {
      hasDragged = true;
    }
    container.scrollLeft = startScrollLeft - deltaX;
  });

  container.addEventListener("pointerup", () => {
    endDrag();
    requestAnimationFrame(() => {
      hasDragged = false;
    });
  });

  container.addEventListener("pointercancel", endDrag);
  container.addEventListener("lostpointercapture", endDrag);

  container.addEventListener(
    "click",
    (event) => {
      if (!hasDragged) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true
  );
});

// Mini terminal layer behind the hero image
const heroTerminalCanvas = document.querySelector(".hero-terminal-canvas");
if (heroTerminalCanvas) {
  const heroVisual = heroTerminalCanvas.closest(".hero__visual");
  const heroImage = heroVisual ? heroVisual.querySelector(".hero__img") : null;
  const heroCtx = heroTerminalCanvas.getContext("2d");
  if (heroCtx) {
    const heroTerminalFeed = [
      { text: "[boot] profile.render --mode=secure", type: "info" },
      { text: "[ok] modules loaded: nmap wireshark burp", type: "success" },
      { text: "akash@cyber:~$ whoami", type: "prompt" },
      { text: "akash", type: "log" },
      { text: "akash@cyber:~$ uptime", type: "prompt" },
      { text: "up 5 days, load average: 0.12 0.18 0.23", type: "log" },
      { text: "akash@cyber:~$ status --portfolio", type: "prompt" },
      { text: "[ok] target online", type: "success" },
      { text: "[warn] scanline drift compensated", type: "warn" },
    ];

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lineClock = 0;
    let cursorClock = 0;
    let cursorOn = true;
    let lineIndex = 0;
    let rafId = 0;
    let resizeObserver = null;
    const buffer = [];

    const lineHeight = () => (reduceMotion.matches ? 14 : 15);
    const fontSize = () => (reduceMotion.matches ? 11 : 12);
    const feedDelay = () => (reduceMotion.matches ? 1100 : 620);

    const typeColor = {
      prompt: "rgba(150, 255, 180, 0.95)",
      info: "rgba(107, 205, 253, 0.86)",
      success: "rgba(150, 255, 177, 0.9)",
      warn: "rgba(240, 208, 116, 0.9)",
      log: "rgba(113, 212, 134, 0.78)",
    };

    const resizeHeroTerminal = () => {
      const rect = (heroVisual || heroTerminalCanvas).getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      heroTerminalCanvas.width = Math.floor(width * dpr);
      heroTerminalCanvas.height = Math.floor(height * dpr);
      heroCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pushLine = () => {
      buffer.push(heroTerminalFeed[lineIndex % heroTerminalFeed.length]);
      lineIndex += 1;
      const maxLines = Math.max(6, Math.floor((height - 28) / lineHeight()));
      if (buffer.length > maxLines) {
        buffer.splice(0, buffer.length - maxLines);
      }
    };

    const drawHeroTerminal = (timestamp) => {
      if (width < 6 || height < 6) {
        rafId = requestAnimationFrame(drawHeroTerminal);
        return;
      }

      if (document.hidden) {
        rafId = requestAnimationFrame(drawHeroTerminal);
        return;
      }

      if (!lineClock) lineClock = timestamp;
      if (!cursorClock) cursorClock = timestamp;

      if (timestamp - lineClock >= feedDelay()) {
        pushLine();
        lineClock = timestamp;
      }

      if (timestamp - cursorClock >= 520) {
        cursorOn = !cursorOn;
        cursorClock = timestamp;
      }

      const gradient = heroCtx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(2, 10, 12, 0.88)");
      gradient.addColorStop(1, "rgba(1, 5, 7, 0.94)");
      heroCtx.fillStyle = gradient;
      heroCtx.fillRect(0, 0, width, height);

      heroCtx.fillStyle = "rgba(100, 255, 158, 0.08)";
      for (let y = 0; y < height; y += 4) {
        heroCtx.fillRect(0, y, width, 1);
      }

      heroCtx.font = `${fontSize()}px 'Consolas', 'Courier New', monospace`;
      heroCtx.textBaseline = "top";
      heroCtx.shadowBlur = 4;
      heroCtx.shadowColor = "rgba(80, 255, 130, 0.28)";

      let y = height - buffer.length * lineHeight() - 26;
      if (y < 10) y = 10;

      buffer.forEach((line) => {
        heroCtx.fillStyle = typeColor[line.type] || typeColor.log;
        heroCtx.fillText(line.text, 10, y);
        y += lineHeight();
      });

      const prompt = "akash@cyber:~$ ";
      heroCtx.fillStyle = typeColor.prompt;
      heroCtx.fillText(prompt, 10, y);

      if (cursorOn) {
        const cursorX = 10 + heroCtx.measureText(prompt).width + 1;
        heroCtx.fillRect(cursorX, y + 2, 7, fontSize() - 2);
      }

      rafId = requestAnimationFrame(drawHeroTerminal);
    };

    window.addEventListener("resize", resizeHeroTerminal, { passive: true });
    resizeHeroTerminal();
    requestAnimationFrame(resizeHeroTerminal);

    if (heroImage && !heroImage.complete) {
      heroImage.addEventListener("load", resizeHeroTerminal, { once: true });
    }

    if (heroVisual && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => resizeHeroTerminal());
      resizeObserver.observe(heroVisual);
    }

    for (let i = 0; i < 4; i += 1) pushLine();
    rafId = requestAnimationFrame(drawHeroTerminal);

    if (typeof reduceMotion.addEventListener === "function") {
      reduceMotion.addEventListener("change", resizeHeroTerminal);
    } else if (typeof reduceMotion.addListener === "function") {
      reduceMotion.addListener(resizeHeroTerminal);
    }

    window.addEventListener("beforeunload", () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
    });
  }
}

// header scroll animation
window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    header.classList.add("header--scroll");
  } else {
    header.classList.remove("header--scroll");
  }
});

// ScrollReveal animations
const sr = ScrollReveal({
  duration: 900,
  distance: "60px",
  delay: 120,
  reset: false,
});

sr.reveal(".hero__content, .about__content");
sr.reveal(".hero__img", { origin: "top" });

sr.reveal(
  ".hero__info-wrapper, .skills__title, .skills__content, .qualification__name, .qualification__item, .experience-card, .service__card, .project__content, .testimonial__wrapper, .footer__content",
  {
    delay: 180,
    interval: 70,
  }
);

sr.reveal(".qualification__footer-text, .contact__content", {
  origin: "left",
});

 sr.reveal(".qualification__footer .btn, .contact__btn", { origin: "right" });
