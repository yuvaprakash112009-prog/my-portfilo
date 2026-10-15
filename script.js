/**
 * WEB CORE — CLIENT INTERACTION ENGINE
 * Orchestrates preloader, theme toggle, mobile drawer navigation,
 * 3D hero particle constellation canvas, contact physics dot matrix,
 * smooth scrolling observer, and validated contact actions.
 */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1. PRELOADER DISMISSAL
  ========================================================== */
  const preloader = document.getElementById("preloader");
  const dismissPreloader = () => {
    if (!preloader) return;
    preloader.style.opacity = "0";
    preloader.style.pointerEvents = "none";
    setTimeout(() => {
      preloader.style.display = "none";
    }, 700);
  };

  // Dismiss on window load or safe fallback after 1.2s
  window.addEventListener("load", dismissPreloader);
  setTimeout(dismissPreloader, 1200);

  /* =========================================================
     2. THEME TOGGLE (DARK / LIGHT MODE)
  ========================================================== */
  const themeToggle = document.getElementById("theme-toggle");
  const sunIcon = document.getElementById("theme-icon-sun");
  const moonIcon = document.getElementById("theme-icon-moon");

  const updateThemeUI = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("webcore_theme", theme);
    } catch (e) {}

    if (sunIcon && moonIcon) {
      if (theme === "light") {
        sunIcon.classList.remove("hidden");
        moonIcon.classList.add("hidden");
      } else {
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
      }
    }
  };

  // Initialize theme
  const initialTheme = document.documentElement.getAttribute("data-theme") || "dark";
  updateThemeUI(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "light" ? "dark" : "light";
      updateThemeUI(next);
    });
  }

  /* =========================================================
     3. HEADER DYNAMICS & MOBILE DRAWER MENU
  ========================================================== */
  const header = document.getElementById("site-header");
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileDrawer = document.getElementById("mobile-menu-drawer");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  // Sticky header background on scroll
  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 30) {
      header.classList.add("bg-black/90", "backdrop-blur-xl", "border-b", "border-gray-800", "shadow-lg");
    } else {
      header.classList.remove("bg-black/90", "backdrop-blur-xl", "border-b", "border-gray-800", "shadow-lg");
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  let isMobileOpen = false;
  const toggleMobileMenu = (forceState) => {
    isMobileOpen = typeof forceState === "boolean" ? forceState : !isMobileOpen;
    if (!mobileDrawer || !mobileToggle) return;

    if (isMobileOpen) {
      mobileDrawer.classList.remove("hidden");
      mobileToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    } else {
      mobileDrawer.classList.add("hidden");
      mobileToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  };

  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => toggleMobileMenu());
  }

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => toggleMobileMenu(false));
  });

  // Close mobile drawer on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMobileOpen) {
      toggleMobileMenu(false);
    }
  });

  /* =========================================================
     4. ACTIVE NAVIGATION LINK ON SCROLL (INTERSECTION OBSERVER)
  ========================================================== */
  const navItems = document.querySelectorAll("#desktop-nav-links .nav-item");
  const sections = document.querySelectorAll("section[id]");

  const observerOptions = {
    root: null,
    rootMargin: "-25% 0px -65% 0px",
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navItems.forEach((item) => {
          const target = item.getAttribute("data-nav");
          const underline = item.querySelector(".nav-underline");
          if (target === id) {
            item.classList.add("text-gold");
            item.classList.remove("text-gray-400");
            if (underline) {
              underline.classList.remove("w-0");
              underline.classList.add("w-full");
            }
          } else {
            item.classList.remove("text-gold");
            item.classList.add("text-gray-400");
            if (underline) {
              underline.classList.remove("w-full");
              underline.classList.add("w-0");
            }
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((sec) => navObserver.observe(sec));

  /* =========================================================
     5. HERO 3D PARTICLE CONSTELLATION CANVAS
  ========================================================== */
  const heroCanvas = document.getElementById("hero-stars-canvas");
  if (heroCanvas) {
    const ctx = heroCanvas.getContext("2d");
    let width = (heroCanvas.width = heroCanvas.offsetWidth || window.innerWidth);
    let height = (heroCanvas.height = heroCanvas.offsetHeight || window.innerHeight);
    let animationFrameId = null;
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Responsive particle count
    const particleCount = Math.floor(Math.min(width, 1400) / 14);
    const particles = [];

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 1.5 + 0.5; // Depth factor
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.8 + 0.8;
        this.baseAlpha = Math.random() * 0.55 + 0.25;
        this.isGold = Math.random() > 0.78; // 22% golden nodes
        this.pulseSpeed = Math.random() * 0.03 + 0.01;
        this.pulseAngle = Math.random() * Math.PI * 2;
      }
      update() {
        if (!prefersReducedMotion) {
          this.x += this.vx * this.z;
          this.y += this.vy * this.z;
          this.pulseAngle += this.pulseSpeed;

          // Wrap edges
          if (this.x < 0) this.x = width;
          if (this.x > width) this.x = 0;
          if (this.y < 0) this.y = height;
          if (this.y > height) this.y = 0;
        }
      }
      draw() {
        // Parallax offset
        const dx = (mouse.x - width / 2) * 0.02 * this.z;
        const dy = (mouse.y - height / 2) * 0.02 * this.z;
        const drawX = this.x + dx;
        const drawY = this.y + dy;

        const pulse = Math.sin(this.pulseAngle) * 0.25 + 0.75;
        const alpha = Math.min(1, this.baseAlpha * pulse);

        ctx.beginPath();
        ctx.arc(drawX, drawY, this.radius * (this.isGold ? 1.2 : 1), 0, Math.PI * 2);
        if (this.isGold) {
          ctx.fillStyle = `rgba(201, 162, 39, ${alpha})`;
          ctx.shadowColor = "rgba(201, 162, 39, 0.6)";
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(245, 245, 243, ${alpha * 0.8})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const connectParticles = () => {
      const maxDistance = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.16;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            if (particles[i].isGold || particles[j].isGold) {
              ctx.strokeStyle = `rgba(201, 162, 39, ${alpha * 1.5})`;
            } else {
              ctx.strokeStyle = `rgba(245, 245, 243, ${alpha})`;
            }
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };

    const animateHero = () => {
      // Lerp mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      connectParticles();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animateHero);
    };

    const handleResize = () => {
      width = heroCanvas.width = heroCanvas.offsetWidth || window.innerWidth;
      height = heroCanvas.height = heroCanvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    window.addEventListener(
      "mousemove",
      (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
      },
      { passive: true }
    );

    // Pause canvas if tab hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(animateHero);
      }
    });

    animationFrameId = requestAnimationFrame(animateHero);
  }

  /* =========================================================
     6. CONTACT SECTION: INTERACTIVE PHYSICS DOT MATRIX CANVAS
  ========================================================== */
  const contactCanvas = document.getElementById("contact-interactive-canvas");
  if (contactCanvas) {
    const ctx = contactCanvas.getContext("2d");
    let cWidth = (contactCanvas.width = contactCanvas.offsetWidth || window.innerWidth);
    let cHeight = (contactCanvas.height = contactCanvas.offsetHeight || 600);
    let contactAnimId = null;

    let cMouse = { x: -1000, y: -1000, radius: 120 };

    const cols = Math.floor(cWidth / 36);
    const rows = Math.floor(cHeight / 36);
    const spacingX = cWidth / cols;
    const spacingY = cHeight / rows;
    const dots = [];

    class MatrixDot {
      constructor(originX, originY) {
        this.originX = originX;
        this.originY = originY;
        this.x = originX;
        this.y = originY;
        this.vx = 0;
        this.vy = 0;
        this.size = 1.6;
        this.colorFactor = 0; // 0 = gray, 1 = gold
      }
      update() {
        const dx = cMouse.x - this.x;
        const dy = cMouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < cMouse.radius && distance > 0) {
          const force = (cMouse.radius - distance) / cMouse.radius;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * force * 24;
          const pushY = Math.sin(angle) * force * 24;

          this.vx -= pushX;
          this.vy -= pushY;
          this.colorFactor = Math.min(1, this.colorFactor + 0.15);
        } else {
          this.colorFactor = Math.max(0, this.colorFactor - 0.03);
        }

        // Spring tension back to origin
        const springX = (this.originX - this.x) * 0.1;
        const springY = (this.originY - this.y) * 0.1;
        this.vx = (this.vx + springX) * 0.82; // Damping
        this.vy = (this.vy + springY) * 0.82;

        this.x += this.vx;
        this.y += this.vy;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (1 + this.colorFactor * 0.8), 0, Math.PI * 2);

        if (this.colorFactor > 0.05) {
          ctx.fillStyle = `rgba(201, 162, 39, ${0.3 + this.colorFactor * 0.7})`;
          ctx.shadowColor = "rgba(201, 162, 39, 0.5)";
          ctx.shadowBlur = 6 * this.colorFactor;
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const initContactDots = () => {
      dots.length = 0;
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          dots.push(new MatrixDot(i * spacingX, j * spacingY));
        }
      }
    };
    initContactDots();

    const renderContactCanvas = () => {
      ctx.clearRect(0, 0, cWidth, cHeight);
      dots.forEach((dot) => {
        dot.update();
        dot.draw();
      });
      contactAnimId = requestAnimationFrame(renderContactCanvas);
    };

    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.addEventListener("mousemove", (e) => {
        const rect = contactCanvas.getBoundingClientRect();
        cMouse.x = e.clientX - rect.left;
        cMouse.y = e.clientY - rect.top;
      });
      contactSection.addEventListener("mouseleave", () => {
        cMouse.x = -1000;
        cMouse.y = -1000;
      });
    }

    window.addEventListener("resize", () => {
      cWidth = contactCanvas.width = contactCanvas.offsetWidth || window.innerWidth;
      cHeight = contactCanvas.height = contactCanvas.offsetHeight || 600;
      initContactDots();
    }, { passive: true });

    contactAnimId = requestAnimationFrame(renderContactCanvas);
  }

  /* =========================================================
     7. CONTACT FORM VALIDATION & DIRECT MESSAGING
  ========================================================== */
  const contactForm = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = document.getElementById("btn-text");
  const btnSpinner = document.getElementById("btn-spinner");
  const btnArrow = document.getElementById("btn-arrow");
  const formFeedback = document.getElementById("form-feedback");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const phoneInput = document.getElementById("phone");
      const serviceInput = document.getElementById("service");
      const detailsInput = document.getElementById("details");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";
      const service = serviceInput ? serviceInput.value : "";
      const details = detailsInput ? detailsInput.value.trim() : "";

      // Client-side validation
      if (!name) {
        showFeedback("Please enter your name.", "error");
        if (nameInput) nameInput.focus();
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showFeedback("Please provide a valid email address.", "error");
        if (emailInput) emailInput.focus();
        return;
      }
      if (!service) {
        showFeedback("Please choose a required service.", "error");
        if (serviceInput) serviceInput.focus();
        return;
      }

      // Simulate sending with clear feedback and WhatsApp/Mailto direct fallback
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = "Processing...";
      if (btnSpinner) btnSpinner.classList.remove("hidden");
      if (btnArrow) btnArrow.classList.add("hidden");

      setTimeout(() => {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = "Send Inquiry";
        if (btnSpinner) btnSpinner.classList.add("hidden");
        if (btnArrow) btnArrow.classList.remove("hidden");

        const whatsappMessage = encodeURIComponent(
          `Hello Yuvaprakash! I came across Web Core.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nDetails: ${details || "Looking for a website project."}`
        );
        const whatsappUrl = `https://wa.me/918754012209?text=${whatsappMessage}`;
        const mailtoUrl = `mailto:yuvaprakash112009@gmail.com?subject=${encodeURIComponent(`Website Project Inquiry - ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nProject Details:\n${details}`)}`;

        if (formFeedback) {
          formFeedback.innerHTML = `
            <div class="rounded-xl border border-green-500/30 bg-green-950/40 p-4 text-left">
              <p class="font-heading font-semibold text-green-400">Inquiry Prepared Successfully!</p>
              <p class="mt-1 font-intro text-xs text-gray-300">Choose your preferred direct channel to deliver it immediately to Yuvaprakash:</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-shine inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 font-heading text-xs font-semibold text-black hover:bg-green-500">
                  Send on WhatsApp &rarr;
                </a>
                <a href="${mailtoUrl}" class="btn-shine inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-charcoal2 px-4 py-2 font-heading text-xs font-medium text-offwhite hover:border-gold hover:text-gold">
                  Send via Email &rarr;
                </a>
              </div>
            </div>
          `;
          formFeedback.classList.remove("hidden");
        }

        contactForm.reset();
      }, 700);
    });
  }

  const showFeedback = (msg, type) => {
    if (!formFeedback) return;
    formFeedback.innerHTML = `<span class="${type === "error" ? "text-red-400" : "text-green-400"} font-medium">${msg}</span>`;
    formFeedback.classList.remove("hidden");
  };

  /* =========================================================
     8. BACK TO TOP BUTTON & DYNAMIC COPYRIGHT
  ========================================================== */
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const yearElement = document.getElementById("copyright-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
