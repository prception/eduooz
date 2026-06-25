(function () {
  "use strict";

  /**
   * Detect base path for components.
   * It looks at the current script's src to determine the relative path to the root.
   * This ensures it works on local files, root domains, and subdirectories (GitHub Pages).
   */
  function getBasePath() {
    const script = document.querySelector('script[src*="components.js"]');
    if (!script) return "./";

    const src = script.getAttribute("src");
    // If the src is root-relative (starts with /), we return it up to the assets folder
    if (src.startsWith("/")) {
      return src.substring(0, src.indexOf("assets/"));
    }

    // Otherwise, return the relative part before 'assets/'
    const assetsIndex = src.indexOf("assets/");
    if (assetsIndex === -1) return "./";

    return src.substring(0, assetsIndex);
  }

  const basePath = getBasePath();

  function ensureFontAwesome() {
    if (document.querySelector('link[href*="font-awesome"]')) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    document.head.appendChild(link);
  }

  // Component paths - automatically adjusted for subdirectories
  const components = {
    header: basePath + "components/header.html",
    footer: basePath + "components/footer.html",
    chat: basePath + "components/chat.html",
    enquiryForm: basePath + "components/enquiry-form.html",
  };

  /**
   * Load a component into a container element
   * @param {string} componentPath - Path to the component HTML file
   * @param {string} containerId - ID of the container element
   */
  function loadComponent(componentPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(componentPath)
      .then((response) => {
        if (!response.ok)
          throw new Error("Component not found: " + componentPath);
        return response.text();
      })
      .then((html) => {
        // Fix relative paths if we are in a subdirectory
        if (basePath && basePath !== "" && basePath !== "/") {
          // Update href and src that don't start with http, /, #, or mailto
          html = html.replace(
            /(href|src)="(?!(?:https?:\/\/|#|mailto:|\/))([^"]+)"/g,
            '$1="' + basePath + '$2"',
          );
        }

        ensureFontAwesome();
        container.innerHTML = html;

        if (containerId === "header-container") {
          highlightActiveNav();
          initMobileNavbar();
          initMegaMenu();
          window.dispatchEvent(new Event("headerLoaded"));
        }

        if (containerId === "footer-container") {
          initScrollToTop();
          window.dispatchEvent(new Event("footerLoaded"));
        }

        if (containerId === "chat-container") {
          initChatFab();
        }

        if (containerId === "enquiry-form-container") {
          window.dispatchEvent(new Event("enquiryFormLoaded"));
        }
      })
      .catch((error) => {
        console.error("Error loading component:", error);
      });
  }

  /**
   * Initialize Scroll To Top Button
   */
  function initScrollToTop() {
    const scrollBtn = document.getElementById("scrollToTopBtn");
    if (!scrollBtn) return;

    // Show/Hide on scroll
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 500) {
          scrollBtn.classList.add("show");
        } else {
          scrollBtn.classList.remove("show");
        }
      },
      { passive: true },
    );

    // Smooth scroll to top
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  /**
   * Initialize the Premium Chat FAB button
   * - Delayed entrance animation on scroll
   * - Toggle active state on click (opens panel)
   * - Quick replies, message sending, typing indicator
   */
  function initChatFab() {
    const chatFab = document.getElementById("chatFab");
    const chatBtn = document.getElementById("chatFabBtn");
    const chatPanelClose = document.getElementById("chatPanelClose");

    if (!chatFab || !chatBtn) return;

    let chatShown = false;

    // Show chat button after scrolling 300px OR after 4 seconds
    const showChat = () => {
      if (chatShown) return;
      chatShown = true;
      chatFab.classList.add("visible");
    };

    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 300) showChat();
      },
      { passive: true },
    );

    setTimeout(showChat, 4000);

    // Toggle panel on FAB click
    chatBtn.addEventListener("click", () => {
      chatFab.classList.toggle("active");

      // Add class to body to hide scroll-to-top button
      const isActive = chatFab.classList.contains("active");
      document.body.classList.toggle("chat-is-open", isActive);
    });

    // Close panel via minimize button
    if (chatPanelClose) {
      chatPanelClose.addEventListener("click", () => {
        chatFab.classList.remove("active");
        document.body.classList.remove("chat-is-open");
      });
    }
  }

  /**
   * Initialize Mega Menu functionality (Desktop)
   * - Handles category switching on hover and keyboard (Enter/Space)
   * - Tracks aria-expanded on the trigger link
   */
  function initMegaMenu() {
    const sidebarItems = document.querySelectorAll(".sidebar-item");
    const panels = document.querySelectorAll(".category-panel");
    const dropdownWrapper = document.querySelector(".nav-item.dropdown");
    const trigger = document.getElementById("courses-menu-trigger");

    if (!sidebarItems.length || !panels.length) return;

    function activateCategory(category) {
      sidebarItems.forEach((si) => {
        si.classList.remove("active");
        si.setAttribute("aria-selected", "false");
      });
      panels.forEach((panel) => {
        panel.classList.remove("active");
        if (panel.id === category) panel.classList.add("active");
      });
      const active = document.querySelector(
        '.sidebar-item[data-category="' + category + '"]',
      );
      if (active) {
        active.classList.add("active");
        active.setAttribute("aria-selected", "true");
      }
    }

    sidebarItems.forEach((item) => {
      item.addEventListener("mouseenter", function () {
        activateCategory(this.getAttribute("data-category"));
      });

      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateCategory(this.getAttribute("data-category"));
        }
      });
    });

    if (dropdownWrapper && trigger) {
      dropdownWrapper.addEventListener("mouseenter", () =>
        trigger.setAttribute("aria-expanded", "true"),
      );
      dropdownWrapper.addEventListener("mouseleave", () =>
        trigger.setAttribute("aria-expanded", "false"),
      );
    }
  }

  /**
   * Initialize mobile navbar functionality
   * - Close on outside click
   * - Toggle overlay
   * - Close on nav link click
   */
  function initMobileNavbar() {
    const navbarToggler = document.querySelector(".mobile-menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (!navbarToggler || !navLinks) return;

    navbarToggler.addEventListener("click", function () {
      this.classList.toggle("active");
      navLinks.classList.toggle("active");
      document.body.style.overflow = navLinks.classList.contains("active")
        ? "hidden"
        : "";
    });

    // Close navbar when clicking a nav link
    const links = navLinks.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", function () {
        navbarToggler.classList.remove("active");
        navLinks.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }

  /**
   * Highlight the active navigation link based on current page
   */
  function highlightActiveNav() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");

      // Check if this link matches current page
      if (link.classList.contains("header-cta")) return;

      if (
        href === currentPage ||
        (currentPage === "index.html" && href === "#home") ||
        (currentPage === "" && href === "#home")
      ) {
        link.classList.add("active");
      } else if (!href.startsWith("#")) {
        link.classList.remove("active");
      }
    });
  }

  // Load components when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    loadComponent(components.header, "header-container");
    loadComponent(components.footer, "footer-container");
    loadComponent(components.chat, "chat-container");
    loadComponent(components.enquiryForm, "enquiry-form-container");
  });
})();
