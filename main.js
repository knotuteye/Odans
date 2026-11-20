/* Odans Engineering & Construction — site behaviour */
(function () {
    "use strict";

    document.documentElement.classList.add("js");

    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Header: solid background once the page scrolls */
    function onScroll() {
        header.classList.toggle("scrolled", window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* Mobile menu */
    function setMenu(open) {
        header.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    toggle.addEventListener("click", function () {
        setMenu(!header.classList.contains("menu-open"));
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && header.classList.contains("menu-open")) {
            setMenu(false);
            toggle.focus();
        }
    });
    document.querySelectorAll(".site-nav a").forEach(function (link) {
        link.addEventListener("click", function () { setMenu(false); });
    });
    window.matchMedia("(min-width: 960px)").addEventListener("change", function (e) {
        if (e.matches) setMenu(false);
    });

    /* Hero video (720px+ only; phones get a photo hero and never download it).
       If the browser won't autoplay it (iPhone Low Power Mode, data saver) or
       the visitor prefers reduced motion, the still frame behind it shows. */
    var video = document.querySelector(".hero-media video");
    if (video) {
        var wide = window.matchMedia("(min-width: 720px)");
        var useStill = function () {
            video.pause();
            video.parentElement.classList.add("no-video");
        };
        var startVideo = function () {
            var source = video.querySelector("source[data-src]");
            if (!source || reduceMotion || !wide.matches) return;
            source.src = source.dataset.src;
            source.removeAttribute("data-src");
            video.muted = true; // iOS checks the property, not just the attribute
            video.load();
            video.defaultPlaybackRate = 0.6;
            video.playbackRate = 0.6;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") attempt.catch(useStill);
        };
        if (reduceMotion) useStill();
        startVideo();
        wide.addEventListener("change", startVideo);
    }

    /* Reveal-on-scroll */
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* Footer year */
    document.querySelectorAll("[data-year]").forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });

    /* Projects: category filter */
    var filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var cat = btn.dataset.filter;
            filterBtns.forEach(function (b) {
                b.setAttribute("aria-pressed", String(b === btn));
            });
            document.querySelectorAll(".project-card").forEach(function (card) {
                card.hidden = !(cat === "all" || card.dataset.category === cat);
            });
        });
    });

    /* Contact: preselect service from ?service=… */
    var form = document.querySelector("#quote-form");
    if (!form) return;

    var serviceParam = new URLSearchParams(window.location.search).get("service");
    var serviceSelect = form.querySelector("#service");
    if (serviceParam && serviceSelect.querySelector('option[value="' + CSS.escape(serviceParam) + '"]')) {
        serviceSelect.value = serviceParam;
    }

    /* Contact: submit via fetch (Formspree-compatible) */
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        status.className = "form-status";
        status.textContent = "";

        if (form.action.indexOf("YOUR_FORM_ID") !== -1) {
            status.classList.add("is-error");
            status.textContent = "The quote form isn't connected yet. Please call or email us using the details on this page.";
            return;
        }

        var button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.dataset.label = button.dataset.label || button.textContent;
        button.textContent = "Sending…";

        fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" }
        }).then(function (res) {
            if (!res.ok) throw new Error(res.status);
            form.reset();
            status.classList.add("is-success");
            status.textContent = "Thank you! Your request has been sent. We'll be in touch shortly.";
        }).catch(function () {
            status.classList.add("is-error");
            status.textContent = "Sorry, something went wrong sending your request. Please try again, or call or email us directly.";
        }).finally(function () {
            button.disabled = false;
            button.textContent = button.dataset.label;
        });
    });
})();
