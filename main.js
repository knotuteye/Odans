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

    /* Motion: everything below is skipped for visitors who prefer reduced
       motion, and the page then shows its finished state. */
    var motion = !reduceMotion && "IntersectionObserver" in window;
    if (motion) document.documentElement.classList.add("motion");

    /* Headings that rise into place word by word. A plain copy stays
       available to screen readers. */
    function splitWords(el) {
        var label = document.createElement("span");
        label.className = "visually-hidden";
        label.textContent = el.textContent.replace(/\s+/g, " ").trim();
        var i = 0;
        (function walk(node) {
            Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                if (child.nodeType === 3) {
                    var frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach(function (part) {
                        if (!part) return;
                        if (/^\s+$/.test(part)) {
                            frag.appendChild(document.createTextNode(" "));
                            return;
                        }
                        var outer = document.createElement("span");
                        var inner = document.createElement("span");
                        outer.className = "sw";
                        outer.setAttribute("aria-hidden", "true");
                        inner.textContent = part;
                        inner.style.setProperty("--i", i++);
                        outer.appendChild(inner);
                        frag.appendChild(outer);
                    });
                    node.replaceChild(frag, child);
                } else if (child.nodeType === 1 && child.tagName !== "BR") {
                    child.setAttribute("aria-hidden", "true");
                    walk(child);
                }
            });
        })(el);
        el.appendChild(label);
    }

    var splitEls = document.querySelectorAll("[data-split]");
    if (motion) splitEls.forEach(splitWords);

    /* Reveal-on-scroll */
    var revealEls = document.querySelectorAll(".reveal, [data-split]");
    if (motion) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
        revealEls.forEach(function (el) { io.observe(el); });
        /* The hero heading is on screen at load: start it straight away */
        var heroTitle = document.querySelector(".hero-title");
        if (heroTitle) requestAnimationFrame(function () {
            requestAnimationFrame(function () { heroTitle.classList.add("is-visible"); });
        });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* Statement text that lights up word by word as it scrolls past */
    var scrubWords = [];
    var scrubEl = document.querySelector("[data-scrub]");
    if (scrubEl && motion) {
        var words = scrubEl.textContent.trim().split(/\s+/);
        scrubEl.textContent = "";
        words.forEach(function (w, n) {
            var span = document.createElement("span");
            span.className = "scrub-w";
            span.textContent = w;
            scrubEl.appendChild(span);
            if (n < words.length - 1) scrubEl.appendChild(document.createTextNode(" "));
            scrubWords.push(span);
        });
    }

    /* From drawing to delivery: the line drawing draws itself, the photo
       wipes in over it, then the labels appear. */
    var buildTrack = document.querySelector(".build-track");
    var buildFrame = document.querySelector(".build-frame");
    var buildSteps = document.querySelectorAll(".build-steps li");
    var buildReadout = document.querySelector("[data-progress]");
    var lastStep = -1;

    /* Images that drift slightly slower than the page */
    var parallaxEls = motion ? document.querySelectorAll("[data-parallax]") : [];

    function clamp01(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }

    function update() {
        ticking = false;
        var vh = window.innerHeight;

        if (scrubWords.length) {
            var r = scrubEl.getBoundingClientRect();
            var p = clamp01((vh * 0.85 - r.top) / (r.height + vh * 0.35));
            var lit = Math.round(p * scrubWords.length);
            scrubWords.forEach(function (w, n) { w.classList.toggle("is-lit", n < lit); });
        }

        if (buildTrack && motion) {
            var t = buildTrack.getBoundingClientRect();
            var bp = clamp01(-t.top / (t.height - vh));
            buildFrame.style.setProperty("--p", bp.toFixed(4));
            var step = bp < 0.4 ? 0 : bp < 0.74 ? 1 : 2;
            if (step !== lastStep) {
                buildSteps.forEach(function (li, n) { li.classList.toggle("is-active", n === step); });
                lastStep = step;
            }
            if (buildReadout) buildReadout.textContent = String(Math.round(bp * 100)).padStart(3, "0");
        }

        parallaxEls.forEach(function (img) {
            var b = img.parentElement.getBoundingClientRect();
            if (b.bottom < 0 || b.top > vh) return;
            var offset = (b.top + b.height / 2 - vh / 2) / vh;
            img.style.translate = "0 " + (offset * -6).toFixed(2) + "%";
        });
    }

    var ticking = false;
    function requestUpdate() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }
    if (motion) {
        update();
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate);
    }

    /* Count-up numbers */
    var counters = document.querySelectorAll("[data-count]");
    if (motion && counters.length) {
        var countIo = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                countIo.unobserve(entry.target);
                var el = entry.target;
                var target = parseInt(el.dataset.count, 10);
                var start = performance.now();
                (function tick(now) {
                    var k = clamp01((now - start) / 1600);
                    var eased = 1 - Math.pow(1 - k, 4);
                    el.textContent = Math.round(eased * target);
                    if (k < 1) requestAnimationFrame(tick);
                })(start);
            });
        }, { threshold: 0.6 });
        counters.forEach(function (el) { countIo.observe(el); });
    }

    /* Services: an image preview follows the cursor over the list
       (mouse and trackpad only; touch screens show thumbnails instead) */
    var preview = document.querySelector(".svc-preview");
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (preview && motion && finePointer.matches) {
        var previewImgs = preview.querySelectorAll("img");
        var px = 0, py = 0, tx = 0, ty = 0, following = false;
        var follow = function () {
            px += (tx - px) * 0.14;
            py += (ty - py) * 0.14;
            preview.style.translate = px.toFixed(1) + "px " + py.toFixed(1) + "px";
            if (following || Math.abs(tx - px) > 0.5 || Math.abs(ty - py) > 0.5) {
                requestAnimationFrame(follow);
            }
        };
        var place = function (e) {
            tx = e.clientX + 28;
            ty = e.clientY - preview.offsetHeight / 2;
        };
        document.querySelectorAll(".svc-row").forEach(function (row) {
            row.addEventListener("mouseenter", function (e) {
                var n = Number(row.dataset.preview);
                previewImgs.forEach(function (img, i) {
                    if (i === n) img.loading = "eager";
                    img.classList.toggle("is-active", i === n);
                });
                place(e);
                if (!preview.classList.contains("is-on")) {
                    px = tx;
                    py = ty;
                }
                preview.classList.add("is-on");
                if (!following) {
                    following = true;
                    requestAnimationFrame(follow);
                }
            });
            row.addEventListener("mousemove", place);
            row.addEventListener("mouseleave", function () {
                preview.classList.remove("is-on");
                following = false;
            });
        });
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
