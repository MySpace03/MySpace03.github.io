(function () {
  "use strict";

  var themeButtons = document.querySelectorAll(".theme-toggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "light" ? "#f7faf4" : "#101311");
    }

    themeButtons.forEach(function (button) {
      var nextTheme = theme === "dark" ? "light" : "dark";
      var label = "Switch to " + nextTheme + " mode";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      button.setAttribute("aria-pressed", String(theme === "light"));
      var labelText = button.querySelector("span");
      var icon = button.querySelector("i");
      if (labelText && icon) {
        labelText.textContent = nextTheme === "light" ? "Light mode" : "Dark mode";
        icon.className = "bx " + (nextTheme === "light" ? "bx-sun" : "bx-moon");
      }
    });
  }

  var savedTheme = window.localStorage.getItem("amin-portfolio-theme");
  applyTheme(savedTheme === "light" ? "light" : "dark");

  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      window.localStorage.setItem("amin-portfolio-theme", nextTheme);
      applyTheme(nextTheme);
    });
  });

  var menuButton = document.querySelector(".menu-toggle");
  var navigation = document.querySelector(".site-nav");
  var header = document.querySelector(".site-header");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 180);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if ("IntersectionObserver" in window) {
    var revealTargets = document.querySelectorAll(
      ".section-heading, .about-layout, .timeline-item, .project-filters, .project-card, .skills-grid, .credentials-grid, .recognition-row, .contact-panel"
    );

    document.body.classList.add("reveal-ready");
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    revealTargets.forEach(function (target) {
      revealObserver.observe(target);
    });

    if (navigation) {
      var sectionLinks = new Map();
      navigation.querySelectorAll('a[href^="#"]').forEach(function (link) {
        var section = document.querySelector(link.getAttribute("href"));
        if (section) sectionLinks.set(section, link);
      });

      var activeObserver = new IntersectionObserver(function (entries) {
        var visible = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];

        if (!visible) return;
        navigation.querySelectorAll("a").forEach(function (link) {
          link.classList.toggle("is-active", sectionLinks.get(visible.target) === link);
        });
      }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.2, 0.5] });

      sectionLinks.forEach(function (_link, section) {
        activeObserver.observe(section);
      });
    }
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", function () {
      var isOpen = navigation.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      menuButton.innerHTML = isOpen
        ? '<i class="bx bx-x" aria-hidden="true"></i>'
        : '<i class="bx bx-menu" aria-hidden="true"></i>';
    });

    navigation.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        menuButton.innerHTML = '<i class="bx bx-menu" aria-hidden="true"></i>';
      }
    });
  }

  var filters = document.querySelectorAll(".filter-button");
  var projects = document.querySelectorAll(".project-card");
  var filterStatus = document.querySelector(".filter-status");
  var pendingFilterTimers = new WeakMap();

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      var visibleCount = 0;
      var filterName = button.textContent.trim();

      filters.forEach(function (filterButton) {
        var isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });

      projects.forEach(function (project) {
        var matchesFilter = filter === "all" || project.getAttribute("data-category") === filter;
        var pendingTimer = pendingFilterTimers.get(project);

        if (pendingTimer) {
          window.clearTimeout(pendingTimer);
          pendingFilterTimers.delete(project);
        }

        project.classList.remove("is-hiding");

        if (matchesFilter) {
          visibleCount += 1;
          if (project.hidden) {
            project.hidden = false;
            project.classList.add("is-entering");
            window.requestAnimationFrame(function () {
              project.classList.remove("is-entering");
            });
          }
        } else if (!project.hidden) {
          project.classList.add("is-hiding");
          var transitionTime = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;
          var timer = window.setTimeout(function () {
            project.hidden = true;
            project.classList.remove("is-hiding");
            pendingFilterTimers.delete(project);
          }, transitionTime);
          pendingFilterTimers.set(project, timer);
        }
      });

      if (filterStatus) {
        filterStatus.textContent = filter === "all"
          ? "Showing all " + visibleCount + " projects"
          : "Showing " + visibleCount + " " + filterName + " projects";
      }
    });
  });

  var year = document.getElementById("current-year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
