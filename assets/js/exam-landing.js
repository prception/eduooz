/**
 * Exam Landing Page — Dynamic Renderer & Interactivity
 * Reads window.EXAM_CONFIG and populates all sections
 */
document.addEventListener("DOMContentLoaded", () => {

    const CONFIG = window.EXAM_CONFIG;
    if (!CONFIG) { console.warn('EXAM_CONFIG not found.'); return; }

    // --- 1. RENDER EXAM SNAPSHOT ---
    function renderSnapshot() {
        const grid = document.getElementById('snapshot-grid');
        if (!grid || !CONFIG.snapshot) return;

        const items = CONFIG.snapshot;
        grid.innerHTML = items.map(item => `
            <div class="snapshot-card g-exam-reveal">
                <div class="snap-icon"><i class="${item.icon}"></i></div>
                <div class="snap-label">${item.label}</div>
                <div class="snap-value">${item.link ? `<a href="${item.link}" target="_blank">${item.value}</a>` : item.value}</div>
            </div>
        `).join('');
    }

    // --- 2. RENDER ABOUT SECTION ---
    function renderAbout() {
        const content = document.getElementById('about-content');
        const highlights = document.getElementById('about-highlights');
        if (!content || !CONFIG.about) return;

        content.innerHTML = `
            <h3>${CONFIG.about.title}</h3>
            ${CONFIG.about.paragraphs.map(p => `<p>${p}</p>`).join('')}
        `;

    }

    // --- 3. RENDER ELIGIBILITY ---
    function renderEligibility() {
        const grid = document.getElementById('eligibility-grid');
        if (!grid || !CONFIG.eligibility) return;

        grid.innerHTML = CONFIG.eligibility.map(item => `
            <div class="elig-card g-exam-reveal">
                <div class="elig-icon"><i class="${item.icon}"></i></div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        `).join('');
    }

    // --- 4. ELIGIBILITY CHECKER LOGIC ---
    function initEligibilityChecker() {
        const form = document.getElementById('elig-checker-form');
        const result = document.getElementById('elig-result');
        if (!form || !result) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const qualification = form.querySelector('[name="qualification"]').value;
            const registration = form.querySelector('[name="registration"]').value;
            const category = form.querySelector('[name="category"]').value;
            const dob = form.querySelector('[name="dob"]').value;

            if (!qualification || !registration || !category || !dob) {
                showResult(result, 'warning', '<i class="fa-solid fa-triangle-exclamation"></i> Please fill in all fields to check eligibility.');
                return;
            }

            // Calculate age
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // Check rules from config
            const rules = CONFIG.eligibilityRules;
            if (!rules) {
                showResult(result, 'success', '<i class="fa-solid fa-circle-check"></i> Based on your inputs, you appear to meet the basic eligibility criteria.');
                return;
            }

            // Check qualification
            if (rules.qualifications && !rules.qualifications.includes(qualification)) {
                showResult(result, 'error', '<i class="fa-solid fa-circle-xmark"></i> Your qualification does not meet the minimum requirement for this exam.');
                return;
            }

            // Check registration
            if (rules.registrationRequired && registration === 'no') {
                showResult(result, 'error', '<i class="fa-solid fa-circle-xmark"></i> Active nursing council registration is mandatory for this exam.');
                return;
            }

            // Check age
            const maxAge = rules.ageLimit[category] || rules.ageLimit.general;
            const minAge = rules.minAge || 18;

            if (age < minAge) {
                showResult(result, 'error', `<i class="fa-solid fa-circle-xmark"></i> Minimum age requirement is ${minAge} years. You are currently ${age} years old.`);
                return;
            }

            if (maxAge && age > maxAge) {
                showResult(result, 'warning', `<i class="fa-solid fa-triangle-exclamation"></i> The maximum age for ${category} category is ${maxAge} years. You are ${age} years old. Check official notification for relaxations.`);
                return;
            }

            showResult(result, 'success', '<i class="fa-solid fa-circle-check"></i> Congratulations! Based on your inputs, you meet the eligibility criteria for this exam.');
        });
    }

    function showResult(el, type, html) {
        el.className = 'elig-result show ' + type;
        el.innerHTML = html;
    }

    // --- 5. RENDER AGE RELAXATION ---
    function renderAgeRelaxation() {
        const grid = document.getElementById('age-relax-grid');
        if (!grid || !CONFIG.ageRelaxation) return;

        grid.innerHTML = CONFIG.ageRelaxation.map(item => `
            <div class="age-card g-exam-reveal">
                <h4>${item.category}</h4>
                <div class="age-value">${item.maxAge} years</div>
                <div class="age-detail">${item.relaxation}</div>
            </div>
        `).join('');
    }

    // --- 6. RENDER SYLLABUS ---
    function renderSyllabus() {
        const grid = document.getElementById('syllabus-grid');
        if (!grid || !CONFIG.syllabus) return;

        grid.innerHTML = CONFIG.syllabus.map(subject => `
            <div class="subject-card g-exam-reveal" data-subject="${subject.name.toLowerCase()}">
                <h4>
                    <span class="subj-icon"><i class="${subject.icon || 'fa-solid fa-book'}"></i></span>
                    ${subject.name}
                </h4>
                <ul>
                    ${subject.topics.map(t => `<li><i class="fa-solid fa-chevron-right"></i> ${t}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        // Search functionality
        const searchInput = document.getElementById('syllabus-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const cards = grid.querySelectorAll('.subject-card');
                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    card.style.display = text.includes(query) ? '' : 'none';
                });
            });
        }
    }

    // --- 7. RENDER PREPARATION STEPS ---
    function renderPreparation() {
        const container = document.getElementById('prepare-timeline');
        if (!container || !CONFIG.preparation) return;

        container.innerHTML = CONFIG.preparation.map((step, i) => `
            <div class="prepare-step g-exam-reveal" data-step="${String(i + 1).padStart(2, '0')}">
                <h4>${step.title}</h4>
                <p>${step.description}</p>
                ${step.duration ? `<span class="step-duration"><i class="fa-regular fa-clock"></i> ${step.duration}</span>` : ''}
            </div>
        `).join('');
    }

    // --- 8. RENDER EXAM PROCESS ---
    function renderProcess() {
        const flow = document.getElementById('process-flow');
        if (!flow || !CONFIG.examProcess) return;

        flow.innerHTML = CONFIG.examProcess.map(node => `
            <div class="process-node g-exam-reveal">
                <div class="node-circle"><i class="${node.icon}"></i></div>
                <div>
                    <h5>${node.title}</h5>
                    <span>${node.subtitle || ''}</span>
                </div>
            </div>
        `).join('');
    }

    // --- 9. RENDER WHY EDUOOZ ---
    function renderWhyEduooz() {
        const grid = document.getElementById('why-grid');
        if (!grid || !CONFIG.whyEduooz) return;

        grid.innerHTML = CONFIG.whyEduooz.map(item => `
            <div class="why-card g-exam-reveal">
                <div class="why-icon"><i class="${item.icon}"></i></div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        `).join('');
    }

    // --- 10. RENDER PREVIOUS PAPERS ---
    function renderPapers() {
        const grid = document.getElementById('papers-grid');
        const empty = document.getElementById('papers-empty');
        if (!grid || !CONFIG.previousPapers) return;

        const papers = CONFIG.previousPapers;

        function renderPaperCards(filtered) {
            if (filtered.length === 0) {
                grid.style.display = 'none';
                if (empty) empty.style.display = 'block';
                return;
            }
            grid.style.display = '';
            if (empty) empty.style.display = 'none';

            grid.innerHTML = filtered.map(paper => `
                <div class="paper-card">
                    <span class="paper-year">${paper.year}</span>
                    <h4>${paper.title}</h4>
                    <div class="paper-meta">${paper.meta || ''}</div>
                    <a href="${paper.url || '#'}" class="btn-download-paper" ${paper.url ? 'target="_blank"' : ''}>
                        <i class="fa-solid fa-download"></i> Download PDF
                    </a>
                </div>
            `).join('');
        }

        renderPaperCards(papers);

        // Search
        const searchInput = document.getElementById('papers-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => filterPapers());
        }

        // Year filters
        const filterBtns = document.querySelectorAll('.papers-filter button');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterPapers();
            });
        });

        function filterPapers() {
            const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const activeFilter = document.querySelector('.papers-filter button.active');
            const yearFilter = activeFilter ? activeFilter.dataset.year : 'all';

            let filtered = papers;
            if (yearFilter && yearFilter !== 'all') {
                filtered = filtered.filter(p => p.year === yearFilter);
            }
            if (query) {
                filtered = filtered.filter(p => p.title.toLowerCase().includes(query) || p.year.includes(query));
            }
            renderPaperCards(filtered);
        }
    }

    // --- 11. RENDER PRACTICE TESTS ---
    function renderPracticeTests() {
        const grid = document.getElementById('practice-grid');
        if (!grid || !CONFIG.practiceTests) return;

        grid.innerHTML = CONFIG.practiceTests.map(test => `
            <div class="practice-card g-exam-reveal">
                <div class="practice-header">
                    <span class="difficulty-badge ${test.difficulty}">${test.difficulty}</span>
                </div>
                <h4>${test.title}</h4>
                <div class="practice-meta">
                    <span><i class="fa-regular fa-circle-question"></i> ${test.questions} Questions</span>
                    <span><i class="fa-regular fa-clock"></i> ${test.duration}</span>
                </div>
                <a href="${test.url || '#'}" class="btn-start-test">
                    <i class="fa-solid fa-play"></i> Start Test
                </a>
            </div>
        `).join('');
    }

    // --- 12. RENDER STUDY MATERIALS ---
    function renderMaterials() {
        const grid = document.getElementById('materials-grid');
        if (!grid || !CONFIG.studyMaterials) return;

        grid.innerHTML = CONFIG.studyMaterials.map(mat => `
            <div class="material-card g-exam-reveal">
                <div class="mat-icon"><i class="${mat.icon}"></i></div>
                <div class="mat-content">
                    <h4>${mat.title}</h4>
                    <p>${mat.description}</p>
                    <a href="${mat.url || '#'}" class="btn-download-mat">
                        <i class="fa-solid fa-download"></i> Download
                    </a>
                </div>
            </div>
        `).join('');
    }

    // --- 13. RENDER RELATED RESOURCES ---
    function renderResources() {
        const container = document.getElementById('resources-pills');
        if (!container || !CONFIG.relatedResources) return;

        container.innerHTML = CONFIG.relatedResources.map(res => `
            <a href="${res.url || '#'}" class="resource-pill">
                <i class="${res.icon}"></i> ${res.label}
            </a>
        `).join('');
    }

    // --- 14. RENDER FAQ ---
    function renderFAQ() {
        const container = document.getElementById('faq-accordion');
        if (!container || !CONFIG.faqs) return;

        const half = Math.ceil(CONFIG.faqs.length / 2);
        const col1 = CONFIG.faqs.slice(0, half);
        const col2 = CONFIG.faqs.slice(half);

        function renderColumn(items, startIdx) {
            return items.map((faq, i) => `
                <div class="faq-item">
                    <button class="faq-question">
                        <span class="faq-num">${String(startIdx + i + 1).padStart(2, '0')}</span>
                        <span class="faq-text">${faq.question}</span>
                        <div class="faq-toggle">
                            <div class="horizontal-line"></div>
                            <div class="vertical-line"></div>
                        </div>
                    </button>
                    <div class="faq-answer-wrapper">
                        <div class="faq-answer-inner">
                            <p>${faq.answer}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        container.innerHTML = `
            <div class="faq-column">${renderColumn(col1, 0)}</div>
            <div class="faq-column">${renderColumn(col2, half)}</div>
        `;

        // Accordion interaction
        container.querySelectorAll('.faq-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.parentElement;
                const isOpen = item.classList.contains('is-open');

                // Close all
                container.querySelectorAll('.faq-item.is-open').forEach(openItem => {
                    openItem.classList.remove('is-open');
                });

                // Toggle current
                if (!isOpen) item.classList.add('is-open');
            });
        });
    }

    // --- 15. STICKY NAVIGATION ---
    function initStickyNav() {
        const nav = document.querySelector('.exam-sticky-nav');
        if (!nav) return;

        document.body.classList.add('has-sticky-nav');

        const links = nav.querySelectorAll('a[href^="#"]');
        const sections = [];

        links.forEach(link => {
            const id = link.getAttribute('href').substring(1);
            const section = document.getElementById(id);
            if (section) sections.push({ link, section });
        });

        // Smooth scroll on click
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.getAttribute('href').substring(1);
                const target = document.getElementById(id);
                if (target) {
                    const offset = window.innerWidth <= 1200 ? 60 : 0;
                    const y = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            });
        });

        // Intersection Observer for active state
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    links.forEach(l => l.classList.remove('active'));
                    const active = nav.querySelector(`a[href="#${id}"]`);
                    if (active) active.classList.add('active');
                }
            });
        }, { threshold: 0.2, rootMargin: '-80px 0px -60% 0px' });

        sections.forEach(({ section }) => observer.observe(section));

        // Hide nav in hero
        const hero = document.querySelector('.course-hero-section');
        if (hero) {
            const heroObserver = new IntersectionObserver(([entry]) => {
                nav.classList.toggle('is-hidden', entry.isIntersecting);
            }, { threshold: 0.3 });
            heroObserver.observe(hero);
        }
    }

    // --- 16. GSAP SCROLL ANIMATIONS ---
    function initAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // Reveal all elements with g-exam-reveal class
        gsap.utils.toArray('.g-exam-reveal').forEach(el => {
            gsap.from(el, {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // --- INITIALIZE ALL ---
    renderSnapshot();
    renderAbout();
    renderEligibility();
    initEligibilityChecker();
    renderAgeRelaxation();
    renderSyllabus();
    renderPreparation();
    renderProcess();
    renderWhyEduooz();
    renderPapers();
    renderPracticeTests();
    renderMaterials();
    renderResources();
    renderFAQ();
    initStickyNav();

    // --- PREMIUM INTERACTIONS ---
    initSnapshotCarousel();
    initWhyShowcase();
    initAgeExplorer();
    initVerticalCarousels();
    initJourneyTimeline();

    // Delay animations to let DOM render
    setTimeout(initAnimations, 100);
});

// ===========================================
// PREMIUM: Exam Snapshot — Horizontal Carousel
// Auto-play, drag, touch, keyboard, dots
// ===========================================
function initSnapshotCarousel() {
    const carousel = document.getElementById('snap-carousel');
    if (!carousel) return;

    const viewport = carousel.querySelector('.snap-carousel-viewport');
    const track = viewport ? viewport.querySelector('.snapshot-marquee-track') : null;
    const dotsContainer = document.getElementById('snap-dots');
    const prevBtn = carousel.querySelector('.snap-arrow-left');
    const nextBtn = carousel.querySelector('.snap-arrow-right');
    if (!viewport || !track) return;

    // Get original cards and clone for infinite loop
    const originalCards = Array.from(track.querySelectorAll('.snapshot-card'));
    if (originalCards.length === 0) return;
    const totalCards = originalCards.length;

    // Clone cards for seamless infinite loop (prepend + append copies)
    const CLONE_COUNT = totalCards;
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        track.insertBefore(clone, track.firstChild);
    });

    const allCards = Array.from(track.querySelectorAll('.snapshot-card'));
    let currentIndex = CLONE_COUNT; // Start at first real card
    let isPaused = false;
    let autoplayInterval = null;
    const AUTOPLAY_DELAY = 3500;

    // Spotlight element
    const spotlight = document.createElement('div');
    spotlight.className = 'snap-carousel-spotlight';
    viewport.appendChild(spotlight);

    // --- Helpers ---
    function getCardWidth() {
        return allCards[0] ? allCards[0].offsetWidth + 20 : 310; // card + gap
    }

    function getVisibleCount() {
        const vw = viewport.offsetWidth;
        if (vw >= 1024) return 4;
        if (vw >= 768) return 2;
        return 1;
    }

    function goToCard(index, smooth = true) {
        const cardW = getCardWidth();
        const visibleCount = getVisibleCount();
        // Center the active card
        const vpWidth = viewport.offsetWidth;
        const offset = index * cardW - (vpWidth / 2 - cardW / 2);
        if (smooth) track.classList.add('smooth-transition');
        else track.classList.remove('smooth-transition');
        track.style.transform = `translateX(-${offset}px)`;
        currentIndex = index;
        updateActiveStates();
        updateDots();

        // Seamless loop: snap back if in clone zone
        if (smooth) {
            setTimeout(() => {
                if (currentIndex >= CLONE_COUNT + totalCards) {
                    goToCard(currentIndex - totalCards, false);
                } else if (currentIndex < CLONE_COUNT) {
                    goToCard(currentIndex + totalCards, false);
                }
            }, 520);
        }
    }

    function updateActiveStates() {
        allCards.forEach((card, i) => {
            card.classList.remove('is-active', 'is-nearby');
            if (i === currentIndex) card.classList.add('is-active');
            else if (Math.abs(i - currentIndex) === 1) card.classList.add('is-nearby');
        });
    }

    // --- Dots ---
    function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalCards; i++) {
            const dot = document.createElement('div');
            dot.className = 'snap-dot' + (i === 0 ? ' active' : '');
            dot.dataset.index = i;
            dot.addEventListener('click', () => {
                goToCard(CLONE_COUNT + i);
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        if (!dotsContainer) return;
        const realIndex = ((currentIndex - CLONE_COUNT) % totalCards + totalCards) % totalCards;
        dotsContainer.querySelectorAll('.snap-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === realIndex);
        });
    }

    // --- Navigation ---
    function next() { goToCard(currentIndex + 1); }
    function prev() { goToCard(currentIndex - 1); }

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });

    // --- Autoplay ---
    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(() => {
            if (!isPaused) next();
        }, AUTOPLAY_DELAY);
    }
    function stopAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
    }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }

    // --- Pause on hover ---
    carousel.addEventListener('mouseenter', () => { isPaused = true; });
    carousel.addEventListener('mouseleave', () => { isPaused = false; });

    // --- Mouse drag ---
    let isDragging = false;
    let dragStartX = 0;
    let dragStartTranslate = 0;

    function getCurrentTranslate() {
        const st = window.getComputedStyle(track).transform;
        if (st === 'none') return 0;
        const matrix = new DOMMatrix(st);
        return matrix.m41;
    }

    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        viewport.classList.add('is-dragging');
        dragStartX = e.pageX;
        dragStartTranslate = getCurrentTranslate();
        track.classList.remove('smooth-transition');
        isPaused = true;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const delta = e.pageX - dragStartX;
        track.style.transform = `translateX(${dragStartTranslate + delta}px)`;
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        viewport.classList.remove('is-dragging');
        isPaused = false;
        const delta = e.pageX - dragStartX;
        const threshold = getCardWidth() * 0.2;
        if (Math.abs(delta) > threshold) {
            delta < 0 ? next() : prev();
        } else {
            goToCard(currentIndex);
        }
        resetAutoplay();
    });

    // --- Touch swipe ---
    let touchStartX = 0;
    let touchStartTranslate = 0;

    viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartTranslate = getCurrentTranslate();
        track.classList.remove('smooth-transition');
        isPaused = true;
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        const delta = e.touches[0].clientX - touchStartX;
        track.style.transform = `translateX(${touchStartTranslate + delta}px)`;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
        const delta = e.changedTouches[0].clientX - touchStartX;
        const threshold = getCardWidth() * 0.2;
        if (Math.abs(delta) > threshold) {
            delta < 0 ? next() : prev();
        } else {
            goToCard(currentIndex);
        }
        isPaused = false;
        resetAutoplay();
    });

    // --- Mouse wheel ---
    carousel.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.deltaX > 0 ? next() : prev();
        } else {
            e.deltaY > 0 ? next() : prev();
        }
        resetAutoplay();
    }, { passive: false });

    // --- Keyboard navigation ---
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { prev(); resetAutoplay(); }
        if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
    });

    // --- Spotlight follow mouse ---
    viewport.addEventListener('mousemove', (e) => {
        const rect = viewport.getBoundingClientRect();
        spotlight.style.left = (e.clientX - rect.left) + 'px';
        spotlight.style.top = (e.clientY - rect.top) + 'px';
    });

    // --- Init ---
    buildDots();
    goToCard(CLONE_COUNT, false);
    startAutoplay();
}

// ===========================================
// PREMIUM INTERACTION: Why Eduooz Showcase
// ===========================================
function initWhyShowcase() {
    const wrapper = document.getElementById('why-showcase');
    if (!wrapper) return;

    const slides = wrapper.querySelectorAll('.why-showcase-slide');
    const dots = wrapper.querySelectorAll('.progress-dot');
    if (slides.length < 2) return;

    let current = 0;
    let interval = null;
    let isPaused = false;

    function goToSlide(index) {
        // Exit current
        slides[current].classList.remove('active');
        slides[current].classList.add('exit-left');
        dots[current].classList.remove('active');

        // Enter new
        current = index;
        slides[current].classList.remove('exit-left');
        slides[current].classList.add('active');
        dots[current].classList.add('active');

        // Clean exit class after transition
        setTimeout(() => {
            slides.forEach((s, i) => {
                if (i !== current) s.classList.remove('exit-left');
            });
        }, 700);
    }

    function next() {
        const nextIndex = (current + 1) % slides.length;
        goToSlide(nextIndex);
    }

    function startAutoplay() {
        stopAutoplay();
        interval = setInterval(() => {
            if (!isPaused) next();
        }, 4500);
    }

    function stopAutoplay() {
        if (interval) clearInterval(interval);
    }

    // Pause on hover
    wrapper.addEventListener('mouseenter', () => { isPaused = true; });
    wrapper.addEventListener('mouseleave', () => { isPaused = false; });

    // Dot click navigation
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index);
            if (index !== current) {
                goToSlide(index);
                startAutoplay(); // Reset timer
            }
        });
    });

    startAutoplay();
}

// ===========================================
// PREMIUM INTERACTION: Age Explorer Accordion
// Only handles standalone instances (not in vcarousel)
// ===========================================
function initAgeExplorer() {
    // Skip vcarousel-tracks — handled inside initVerticalCarousels()
    const standalone = document.getElementById('age-explorer');
    if (!standalone) return;
    const cards = standalone.querySelectorAll('.age-explorer-card');
    if (!cards.length) return;

    cards.forEach((card) => {
        const front = card.querySelector('.age-explorer-front');
        if (!front) return;
        front.addEventListener('click', () => {
            const isExpanded = card.classList.contains('expanded');
            cards.forEach(c => c.classList.remove('expanded'));
            if (!isExpanded) card.classList.add('expanded');
        });
    });
}

// ===========================================
// PREMIUM: Vertical Carousels (Eligibility + Age Relaxation)
// Independent auto-scroll, keyboard, wheel, touch, expand-pause
// ===========================================
function initVerticalCarousels() {
    document.querySelectorAll('.vcarousel-viewport').forEach(viewport => {
        const track = viewport.querySelector('.vcarousel-track');
        const dotsContainer = viewport.querySelector('.vcarousel-dots');
        const column = viewport.closest('.split-column');
        const upBtn = column ? column.querySelector('.vc-up') : null;
        const downBtn = column ? column.querySelector('.vc-down') : null;
        if (!track) return;

        const cards = Array.from(track.children);
        const totalCards = cards.length;
        if (totalCards === 0) return;
        const visibleCount = 2;
        const autoplayDelay = parseInt(viewport.dataset.autoplay) || 4000;

        let currentSlide = 0;
        let interval = null;
        let isPaused = false;
        let isCardExpanded = false;
        const totalSlides = Math.ceil(totalCards / visibleCount);

        // --- Helpers ---
        function getSlideOffset() {
            if (!cards[0]) return 0;
            const cardHeight = cards[0].offsetHeight;
            const gap = 16;
            return currentSlide * (cardHeight * visibleCount + gap * visibleCount);
        }

        function goToSlide(index, smooth = true) {
            // Infinite loop
            if (index >= totalSlides) index = 0;
            if (index < 0) index = totalSlides - 1;
            currentSlide = index;
            const cardHeight = cards[0] ? cards[0].offsetHeight : 180;
            const gap = 16;
            const offset = currentSlide * (cardHeight * visibleCount + gap * visibleCount);
            track.style.transition = smooth ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
            track.style.transform = `translateY(-${offset}px)`;
            updateDots();
            updateActiveCards();
        }

        function next() { goToSlide(currentSlide + 1); }
        function prev() { goToSlide(currentSlide - 1); }

        // --- Active card highlight ---
        function updateActiveCards() {
            cards.forEach((card, i) => {
                card.classList.remove('is-active');
                const startIdx = currentSlide * visibleCount;
                if (i >= startIdx && i < startIdx + visibleCount) {
                    card.classList.add('is-active');
                }
            });
        }

        // --- Dots ---
        if (dotsContainer) {
            dotsContainer.classList.add('vertical-dots');
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('div');
                dot.className = 'vdot' + (i === 0 ? ' active' : '');
                dot.dataset.index = i;
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoplay();
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            if (!dotsContainer) return;
            dotsContainer.querySelectorAll('.vdot').forEach((d, i) => {
                d.classList.toggle('active', i === currentSlide);
            });
        }

        // --- Autoplay ---
        function startAutoplay() {
            stopAutoplay();
            interval = setInterval(() => {
                if (!isPaused && !isCardExpanded) next();
            }, autoplayDelay);
        }
        function stopAutoplay() {
            if (interval) clearInterval(interval);
        }
        function resetAutoplay() { stopAutoplay(); startAutoplay(); }

        // --- Pause on hover ---
        viewport.addEventListener('mouseenter', () => { isPaused = true; });
        viewport.addEventListener('mouseleave', () => { isPaused = false; });

        // --- Arrow buttons ---
        if (upBtn) upBtn.addEventListener('click', () => { prev(); resetAutoplay(); });
        if (downBtn) downBtn.addEventListener('click', () => { next(); resetAutoplay(); });

        // --- Mouse wheel ---
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) next();
            else prev();
            resetAutoplay();
        }, { passive: false });

        // --- Touch swipe ---
        let touchStartY = 0;
        viewport.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            isPaused = true;
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            const deltaY = touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(deltaY) > 30) {
                if (deltaY > 0) next();
                else prev();
            }
            isPaused = false;
            resetAutoplay();
        }, { passive: true });

        // --- Keyboard navigation ---
        viewport.setAttribute('tabindex', '0');
        viewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') { e.preventDefault(); prev(); resetAutoplay(); }
            if (e.key === 'ArrowDown') { e.preventDefault(); next(); resetAutoplay(); }
        });

        // --- Expand/collapse pause (age explorer cards) ---
        const ageCards = track.querySelectorAll('.age-explorer-card');
        ageCards.forEach(card => {
            const front = card.querySelector('.age-explorer-front');
            if (!front) return;

            // Remove old listeners by cloning
            const newFront = front.cloneNode(true);
            front.parentNode.replaceChild(newFront, front);

            newFront.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');
                // Close all in same track
                ageCards.forEach(c => c.classList.remove('expanded'));
                if (!isExpanded) {
                    card.classList.add('expanded');
                    isCardExpanded = true; // Pause auto-scroll
                } else {
                    isCardExpanded = false; // Resume
                }
            });
        });

        // --- Init ---
        goToSlide(0, false);
        startAutoplay();
    });
}

// ===========================================
// PREMIUM: Exam Process — Journey Timeline
// Milestones, expandable cards, progress line
// ===========================================
function initJourneyTimeline() {
    const section = document.querySelector('.journey-timeline-section');
    if (!section) return;

    const milestones = Array.from(section.querySelectorAll('.journey-milestone'));
    const cards = Array.from(section.querySelectorAll('.journey-card'));
    const progressFill = document.getElementById('journey-progress-fill');
    const counterCurrent = document.getElementById('journey-current');
    const prevBtn = document.getElementById('journey-prev');
    const nextBtn = document.getElementById('journey-next');
    if (milestones.length === 0) return;

    const totalSteps = milestones.length;
    let currentStep = 0;

    function goToStep(index) {
        if (index < 0 || index >= totalSteps) return;

        // Remove active from all
        milestones.forEach(m => m.classList.remove('active'));
        cards.forEach(c => {
            c.classList.remove('active');
            // Clear any stale GSAP inline styles
            if (typeof gsap !== 'undefined') gsap.set(c, { clearProps: 'all' });
        });

        // Set new active using data-step attribute
        currentStep = index;
        const activeMilestone = milestones.find(m => parseInt(m.dataset.step) === index);
        const activeCard = cards.find(c => parseInt(c.dataset.step) === index);

        if (activeMilestone) activeMilestone.classList.add('active');
        if (activeCard) {
            activeCard.classList.add('active');
            // GSAP reveal animation
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(activeCard,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
                );
            }
        }

        // Update progress line
        const progressPct = (currentStep / (totalSteps - 1)) * 100;
        if (progressFill) progressFill.style.width = progressPct + '%';
        // Update counter
        if (counterCurrent) counterCurrent.textContent = currentStep + 1;
        // Update button states
        if (prevBtn) prevBtn.disabled = currentStep === 0;
        if (nextBtn) nextBtn.disabled = currentStep === totalSteps - 1;
        // Scroll milestone into view on mobile
        if (activeMilestone) activeMilestone.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Milestone clicks
    milestones.forEach((m, i) => {
        m.addEventListener('click', () => goToStep(i));
    });

    // Nav buttons
    if (prevBtn) prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToStep(currentStep + 1));

    // Keyboard navigation
    section.setAttribute('tabindex', '0');
    section.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goToStep(currentStep - 1); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goToStep(currentStep + 1); }
    });

    // Touch swipe on milestone area
    const roadmap = section.querySelector('.journey-roadmap');
    if (roadmap) {
        let touchStartX = 0;
        roadmap.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        roadmap.addEventListener('touchend', (e) => {
            const delta = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(delta) > 40) {
                delta < 0 ? goToStep(currentStep + 1) : goToStep(currentStep - 1);
            }
        }, { passive: true });
    }

    // Initialize first step
    goToStep(0);
}
