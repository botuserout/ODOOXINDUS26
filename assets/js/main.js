$(document).ready(function () {


    /* =========================================
       PRELOADER LOGIC (Handled by particle-loader.css & particleground)
    ========================================= */
    /* =========================================
       PRELOADER LOGIC (Improved for Lifecycle & Cache)
    ========================================= */
    function hidePreloader() {
        var preloader = $("#preloader");
        if (preloader.length) {
            // Explicitly unlock body scrolling just in case
            $("body").css("overflow", "");

            // Start fade out
            preloader.addClass("hidden");

            // Remove from DOM after transition
            setTimeout(function() {
                preloader.remove();
            }, 800);
        }
    }

    // 1. Initial Load
    $(window).on("load", function () {
        // Force scroll to top on load/refresh
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        setTimeout(() => {
            hidePreloader();
        }, 1500); // Wait for particles to show off a bit
    });

    // 2. Browser Back/Forward Cache Restoration (bfcache)
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            // Page was restored from cache (bfcache)
            // Force hide immediately or run smooth hide
            hidePreloader();
        }
    });

    /* =========================================
       CORE TEAM CAROUSEL (Slick)
    ========================================= */
    const teamCarousel = $(".team-carousel");
    if (teamCarousel.length) {
        teamCarousel.slick({
            centerMode: true,
            centerPadding: '0px',
            slidesToShow: 3,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 1500, // Speed up scroll interval
            speed: 400, // Faster transition
            focusOnSelect: true,
            arrows: false, /* Custom arrows used */
            pauseOnHover: false, // Keep scrolling
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 3,
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        centerPadding: '40px',
                    }
                }
            ]
        });
    }

    // Smooth scroll
    /* =========================================
       SCROLL INTERACTIONS
    ========================================= */
    const navbar = $(".main-navbar");
    const navLinks = $(".nav-link");
    const navbarHeight = navbar.outerHeight();

    // Throttled Scroll Function
    let isScrolling = false;
    $(window).on("scroll", function () {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                handleScroll();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    function handleScroll() {
        const scrollPos = $(window).scrollTop();

        // 1. Navbar Scrolled State
        if (scrollPos > 40) {
            navbar.addClass("scrolled");
        } else {
            navbar.removeClass("scrolled");
        }

        // 2. Scroll Spy (Active Link)
        // Select both direct nav-links and dropdown items
        const allLinks = $(".nav-link, .dropdown-item");

        allLinks.each(function () {
            const currLink = $(this);
            const refHREF = currLink.attr("href");

            // Skip empty or placeholder links
            if (!refHREF || refHREF === "#" || refHREF.startsWith("#!") || !refHREF.startsWith("#")) return;

            const refElement = $(refHREF);

            if (refElement.length) {
                if (
                    refElement.position().top - navbarHeight - 20 <= scrollPos &&
                    refElement.position().top + refElement.height() > scrollPos
                ) {
                    // Remove active from everywhere first? No, that causes flickering if multiple ranges overlap
                    // But we should usually remove active from siblings or all
                    // For simplicity in this structure:

                    // Note: We need to manage state carefully.
                    // Better approach: Find the ONE current section and highlight its link.
                    // But here we are iterating links.

                    // Simple active toggle:
                    $(".nav-link, .dropdown-item").removeClass("active");
                    $(".nav-item").removeClass("active"); // Parent li

                    currLink.addClass("active");

                    // If it's a dropdown item, activate the parent dropdown toggle
                    if (currLink.hasClass("dropdown-item")) {
                        currLink.closest(".nav-item.dropdown").addClass("active");
                        currLink.closest(".dropdown-menu").siblings(".nav-link").addClass("active");
                    }
                }
            }
        });
    }

    // Smooth Scroll on Click
    navLinks.on("click", function (e) {
        if (this.hash !== "") {
            e.preventDefault();
            const hash = this.hash;
            const target = $(hash);

            if (target.length) {
                $("html, body").animate(
                    {
                        scrollTop: target.offset().top - navbarHeight + 1, // Offset for fixed nav
                    },
                    800,
                    "swing" // Switched to standard jQuery easing to fix broken scroll
                );

                // Close mobile menu on click
                $(".navbar-collapse").collapse("hide");
            }
        }
    });

    /* =========================================
       CONSTELLATION PARTICLE SYSTEM
    ========================================= */
    const canvas = document.getElementById("hero-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let particles = [];
        let width, height;

        // Resize Canvas
        function resize() {
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
            initParticles();
        }

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5; // Very slow drift
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 1.5 + 0.5; // 0.5px to 2px
                this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`; // Varing opacity

                // Glow effect setup
                this.glow = Math.random() > 0.8; // 20% of particles have glow
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Wrap around edges instead of bouncing (Space drift feel)
                if (this.x < -10) this.x = width + 10;
                if (this.x > width + 10) this.x = -10;
                if (this.y < -10) this.y = height + 10;
                if (this.y > height + 10) this.y = -10;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

                if (this.glow) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fill();
                ctx.shadowBlur = 0; // Reset
            }
        }

        // Initialize Particles
        function initParticles() {
            particles = [];
            // Desktop: ~90, Mobile: ~45
            let count = window.innerWidth < 768 ? 45 : 90;

            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        // Draw Constellation Lines
        function connectParticles() {
            // Optimization: check fewer connections or use simpler distance check
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;

                    // Simple distance check first to avoid SQRT if possible (optimization)
                    if (Math.abs(dx) > 140 || Math.abs(dy) > 140) continue;

                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 140) {
                        // Lines fade out relative to distance
                        let opacity = (1 - distance / 140) * 0.15;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation Loop
        // Helper to pause animations when off-screen
        let animationFrameId;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationFrameId) animate();
                } else {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            });
        }, { threshold: 0.1 });

        observer.observe(canvas);

        // Animation Loop
        function animate() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.update();
                p.draw();
            });

            connectParticles();
            animationFrameId = requestAnimationFrame(animate);
        }

        // Init
        window.addEventListener("resize", resize);
        resize();
        // Removed direct animate() call; observer handles it

        /* =========================================
           PARALLAX EFFECT
        ========================================= */
        const heroContent = document.querySelector(".hero-content");

        if (heroContent && window.matchMedia("(hover: hover)").matches) {
            document.addEventListener("mousemove", (e) => {
                const x = (window.innerWidth - e.pageX * 2) / 60;
                const y = (window.innerHeight - e.pageY * 2) / 60;

                const offsetX = Math.max(-20, Math.min(20, x));
                const offsetY = Math.max(-20, Math.min(20, y));

                heroContent.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            });
        }
    }


    /* =========================================
       3D TILT EFFECT (CTA BUTTON)
    ========================================= */
    const ctaBtn = document.querySelector(".btn-cta");
    if (ctaBtn && window.matchMedia("(hover: hover)").matches) {
        ctaBtn.addEventListener("mousemove", (e) => {
            const rect = ctaBtn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Get rotation values (Max +/- 8deg)
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            // Apply transform
            ctaBtn.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        // Reset on leave
        ctaBtn.addEventListener("mouseleave", () => {
            ctaBtn.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
        });
    }

    /* =========================================
       GRID TRAIL MOUSE EFFECT
    ========================================= */
    /* =========================================
       GRID TRAIL MOUSE EFFECT (Hero & Schedule)
    ========================================= */
    function initGridTrail(canvasId) {
        const gridCanvas = document.getElementById(canvasId);
        if (gridCanvas && window.matchMedia("(min-width: 768px)").matches) {
            const ctx = gridCanvas.getContext("2d");
            let width, height;
            const cellSize = 40;
            let activeCells = [];

            // Shared mouse state (or per canvas? Shared is fine for visual consistency if sections are far apart, 
            // but precise hit testing needs to be relative to the canvas)
            // Actually, we must track mouse relative to EACH canvas if they have different offsets.

            function resizeGrid() {
                // Ensure parent has position relative or absolute for accurate offset
                width = gridCanvas.width = gridCanvas.parentElement.offsetWidth;
                height = gridCanvas.height = gridCanvas.parentElement.offsetHeight;
            }

            // Track mouse relative to THIS canvas
            document.addEventListener("mousemove", (e) => {
                const rect = gridCanvas.getBoundingClientRect();

                // Only activate if mouse is inside this specific canvas rect
                if (e.clientY <= rect.bottom && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top) {
                    const localX = e.clientX - rect.left;
                    const localY = e.clientY - rect.top;
                    activateCell(localX, localY);
                }
            });

            function activateCell(x, y) {
                const col = Math.floor(x / cellSize);
                const row = Math.floor(y / cellSize);

                const exists = activeCells.find(c => c.c === col && c.r === row);
                if (exists) {
                    exists.alpha = 1;
                } else {
                    activeCells.push({ c: col, r: row, alpha: 1 });
                }
            }

            let trailFrameId;
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (!trailFrameId) drawGridTrail();
                    } else {
                        cancelAnimationFrame(trailFrameId);
                        trailFrameId = null;
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(gridCanvas);

            function drawGridTrail() {
                ctx.clearRect(0, 0, width, height);
                activeCells = activeCells.filter(cell => cell.alpha > 0.01);

                activeCells.forEach(cell => {
                    const x = cell.c * cellSize;
                    const y = cell.r * cellSize;

                    ctx.strokeStyle = `rgba(255, 255, 255, ${cell.alpha * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, cellSize, cellSize);

                    ctx.fillStyle = `rgba(124, 58, 237, ${cell.alpha * 0.2})`;
                    ctx.fillRect(x, y, cellSize, cellSize);

                    cell.alpha -= 0.02;
                });

                trailFrameId = requestAnimationFrame(drawGridTrail);
            }

            window.addEventListener("resize", resizeGrid);
            resizeGrid();
            // grid trail loop handled by observer
        }
    }

    // Initialize for Hero
    initGridTrail("grid-canvas");
    // Initialize for Schedule
    initGridTrail("schedule-canvas");
    // Initialize for Rules
    initGridTrail("rules-canvas");

    /* =========================================
       SCROLL-DRIVEN SLIDING SECTION (GSAP)
    ========================================= */
    // Wait for GSAP libraries to load if using CDN without module imports
    // Or assume they are loaded since they are scripting tags before main.js
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // Only run horizontal scroll on desktop/tablet
        ScrollTrigger.matchMedia({
            // Desktop/Large Tablet
            "(min-width: 769px)": function () {
                const track = document.querySelector(".process-track");
                const sections = document.querySelectorAll(".process-card");

                // Calculate total width to scroll
                // track width is roughly (cardWidth + gap) * numCards
                // But easier is simple horizontal scroll logic:

                if (track && sections.length) {
                    // Method: Pin container, translate track x percent
                    // We need actual width calculation

                    // Force width calculation
                    const getScrollAmount = () => {
                        let trackWidth = track.scrollWidth;
                        return -(trackWidth - window.innerWidth + 100); // 100px buffer
                    };

                    const tween = gsap.to(track, {
                        x: getScrollAmount,
                        duration: 1,
                        ease: "none"
                    });

                    ScrollTrigger.create({
                        trigger: ".process-container",
                        start: "top top",
                        end: () => `+=${getScrollAmount() * -1}`, // Scroll distance same as width
                        pin: true,
                        animation: tween,
                        scrub: 1, // Smooth scrubbing
                        invalidateOnRefresh: true,
                        // markers: true // Enable for debugging
                    });

                    // Parallax for Icons
                    gsap.utils.toArray(".floating-icon-container").forEach((icon, i) => {
                        gsap.to(icon, {
                            y: -50,
                            scrollTrigger: {
                                trigger: icon.closest(".process-card"),
                                containerAnimation: tween,
                                start: "left center",
                                end: "right center",
                                scrub: true
                            }
                        });
                    });
                }
            },

            // Mobile: Cleanup
            "(max-width: 768px)": function () {
                // Determine if we need to kill triggers or reset styles
                // ScrollTrigger.matchMedia handles most cleanup automatically!
                // We just rely on CSS stacking for mobile.
            }
        });
    } else {
        console.warn("GSAP or ScrollTrigger not loaded");
    }

    /* =========================================
       TIC-TAC-TOE MINI GAME
    ========================================= */
    const board = document.getElementById("ttt-board");
    const cells = document.querySelectorAll(".ttt-cell");
    const statusDisplay = document.querySelector(".ttt-status");
    const resetButton = document.getElementById("ttt-reset");
    const playerIndicator = document.getElementById("current-player");

    if (board && cells.length > 0) {
        let gameActive = true;
        let currentPlayer = "O";
        let gameState = ["", "", "", "", "", "", "", "", ""];

        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        function handleCellClick(clickedCellEvent) {
            const clickedCell = clickedCellEvent.target;
            const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

            if (gameState[clickedCellIndex] !== "" || !gameActive) {
                return;
            }

            handleCellPlayed(clickedCell, clickedCellIndex);
            handleResultValidation();
        }

        function handleCellPlayed(clickedCell, clickedCellIndex) {
            gameState[clickedCellIndex] = currentPlayer;
            clickedCell.innerText = currentPlayer;
            clickedCell.classList.add(currentPlayer.toLowerCase());
            // Add slight pop animation via CSS transition or class
            clickedCell.style.transform = "scale(1.1)";
            setTimeout(() => clickedCell.style.transform = "scale(1)", 200);
        }

        function handleResultValidation() {
            let roundWon = false;
            let winningcells = [];

            for (let i = 0; i <= 7; i++) {
                const winCondition = winningConditions[i];
                let a = gameState[winCondition[0]];
                let b = gameState[winCondition[1]];
                let c = gameState[winCondition[2]];

                if (a === '' || b === '' || c === '') {
                    continue;
                }
                if (a === b && b === c) {
                    roundWon = true;
                    winningcells = winCondition;
                    break;
                }
            }

            if (roundWon) {
                statusDisplay.innerHTML = `SYSTEM ALERT: <span style="color: ${currentPlayer === 'X' ? 'var(--status-error)' : 'var(--status-info)'}">Player ${currentPlayer} Wins!</span>`;
                gameActive = false;

                // Highlight winning cells
                winningcells.forEach(index => {
                    cells[index].style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    cells[index].style.boxShadow = "0 0 20px " + (currentPlayer === 'X' ? 'var(--status-error)' : 'var(--status-info)');
                });
                return;
            }

            let roundDraw = !gameState.includes("");
            if (roundDraw) {
                statusDisplay.innerText = "SYSTEM ALERT: Game Draw!";
                gameActive = false;
                return;
            }

            handlePlayerChange();
        }

        function handlePlayerChange() {
            currentPlayer = currentPlayer === "O" ? "X" : "O";
            if (document.getElementById("current-player")) {
                const ind = document.getElementById("current-player");
                ind.innerText = currentPlayer;
                ind.style.color = currentPlayer === "O" ? "var(--status-info)" : "var(--status-error)";
            }
        }

        function handleRestartGame() {
            gameActive = true;
            currentPlayer = "O";
            gameState = ["", "", "", "", "", "", "", "", ""];
            statusDisplay.innerHTML = `Player <span id="current-player" style="color: var(--status-info)">O</span>'s Turn`;

            cells.forEach(cell => {
                cell.innerText = "";
                cell.classList.remove("x", "o");
                cell.style.backgroundColor = "";
                cell.style.boxShadow = "";
                cell.style.transform = "";
            });
        }

        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        if (resetButton) resetButton.addEventListener('click', handleRestartGame);
    }



    /* =========================================
       PRIZE SECTION ANIMATION (Hero Style)
    ========================================= */
    // Step 2: Animation Safety Guard
    // Ensure styles are applied only if GSAP is loaded and elements exist
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const prizePodium = document.querySelector(".prize-podium");

        if (prizePodium) {
            // Force visibility ensuring no stuck opacity
            gsap.set(".prize-card", { autoAlpha: 1 });

            // Create timeline with safety
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".prize-podium",
                    start: "top 85%", // Adjusted trigger
                    toggleActions: "play none none reverse", // Preserves exit animation
                    onRefresh: self => {
                        // Defensive: if progress is 1, ensure visible
                        if (self.progress === 1) {
                            gsap.set(".prize-card", { autoAlpha: 1, transform: "none" });
                        }
                    }
                }
            });

            // 1. Center (Gold) Pop Up
            tl.from(".prize-card.gold", {
                y: 100,
                autoAlpha: 0, // uses visibility:hidden during opacity:0
                scale: 0.8,
                duration: 1,
                ease: "back.out(1.7)"
            })
                // 2. Sides Slide In (Silver & Bronze)
                .from(".prize-card.silver", {
                    x: -50,
                    y: 50,
                    autoAlpha: 0,
                    duration: 0.8,
                    ease: "power2.out"
                }, "-=0.6")
                .from(".prize-card.bronze", {
                    x: 50,
                    y: 50,
                    autoAlpha: 0,
                    duration: 0.8,
                    ease: "power2.out"
                }, "-=0.6");

            // Header fade in - Linked to the timeline for coordination
            tl.from(".prize-header", {
                y: 50,
                autoAlpha: 0,
                duration: 1,
                ease: "power2.out"
            }, 0); // Start at equivalent time to podium or slightly before? 0 = at start of TL

            // Fallback safety: Check after 2 seconds if visible
            // Force reset if things go wrong
            setTimeout(() => {
                const header = document.querySelector(".prize-header");
                if (header && getComputedStyle(header).opacity === "0") {
                    gsap.set(header, { autoAlpha: 1, transform: "none" });
                }
                ScrollTrigger.refresh();
            }, 1500);
        }
    } else {
        // Fallback: Force Visible if GSAP fails
        $(".prize-card, .prize-header").css({ "opacity": 1, "visibility": "visible", "transform": "none" });
    }

    /* =========================================
       REGISTER SECTION ANIMATION
    ========================================= */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const regTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".register-section",
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

        regTl.from(".register-header", {
            y: 50,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.out"
        })
            .from(".register-card", {
                y: 50,
                autoAlpha: 0,
                duration: 0.8,
                stagger: 0.2, // Stagger left then right
                ease: "power2.out"
            }, "-=0.4")
            .from(".btn-register-main", {
                y: 30,
                // autoAlpha: 0, // Removed to ensure visibility if GSAP triggers fail or lag
                scale: 0.9,
                duration: 0.6,
                ease: "back.out(1.7)"
            }, "-=0.2");

        // Safety check for Register section visibility
        setTimeout(() => {
            if (document.querySelector(".register-section")) {
                ScrollTrigger.refresh();
            }
        }, 1000);
    }

    /* =========================================
       VENUE SECTION ANIMATION
    ========================================= */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const venueTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".venue-section",
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

        venueTl.from(".venue-header", {
            y: 30,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.out"
        })
            .from(".venue-card", {
                y: 50,
                autoAlpha: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out"
            }, "-=0.4");
    }

    /* =========================================
       ABOUT SECTION ANIMATION
    ========================================= */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const aboutTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".about-section",
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

        aboutTl.from(".about-header", {
            y: 50,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.out"
        })
            .from(".about-text-col", {
                x: -50,
                autoAlpha: 0,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.6")
            .from(".about-highlight-card", {
                y: 30,
                autoAlpha: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.2)"
            }, "-=0.6")
            .from(".about-stat", {
                scale: 0.8,
                autoAlpha: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "back.out(1.5)"
            }, "-=0.4");
    }

    /* =========================================
       SCROLL TO TOP functionality
    ========================================= */
    const scrollTopBtn = document.getElementById("scrollToTop");
    if (scrollTopBtn) {
        // Show/Hide on scroll
        window.addEventListener("scroll", () => {
            if (window.scrollY > 100) {
                scrollTopBtn.style.opacity = "1";
                scrollTopBtn.style.pointerEvents = "all";
            } else {
                scrollTopBtn.style.opacity = "0";
                scrollTopBtn.style.pointerEvents = "none";
            }
        });

        // Smooth scroll to top
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        // Initial check
        if (window.scrollY < 100) {
            scrollTopBtn.style.opacity = "0";
            scrollTopBtn.style.pointerEvents = "none";
        }
    }

    /* =========================================
       HERO COUNTDOWN TIMER
    ========================================= */
    const countDownDate = new Date("Feb 23, 2026 23:59:59").getTime();

    // Update the count down every 1 second
    const countdownInterval = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        if (document.getElementById("days")) {
            // Time calculations for days, hours, minutes and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display results
            document.getElementById("days").innerHTML = (days < 10 ? "0" : "") + days;
            document.getElementById("hours").innerHTML = (hours < 10 ? "0" : "") + hours;
            document.getElementById("minutes").innerHTML = (minutes < 10 ? "0" : "") + minutes;
            document.getElementById("seconds").innerHTML = (seconds < 10 ? "0" : "") + seconds;

            // If the count down is finished, write some text
            if (distance < 0) {
                clearInterval(countdownInterval);
                document.querySelector(".countdown-container").innerHTML = "<div class='time-val'>REGISTRATION CLOSED</div>";
            }
        }
    }, 1000);



    /* =========================================
       FAQ ACCORDION LOGIC
    ========================================= */
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(question => {
        question.addEventListener("click", () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains("active");

            // Close all others (Accordion behavior)
            document.querySelectorAll(".faq-item").forEach(item => {
                item.classList.remove("active");
                item.querySelector(".faq-answer").style.maxHeight = null;
            });

            // Toggle clicked item
            if (!isActive) {
                faqItem.classList.add("active");
                const answer = faqItem.querySelector(".faq-answer");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });


    /* =========================================
       FACULTY CAROUSEL (Dynamic Render + Loop)
    ========================================= */
    if (typeof gsap !== 'undefined' && document.querySelector(".faculty-track")) {
        const track = document.querySelector(".faculty-track");

        // DATA: Faculty Member List
        const facultyList = [
            { name: "Asst. Prof. Zalak Vyas", role: "HoD-CSE, IITE", image: "assets/img/faculty/Ms. Zalak Vyas.jpg" },
            { name: "Asst. Prof. Hiren Mer", role: "Program Coordinator", image: "assets/img/faculty/Mr. Hiren Mer.jpg" },
            { name: "Dr. Kaushal Jani", role: "CSE, IITE", image: "assets/img/faculty/Dr Kuashal Jani.png" },
            { name: "Dr. Ashwin Patani", role: "CSE, IITE", image: "assets/img/faculty/Ashwin_Patani.jpg" },
            { name: "Ms. Madhvi Bera", role: "CSE, IITE", image: "assets/img/faculty/Ms. Madhavi Bera.jpg" },
            { name: "Dr. Sheetal Pandya", role: "CSE, IITE", image: "assets/img/faculty/Dr. Sheetal Pandya1.jpg" },
            { name: "Mr. Parth Nirmal", role: "CSE, IITE", image: "assets/img/faculty/Mr. Parth Nirmal.jpg" },
            { name: "Ms. Urvi Rabara", role: "CSE, IITE", image: "assets/img/faculty/Ms urvi .png" },
            { name: "Ms. Shruti Jaiswal", role: "CSE, IITE", image: "assets/img/faculty/Ms.Shruti Jaiswal.png" },
            { name: "Ms. Dipali Jitya", role: "CSE, IITE", image: "assets/img/faculty/Ms. Dipali Jitiya.jpg" },
            { name: "Ms. Foram Gohel", role: "CSE, IITE", image: "assets/img/faculty/Ms. Foram Gohel.jpg" },
            { name: "Ms. Toral Desai", role: "CSE, IITE", image: "assets/img/faculty/Ms. Toral Desai.jpg" },
            { name: "Ms. Babita Patel", role: "CSE, IITE", image: "assets/img/faculty/Ms. Babita Patel.jpg" },
            { name: "Ms. Sweta Rathod", role: "CSE, IITE", image: "assets/img/faculty/Ms. Sweta Rathod.jpg" },
            { name: "Ms. Anjali Chopra", role: "CSE, IITE", image: "assets/img/faculty/Ms Anjali.png" },
            { name: "Mr. Vatsal Suthar", role: "CSE, IITE", image: "assets/img/faculty/Mr Vatsal.jpg" },
            { name: "Mr. Prejesh Pal Singh", role: "CSE, IITE", image: "assets/img/faculty/Ms prejesh pal.png" },
            { name: "Ms. Zarna Kotak", role: "CSE, IITE", image: "assets/img/faculty/Ms. Zarna.jpg" },
            { name: "Ms. Jenisha Patel", role: "CSE, IITE", image: "assets/img/faculty/Ms jenisha.jpg" }
        ];

        // Clear placeholder HTML
        track.innerHTML = "";

        // Render Cards Dynamically
        facultyList.forEach(fac => {
            const cardHTML = `
                <div class="faculty-card">
                    <div class="faculty-card-glow"></div>
                    <div class="faculty-img-box">
                        <img src="${fac.image}" alt="${fac.name}" class="faculty-img" loading="lazy" 
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(fac.name)}&background=random&color=fff'">
                    </div>
                    <h4 class="faculty-name">${fac.name}</h4>
                </div>
            `;
            track.insertAdjacentHTML("beforeend", cardHTML);
        });

        // --- ANIMATION START ---

        // 1. Clone cards to ensure enough width for seamless loop
        const cards = gsap.utils.toArray(".faculty-card");
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });

        const allCards = gsap.utils.toArray(".faculty-card");

        // 2. Continuous Loop Animation
        const cardWidth = 280; // from CSS
        const gap = 30; // from CSS
        const totalWidth = (cardWidth + gap) * cards.length;

        const loopTl = gsap.to(track, {
            x: -totalWidth,
            ease: "none",
            duration: 60, // Adjusted for longer list
            repeat: -1,
            modifiers: {
                x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
            }
        });

        // 3. Hover Effects (Optimized: No persistent random loop)
        allCards.forEach(card => {
            // Hover interactions - simple scale only
            card.addEventListener("mouseenter", () => {
                loopTl.pause();
                gsap.to(card, { scale: 1.05, duration: 0.2, overwrite: true });
            });

            card.addEventListener("mouseleave", () => {
                loopTl.play();
                gsap.to(card, { scale: 1, duration: 0.2, overwrite: true });
            });
        });
    }


    /* =========================================
       PARTICLE PRELOADER CONTROLLER (Provided Legacy Helper)
    ========================================= */
    !function (a, b) { "use strict"; function c(a) { a = a || {}; for (var b = 1; b < arguments.length; b++) { var c = arguments[b]; if (c) for (var d in c) c.hasOwnProperty(d) && ("object" == typeof c[d] ? deepExtend(a[d], c[d]) : a[d] = c[d]) } return a } function d(d, g) { function h() { if (y) { r = b.createElement("canvas"), r.className = "pg-canvas", r.style.display = "block", d.insertBefore(r, d.firstChild), s = r.getContext("2d"), i(); for (var c = Math.round(r.width * r.height / g.density), e = 0; c > e; e++) { var f = new n; f.setStackPos(e), z.push(f) } a.addEventListener("resize", function () { k() }, !1), b.addEventListener("mousemove", function (a) { A = a.pageX, B = a.pageY }, !1), D && !C && a.addEventListener("deviceorientation", function () { F = Math.min(Math.max(-event.beta, -30), 30), E = Math.min(Math.max(-event.gamma, -30), 30) }, !0), j(), q("onInit") } } function i() { r.width = d.offsetWidth, r.height = d.offsetHeight, s.fillStyle = g.dotColor, s.strokeStyle = g.lineColor, s.lineWidth = g.lineWidth } function j() { if (y) { u = a.innerWidth, v = a.innerHeight, s.clearRect(0, 0, r.width, r.height); for (var b = 0; b < z.length; b++)z[b].updatePosition(); for (var b = 0; b < z.length; b++)z[b].draw(); G || (t = requestAnimationFrame(j)) } } function k() { i(); for (var a = d.offsetWidth, b = d.offsetHeight, c = z.length - 1; c >= 0; c--)(z[c].position.x > a || z[c].position.y > b) && z.splice(c, 1); var e = Math.round(r.width * r.height / g.density); if (e > z.length) for (; e > z.length;) { var f = new n; z.push(f) } else e < z.length && z.splice(e); for (c = z.length - 1; c >= 0; c--)z[c].setStackPos(c) } function l() { G = !0 } function m() { G = !1, j() } function n() { switch (this.stackPos, this.active = !0, this.layer = Math.ceil(3 * Math.random()), this.parallaxOffsetX = 0, this.parallaxOffsetY = 0, this.position = { x: Math.ceil(Math.random() * r.width), y: Math.ceil(Math.random() * r.height) }, this.speed = {}, g.directionX) { case "left": this.speed.x = +(-g.maxSpeedX + Math.random() * g.maxSpeedX - g.minSpeedX).toFixed(2); break; case "right": this.speed.x = +(Math.random() * g.maxSpeedX + g.minSpeedX).toFixed(2); break; default: this.speed.x = +(-g.maxSpeedX / 2 + Math.random() * g.maxSpeedX).toFixed(2), this.speed.x += this.speed.x > 0 ? g.minSpeedX : -g.minSpeedX }switch (g.directionY) { case "up": this.speed.y = +(-g.maxSpeedY + Math.random() * g.maxSpeedY - g.minSpeedY).toFixed(2); break; case "down": this.speed.y = +(Math.random() * g.maxSpeedY + g.minSpeedY).toFixed(2); break; default: this.speed.y = +(-g.maxSpeedY / 2 + Math.random() * g.maxSpeedY).toFixed(2), this.speed.x += this.speed.y > 0 ? g.minSpeedY : -g.minSpeedY } } function o(a, b) { return b ? void (g[a] = b) : g[a] } function p() { console.log("destroy"), r.parentNode.removeChild(r), q("onDestroy"), f && f(d).removeData("plugin_" + e) } function q(a) { void 0 !== g[a] && g[a].call(d) } var r, s, t, u, v, w, x, y = !!b.createElement("canvas").getContext, z = [], A = 0, B = 0, C = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i), D = !!a.DeviceOrientationEvent, E = 0, F = 0, G = !1; return g = c({}, a[e].defaults, g), n.prototype.draw = function () { s.beginPath(), s.arc(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY, g.particleRadius / 2, 0, 2 * Math.PI, !0), s.closePath(), s.fill(), s.beginPath(); for (var a = z.length - 1; a > this.stackPos; a--) { var b = z[a], c = this.position.x - b.position.x, d = this.position.y - b.position.y, e = Math.sqrt(c * c + d * d).toFixed(2); e < g.proximity && (s.moveTo(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY), g.curvedLines ? s.quadraticCurveTo(Math.max(b.position.x, b.position.x), Math.min(b.position.y, b.position.y), b.position.x + b.parallaxOffsetX, b.position.y + b.parallaxOffsetY) : s.lineTo(b.position.x + b.parallaxOffsetX, b.position.y + b.parallaxOffsetY)) } s.stroke(), s.closePath() }, n.prototype.updatePosition = function () { if (g.parallax) { if (D && !C) { var a = (u - 0) / 60; w = (E - -30) * a + 0; var b = (v - 0) / 60; x = (F - -30) * b + 0 } else w = A, x = B; this.parallaxTargX = (w - u / 2) / (g.parallaxMultiplier * this.layer), this.parallaxOffsetX += (this.parallaxTargX - this.parallaxOffsetX) / 10, this.parallaxTargY = (x - v / 2) / (g.parallaxMultiplier * this.layer), this.parallaxOffsetY += (this.parallaxTargY - this.parallaxOffsetY) / 10 } var c = d.offsetWidth, e = d.offsetHeight; switch (g.directionX) { case "left": this.position.x + this.speed.x + this.parallaxOffsetX < 0 && (this.position.x = c - this.parallaxOffsetX); break; case "right": this.position.x + this.speed.x + this.parallaxOffsetX > c && (this.position.x = 0 - this.parallaxOffsetX); break; default: (this.position.x + this.speed.x + this.parallaxOffsetX > c || this.position.x + this.speed.x + this.parallaxOffsetX < 0) && (this.speed.x = -this.speed.x) }switch (g.directionY) { case "up": this.position.y + this.speed.y + this.parallaxOffsetY < 0 && (this.position.y = e - this.parallaxOffsetY); break; case "down": this.position.y + this.speed.y + this.parallaxOffsetY > e && (this.position.y = 0 - this.parallaxOffsetY); break; default: (this.position.y + this.speed.y + this.parallaxOffsetY > e || this.position.y + this.speed.y + this.parallaxOffsetY < 0) && (this.speed.y = -this.speed.y) }this.position.x += this.speed.x, this.position.y += this.speed.y }, n.prototype.setStackPos = function (a) { this.stackPos = a }, h(), { option: o, destroy: p, start: m, pause: l } } var e = "particleground", f = a.jQuery; a[e] = function (a, b) { return new d(a, b) }, a[e].defaults = { minSpeedX: .1, maxSpeedX: .7, minSpeedY: .1, maxSpeedY: .7, directionX: "center", directionY: "center", density: 1e4, dotColor: "#666666", lineColor: "#666666", particleRadius: 7, lineWidth: 1, curvedLines: !1, proximity: 100, parallax: !0, parallaxMultiplier: 5, onInit: function () { }, onDestroy: function () { } }, f && (f.fn[e] = function (a) { if ("string" == typeof arguments[0]) { var b, c = arguments[0], g = Array.prototype.slice.call(arguments, 1); return this.each(function () { f.data(this, "plugin_" + e) && "function" == typeof f.data(this, "plugin_" + e)[c] && (b = f.data(this, "plugin_" + e)[c].apply(this, g)) }), void 0 !== b ? b : this } return "object" != typeof a && a ? void 0 : this.each(function () { f.data(this, "plugin_" + e) || f.data(this, "plugin_" + e, new d(this, a)) }) }) }(window, document), function () { for (var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0; c < b.length && !window.requestAnimationFrame; ++c)window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"]; window.requestAnimationFrame || (window.requestAnimationFrame = function (b) { var c = (new Date).getTime(), d = Math.max(0, 16 - (c - a)), e = window.setTimeout(function () { b(c + d) }, d); return a = c + d, e }), window.cancelAnimationFrame || (window.cancelAnimationFrame = function (a) { clearTimeout(a) }) }();

    // Particle Initialization with Theme Colors
    if (document.getElementById('particles-foreground')) {
        particleground(document.getElementById('particles-foreground'), {
            dotColor: 'rgba(255, 255, 255, 1)',
            lineColor: 'rgba(255, 255, 255, 0.05)',
            minSpeedX: 0.3, maxSpeedX: 0.6,
            minSpeedY: 0.3, maxSpeedY: 0.6,
            density: 50000,
            curvedLines: false,
            proximity: 250,
            parallaxMultiplier: 10,
            particleRadius: 4,
        });
    }

    if (document.getElementById('particles-background')) {
        particleground(document.getElementById('particles-background'), {
            dotColor: 'rgba(255, 255, 255, 0.5)',
            lineColor: 'rgba(255, 255, 255, 0.05)',
            minSpeedX: 0.075, maxSpeedX: 0.15,
            minSpeedY: 0.075, maxSpeedY: 0.15,
            density: 30000,
            curvedLines: false,
            proximity: 20,
            parallaxMultiplier: 20,
            particleRadius: 2,
        });
    }

});


