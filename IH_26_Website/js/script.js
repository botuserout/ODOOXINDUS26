document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Scroll Animations --- */
    const animatedElements = document.querySelectorAll('.fade-in-up, .reveal-text, .reveal-zoom, .reveal-right, .reveal-left, .reveal-up, .reveal-flip');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => revealOnScroll.observe(el));


    /* --- 2. Horizontal Scroll Section & Progress Bar --- */
    const stickyContainer = document.querySelector('.sticky-container');
    const horizontalTrack = document.querySelector('.horizontal-track');
    const competitionSection = document.querySelector('.competition-section');
    const progressBar = document.querySelector('.scroll-progress');

    function handleScroll() {
        if (window.innerWidth <= 768) {
            // Reset transforms on mobile just in case
            if (horizontalTrack) horizontalTrack.style.transform = 'none';
            return;
        }

        if (!competitionSection || !horizontalTrack) return;

        const sectionTop = competitionSection.offsetTop;
        const sectionHeight = competitionSection.offsetHeight;
        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;

        // "The Grind" section animation logic
        if (scrollPos >= sectionTop && scrollPos <= (sectionTop + sectionHeight - windowHeight)) {
            const distanceScrolled = scrollPos - sectionTop;
            const maxVerticalScroll = sectionHeight - windowHeight;
            const percentage = distanceScrolled / maxVerticalScroll;

            // Move track
            const trackWidth = horizontalTrack.scrollWidth;
            const moveAmount = (trackWidth - window.innerWidth) * percentage;

            horizontalTrack.style.transform = `translateX(-${moveAmount}px)`;

            // Progress Bar
            if (progressBar) progressBar.style.width = `${Math.min(percentage * 100, 100)}%`;
        }
    }

    // Use requestAnimationFrame for smoother performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Resize handler to reset layout
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768 && horizontalTrack) {
            horizontalTrack.style.transform = 'none';
        }
    });


    /* --- 3. Confetti Animation --- */
    const winnersSection = document.querySelector('.winners-section');
    let confettiTriggered = false;

    // Use a slightly more aggressive threshold and rootMargin to ensure it triggers
    const confettiObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !confettiTriggered) {
                spawnConfetti();
                confettiTriggered = true;
            }
        });
    }, { threshold: 0.1 });

    if (winnersSection) confettiObserver.observe(winnersSection);

    function spawnConfetti() {
        const colors = ['#875A7B', '#6F4B63', '#E6DCE3', '#FFD700', '#FFFFFF'];
        const confettiContainer = winnersSection; // or document.body if needed

        for (let i = 0; i < 100; i++) { // Increased count
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');

            // Randomize
            const left = Math.random() * 100;
            const animDelay = Math.random() * 3;
            const size = Math.random() * 8 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];

            confetti.style.left = `${left}%`;
            confetti.style.animationDelay = `${animDelay}s`;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.backgroundColor = color;

            confettiContainer.appendChild(confetti);

            // Cleanup
            setTimeout(() => {
                confetti.remove();
            }, 6000);
        }
    }


    /* --- 4. Lightbox Logic --- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    // Select all interactive images
    const galleryImages = Array.from(document.querySelectorAll(
        '.grid-item img, .masonry-item img, .track-item img, .winner-hero img, .winner-sub img'
    ));

    let currentIndex = 0;

    function openLightbox(index) {
        currentIndex = index;
        const img = galleryImages[currentIndex];

        // Handle normal src or data-src if lazy loaded
        lightboxImg.src = img.src;

        let caption = img.getAttribute('data-caption');
        if (!caption) caption = img.alt;

        lightboxCaption.textContent = caption;

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        openLightbox(currentIndex);
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        openLightbox(currentIndex);
    }

    // Attach Click Events
    galleryImages.forEach((img, index) => {
        // Find the clickable parent container (the interactive div)
        const parent = img.closest('.grid-item, .masonry-item, .track-item, .winner-hero, .winner-sub');
        if (parent) {
            parent.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling issues
                openLightbox(index);
            });
        }
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });

});
