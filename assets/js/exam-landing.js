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

    // --- 2. RENDER ABOUT SECTION (Video Carousel + Stat Counters) ---
    function renderAbout() {
        var track     = document.getElementById('aev-track');
        var dotsWrap  = document.getElementById('aev-dots');
        var prevBtn   = document.getElementById('aev-prev');
        var nextBtn   = document.getElementById('aev-next');
        var trackWrap = document.getElementById('aev-track-wrap');
        var statsEl   = document.getElementById('aev-stats');

        if (!track) return;

        var videos = [
            { id: 'd5xoc5zvWyQ', title: 'NORCET 11 — All You Need to Know', tag: 'Latest' },
            { id: 'qEBQcfAy5e4', title: 'NORCET 10 — Nursing Officer Exam Details', tag: 'Popular' },
            { id: 'h9NjqU6IyzE', title: 'Best NORCET Preparation Strategy', tag: 'Strategy' },
            { id: 'u6EAh2w3bPo', title: 'NORCET 9 — Must-Know Exam Questions', tag: 'MCQs' }
        ];

        var current   = 0;
        var isHovered = false;
        var autoTimer = null;
        var touchStartX = 0;

        /* ── Build cards ── */
        function buildCards() {
            track.innerHTML = videos.map(function(v, i) {
                return '<a class="aev-card' + (i === 0 ? ' aev-active' : '') + '"'
                     + ' href="https://www.youtube.com/watch?v=' + v.id + '"'
                     + ' target="_blank" rel="noopener" data-idx="' + i + '">'
                     + '<img class="aev-thumb" loading="lazy"'
                     + '  src="https://img.youtube.com/vi/' + v.id + '/maxresdefault.jpg"'
                     + '  onerror="this.onerror=null;this.src=\'https://img.youtube.com/vi/' + v.id + '/hqdefault.jpg\'"'
                     + '  alt="' + v.title + '">'
                     + '<div class="aev-overlay"></div>'
                     + '<div class="aev-play"><i class="fa-solid fa-play" style="margin-left:3px"></i></div>'
                     + '<span class="aev-tag">' + v.tag + '</span>'
                     + '<div class="aev-caption"><p class="aev-card-title">' + v.title + '</p></div>'
                     + '</a>';
            }).join('');

            buildDots();
            updateCarousel(false);
        }

        /* ── Dots ── */
        function buildDots() {
            if (!dotsWrap) return;
            dotsWrap.innerHTML = videos.map(function(_, i) {
                return '<button class="aev-dot' + (i === 0 ? ' aev-dot-active' : '') + '" aria-label="Video ' + (i + 1) + '"></button>';
            }).join('');
            dotsWrap.querySelectorAll('.aev-dot').forEach(function(dot, i) {
                dot.addEventListener('click', function() { goTo(i); });
            });
        }

        /* ── Position track to center active card ── */
        function updateCarousel(animate) {
            var cards = track.querySelectorAll('.aev-card');
            if (!cards.length || !trackWrap) return;

            var containerW = trackWrap.offsetWidth;
            var cardW      = cards[0].offsetWidth;
            var gap        = 16;
            var peekOffset = (containerW - cardW) / 2;
            var offset     = peekOffset - current * (cardW + gap);

            track.style.transition = animate
                ? 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)'
                : 'none';
            track.style.transform = 'translateX(' + offset + 'px)';

            cards.forEach(function(c, i) {
                c.classList.toggle('aev-active', i === current);
            });

            if (dotsWrap) {
                dotsWrap.querySelectorAll('.aev-dot').forEach(function(d, i) {
                    d.classList.toggle('aev-dot-active', i === current);
                });
            }
        }

        function goTo(idx) {
            current = ((idx % videos.length) + videos.length) % videos.length;
            updateCarousel(true);
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        /* ── Auto-slide ── */
        function startAuto() {
            clearInterval(autoTimer);
            autoTimer = setInterval(function() {
                if (!isHovered) next();
            }, 4000);
        }

        /* ── Nav buttons ── */
        if (nextBtn) nextBtn.addEventListener('click', function() { next(); startAuto(); });
        if (prevBtn) prevBtn.addEventListener('click', function() { prev(); startAuto(); });

        /* ── Hover pause ── */
        var carousel = document.getElementById('aev-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', function() { isHovered = true; });
            carousel.addEventListener('mouseleave', function() { isHovered = false; });
        }

        /* ── Touch swipe ── */
        if (trackWrap) {
            trackWrap.addEventListener('touchstart', function(e) {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });
            trackWrap.addEventListener('touchend', function(e) {
                var dx = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(dx) > 40) {
                    if (dx < 0) next(); else prev();
                    startAuto();
                }
            }, { passive: true });
        }

        /* ── Recalculate on resize ── */
        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() { updateCarousel(false); }, 150);
        });

        /* ── Animated stat counters (Intersection Observer) ── */
        if (statsEl) {
            var countersRun = false;
            var statsObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting && !countersRun) {
                        countersRun = true;
                        statsEl.querySelectorAll('.aev-stat-num').forEach(function(el) {
                            var target   = parseInt(el.dataset.target, 10);
                            var suffix   = el.dataset.suffix  || '';
                            var prefix   = el.dataset.prefix  || '';
                            var duration = 1600;
                            var startTs  = null;
                            (function tick(ts) {
                                if (!startTs) startTs = ts;
                                var p   = Math.min((ts - startTs) / duration, 1);
                                var ease = 1 - Math.pow(1 - p, 3);
                                el.textContent = prefix + Math.round(ease * target) + suffix;
                                if (p < 1) requestAnimationFrame(tick);
                            })(performance.now());
                        });
                        statsObserver.disconnect();
                    }
                });
            }, { threshold: 0.5 });
            statsObserver.observe(statsEl);
        }

        /* ── Init ── */
        buildCards();
        startAuto();
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

    // --- 10. RENDER PREVIOUS PAPERS (PDF EXPLORER) ---
    // Loads from /question-papers/papers.json; falls back to CONFIG.previousPapers
    function renderPapers() {
        var grid     = document.getElementById('pex-paper-grid');
        if (!grid) return;

        var examSlug = CONFIG.examSlug || 'aiims-norcet';

        /* ── Resolve papers.json URL relative to current page ── */
        var jsonPath = (function() {
            var depth = window.location.pathname.split('/').filter(Boolean).length;
            var prefix = '';
            for (var i = 0; i < depth; i++) prefix += '../';
            return prefix + 'question-papers/papers.json';
        }());

        fetch(jsonPath)
            .then(function(r) {
                if (!r.ok) throw new Error('fetch failed');
                return r.json();
            })
            .then(function(data) {
                var allPapers = (data.papers || []).filter(function(p) {
                    return p.examSlug === examSlug;
                });
                // Enrich with meta field for display if missing
                allPapers.forEach(function(p) {
                    if (!p.meta) {
                        var parts = [];
                        if (p.questionCount) parts.push(p.questionCount + ' MCQs');
                        if (p.duration) parts.push(p.duration);
                        p.meta = parts.join(' · ');
                    }
                });
                initPaperExplorer(allPapers);
            })
            .catch(function() {
                // Graceful fallback to EXAM_CONFIG inline data
                var fallback = (CONFIG.previousPapers || []);
                initPaperExplorer(fallback);
            });

        function initPaperExplorer(papers) {
            var emptyEl  = document.getElementById('pex-empty');
            var iframe   = document.getElementById('pex-iframe');
            var skeleton = document.getElementById('pex-skeleton');
            var locked   = document.getElementById('pex-locked-state');
            var infoYear = document.getElementById('pex-info-year');
            var infoTitle= document.getElementById('pex-info-title');
            var dlBtn    = document.getElementById('pex-download-btn');
            var zoomLbl  = document.getElementById('pex-zoom-label');
            var tabsEl   = document.getElementById('pex-tabs');

            var activePaper = null;
            var currentZoom = 100;
            var activeYear  = 'all';
            var searchQuery = '';

            /* ── Auto-generate year filter tabs from data ── */
            if (tabsEl) {
                var years = papers
                    .map(function(p) { return p.year; })
                    .filter(function(y, i, a) { return a.indexOf(y) === i; })
                    .sort().reverse();

                tabsEl.innerHTML = '<button class="pex-tab active" data-year="all">All Years</button>'
                    + years.map(function(y) {
                        return '<button class="pex-tab" data-year="' + y + '">' + y + '</button>';
                    }).join('');
            }

            /* ── Zoom ── */
            function setZoom(z) {
                currentZoom = Math.max(60, Math.min(200, z));
                if (iframe) {
                    iframe.style.transform = 'scale(' + (currentZoom / 100) + ')';
                    iframe.style.transformOrigin = 'top center';
                }
                if (zoomLbl) zoomLbl.textContent = currentZoom + '%';
            }
            var zIn  = document.getElementById('pex-zoom-in');
            var zOut = document.getElementById('pex-zoom-out');
            if (zIn)  zIn.addEventListener('click',  function() { setZoom(currentZoom + 20); });
            if (zOut) zOut.addEventListener('click', function() { setZoom(currentZoom - 20); });

            /* ── Fullscreen ── */
            var fsBtn = document.getElementById('pex-fullscreen-btn');
            if (fsBtn) {
                fsBtn.addEventListener('click', function() {
                    var card = document.getElementById('pex-preview-card');
                    if (!card) return;
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                        fsBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
                    } else {
                        if (card.requestFullscreen) card.requestFullscreen();
                        fsBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
                    }
                });
            }

            /* ── Load PDF preview ── */
            function loadPreview(paper) {
                if (!skeleton || !locked || !iframe) return;
                locked.classList.remove('pex-show');
                iframe.classList.remove('pex-loaded');
                skeleton.classList.remove('pex-hidden');

                if (!paper.pdfUrl) {
                    setTimeout(function() {
                        skeleton.classList.add('pex-hidden');
                        var locTitle = document.getElementById('pex-locked-title');
                        var locSub   = document.getElementById('pex-locked-sub');
                        if (locTitle) locTitle.textContent = paper.shortTitle || paper.title;
                        if (locSub)   locSub.textContent   = 'Enroll to access and download this paper.';
                        locked.classList.add('pex-show');
                    }, 480);
                    return;
                }

                iframe.src = '';
                setTimeout(function() {
                    iframe.onload = function() {
                        skeleton.classList.add('pex-hidden');
                        iframe.classList.add('pex-loaded');
                    };
                    iframe.src = paper.pdfUrl;
                }, 100);
            }

            /* ── Select paper ── */
            function selectPaper(paper) {
                activePaper = paper;
                if (infoYear)  infoYear.textContent  = paper.year + (paper.shift ? ' · ' + paper.shift : '');
                if (infoTitle) infoTitle.textContent = paper.shortTitle || paper.title;

                grid.querySelectorAll('.pex-paper-card').forEach(function(c) {
                    c.classList.toggle('pex-active', c.dataset.id === paper.id);
                });

                if (dlBtn) {
                    if (paper.pdfUrl) {
                        dlBtn.href = paper.pdfUrl;
                        dlBtn.setAttribute('target', '_blank');
                        dlBtn.style.opacity = '';
                        dlBtn.style.pointerEvents = '';
                    } else {
                        dlBtn.href = '#';
                        dlBtn.removeAttribute('target');
                        dlBtn.style.opacity = '0.38';
                        dlBtn.style.pointerEvents = 'none';
                    }
                }

                // Update URL to paper SEO page using history API (shareable, crawlable)
                if (paper.slug && window.history && window.history.pushState) {
                    var paperUrl = '/question-papers/' + paper.slug + '/';
                    window.history.replaceState({ paperId: paper.id }, paper.title, paperUrl);
                }

                loadPreview(paper);
            }

            /* ── Render cards ── */
            function renderCards(list) {
                if (list.length === 0) {
                    grid.innerHTML = '';
                    if (emptyEl) emptyEl.classList.add('pex-show');
                    return;
                }
                if (emptyEl) emptyEl.classList.remove('pex-show');

                grid.innerHTML = list.map(function(paper, i) {
                    var isActive = activePaper && activePaper.id === paper.id;
                    var seoHref  = paper.slug ? '/question-papers/' + paper.slug + '/' : '#';
                    return '<div class="pex-paper-card' + (isActive ? ' pex-active' : '') + '"'
                         + ' data-id="' + paper.id + '"'
                         + ' style="animation-delay:' + (i * 0.05) + 's">'
                         + '<div class="pex-card-top">'
                         +   '<div class="pex-card-icon"><i class="fa-solid fa-file-pdf"></i></div>'
                         +   '<span class="pex-year-badge">' + paper.year + '</span>'
                         + '</div>'
                         + '<h4 class="pex-card-title">' + (paper.shortTitle || paper.title) + '</h4>'
                         + '<p class="pex-card-meta"><i class="fa-regular fa-file-lines"></i> '
                         +   (paper.meta || '')
                         +   (paper.pages ? ' · ' + paper.pages + ' pages' : '')
                         + '</p>'
                         + '<div class="pex-card-footer">'
                         +   '<div class="pex-active-chip"><i class="fa-solid fa-eye"></i> Previewing</div>'
                         +   '<a class="pex-seo-link" href="' + seoHref + '" title="Full page for ' + (paper.shortTitle || paper.title) + '"'
                         +     ' onclick="event.stopPropagation()">'
                         +     '<i class="fa-solid fa-arrow-up-right-from-square"></i>'
                         +   '</a>'
                         + '</div>'
                         + '</div>';
                }).join('');

                grid.querySelectorAll('.pex-paper-card').forEach(function(card) {
                    card.addEventListener('click', function() {
                        var id = card.dataset.id;
                        var found = papers.filter(function(p) { return p.id === id; })[0];
                        if (found) selectPaper(found);
                    });
                });
            }

            /* ── Filter ── */
            function applyFilter() {
                var filtered = papers.slice();
                if (activeYear !== 'all') {
                    filtered = filtered.filter(function(p) { return p.year === activeYear; });
                }
                if (searchQuery) {
                    var q = searchQuery;
                    filtered = filtered.filter(function(p) {
                        return (p.title || '').toLowerCase().indexOf(q) !== -1
                            || (p.shortTitle || '').toLowerCase().indexOf(q) !== -1
                            || (p.year || '').indexOf(q) !== -1
                            || (p.shift || '').toLowerCase().indexOf(q) !== -1;
                    });
                }
                renderCards(filtered);
                var stillVisible = filtered.some(function(p) { return activePaper && p.id === activePaper.id; });
                if (filtered.length && !stillVisible) selectPaper(filtered[0]);
            }

            /* ── Tab listeners (bound on live DOM after tab build) ── */
            function bindTabs() {
                var tabs = document.querySelectorAll('#pex-tabs .pex-tab');
                tabs.forEach(function(tab) {
                    tab.addEventListener('click', function() {
                        tabs.forEach(function(t) { t.classList.remove('active'); });
                        tab.classList.add('active');
                        activeYear = tab.dataset.year;
                        applyFilter();
                    });
                });
            }
            bindTabs();

            /* ── Search listener ── */
            var searchInput = document.getElementById('pex-search');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    searchQuery = searchInput.value.toLowerCase().trim();
                    applyFilter();
                });
            }

            /* ── Init ── */
            renderCards(papers);
            if (papers.length) selectPaper(papers[0]);

            // Restore scroll position on browser back
            window.addEventListener('popstate', function(e) {
                if (e.state && e.state.paperId) {
                    var found = papers.filter(function(p) { return p.id === e.state.paperId; })[0];
                    if (found) selectPaper(found);
                }
            });
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

    }

    // --- 15. STICKY NAVIGATION ---
    function initStickyNav() {
        const nav = document.getElementById('exam-sticky-nav');
        if (!nav) return;

        document.body.classList.add('has-sticky-nav');

        const links = nav.querySelectorAll('.esn-btn[href^="#"]');
        const sections = [];

        links.forEach(link => {
            const id = link.getAttribute('href').substring(1);
            const section = document.getElementById(id);
            if (section) sections.push({ link, section });
        });

        // Smooth scroll + ripple on click
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Ripple
                const ripple = document.createElement('span');
                ripple.className = 'esn-ripple';
                link.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);

                // Scroll
                const id = link.getAttribute('href').substring(1);
                const target = document.getElementById(id);
                if (target) {
                    const offset = window.innerWidth <= 1024 ? 80 : 0;
                    const y = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            });
        });

        // Keyboard navigation (arrow keys between items)
        nav.addEventListener('keydown', (e) => {
            const btns = Array.from(links);
            const idx = btns.indexOf(document.activeElement);
            if (idx === -1) return;
            const isMobile = window.innerWidth <= 1024;
            const prev = isMobile ? 'ArrowLeft' : 'ArrowUp';
            const next = isMobile ? 'ArrowRight' : 'ArrowDown';
            if (e.key === prev && idx > 0) { e.preventDefault(); btns[idx - 1].focus(); }
            if (e.key === next && idx < btns.length - 1) { e.preventDefault(); btns[idx + 1].focus(); }
        });

        // Intersection Observer for active section
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    links.forEach(l => l.classList.remove('active'));
                    const active = nav.querySelector(`.esn-btn[href="#${id}"]`);
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

        // Hide on scroll down, show on scroll up
        let lastScrollY = window.scrollY;
        let rafId = null;

        window.addEventListener('scroll', () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                const currentY = window.scrollY;
                if (currentY > 150) {
                    nav.classList.toggle('esn-scrolled-down', currentY > lastScrollY + 6);
                } else {
                    nav.classList.remove('esn-scrolled-down');
                }
                lastScrollY = currentY;
                rafId = null;
            });
        }, { passive: true });

        // Mobile: tap to show tooltip briefly
        nav.querySelectorAll('.esn-item').forEach(item => {
            item.addEventListener('touchstart', () => {
                nav.querySelectorAll('.esn-item').forEach(i => i.classList.remove('esn-tapped'));
                item.classList.add('esn-tapped');
                setTimeout(() => item.classList.remove('esn-tapped'), 2000);
            }, { passive: true });
        });
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
    // Renders are isolated too: a bad CONFIG section won't block later steps.
    [
        renderSnapshot, renderAbout, renderEligibility, initEligibilityChecker,
        renderAgeRelaxation, renderSyllabus, renderPreparation, renderProcess,
        renderWhyEduooz, renderPapers, renderPracticeTests, renderMaterials,
        renderResources, renderFAQ, initFaqAccordion, initStickyNav,
        initSyllabusTabs, initPrepareAccordion
    ].forEach(fn => {
        try { fn(); }
        catch (e) { console.warn('[Render Init] ' + fn.name + ' failed:', e); }
    });

    // --- PREMIUM INTERACTIONS ---
    // Each init is isolated: one failure cannot cascade to the next.
    [
        initWhyShowcase,
        initAgeExplorer,
        initVerticalCarousels,
        initJourneyTimeline,
        initFacultyCarousel,
        initReviewCounters,
        initReviewCarousel,
        initMockTestSystem
    ].forEach(fn => {
        try { fn(); }
        catch (e) { console.warn('[Carousel Init] ' + fn.name + ' failed:', e); }
    });

    // Delay animations to let DOM render
    setTimeout(() => { try { initAnimations(); } catch(e) { console.warn('[Init] initAnimations failed:', e); } }, 100);
});

// ===========================================
// WHY EDUOOZ — Rotating Feature Showcase
// Slides between two sets of why-cards with
// CSS-driven progress-bar dots and auto-advance.
// ===========================================
function initWhyShowcase() {
    const wrapper = document.getElementById('why-showcase');
    if (!wrapper) return;

    const slides = Array.from(wrapper.querySelectorAll('.why-showcase-slide'));
    const dots   = Array.from(wrapper.querySelectorAll('.progress-dot'));
    if (slides.length < 2) return;

    let current  = 0;
    let timer    = null;
    const DELAY  = 4500; // must match CSS @keyframes progress-fill duration

    function goTo(idx) {
        const prev = current;
        current = ((idx % slides.length) + slides.length) % slides.length;
        if (prev === current) return;

        // Exit old slide with left-slide animation
        slides[prev].classList.add('exit-left');
        slides[prev].classList.remove('active');
        setTimeout(() => slides[prev].classList.remove('exit-left'), 700);

        // Activate incoming slide
        slides[current].classList.add('active');

        // Restart dot progress animation: remove then force reflow then re-add
        dots.forEach((d, i) => {
            d.classList.remove('active');
            if (i === current) {
                void d.offsetWidth; // flush so CSS animation restarts
                d.classList.add('active');
            }
        });
    }

    function next() { goTo(current + 1); }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(next, DELAY);
    }

    // Dot clicks
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { goTo(i); startAuto(); });
    });

    // Touch swipe
    let touchStartX = 0;
    wrapper.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        clearInterval(timer);
    }, { passive: true });
    wrapper.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) dx < 0 ? next() : goTo(current - 1);
        startAuto();
    }, { passive: true });

    // Hover pause (CSS pauses the ::after fill animation; JS pauses the interval)
    wrapper.addEventListener('mouseenter', () => clearInterval(timer));
    wrapper.addEventListener('mouseleave', startAuto);

    // Ensure clean initial state
    slides.forEach((s, i) => { s.classList.toggle('active', i === 0); s.classList.remove('exit-left'); });
    dots.forEach((d, i)   => d.classList.toggle('active', i === 0));

    startAuto();
}

// --- FACULTY SHOWCASE CAROUSEL ---
function initFacultyCarousel() {
    const stage = document.getElementById('fac-car-stage');
    const track = document.getElementById('fac-car-track');
    const prevBtn = document.getElementById('fac-car-prev');
    const nextBtn = document.getElementById('fac-car-next');
    const dotsEl = document.getElementById('fac-car-dots');
    if (!track || !stage) return;

    const cards = Array.from(track.querySelectorAll('.fac-car-card'));
    if (cards.length === 0) return;

    const GAP = 28;
    let current = 0;
    let autoTimer = null;
    let isPaused = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragCurrentX = 0;

    // Animated counters
    function animateCounters(card) {
        card.querySelectorAll('[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count);
            if (el.dataset.counted) { el.textContent = target.toLocaleString() + '+'; return; }
            el.dataset.counted = '1';
            const duration = 1400;
            const start = performance.now();
            (function tick(now) {
                const p = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                const val = Math.round(target * ease);
                el.textContent = val.toLocaleString() + '+';
                if (p < 1) requestAnimationFrame(tick);
            })(start);
        });
    }

    function getCardWidth() {
        const sw = stage.offsetWidth;
        if (window.innerWidth <= 600) return sw * 0.88;
        if (window.innerWidth <= 900) return sw * 0.65;
        return sw * 0.34;
    }

    function update() {
        const cardW = getCardWidth();
        const sw = stage.offsetWidth;
        const offset = (sw - cardW) / 2 - current * (cardW + GAP);
        cards.forEach(c => { c.style.width = cardW + 'px'; });
        track.style.transform = `translateX(${offset}px)`;
        cards.forEach((c, i) => {
            c.classList.remove('fac-car-active', 'fac-car-nearby');
            if (i === current) {
                c.classList.add('fac-car-active');
                animateCounters(c);
            } else if (Math.abs(i - current) === 1 || (current === 0 && i === cards.length - 1) || (current === cards.length - 1 && i === 0)) {
                c.classList.add('fac-car-nearby');
            }
        });
        if (dotsEl) {
            Array.from(dotsEl.querySelectorAll('.fac-car-dot')).forEach((d, i) => {
                d.classList.toggle('fac-car-dot-active', i === current);
            });
        }
    }

    function goTo(idx) {
        current = ((idx % cards.length) + cards.length) % cards.length;
        update();
    }

    function buildDots() {
        if (!dotsEl) return;
        dotsEl.innerHTML = '';
        cards.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.className = 'fac-car-dot' + (i === 0 ? ' fac-car-dot-active' : '');
            btn.setAttribute('aria-label', `Go to faculty ${i + 1}`);
            btn.addEventListener('click', () => { goTo(i); resetAuto(); });
            dotsEl.appendChild(btn);
        });
    }

    function resetAuto() {
        clearInterval(autoTimer);
        if (!isPaused) {
            autoTimer = setInterval(() => goTo(current + 1), 4000);
        }
    }

    // Arrow buttons
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    // Pause on hover
    const root = document.querySelector('.fac-car-root');
    if (root) {
        root.addEventListener('mouseenter', () => { isPaused = true; clearInterval(autoTimer); });
        root.addEventListener('mouseleave', () => { isPaused = false; resetAuto(); });
    }

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 44) { goTo(current + (diff > 0 ? 1 : -1)); resetAuto(); }
    }, { passive: true });

    // Mouse drag
    track.addEventListener('mousedown', e => {
        isDragging = true;
        dragStartX = e.clientX;
        track.style.cursor = 'grabbing';
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        dragCurrentX = e.clientX;
    });
    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = '';
        const diff = dragStartX - dragCurrentX;
        if (Math.abs(diff) > 50) { goTo(current + (diff > 0 ? 1 : -1)); resetAuto(); }
    });

    // Click to focus card
    cards.forEach((card, i) => {
        card.addEventListener('click', () => { if (i !== current) { goTo(i); resetAuto(); } });
    });

    // Keyboard navigation
    const section = document.querySelector('.fac-showcase-section');
    if (section) {
        section.setAttribute('tabindex', '0');
        section.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); resetAuto(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); resetAuto(); }
        });
    }

    // Mouse wheel
    if (stage) {
        stage.addEventListener('wheel', e => {
            e.preventDefault();
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.deltaX > 0 ? goTo(current + 1) : goTo(current - 1);
            } else {
                e.deltaY > 0 ? goTo(current + 1) : goTo(current - 1);
            }
            resetAuto();
        }, { passive: false });
    }

    // Floating particles
    const particlesEl = document.getElementById('fac-particles');
    if (particlesEl) {
        for (let i = 0; i < 20; i++) {
            const dot = document.createElement('div');
            const size = 3 + Math.random() * 4;
            dot.style.cssText = `
                position:absolute;
                width:${size}px;height:${size}px;
                border-radius:50%;
                background:rgba(6,182,212,${0.08 + Math.random()*0.12});
                left:${Math.random()*100}%;
                top:${Math.random()*100}%;
                animation: fac-float-particle ${8 + Math.random()*12}s ease-in-out ${Math.random()*5}s infinite;
            `;
            particlesEl.appendChild(dot);
        }
    }

    window.addEventListener('resize', update, { passive: true });

    buildDots();
    goTo(0);
    resetAuto();
}

// --- FAQ ACCORDION ---
function initFaqAccordion() {
    const container = document.getElementById('faq-accordion');
    if (!container) return;

    container.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            if (!item) return;
            const isActive = item.classList.contains('active');

            // Close all open items and remove wrapper dimming
            container.querySelectorAll('.faq-item.active').forEach(open => open.classList.remove('active'));
            container.classList.remove('has-active');

            // Open clicked item if it was closed
            if (!isActive) {
                item.classList.add('active');
                container.classList.add('has-active');
            }
        });
    });
}

// --- GOOGLE REVIEWS COUNTERS ---
function initReviewCounters() {
    const bar = document.getElementById('greview-stats-bar');
    if (!bar) return;

    const counters = bar.querySelectorAll('.greview-count[data-target]');
    if (!counters.length) return;

    let triggered = false;
    const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || triggered) return;
        triggered = true;

        counters.forEach(el => {
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const isDecimal = target % 1 !== 0;
            const duration = 1600;
            const start = performance.now();

            (function tick(now) {
                const p = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                const val = target * ease;
                el.textContent = (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            })(start);
        });

        observer.disconnect();
    }, { threshold: 0.4 });

    observer.observe(bar);
}

// --- GOOGLE REVIEWS CAROUSEL ---
function initReviewCarousel() {
    const viewport = document.getElementById('greview-carousel-viewport');
    const track    = document.getElementById('greview-track');
    const prevBtn  = document.getElementById('greview-prev');
    const nextBtn  = document.getElementById('greview-next');
    const dotsEl   = document.getElementById('greview-dots');

    if (!track || !viewport) return;

    const cards = Array.from(track.querySelectorAll('.greview-card'));
    const GAP   = 18; // matches CSS gap
    let current = 0;
    let autoTimer = null;

    function getVisible() {
        const w = window.innerWidth;
        if (w <= 480) return 1;
        if (w <= 768) return 2;
        return 3;
    }

    function getMax() {
        return Math.max(0, cards.length - getVisible());
    }

    function setWidths() {
        const visible = getVisible();
        const vpW = viewport.offsetWidth;
        const cardW = (vpW - GAP * (visible - 1)) / visible;
        cards.forEach(c => { c.style.width = cardW + 'px'; c.style.flexShrink = '0'; });
    }

    function buildDots() {
        const max = getMax();
        dotsEl.innerHTML = '';
        for (let i = 0; i <= max; i++) {
            const btn = document.createElement('button');
            btn.className = 'greview-dot' + (i === current ? ' greview-dot-active' : '');
            btn.setAttribute('aria-label', `Go to review ${i + 1}`);
            btn.addEventListener('click', () => { goTo(i); resetAuto(); });
            dotsEl.appendChild(btn);
        }
    }

    function updateDots() {
        Array.from(dotsEl.querySelectorAll('.greview-dot')).forEach((d, i) => {
            d.classList.toggle('greview-dot-active', i === current);
        });
    }

    function goTo(idx) {
        current = Math.max(0, Math.min(idx, getMax()));

        const visible = getVisible();
        const vpW = viewport.offsetWidth;
        const cardW = (vpW - GAP * (visible - 1)) / visible;
        track.style.transform = `translateX(-${current * (cardW + GAP)}px)`;

        prevBtn.disabled = current === 0;
        nextBtn.disabled = current >= getMax();

        updateDots();
    }

    function resetAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => {
            goTo(current >= getMax() ? 0 : current + 1);
        }, 5000);
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    // Pause auto on hover
    const wrap = document.getElementById('greview-carousel-wrap');
    if (wrap) {
        wrap.addEventListener('mouseenter', () => clearInterval(autoTimer));
        wrap.addEventListener('mouseleave', resetAuto);
        wrap.addEventListener('focusin',    () => clearInterval(autoTimer));
        wrap.addEventListener('focusout',   resetAuto);
    }

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 44) { goTo(current + (diff > 0 ? 1 : -1)); resetAuto(); }
    }, { passive: true });

    // Keyboard on focused arrows
    [prevBtn, nextBtn].forEach(btn => {
        btn.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAuto(); }
            if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
        });
    });

    // Resize
    window.addEventListener('resize', () => {
        setWidths();
        buildDots();
        goTo(Math.min(current, getMax()));
    }, { passive: true });

    // Init
    setWidths();
    buildDots();
    goTo(0);
    resetAuto();
}

// ===========================================
// MOCK TEST SYSTEM
// ===========================================
function initMockTestSystem() {
    const wrapper = document.getElementById('mts-wrapper');
    if (!wrapper) return;

    // ── Question Bank ──────────────────────────────────────────
        const CATEGORIES = [
      {
        name: 'Cardiology', icon: 'fa-heart-pulse', color: '#ef4444',
        sections: [
          {
            name: 'Cardiology I',
            questions: [
              { q:'What is the typical distribution of the heart relative to the sternum?', opts:['Equal distribution (50% left, 50% right)','Three-fourths left, one-fourth right','Two-thirds left, one-third right','Entirely within the left side'], ans:2, exp:'The heart is described as having 2/3 part in the left, 1/3 right of the sternum.' },
              { q:'Which layer of the heart wall is responsible for the pumping action and comprises ~95% of the total heart wall?', opts:['Endocardium','Epicardium','Fibrous Pericardium','Myocardium'], ans:3, exp:'The Myocardium is the thickest layer (~95% of the heart wall) responsible for the pumping action.' },
              { q:'The apex (inferior pointed end) of the heart is formed by the tip of which chamber?', opts:['Right Atrium (RA)','Right Ventricle (RV)','Left Atrium (LA)','Left Ventricle (LV)'], ans:3, exp:'The apex is the pointed end of the heart inferiorly and is formed by the tip of the Left Ventricle.' },
              { q:'For a normal adult, the estimated Cardiac Output (CO) is:', opts:['3 L/min','5 L/min','7 L/min','10 L/min'], ans:1, exp:'Cardiac output (CO) is specified as 5 L/min.' },
              { q:"The outermost layer of the heart's fibrous covering (Fibrous Pericardium) is characterized as being:", opts:['Thin, elastic, and smooth serous membrane','Muscular tissue primarily responsible for contraction','Superficial, tough, inelastic, dense, irregular connective tissue layer','Made up of squamous epithelium'], ans:2, exp:'The Fibrous Pericardium is described as a superficial, tough, inelastic, dense, irregular connective tissue layer.' },
              { q:'The embryological development of the heart begins and is completed during:', opts:['Begins 1st week, completed 4th week','Starts 3rd week, completed 9th week','Starts 4th week, completed 12th week','Begins 9th week, continues until birth'], ans:1, exp:'Development of the heart starts during the 3rd week of gestation and is completed by the 9th week.' },
              { q:'The superior portion of the heart (Base) is anatomically situated at which ICS?', opts:['Left 5th ICS','2nd ICS','4th ICS','6th ICS'], ans:1, exp:'The superior portion of the heart, the Base, is situated in the 2nd ICS.' },
              { q:'The innermost layer of the heart wall, which provides a smooth lining for the chambers, is the:', opts:['Myocardium','Epicardium','Parietal Pericardium','Endocardium'], ans:3, exp:'The Endocardium is the innermost layer of the heart wall and provides a smooth lining for the chambers.' },
              { q:'The Serous Pericardium (inner double-layered covering) is subdivided into the:', opts:['Fibrous and Parietal layers','Parietal and Visceral layers','Myocardial and Epicardial layers','Endocardial and Visceral layers'], ans:1, exp:'The Serous Pericardium consists of an Outer layer (Parietal) and an Inner layer (Visceral pericardium).' },
              { q:'A major function of the pericardial fluid in the pericardial cavity is:', opts:['To supply oxygen to the myocardium','To initiate the electrical conduction system','To reduce friction between membranes during contraction','To attach the heart to the diaphragm'], ans:2, exp:'The pericardial cavity is filled with serous fluid, which reduces friction between membranes during contraction of the heart.' },
              { q:'Which embryonic heart structure develops into the Ascending Aorta and Pulmonary Trunk?', opts:['Bulbus cordis','Primitive ventricle','Primitive atrium','Truncus arteriosus'], ans:3, exp:'The Truncus arteriosus develops into the Ascending aorta and pulmonary trunk.' },
              { q:'A condition where the heart is located on the right side of the thoracic cavity is termed:', opts:['Levocardia','Dextrocardia','Mesocardia','Cardiac Tamponade'], ans:1, exp:'The condition where the Heart is on the right side of the thoracic cavity is called Dextrocardia.' },
              { q:'Excessive secretion of pericardial fluid and blood leads to:', opts:['Endocarditis and Myocarditis','Cardiac tamponade and Pericardial effusion','Dextrocardia and Levocardia','VSD and Tetralogy of Fallot'], ans:1, exp:'Excessive secretion of pericardial fluid and blood leads to cardiac tamponade and pericardial effusion.' },
              { q:'Which borders of the heart are formed primarily by the Left Ventricle (LV)?', opts:['Right border and Superior border','Inferior border only','Left border and partly the Inferior border','Superior border only'], ans:2, exp:'The Left border is formed by the LV (partly by the LA); the Inferior border is mainly by RV and partly by LV.' },
              { q:'The Infundibulum (conus arteriosus) is a conical pouch from the upper and left angle of RV from which the ___ arises.', opts:['Aorta','Pulmonary veins','Pulmonary trunk','Coronary sinus'], ans:2, exp:'The Infundibulum (conus arteriosus) is formed from the upper and left angle of RV from which the pulmonary trunk arises.' },
              { q:'The Apex is at the left 5th ICS. What is its position relative to the median plane?', opts:['1â€“3 cm from the median plane','Medial to the sternal margin','Medial to the midclavicular line (7â€“9 cm from the median plane)','Lateral to the anterior axillary line'], ans:2, exp:'The apex is situated at the left 5th ICS, medial to the midclavicular line (7â€“9 cm from the median plane).' },
              { q:'Defects in the development of the infundibulum are associated with which congenital heart defect?', opts:['Ventricular Septal Defect (VSD)','Atrial Septal Defect (ASD)','Tetralogy of Fallot (TOF)','Patent Ductus Arteriosus (PDA)'], ans:2, exp:'Defects in infundibulum development can result in Tetralogy of Fallot (TOF).' },
              { q:'The procedure used to remove excess pericardial fluid from the pericardial cavity is known as:', opts:['Cardiac catheterization','Angiography','Cardioversion','Pericardiocentesis'], ans:3, exp:'Removing excess pericardial fluid from the pericardial cavity is called Pericardiocentesis.' },
              { q:'The Visceral pericardium (inner layer of Serous Pericardium) is continuous with which layer of the heart wall?', opts:['Myocardium','Endocardium','Epicardium','Fibrous pericardium'], ans:2, exp:'The Epicardium is the outermost layer of the heart wall and is another name for the visceral layer of pericardium.' },
              { q:'The heart valves (Aortic, Pulmonary, Tricuspid, Mitral) originate embryologically from which structure?', opts:['Truncus arteriosus','Bulbus cordis','Primitive ventricle','Endocardial cushions'], ans:3, exp:'The Endocardial cushions develop into the Aortic, pulmonary, tricuspid, and mitral valves.' },
              { q:'In adult females, the approximate weight of the heart is:', opts:['300 gm','250 gm','Size reference (12 Ã— 9 Ã— 6 cm)','Output reference (5 L/min)'], ans:1, exp:'The weight of the heart in females is 250 gm.' },
              { q:'The term "conus arteriosus" refers to the _____ structure, while "infundibulum" refers to the internal structure.', opts:['Muscular','Fibrous','External','Visceral'], ans:2, exp:'The infundibulum refers to the internal structure, whereas the conus arteriosus refers to the external structure.' },
              { q:'The superior broad part of the heart (Base) is anatomically formed by which chamber?', opts:['Right Atrium (RA)','Right Ventricle (RV)','Left Atrium (LA)','Left Ventricle (LV)'], ans:2, exp:'The Base of the heart is the posterior surface and is formed by the Left Atrium (LA).' },
              { q:'Which embryonic heart structure gives rise to the trabeculated portions of the Right and Left Ventricles?', opts:['Bulbus cordis','Primitive atrium','Truncus arteriosus','Primitive ventricle'], ans:3, exp:'The Primitive ventricle develops into the Trabeculated RV and LV.' },
              { q:'For pericardiocentesis, the nurse should anticipate placing the needle at which insertion site?', opts:['2nd ICS, right sternal border','Midclavicular line, 5th ICS','5th ICS near the sternal margin','Subxiphoid area only'], ans:2, exp:'The needle insertion site for pericardiocentesis is the 5th ICS near the sternal margin. Patient position: supine with HOB elevated 30â€“60 degrees.' }
            ]
          },
          {
            name: 'Cardiology II',
            questions: [
              { q:'The primary natural pacemaker (SA node) normally generates electrical impulses at what rate?', opts:['40â€“60 times/min','20â€“40 times/min','60â€“100 times/min','1â€“5 times/min'], ans:2, exp:'The SA node, the main natural pacemaker of the heart, generates electrical impulses at 60â€“100 times per minute.' },
              { q:'If the SA node fails, the AV node can sustain a heart rate of approximately:', opts:['60â€“100 bpm','40â€“60 bpm','20â€“40 bpm','10â€“20 bpm'], ans:1, exp:'If the SA node fails, the AV node can take over and initiate a heart rate of 40â€“60 bpm.' },
              { q:'Which component forms the last part of the conduction system and acts as tertiary pacemaker with the slowest intrinsic rate?', opts:['SA node','AV node','Bundle of His','Purkinje fibers'], ans:3, exp:'The Purkinje fibers form the last part of the conduction system and sustain a rate of 20â€“40 bpm if both SA and AV nodes fail.' },
              { q:'The conduction velocity of the Atrioventricular (AV) node is approximately:', opts:['4 m/sec','1 m/sec','0.05 m/sec','10 m/sec'], ans:2, exp:'The conduction velocity of the AV node is about 0.05 m/sec.' },
              { q:'What is the speed of electrical impulse conduction through the Purkinje fibers?', opts:['0.05 m/sec','1 m/sec','2 m/sec','About 4 m/sec'], ans:3, exp:'Purkinje fibers conduct impulses at about 4 m/sec, enabling simultaneous spread to both ventricles.' },
              { q:'The primary significance of the "AV nodal delay" is to:', opts:['Increase force of ventricular contraction','Allow time for repolarization of the AV node','Provide time for emptying of blood from atria into ventricles','Speed up impulse transmission to the Bundle of His'], ans:2, exp:'The AV nodal delay ensures time for atrial contraction to complete before ventricular contraction begins, allowing effective pumping.' },
              { q:'Which autonomic nervous system intervention shortens the AV nodal delay?', opts:['Vagal stimulation','Cholinergic stimulation','Sympathetic stimulation','Parasympathetic stimulation'], ans:2, exp:'AV nodal delay is shortened by sympathetic stimulation. Parasympathetic (vagal) stimulation lengthens the delay.' },
              { q:'Which anatomical structure is the only conducting pathway between the atria and the ventricles?', opts:['SA node','Purkinje fibers','Internodal fibers','Atrioventricular (AV) node'], ans:3, exp:'The AV node is the only conducting pathway located between the atria and the ventricles.' },
              { q:'The Bundle of His prevents which specific electrical flow phenomenon?', opts:['Accelerated conduction','Delayed conduction','Antidromic conduction','Retrograde conduction of impulses back into the atria'], ans:3, exp:'The AV bundle (Bundle of His) does not permit retrograde conduction of impulses back into the atria.' },
              { q:'Which three bands are primarily included in the internodal fibers connecting the SA node to the AV node?', opts:['Right, Middle, and Left tracts','Anterior Wenckebach, Middle Thorel, Posterior Bachman','Anterior internodal tract of Bachman, Middle of Wenckebach, Posterior of Thorel','Right bundle branch, Left bundle branch, and Bundle of His'], ans:2, exp:'The internodal fibers include: Anterior internodal tract of Bachman, Middle internodal tract of Wenckebach, and Posterior internodal tract of Thorel.' },
              { q:'Which pathway correctly represents the normal sequence of electrical impulse conduction through the heart?', opts:['AV node â†’ Bundle branches â†’ Bundle of His â†’ SA node â†’ Purkinje','SA node â†’ Bundle of His â†’ Bundle branches â†’ AV node â†’ Purkinje','SA node â†’ AV node â†’ Bundle of His â†’ Bundle branches â†’ Purkinje fibers','AV node â†’ AV bundle â†’ SA node â†’ Purkinje â†’ Bundle branches'], ans:2, exp:'The correct pathway: SA node â†’ AV node â†’ Bundle of His â†’ Bundle branches â†’ Purkinje fibers.' },
              { q:'Oxygenated blood first enters into which chamber of the heart?', opts:['Right ventricle','Right atrium','Pulmonary artery','Left atrium'], ans:3, exp:'Oxygenated blood first enters into the Left atrium (from pulmonary veins).' },
              { q:'Which chamber is primarily responsible for ejecting oxygenated blood into the systemic circulation?', opts:['Right atrium','Right ventricle','Left atrium','Left ventricle'], ans:3, exp:'The Left ventricle ejects oxygenated blood into the general (systemic) circulation.' },
              { q:'The total number of chambers in the human heart is:', opts:['4','1','3','2'], ans:0, exp:'The human heart contains a total of 4 chambers.' },
              { q:'Which valve is located between the right atrium and the right ventricle?', opts:['Mitral valve','Bicuspid valve','Aortic valve','Tricuspid valve'], ans:3, exp:'The Tricuspid valve is located between the right atrium and the right ventricle.' },
              { q:'The valve that prevents the backward flow of blood into the left atrium is the:', opts:['Tricuspid valve','Aortic valve','Pulmonary valve','Mitral valve'], ans:3, exp:'The Mitral valve (Bicuspid valve) prevents the backward flow of blood into the left atrium.' },
              { q:'The innermost layer of the heart is known as the:', opts:['Epicardium','Pericardium','Myocardium','Endocardium'], ans:3, exp:'The innermost layer of the heart is the Endocardium.' },
              { q:'The apical impulse of the heart is normally felt at which intercostal space (ICS)?', opts:['Right 2nd ICS','Left 2nd ICS','Right 5th ICS','Left 5th ICS'], ans:3, exp:'The apical impulse of the heart is normally felt at the Left 5th ICS.' },
              { q:'Cardiac muscle differs significantly from skeletal muscle primarily due to which unique characteristic?', opts:['It contains actin and myosin','It requires calcium for contraction','It has automaticity and conductivity','It thrives without oxygen'], ans:2, exp:'Cardiac muscle differs from skeletal muscle because it possesses automaticity and conductivity.' },
              { q:'The heart receives oxygen and nutrients via two main coronary arteries, which are the first branches of the:', opts:['Pulmonary artery','Superior Vena Cava','Pulmonary vein','Aorta'], ans:3, exp:'The right and left coronary arteries are the first branches of the aorta.' },
              { q:'The Left Main Coronary Artery (LCA) typically branches into the:', opts:['Posterior descending artery and Right marginal artery','Left Anterior Descending (LAD) and Circumflex artery','Conus branch and Posterior descending artery','Right coronary artery and Circumflex artery'], ans:1, exp:'The Left Main Coronary Artery divides into: LAD and Circumflex artery.' },
              { q:'The Right Main Coronary Artery (RCA) supplies all of the following EXCEPT the:', opts:['Right atrium','Right ventricle','Inferior portion of the LV','Lateral portion of the LV'], ans:3, exp:'The RCA supplies the right atrium, right ventricle, inferior LV, posterior septal wall, SA/AV nodes. The Circumflex artery supplies the lateral and posterior LV.' },
              { q:'Which area is supplied by the Left Anterior Descending (LAD) artery?', opts:['Left atrium','Posterior septal wall','Lateral and posterior surface of the LV','Anterior ventricular septum'], ans:3, exp:'The LAD supplies the anterior wall of the LV, the anterior ventricular septum, and the apex of the LV.' },
              { q:'Which specific branch of the Left Coronary Artery provides blood to the left atrium?', opts:['Left anterior descending (LAD)','Posterior descending artery (PDA)','Right coronary artery (RCA)','Circumflex artery'], ans:3, exp:'The Circumflex artery supplies blood to the Left Atrium (LA).' },
              { q:'The arteries are called "coronary" because they:', opts:['Run alongside the superior vena cava','Are the largest arteries in the body','Supply the cardiac apex','Encircle the base of the ventricles somewhat like a crown'], ans:3, exp:'The arteries are called "coronary" because they encircle the base of the ventricles, resembling a crown.' }
            ]
          },
          {
            name: 'Cardiology III',
            questions: [
              { q:'What physiological event marks the beginning of ventricular systole and produces the first heart sound (S1)?', opts:['Closure of the semilunar valves','Ventricular filling','Opening of the AV valves','Closure of the atrioventricular (AV) valves'], ans:3, exp:'The First heart sound (S1), known as "Lub," is heard as the atrioventricular valves close at the beginning of ventricular systole.' },
              { q:'Where is the first heart sound (S1) typically heard loudest during cardiac auscultation?', opts:['Base of the heart','Erb\'s point','Pulmonary area','Apex of the heart'], ans:3, exp:'S1 is heard loudest at the apex of the heart.' },
              { q:'The second heart sound (S2), or "Dub," is caused by the closure of which valves?', opts:['Tricuspid and Mitral valves','Semilunar valves','Aortic and Tricuspid valves','Mitral and Pulmonary valves'], ans:1, exp:'S2 is heard when the semilunar valves close at the beginning of ventricular diastole.' },
              { q:'The third heart sound (S3), also called a ventricular gallop, occurs due to:', opts:['Produced during atrial systole','Increased resistance during valve opening','Closure of the semilunar valves','The rushing of blood during ventricular filling'], ans:3, exp:'The Third heart sound (S3) occurs due to the rushing of blood during ventricular filling.' },
              { q:'The presence of the third heart sound (S3) is considered a normal finding in which population?', opts:['Individuals over 60 years old','Patients with heart failure','Patients with valvular regurgitation','Individuals less than 30 years old'], ans:3, exp:'S3 is normal in individuals younger than 30 years.' },
              { q:'Which term describes the condition when S3 is audible, giving the rhythm resemblance to the gallop of a horse?', opts:['Sinus rhythm','Sinus tachycardia','Gallop rhythm or triple rhythm','Pathological murmur'], ans:2, exp:'If S3 is audible, the rhythm resembles the gentle gallop of a horse and is called gallop rhythm or triple sound.' },
              { q:'The Fourth heart sound (S4) is produced during atrial systole if what condition is present?', opts:['Decrease in ventricular wall compliance','Decreased heart rate','Resistance to ventricular filling','Closure of AV valves'], ans:2, exp:'S4 is produced during atrial systole if resistance to ventricular filling is present.' },
              { q:'Which area of cardiac auscultation is described as the Left 5th ICS below the nipple at the Left midclavicular line?', opts:['Tricuspid valve area','Aortic valve area','Erb\'s point','Mitral valve area'], ans:3, exp:'The Mitral valve is auscultated at the Left 5th ICS below the nipple, Left midclavicular line.' },
              { q:'For a normal heart rate of 72 bpm, what is the approximate total duration of the cardiac cycle?', opts:['0.1 seconds','0.3 seconds','0.8 seconds','1.0 second'], ans:2, exp:'When the heart rate is 72 bpm, the duration of each cardiac cycle is about 0.8 seconds.' },
              { q:'In the cardiac cycle, the term "Systole" refers to:', opts:['Relaxation','Filling','Contraction','Repolarization'], ans:2, exp:'Systole refers to contraction.' },
              { q:'During a 0.8 second cardiac cycle, what is the specified duration of ventricular systole?', opts:['0.1 sec','0.5 sec','0.7 sec','0.3 sec'], ans:3, exp:'The duration of ventricular systole is 0.3 seconds.' },
              { q:'During a 0.8 second cardiac cycle, the duration of atrial diastole is:', opts:['0.1 sec','0.3 sec','0.5 sec','0.7 sec'], ans:3, exp:'The duration of atrial diastole is 0.7 seconds.' },
              { q:'What is the approximate Cardiac Output (CO) for an average adult at rest?', opts:['70 ml (stroke volume)','72 bpm (heart rate)','300â€“400 L/min','5 L/min'], ans:3, exp:'For an average adult at rest, CO is approximately 5 L/min.' },
              { q:'Cardiac Output (CO) is calculated using which relationship?', opts:['CO = SBP âˆ’ DBP','CO = CI / BSA','CO = SV Ã— HR','CO = Apical pulse âˆ’ Radial pulse'], ans:2, exp:'Cardiac output is calculated by multiplying stroke volume (SV) and heart rate (HR): CO = SV Ã— HR.' },
              { q:'What is the normal stroke volume (SV), defined as the amount of blood pumped per heartbeat?', opts:['5 L/min','120 ml','70 ml','40 mmHg'], ans:2, exp:'Normal stroke volume is 70 ml.' },
              { q:'Which organ receives the largest percentage of cardiac output (CO) at rest (30%)?', opts:['Kidney','Brain','Skeletal muscles','Liver'], ans:3, exp:'The Liver receives 30% of the distribution of CO, which is the maximum percentage listed.' },
              { q:'What is the normal cardiac reserve (maximum increase in CO above normal) in a young adult?', opts:['500â€“600%','5 L/min','300â€“400%','2.8 L/mÂ²/min'], ans:2, exp:'Normal cardiac reserve in a young adult is 300â€“400%.' },
              { q:'What is the formula used to determine the Cardiac Index (CI)?', opts:['CI = SBP / DBP','CI = CO / BSA','CI = SV Ã— HR','CI = HR / BSA'], ans:1, exp:'Cardiac Index (CI) is calculated as CO/BSA (body surface area).' },
              { q:'A heart rate greater than 100 bpm is defined as:', opts:['Normal sinus rhythm','Sinus bradycardia','Sinus tachycardia','Ventricular gallop'], ans:2, exp:'Sinus tachycardia is defined as a heart rate greater than 100 bpm.' },
              { q:'Stimulation of sympathetic nerve fibers leads to the release of which neurotransmitter?', opts:['Acetylcholine','Serotonin','Dopamine','Norepinephrine'], ans:3, exp:'Stimulation of sympathetic nerve fibers releases the neurotransmitter norepinephrine.' },
              { q:'Stimulation of sympathetic nerve fibers causes which cardiovascular effect?', opts:['Decreased heart rate','Lessened ventricular contractility','Increased conduction speed through the AV node','Occurs when an increase in BP is detected'], ans:2, exp:'Sympathetic nerve stimulation causes increased conduction speed through the AV node, increased heart rate, and increased contractility.' },
              { q:'Stimulation of parasympathetic nerve fibers releases acetylcholine, leading to what primary cardiac effect?', opts:['Increased atrial and ventricular contractility','Peripheral vasoconstriction','Increased heart rate','Decreased heart rate'], ans:3, exp:'Stimulation of parasympathetic nerve fibers releases acetylcholine, resulting in a decreased heart rate.' },
              { q:'Under what condition does stimulation of parasympathetic nerve fibers primarily occur?', opts:['When a decrease in pressure is detected','During exercise','During ventricular systole','When an increase in BP is detected'], ans:3, exp:'Parasympathetic stimulation occurs when an increase in BP (blood pressure) is detected.' },
              { q:'What is the time required for a drop of blood to pass from the RA, through entire circulation, and back in a resting person?', opts:['0.8 seconds','30 seconds','About 1 minute','5 minutes'], ans:2, exp:'Circulation time is about 1 minute in a resting person.' },
              { q:'Pulse pressure is calculated by:', opts:['Heart Rate divided by Stroke Volume','Systolic Blood Pressure minus Diastolic Blood Pressure','Cardiac Output divided by Body Surface Area','Apical pulse minus radial pulse'], ans:1, exp:'Pulse pressure is the difference between SBP (Systolic Blood Pressure) and DBP (Diastolic Blood Pressure).' }
            ]
          },
          {
            name: 'Cardiology IV',
            questions: [
              { q:'Where does the aorta originate and what type of blood does it carry?', opts:['Right ventricle; deoxygenated blood','Left atrium; oxygen-rich blood','Right atrium; deoxygenated blood','Left ventricle; oxygen-rich blood'], ans:3, exp:'The aorta originates from the left ventricle and carries oxygen-rich blood to all parts of the body.' },
              { q:'Which is the longest principal division of the aorta?', opts:['Ascending aorta (5 cm)','Arch of aorta (4â€“5 cm)','Thoracic aorta (20 cm)','Abdominal aorta (5 cm)'], ans:2, exp:'The Thoracic aorta is the longest at 20 cm. Ascending aorta: 5 cm, Arch: 4â€“5 cm, Abdominal: 5 cm.' },
              { q:'What is the correct length of the thoracic aorta?', opts:['5 cm','20 cm','10 cm','4â€“5 cm'], ans:1, exp:'The thoracic aorta has a length of 20 cm.' },
              { q:'The brachiocephalic artery is a direct branch of which part of the aorta?', opts:['Aortic arch','Thoracic aorta','Abdominal aorta','Ascending aorta'], ans:0, exp:'The aortic arch has three main branches: brachiocephalic, left common carotid, and left subclavian arteries.' },
              { q:'Which artery is a visceral branch of the thoracic aorta that supplies the lungs?', opts:['Bronchial artery','Subcostal artery','Pericardial artery','Esophageal artery'], ans:0, exp:'Bronchial arteries are visceral branches of the thoracic aorta that provide oxygenated blood to the lungs.' },
              { q:'Which of the following is an unpaired branch of the abdominal aorta?', opts:['Celiac trunk','Renal artery','Gonadal artery','Suprarenal artery'], ans:0, exp:'The celiac trunk is an unpaired branch that supplies the liver, stomach, and spleen.' },
              { q:'The Celiac trunk divides into three main branches. Which of these is NOT one of them?', opts:['Superior mesenteric artery','Left gastric artery','Splenic artery','Common hepatic artery'], ans:0, exp:'The Superior mesenteric artery is a separate branch of the abdominal aorta, not a branch of the celiac trunk.' },
              { q:'At which vertebral level does the abdominal aorta split into the common iliac arteries?', opts:['4th lumbar vertebra','1st lumbar vertebra','12th thoracic vertebra','5th lumbar vertebra'], ans:0, exp:'The abdominal aorta ends by bifurcating at the level of the 4th lumbar vertebra.' },
              { q:'What structure is supplied by the Superior phrenic artery?', opts:['Muscles of intercostal space','Superior part of diaphragm','Inferior part of diaphragm','Pericardium of heart'], ans:1, exp:'The superior phrenic artery is a branch of the thoracic aorta that supplies the upper (superior) part of the diaphragm.' },
              { q:'Which division of the aorta is specifically 5 cm long and begins at the left ventricle?', opts:['Ascending aorta','Aortic arch','Abdominal aorta','Thoracic aorta'], ans:0, exp:'The ascending aorta is 5 cm long and starts directly from the left ventricle.' },
              { q:'Which CK isoenzyme is specific to cardiac muscle?', opts:['CK-MM','CK-BB','CK-MB','CK-AA'], ans:2, exp:'CK-MB is predominantly found in cardiac muscle and rises in myocardial injury.' },
              { q:'Which troponin is most specific for myocardial injury?', opts:['Troponin C','Troponin I','Troponin T','Myoglobin'], ans:1, exp:'Troponin I is released only from cardiac muscle and is not found in skeletal muscle, making it most specific for myocardial injury.' },
              { q:'Troponin I remains elevated after MI for up to:', opts:['24 hours','48 hours','3â€“5 days','7â€“10 days'], ans:3, exp:'Troponin I remains elevated for 7â€“10 days, allowing late diagnosis of MI.' },
              { q:'Which marker rises earliest after myocardial injury?', opts:['CK-MB','Troponin I','Myoglobin','LDH'], ans:2, exp:'Myoglobin rises within 2 hours of myocardial injury, making it a sensitive early marker though not specific.' },
              { q:'The "flipped LDH pattern" in acute MI refers to:', opts:['LDH-2 > LDH-1','LDH-1 = LDH-2','LDH-1 > LDH-2','LDH-3 > LDH-1'], ans:2, exp:'In MI, LDH-1 exceeds LDH-2 (flipped pattern), unlike the normal pattern where LDH-2 > LDH-1.' },
              { q:'Elevated homocysteine increases cardiac risk by:', opts:['Increasing oxygen supply','Causing endothelial damage','Reducing platelet aggregation','Enhancing vasodilation'], ans:1, exp:'Homocysteine damages the endothelium and promotes thrombosis, increasing cardiovascular risk.' },
              { q:'BNP is primarily secreted from the:', opts:['Atria','Ventricles','Lungs','Kidneys'], ans:1, exp:'BNP is produced mainly by ventricular myocardium in response to stretch/pressure overload.' },
              { q:'Who invented the electrocardiograph?', opts:['Carlo Matteucci','William Harvey','William Einthoven','Claude Bernard'], ans:2, exp:'William Einthoven invented the ECG in 1895.' },
              { q:'Normal PR interval duration is:', opts:['< 0.12 sec','0.12â€“0.20 sec','0.20â€“0.30 sec','> 0.30 sec'], ans:1, exp:'PR interval represents AV conduction time and normally lasts 0.12â€“0.20 sec.' },
              { q:'Which ECG wave represents ventricular depolarization?', opts:['P wave','T wave','QRS complex','U wave'], ans:2, exp:'The QRS complex corresponds to ventricular depolarization.' },
              { q:'A prominent U wave on ECG suggests:', opts:['Hypercalcemia','Hypokalemia','Hypernatremia','Acidosis'], ans:1, exp:'Hypokalemia causes delayed repolarization producing prominent U waves on ECG.' },
              { q:'Which artery supplies the left upper limb directly from the aortic arch?', opts:['Left common carotid','Left subclavian','Brachiocephalic','Axillary'], ans:1, exp:'The left subclavian artery arises directly from the aortic arch and supplies the left upper limb.' },
              { q:'Normal adult aortic diameter is approximately:', opts:['1â€“2 cm','2â€“3 cm','3â€“4 cm','4â€“5 cm'], ans:1, exp:'The normal diameter of the aorta is 2â€“3 cm.' },
              { q:'The aortic arch supplies blood mainly to the:', opts:['Abdomen','Pelvis','Head, neck, and upper limbs','Lower limbs'], ans:2, exp:'Branches of the aortic arch supply the head, neck, and upper extremities.' },
              { q:'The abdominal aorta terminates by dividing into:', opts:['Femoral arteries','External iliac arteries','Internal iliac arteries','Common iliac arteries'], ans:3, exp:'The abdominal aorta bifurcates into the right and left common iliac arteries.' }
            ]
          },
          {
            name: 'Cardiology V',
            questions: [
              { q:'A client is prescribed Holter monitoring. Which instruction should the nurse prioritize?', opts:['Maintain bed rest throughout the testing period','Avoid all normal daily activities to prevent artifacts','Keep a detailed diary of activities and any symptoms','The client may take a brief shower if the monitor is kept dry'], ans:2, exp:'Clients undergoing Holter monitoring should perform normal daily activities but must maintain a diary to document symptoms. Baths and showers must be avoided.' },
              { q:'Which is considered the best test for diagnosing intermittent arrhythmias?', opts:['Resting 12-lead ECG','Holter monitoring','Transthoracic echocardiography','Cardiac catheterization'], ans:1, exp:'Holter monitoring provides continuous ECG recording over 24â€“72 hours, making it the best test for detecting intermittent arrhythmias.' },
              { q:'During an exercise stress test, which finding indicates a "positive" result for ischemia?', opts:['An increase in systolic blood pressure','A heart rate increase of 20 bpm','ST-segment depression of â‰¥ 1 mm','Absence of Q waves in all leads'], ans:2, exp:'A positive stress test for ischemia is characterized by ST-segment depression â‰¥ 1 mm, ST elevation in leads without Q waves, or exercise-induced chest pain.' },
              { q:'A client unable to tolerate physical exercise for a stress test may receive which medications to simulate exercise?', opts:['Metoprolol or Atenolol','Dipyridamole or Dobutamine','Metformin or Insulin','Warfarin or Heparin'], ans:1, exp:'If a client cannot tolerate exercise, IV infusion of dipyridamole or dobutamine is given to simulate the effect of exercise on the heart.' },
              { q:'Which of the following should the client avoid before an exercise ECG?', opts:['Water and clear liquids','Smoking, alcohol, and caffeine','Normal walking and light activity','High-protein meals'], ans:1, exp:'Pre-procedure instructions include advising the client to avoid smoking, alcohol, and caffeine, as these can affect heart rate and rhythm.' },
              { q:'What is the primary clinical advantage of Transesophageal Echocardiography (TEE) over Transthoracic Echocardiography?', opts:['It is entirely non-invasive','It does not require a probe','It provides clearer images of posterior heart structures','It is the most commonly performed echocardiogram'], ans:2, exp:'TEE involves passing a probe into the esophagus, providing clearer images of posterior heart structures because the probe is closer to the heart.' },
              { q:'Which parameter provides the best information about left ventricular systolic function on an echocardiogram?', opts:['Pulmonary artery pressure','Right atrial size','Ejection fraction','Direction of blood flow via Doppler'], ans:2, exp:'The ejection fraction (EF) is the percentage of end-diastolic blood volume ejected during systole and provides critical information about LV systolic function.' },
              { q:'A client diagnosed with systolic heart failure would have which ejection fraction (EF) value?', opts:['60%','55%','50%','40%'], ans:3, exp:'A normal EF is 55â€“65%. Clients with systolic heart failure generally have an EF < 45%, so 40% is consistent with this diagnosis.' },
              { q:'Which diagnostic procedure is the "gold standard" for detecting atherosclerotic obstruction of coronary arteries?', opts:['Exercise Stress Test','Doppler Echocardiography','Coronary Angiography','Holter Monitoring'], ans:2, exp:'Coronary angiography, performed during cardiac catheterization, is the gold standard for detecting atherosclerotic obstruction and evaluating coronary artery patency.' },
              { q:'When performing a right-sided cardiac catheterization, the catheter is inserted through a:', opts:['Vein','Artery','Bronchus','Esophagus'], ans:0, exp:'Right-sided heart catheterization is performed by inserting a catheter into a vein, whereas left-sided heart catheterization involves insertion into an artery.' },
              { q:'Which access route is often preferred for coronary angiography due to a lower risk of bleeding?', opts:['Femoral artery','Radial artery','Subclavian vein','Internal jugular vein'], ans:1, exp:'The radial artery is preferred because it is associated with less bleeding at the insertion site compared to the femoral approach.' },
              { q:'Why must Metformin be withheld for 24 hours prior to cardiac catheterization?', opts:['To prevent hypoglycemia during the procedure','To avoid interference with sedative medications','To prevent the risk of lactic acidosis associated with contrast dye','To ensure the client remains NPO'], ans:2, exp:'Metformin is withheld because the contrast dye used in angiography, combined with metformin, increases the risk of lactic acidosis.' },
              { q:'A client undergoing cardiac catheterization asks what they will feel when the dye is injected. The nurse should respond:', opts:['You will feel a sharp, stinging pain in your chest','You may feel a flushed, warm sensation throughout your body','You will likely feel an immediate need to cough','You will not feel anything at all'], ans:1, exp:'When the contrast dye is injected, the client commonly experiences a flushed and warm feeling throughout the body.' },
              { q:'Following a cardiac catheterization, how often should the nurse initially monitor peripheral pulses and the insertion site?', opts:['Every 15 minutes for 4 hours','Every 30 minutes for 2 hours','Once every hour for 6 hours','Every 2 hours for the first 24 hours'], ans:1, exp:'Post-procedure care includes monitoring peripheral pulses, colour, warmth, and sensation distal to the site every 30 minutes for the first 2 hours.' },
              { q:'To prevent arterial occlusion after cardiac catheterization via the femoral artery, the nurse should ensure:', opts:['The extremity is kept extended for 4â€“6 hours','The client walks immediately to promote circulation','The head of the bed is elevated to 90 degrees','A cold compress is applied to the site for 12 hours'], ans:0, exp:'The affected extremity must be kept extended for 4â€“6 hours, and the client should maintain strict bed rest for 6â€“12 hours to prevent arterial occlusion.' },
              { q:'The nurse encourages increased fluid intake following cardiac catheterization primarily to:', opts:['Replace blood lost during the procedure','Facilitate excretion of the contrast dye','Maintain blood pressure in the presence of sedatives','Prevent the formation of blood clots'], ans:1, exp:'Contrast dyes have an osmotic diuretic effect, and fluid intake is encouraged to help excrete the dye and replace fluid loss.' },
              { q:'What is the normal range for Central Venous Pressure (CVP) measured in mm Hg?', opts:['1â€“2 mm Hg','2â€“6 mm Hg','6â€“12 mm Hg','10â€“15 mm Hg'], ans:1, exp:'The normal CVP is 2â€“6 mm Hg (or 4â€“12 cm Hâ‚‚O).' },
              { q:"A client's CVP reading is 1 mm Hg. The nurse interprets this as a sign of:", opts:['Fluid overload','Right-sided heart failure','Hypovolemia','Pulmonary hypertension'], ans:2, exp:'A low CVP (below 2 mm Hg) indicates hypovolemia, while a high CVP indicates fluid overload or right heart failure.' },
              { q:'Which factor would cause an increase in Central Venous Pressure (CVP)?', opts:['Deep inhalation','Distributive shock','Mechanical ventilation with PEEP','Dehydration'], ans:2, exp:'Factors that increase CVP include mechanical ventilation with PEEP, heart failure, hypervolemia, and cardiac tamponade.' },
              { q:'Pulmonary Artery Wedge Pressure (PAWP) is a clinical estimate of:', opts:['Right ventricular end-diastolic pressure','Left atrial pressure','Mean arterial pressure','Right atrial pressure'], ans:1, exp:'PAWP (PCWP) is measured by wedging a catheter into a small pulmonary arterial branch to estimate left atrial pressure and LV end-diastolic pressure.' },
              { q:'What is the normal value for Pulmonary Artery Wedge Pressure (PAWP)?', opts:['2â€“6 mmHg','6â€“12 mmHg','15â€“25 mmHg','25â€“30 mmHg'], ans:1, exp:'The normal value for PAWP is 6â€“12 mmHg.' },
              { q:'Pulmonary hypertension is clinically defined as pulmonary artery pressure (PAP) greater than:', opts:['10 mm Hg at rest','15 mm Hg at rest','25 mm Hg at rest','40 mm Hg at rest'], ans:2, exp:'Pulmonary hypertension occurs if the pressure in the pulmonary artery is > 25 mm Hg at rest or 30 mm Hg during activity.' },
              { q:'Where is the phlebostatic axis anatomically located?', opts:['2nd intercostal space, mid-clavicular line','4th intercostal space, mid-axillary line','5th intercostal space, left sternal border','4th intercostal space, mid-clavicular line'], ans:1, exp:'The phlebostatic axis is the intersection of the 4th intercostal space and the mid-axillary line.' },
              { q:'What is the clinical significance of the phlebostatic axis?', opts:['Site for auscultating the mitral valve','Preferred site for radial artery puncture','Zero reference point for hemodynamic pressure measurements','Indicates the location of the left ventricle'], ans:2, exp:'The phlebostatic axis is used as the zero level for hemodynamic pressure measurements (CVP, PAP, PCWP) to ensure accurate standardized readings.' },
              { q:'When leveling a pressure transducer for hemodynamic monitoring, the phlebostatic axis corresponds approximately to the level of the:', opts:['Left ventricle','Aortic arch','Right atrium','Pulmonary artery'], ans:2, exp:'The phlebostatic axis corresponds approximately to the level of the right atrium.' }
            ]
          }
        ]
      },
      {
        name: 'CNS', icon: 'fa-brain', color: '#8b5cf6',
        sections: [
          {
            name: 'CNS I',
            questions: [
          { q:'Which structure is responsible for generating and transmitting the nerve impulse and is known as the working unit of the nervous system?', opts:['Neuroglia','Astrocyte','Schwann cell','Neuron'], ans:3, exp:'Neurons are identified as the working unit of the nervous system, responsible for generating and transmitting the nerve impulse.' },
          { q:'What is the typical duration of the action potential produced by nervous tissue?', opts:['1 second','1 minute','1 millisecond','1 microsecond'], ans:2, exp:'Nervous tissue has the property to produce action potential, which has a 1 millisecond duration.' },
          { q:'The nerve cell body, also known as the soma or perikaryon, contains all of the following components EXCEPT:', opts:['Mitochondria','Nissl bodies','Cell membrane','Neurotransmitters'], ans:3, exp:'The cell body consists of cytoplasm, nucleus, lysosomes, mitochondria, Nissl bodies, and Golgi complex. Neurotransmitters are synthesized in pre-synaptic neurons and stored in vesicles.' },
          { q:'Nissl bodies are composed of:', opts:['Cytoplasm and Golgi complex','Lysosomes and mitochondria','Polysomes and rough endoplasmic reticulum','Synaptic vesicles and neurofilaments'], ans:2, exp:'Nissl bodies are characteristic of nerve cells and consist of polysomes and rough endoplasmic reticulum.' },
          { q:'Nissl bodies are present in which parts of the neuron?', opts:['Axons only','Nerve cell bodies and axons','Dendrites and axons','Nerve cell bodies and dendrites'], ans:3, exp:'Nissl bodies are present in nerve cell bodies and dendrites but are absent in axons.' },
          { q:'A genetic defect in the synthesis of lysosomal enzymes results in which specific storage disease?', opts:['Multiple sclerosis','Tay-Sachs disease','Gliosis',"Parkinson's disease"], ans:1, exp:'A genetic defect in the synthesis of lysosomal enzymes results in the storage disease, Tay-Sachs disease.' },
          { q:'Which part of the neuron conducts in a decremental fashion and transmits synaptic input toward the cell body?', opts:['Axon','Myelin sheath','Dendrites','Nodes of Ranvier'], ans:2, exp:'Dendrites receive synaptic input, transmit it toward the cell body, and conduct in a decremental fashion.' },
          { q:'In a myelinated nerve fiber, the myelin sheath is produced in the Peripheral Nervous System (PNS) by:', opts:['Oligodendrocytes','Astrocytes','Schwann cells','Ependymal cells'], ans:2, exp:'The myelin sheath is produced in the PNS by Schwann cells.' },
          { q:'Where is the myelin sheath absent at regular intervals along a nerve fiber?', opts:['Pre-synaptic membrane','Synaptic cleft','Nodes of Ranvier','Perikaryon'], ans:2, exp:'The myelin sheath is absent at regular intervals, and these absent areas are called nodes of Ranvier.' },
          { q:'Which type of neuroglia are the largest glial cells, star-shaped, and play a role in forming the Blood-Brain Barrier (BBB)?', opts:['Microglia','Oligodendrocytes','Astrocytes','Schwann cells'], ans:2, exp:'Astrocytes are described as star-shaped, the largest glial cells, and they help to form the BBB.' },
          { q:'The process where Astrocytes form glial scars in damaged areas of the brain is known as:', opts:['Phagocytosis','Remyelination','Gliosis','Synaptic input'], ans:2, exp:'Astrocytes form glial scars in damaged areas of the brain, a process called gliosis.' },
          { q:'Damage or destruction to which type of glial cell is associated with multiple sclerosis?', opts:['Astrocytes','Microglia','Ependymal cells','Oligodendrocytes'], ans:3, exp:'Oligodendrocytes, the myelin-forming cells of the CNS, are destroyed in multiple sclerosis.' },
          { q:'Which neuroglia line the central canal of the spinal cord and the ventricles of the brain, and are involved in CSF secretion?', opts:['Astrocytes','Ependymal cells','Microglia','Satellite cells'], ans:1, exp:'Ependymal cells line these structures and are involved in the secretion of cerebrospinal fluid (CSF).' },
          { q:'Which small glial cells arise from monocytes entering the CNS from the blood and function as macrophages in damaged tissue?', opts:['Oligodendrocytes','Astrocytes','Microglia','Schwann cells'], ans:2, exp:'Microglia arise from monocytes and function as macrophages when activated by inflammatory or degenerative processes.' },
          { q:'What is the total number of pairs of cranial nerves that arise from the brain?', opts:['10 pairs','31 pairs','12 pairs','20 pairs'], ans:2, exp:'Cranial nerves arise from the brain, and there is a total of 12 pairs.' },
          { q:'Visceral neurons (autonomic nerve fibers) are classified based on distribution because they supply the:', opts:['Skeletal muscles of the body','Internal organs of the body','Brain and spinal cord','Skin receptors'], ans:1, exp:'Visceral neurons/autonomic nerve fibers supply the internal organs of the body.' },
          { q:'Neurons that conduct sensory impulses toward the brain or spinal cord are classified as:', opts:['Motor neurons','Efferent neurons','Afferent neurons','Somatic neurons'], ans:2, exp:'Sensory neurons/Afferent neurons conduct sensory impulses towards the brain or spinal cord.' },
          { q:'What is the minute space between the presynaptic and postsynaptic neurons called?', opts:['Synaptic junction','Synaptic vesicle','Synaptic cleft','Synaptic body'], ans:2, exp:'The minute space between pre and post-synaptic neurons is called a synaptic cleft.' },
          { q:'In a chemical synapse, where is the neurotransmitter synthesized and stored before transmission?', opts:['Synaptic cleft','Post-synaptic membrane','Myelin sheath','Pre-synaptic neurons'], ans:3, exp:'Neurotransmitter is synthesized by the pre-synaptic neurons and stored in vesicles.' },
          { q:'Electrical synapses, or ephapses, are characterized by consisting of:', opts:['Neurotransmitter receptors','Polysomes','Gap junctions','Myelin sheaths'], ans:2, exp:'Electrical synapses (ephapses) consist of gap junctions and allow ions to pass from cell to cell.' },
          { q:'Satellite cells are glial cells of the PNS that perform what function?', opts:['Form myelin sheath on PNS neurons','Enclose cell bodies of sensory neurons in spinal ganglia','Function as macrophages','Line the central canal'], ans:1, exp:'Satellite cells enclose the cell bodies of sensory neurons in the spinal ganglia.' },
          { q:'How many total pairs of spinal nerves arise from the spinal cord?', opts:['12 pairs','30 pairs','31 pairs','40 pairs'], ans:2, exp:'Spinal nerves arise from the spinal cord, and there is a total of 31 pairs.' },
          { q:'Motor neurons (efferent neurons) carry impulses from the CNS to stimulate:', opts:['Sensory input','Contraction in muscle tissue','Secretion in glandular tissue','Both B and C'], ans:3, exp:'Motor neurons carry impulses from the CNS to either muscle tissue (stimulates contraction) or glandular tissue (stimulates secretion).' },
          { q:'Neuroglia cells are generally different from neurons because neuroglia cells:', opts:['Are excitable','Are non-excitable and capable of cell division throughout life','Generate action potentials','Transmit nerve impulses'], ans:1, exp:'Neuroglia are non-excitable glial cells and are capable of cell division throughout life.' }
            ]
          },
          {
            name: 'CNS II',
            questions: [
          { q:'A nurse is preparing a client for a CT scan using contrast dye. Which pre-procedural action is essential?', opts:['Placing the client in a prone position for 2 hours','Withholding all caffeine and stimulants for 48 hours','Assessing for allergies to iodine, contrast dyes, or shellfish','Ensuring all metal objects are removed from the client'], ans:2, exp:'Pre-procedural interventions for a CT scan using dye include assessing the client for allergies to iodine, contrast dyes, or shellfish. Option A relates to Lumbar Puncture, B to EEG, D to MRI.' },
          { q:"During the injection of contrast dye for a CT scan, the client reports a hot, flushed sensation and a metallic taste in their mouth. What is the nurse's priority action?", opts:['Stop the injection immediately and assess for anaphylaxis','Administer replacement fluids to prevent dehydration','Inform the client that this is a normal expected sensation','Check the dye injection site for hematoma formation'], ans:2, exp:'A hot, flushed sensation and metallic taste when contrast dye is injected are normal expected findings that the nurse should inform the client about beforehand.' },
          { q:'Following a CT scan with contrast dye, which assessment should the nurse perform regarding the injection site?', opts:['Monitor the site for CSF leakage','Check for the presence of a hematoma or bleeding','Assess for pain on the outer part of the elbow',"Check for a positive Phalen's sign"], ans:1, exp:'Post-procedure interventions include assessing the injection site for bleeding or hematoma, and monitoring the extremity for color, warmth, and distal pulses.' },
          { q:'A Lumbar Puncture is contraindicated in clients diagnosed with which condition?', opts:['Carpal tunnel syndrome','Hypotension','Increased Intracranial Pressure (ICP)',"Positive Phalen's sign"], ans:2, exp:'A Lumbar Puncture is specifically contraindicated in clients with increased ICP.' },
          { q:'Where is the spinal needle inserted during a standard Lumbar Puncture procedure?', opts:['Into the subarachnoid space through the L3-L4 interspace','Over the median nerve in the wrist','Into the lateral epicondyle','Through the occipital lobe'], ans:0, exp:'A Lumbar Puncture involves the insertion of a spinal needle through the L3-L4 interspace into the lumbar subarachnoid space.' },
          { q:'Post-procedure care following a Lumbar Puncture requires placing the patient in a prone position for what duration?', opts:['6 hours','60 seconds','2 hours','24-48 hours'], ans:2, exp:'Post-procedure interventions for a Lumbar Puncture require placing the patient in a prone position for 2 hours.' },
          { q:'What potential post-procedure complication should the nurse monitor for specifically after a Lumbar Puncture?', opts:['Hot, flushed sensation in the mouth','CSF leakage or headache','Compression of the radial nerve','Development of Beta waves'], ans:1, exp:'Post-procedure interventions for a Lumbar Puncture include monitoring for headache and checking for the presence of CSF leakage.' },
          { q:'Which dietary instruction is appropriate for a client preparing for an EEG?', opts:['Allow the client to have breakfast','Withhold all oral intake for 8 hours','Restrict fluid intake due to expected diuresis','Withhold only medications, not beverages'], ans:0, exp:'A key pre-procedural intervention for an EEG is to allow the client to have breakfast.' },
          { q:'Which normal adult brain wave pattern is associated with being awake with mental activity?', opts:['Alpha (8-13 Hz)','Theta (4-7 Hz)','Delta (<3.5 Hz)','Beta (14-30 Hz)'], ans:3, exp:'The Beta wave (14-30 Hz) is the normal adult brain wave associated with being awake with mental activity.' },
          { q:'What brain wave pattern is characteristic of deep sleep?', opts:['Beta','Alpha','Delta','Gamma'], ans:2, exp:'Delta waves (<3.5 Hz) are the brain waves associated with deep sleep.' },
          { q:'A GCS score less than 8 indicates which state?', opts:['Minor injury','Moderate injury','Coma','Awake and resting'], ans:2, exp:'A score less than 8 on the GCS indicates coma.' },
          { q:'Which clinical manifestation is characteristic of Carpal Tunnel Syndrome?', opts:['Pain on the outer part of the elbow','Impaired sensation in the distribution of the median nerve','Compression on the nerve from walking with crutches','Brain wave activity of 8-13 Hz'], ans:1, exp:'Clinical manifestations of CTS include weakness, pain, numbness and tingling sensation, and impaired sensation in the distribution of the median nerve.' },
          { q:"A positive response to Phalen's sign is identified by which finding?", opts:['An immediate hot, flushed sensation','Tingling in the distribution of the median nerve over the hand','Point tenderness over the lateral epicondyle','A GCS score of 9-12'], ans:1, exp:"Both Tinel's sign and Phalen's sign are positive if there is a sensation of tingling in the distribution of the median nerve over the hand." },
          { q:'Radial tunnel syndrome is also known by which common name?', opts:['Saturday night palsy','Crutch palsy','Persistent tennis elbow','Honeymoon palsy'], ans:2, exp:'Radial tunnel syndrome is also known as persistent tennis elbow.' },
          { q:'Which is a characteristic clinical feature of Tennis Elbow (Lateral Epicondylitis)?', opts:['Numbness and tingling in the median nerve distribution','Point tenderness over the lateral epicondyle','Tingling sensation when tapping the wrist','Compression of the L3-L4 interspace'], ans:1, exp:'Clinical features of Tennis Elbow include pain on the outer part of the elbow and point tenderness over the lateral epicondyle.' },
          { q:'Which alias for Radial Nerve Palsy is specifically associated with compression due to falling asleep with the back of the arm compressed, often related to alcohol intake?', opts:['Honeymoon palsy','Crutch palsy','Squash palsy','Saturday night palsy'], ans:3, exp:'Saturday night palsy is an alias for Radial Nerve Palsy, where alcohol is sometimes a factor as a person falls asleep with the back of their arm compressed.' }
            ]
          },
          {
            name: 'CNS III',
            questions: [
          { q:'Meningitis is pathologically defined as the inflammation involving which specific layers of the Central Nervous System (CNS)?', opts:['Dura mater and subarachnoid space','White and grey matter of the brain','Arachnoid and pia mater of the brain and spinal cord','Brain parenchymal tissue and cerebrum'], ans:2, exp:'Meningitis is the inflammation of the meninges, specifically the arachnoid and pia mater of the brain and spinal cord.' },
          { q:'Which of the following classifications of meningitis is also known as "Septic Meningitis"?', opts:['Tuberculous bacilli meningitis (TBM)','Aseptic meningitis','Bacterial meningitis (Pyogenic)','Viral meningitis'], ans:2, exp:'Bacterial meningitis is referred to as septic meningitis or Pyogenic meningitis.' },
          { q:'The organism responsible for causing infection of the meninges typically enters the Central Nervous System (CNS) through which primary route(s)?', opts:['Direct inoculation via lumbar puncture','Gastrointestinal tract invasion','Upper respiratory tract or bloodstream','Direct spread from the inner ear'], ans:2, exp:'The causative organism enters into the CNS through the upper respiratory tract or bloodstream.' },
          { q:'Septic Meningitis is most frequently observed in which demographic?', opts:['Adults aged 20 to 40 years','Age group 6 to 24 months','Birth to 2 months','Immunocompromised elderly patients'], ans:2, exp:'Septic meningitis (Bacterial meningitis) is most common from birth to 2 months.' },
          { q:'Which clinical manifestation is uniquely associated with meningococcal meningitis, differentiating it from other forms?', opts:['Seizure activity','Nuchal rigidity','Red macular (petechial) rash',"Positive Brudzinski's sign"], ans:2, exp:'A red macular (petechial) rash specifically occurs in meningococcal meningitis only.' },
          { q:'Seizure activity is a common complication in meningitis, reported to occur in what fraction of cases?', opts:['Half of cases','1/4th cases','1/3rd cases','2/3rds cases'], ans:2, exp:'Seizure occurs in 1/3rd cases of meningitis.' },
          { q:"A nurse assesses a patient for meningeal irritation. A positive Kernig's Sign is elicited when:", opts:['Neck flexion results in involuntary hip flexion','Neck flexion produces an electric shock sensation radiating down the spine','The extension of the knee is painful or limited when the knee and hip are both flexed to 90 degrees','The patient exhibits extreme neck stiffness (nuchal rigidity)'], ans:2, exp:"Kernig's Sign is positive when the knee is flexed to 90 degrees, the hip is flexed to 90 degrees, and the subsequent extension of the knee is painful or limited." },
          { q:'Which etiological agent is responsible for Tuberculous Bacilli Meningitis (TBM)?', opts:['Neisseria meningitidis','Tubercle bacilli (acid-fast bacilli) or mycobacterium tuberculosis','Mycoplasma','Herpes simplex'], ans:1, exp:'TBM is caused by tubercle bacilli (acid-fast bacilli) or mycobacterium tuberculosis.' },
          { q:'In the cerebrospinal fluid (CSF) analysis of Bacterial Meningitis, which combination of findings is expected regarding appearance and glucose levels?', opts:['Clear appearance; Normal glucose','Clear appearance; Decreased glucose','Turbid appearance; Decreased glucose (<40 mg/dL)','Turbid appearance; Normal glucose'], ans:2, exp:'Bacterial Meningitis is characterized by Turbid appearance and Decreased glucose levels (<40 mg/dL).' },
          { q:'A lumbar puncture performed on a client suspected of having Viral Meningitis would typically yield CSF with which characteristics regarding WBC count and Glucose level?', opts:['WBC >1000 cells/uL; Decreased glucose','WBC <500 cells/uL; Low or absent glucose','WBC <300 cells/uL with Lymphocytic predominance; Normal glucose','WBC 25-300 microl; Normal glucose'], ans:2, exp:'Viral Meningitis CSF analysis shows WBC count <300 with Lymphocytic predominance and Normal glucose (50-80 mg/dL).' },
          { q:'Which CSF finding is commonly associated with Fungal Meningitis?', opts:['Protein levels 15-45 mg/dL','Opening pressure below 90 mm Hg','WBC count >1000 cells/uL','Protein levels >200 mg/dL'], ans:3, exp:'Fungal Meningitis is associated with Protein levels >200 mg/dL and Normal-Elevated Opening Pressure.' },
          { q:'In the pharmacological management of Meningitis, which medication class is specifically advised for headache relief?', opts:['Steroids (Dexamethasone)','Antivirals (Acyclovir)','Anti-seizure medications','Analgesics (Codeine)'], ans:3, exp:'Management for meningitis includes Analgesics (Codeine for headache).' },
          { q:'The definitive description of Encephalitis involves the inflammation of which specific components of the brain?', opts:['The meninges (arachnoid and pia mater)','Cranial nerves and spinal nerve roots','Brain parenchymal tissue and white and grey matter of the brain','Cerebral cortex and the ventricles'], ans:2, exp:'Encephalitis is the inflammation of the brain parenchymal tissue and inflammation of white and grey matter of the brain.' },
          { q:'Which specific viral pathogen is listed as an etiology for Encephalitis?', opts:['Mumps virus','Enterovirus','Arbovirus','Cytomegalovirus (CMV)'], ans:3, exp:'Viral etiologies for Encephalitis include CMV, HSV, EBV, and Measles virus.' },
          { q:'If a patient with Encephalitis is managed to control increased Intracranial Pressure (ICP), the Head of Bed (HOB) should be elevated to what range?', opts:['15-20 degrees','30-45 degrees','60 degrees','90 degrees'], ans:1, exp:'Management for Encephalitis includes elevating HOB 30-45 degrees to help control ICP.' },
          { q:'Brain Abscess is defined as a pathological condition characterized by:', opts:['Chronic demyelination of CNS neurons','Inflammation restricted to the gray matter','Accumulation of pus within the brain tissue resulting from local or systemic infection','Inflammation of the brain and spinal cord meninges'], ans:2, exp:'Brain abscess is the accumulation of pus within the brain tissue that can result from a local or systemic infection.' },
          { q:'When comparing CSF analysis results for Encephalitis and Brain Abscess, a key distinction is often seen in the glucose level:', opts:['Encephalitis glucose is decreased; Brain Abscess glucose is normal','Encephalitis glucose is Normal; Brain Abscess glucose is Low or absent','Both conditions typically show decreased glucose','Both conditions typically show normal glucose'], ans:1, exp:'In Encephalitis, glucose is Normal. In Brain Abscess, glucose is Low or absent.' },
          { q:'Multiple Sclerosis (MS) is classified as a chronic, progressive, degenerative disorder resulting from the destruction of which vital component for nerve conduction in the CNS?', opts:['Astrocyte connections','Pia mater','Myelin sheath of neurons','Oligodendrocytes themselves'], ans:2, exp:'MS occurs due to the destruction of the myelin sheath of neurons in the CNS, which is essential for normal conduction of nerve impulses.' },
          { q:'Multiple Sclerosis is also commonly known by which two alternative names?', opts:['Septic meningitis and TBM',"Kernig's disease and Brudzinski's syndrome",'Disseminated sclerosis or Encephalomyelitis disseminate','Acute disseminated encephalomyelitis (ADEM)'], ans:2, exp:'MS is known as disseminated sclerosis or Encephalomyelitis disseminate.' },
          { q:'Multiple Sclerosis exhibits a specific gender prevalence, affecting women approximately:', opts:['Three times as much as men','Twice as much as men','Equally as much as men','Half as much as men'], ans:1, exp:'MS affects the 20 to 40 years age range, and women are affected twice as much as men.' },
          { q:"A patient with Multiple Sclerosis experiences an electric shock-like sensation radiating down the spine upon neck flexion. This sign, known as Lhermitte's Sign, is also referred to as the:", opts:['Positive Babinski reflex','Spasticity phenomenon','Barber chair phenomenon',"Uhthoff's phenomenon"], ans:2, exp:"Lhermitte's sign, described as the electric shock-like sensation on neck flexion, is also known as the Barber chair phenomenon." },
          { q:'Which clinical manifestation of Multiple Sclerosis is defined as the paralysis of all four limbs due to bilateral lesion of the pyramidal tract at the cervical region?', opts:['Hemiplegia','Paraplegia','Quadriplegia/tetraplegia','Diplegia'], ans:2, exp:'Quadriplegia/tetraplegia is defined as the paralysis of all 4 limbs due to bilateral lesion of the pyramidal tract at the cervical region.' },
          { q:'Which factor is listed as a potential risk factor that may trigger relapses or exacerbations in a client with Multiple Sclerosis?', opts:['High protein diet','Elevated blood sugar','Stress','High potassium intake'], ans:2, exp:'Risk factors for MS exacerbations include Pregnancy, Fatigue, Stress, Trauma, and Infection.' },
          { q:'In the diagnostic workup for Multiple Sclerosis, which specific immunological finding in CSF analysis supports the diagnosis?', opts:['Decreased CSF glucose level','Normal serum globulin level','Increased oligoclonal antibody level','Decreased protein level'], ans:2, exp:'Diagnosis via LP and CSF analysis shows Elevated proteins, Increased oligoclonal antibody level, and Increased gamma globulin level.' },
          { q:'A core nursing intervention to address constipation in a client with Multiple Sclerosis involves advising which specific dietary modification?', opts:['Low-fat, low-fiber diet with fluid restriction','High protein, low potassium diet','Balanced diet: low-fat, high fiber diet','High carbohydrate diet to increase energy'], ans:2, exp:'Nursing care advice includes a balanced diet: low-fat, high fiber diet to relieve constipation, along with high protein, potassium-rich diet and increased fluids.' }
            ]
          },
          {
            name: 'CNS IV',
            questions: [
          { q:'The underlying mechanism of muscle weakness in Myasthenia Gravis (MG) involves antibodies that specifically target and destroy which structure?', opts:['Dopamine receptors in the substantia nigra','Acetylcholine receptors at the neuromuscular junction','Gamma-aminobutyric acid (GABA) receptors in the brain','Motor end plates, causing hyperpolarization'], ans:1, exp:'Myasthenia Gravis is an autoimmune disease where antibodies destroy the acetylcholine receptor at the neuromuscular junction, causing decreased functional ACh receptors and lack of Na+ influx preventing muscle contraction.' },
          { q:'A patient presenting with Myasthenia Gravis exhibits severe generalized weakness that is notably worse in the late afternoon or evening. This manifestation is best described as:', opts:['Tremor (Pill rolling)','Rigidity (Stiffness)','Extreme weakness and fatigue in the evening','Loss of automatic movements'], ans:2, exp:'Extreme weakness and fatigue in the evening is a clinical manifestation of MG. The weakness is characterized as fluctuating weakness of skeletal muscles, particularly those used for chewing, speaking, breathing, and eye muscles.' },
          { q:'Which finding, if noted during the assessment of a patient experiencing a Myasthenic Crisis, is considered an acute life-threatening sign?', opts:['Ptosis and Diplopia','Decreased urine output','Respiratory paralysis and failure','Bowel and bladder incontinence'], ans:2, exp:'Clinical manifestations of Myasthenia Gravis include respiratory paralysis and failure. Myasthenic crisis is defined as an acute attack or acute exacerbation of the disease.' },
          { q:'The Tensilon test involves administering Edrophonium. If the patient has Myasthenia Gravis, what result is expected?', opts:['Muscle strength is not improved, indicating the weakness is due to other reasons','Muscle strength is improved, indicating possibly Myasthenia Gravis','Severe cholinergic side effects immediately necessitate administering atropine','An acute exacerbation of the disease occurs'], ans:1, exp:"During the Tensilon test, if Edrophonium is injected and the patient's muscle strength is improved, it indicates possibly Myasthenia Gravis." },
          { q:'In Myasthenia Gravis, the diagnosis process often includes screening for Thymoma. Which diagnostic studies are specifically mentioned for detecting this condition?', opts:['Nerve conduction study and EMG','Lumbar puncture and CSF analysis','CT or MRI Scan','Tensilon Test'], ans:2, exp:'CT and MRI Scans are used to detect Thymoma. Other diagnostic methods include the Tensilon test, Nerve conduction study, and EMG.' },
          { q:'A Myasthenic Crisis (acute attack of myasthenia gravis) can be caused by:', opts:['Overmedication with anticholinesterase drugs','Excessive secretion of cholinesterase','A rapid unrecognized progression of the disease, such as due to infection or inadequate medication','Anticholinergic drug administration'], ans:2, exp:'A Myasthenic crisis is caused by a rapid unrecognized progression of the disease. Specific factors include inadequate medication, infection, fatigue, and stress.' },
          { q:'The initial cause of muscle contraction failure in Myasthenia Gravis at the neuromuscular junction is due to:', opts:['Excessive cholinesterase destroying acetylcholine','Insufficient secretion of sodium (Na+)','Destruction of acetylcholine receptors leading to a lack of Na+ influx','Depolarization of the motor end plates'], ans:2, exp:'In Myasthenia Gravis, autoantibodies cause acetylcholine receptors to be internalized and degraded, leading to a lack of Na+ influx which prevents muscle contraction.' },
          { q:'Plasmapheresis (Plasma exchange therapy) is utilized in the management of Myasthenia Gravis for what specific purpose?', opts:['To increase dopamine levels in the brain','To remove circulating anti-Ach receptor antibody','To prevent the destruction of levodopa by the liver','To depolarize the motor end plates'], ans:1, exp:'Plasmapheresis is used in management to remove circulating anti-Ach receptor antibody.' },
          { q:'A patient is diagnosed with Cholinergic Crisis. The nurse recognizes that this crisis is typically caused by:', opts:['Infection or fatigue','Inadequate amount of medication','Overmedication with anticholinesterase','Degeneration of dopamine-producing cells'], ans:2, exp:'Cholinergic crisis is caused by overmedication with anticholinesterase.' },
          { q:'For a patient experiencing Cholinergic Crisis, the priority nursing intervention related to medication administration involves:', opts:['Administering IV immunoglobulin','Administering Bromocriptine','Administering the antidote atropine sulfate','Providing a high-calorie, protein, and fiber diet'], ans:2, exp:'The interventions for Cholinergic Crisis are to withhold anticholinesterase medication and administer antidote atropine sulfate.' },
          { q:'In addition to fluctuating muscle weakness in the eyes and face, which two related swallowing and respiratory findings are characteristic clinical manifestations of Myasthenia Gravis?', opts:['Dysphagia and Hoarseness in voice','Micrographia and Monotonous speech','Constipation and Amnesia','Rigidity and Bradykinesia'], ans:0, exp:'Clinical manifestations include dysphagia (difficulty chewing and swallowing) and hoarseness in voice.' },
          { q:'Which assessment finding is unique to the assessment of Myasthenic Crisis, indicating severe systemic stress and deterioration?', opts:['Loss of ability to control body movements','Absent cough and swallow reflex','Tremors in hands and fingers at rest','Insufficient secretion of acetylcholine'], ans:1, exp:'Assessment findings during a Myasthenic Crisis include absent cough and swallow reflex, along with increased pulse, respiration, and BP, dyspnea, anoxia, cyanosis, and decreased urine output.' },
          { q:'The use of immunosuppressants such as Azathioprine and Cyclosporine, along with surgery like Thymectomy, are categorized under which component of Myasthenia Gravis care?', opts:['Diagnosis','Assessment','Complication','Management'], ans:3, exp:'Immunosuppressants (Azathioprine, Cyclosporine) and surgery (Thymectomy) are listed under the Management section for the disease.' },
          { q:"Parkinson's Disease (PD) is fundamentally characterized by the degeneration of dopamine-producing cells located in which specific brain structure?", opts:['Thalamus','Globus pallidus','Basal ganglia','Substantia nigra'], ans:3, exp:"Parkinson's Disease occurs due to the degeneration of dopamine-producing cells in the substantia nigra (nuclei in the extrapyramidal system of the midbrain)." },
          { q:"The characteristic triad of cardinal features used in the clinical diagnosis of Parkinson's Disease includes:", opts:['Dysphagia, Ptosis, and Diplopia','Tremor (Pill rolling), Rigidity (Stiffness), and Bradykinesia (Abnormal slow movement)','Akinesia, Micrographia, and Amnesia','Monotonous speech, Constipation, and Loss of automatic movements'], ans:1, exp:"The three cardinal features of Parkinson's Disease are Tremor (Pill rolling), Rigidity (Stiffness), and Bradykinesia (Abnormal slow movement)." },
          { q:"The purpose of Carbidopa when administered in combination with Levodopa for Parkinson's Disease management is:", opts:['To block reuptake of dopamine into presynaptic neurons','To activate dopamine receptors in the CNS','To convert L-dopa to dopamine in the brain','To prevent the destruction of levodopa by the liver and from early metabolism'], ans:3, exp:'Carbidopa must be given because it prevents the destruction of levodopa by the liver and from early metabolism.' },
          { q:"The primary reason a combination of Carbidopa and Levodopa is administered to Parkinson's patients, rather than dopamine alone, is:", opts:['Dopamine cannot cross the blood-brain barrier (BBB)','L-dopa is a dopamine antagonist','Carbidopa causes excessive secretion of cholinesterase','L-dopa is required to treat associated psychiatric symptoms'], ans:0, exp:'The combination is used because dopamine itself cannot cross the blood-brain barrier (BBB). L-dopa (precursor of dopamine) is converted to dopamine in the brain.' },
          { q:"Which clinical manifestation of Parkinson's Disease describes the progressively smaller handwriting often seen in patients?", opts:['Akinesia','Bradykinesia','Micrographia','Diplopia'], ans:2, exp:'Handwriting that becomes progressively smaller is described as micrographia.' },
          { q:"In Parkinson's Disease, loss of automatic movements, such as eye blinking and arm swinging while walking, is a clinical manifestation listed alongside:", opts:['Myasthenic crisis','Decreased functional acetylcholine receptors','Constipation and monotonous speech','Absent cough reflex'], ans:2, exp:"The loss of automatic movements is listed alongside Constipation and Monotonous speech (quick, soft, slurred speech) as clinical manifestations of Parkinson's Disease." },
          { q:'What specific dietary advice is given to patients taking antiparkinson medication?', opts:['Avoid high-calorie, protein, fiber, and soft diet','Avoid food rich in Vitamin B6 (fish, beef liver, organ meat)','Increase intake of foods rich in Vitamin B6','Avoid atropine sulfate'], ans:1, exp:'Patients should be advised to avoid food rich in Vitamin B6 (fish, beef liver, organ meat) because it blocks the effect of antiparkinson medication.' },
          { q:"Anticholinergic drugs, such as Atropine, Benztropine, and Trihexyphenidyl, are used in the management of Parkinson's Disease primarily to:", opts:['Increase dopamine secretion','Prevent levodopa destruction','Control tremor and hypersecretion of the body','Treat Myasthenic crisis'], ans:2, exp:'Anticholinergics (e.g., Atropine, Benztropine, Trihexyphenidyl) are used to control tremor and hypersecretion of the body.' },
          { q:'Which class of medication, including Bromocriptine, Selegeline, and Pramipexole, is used in PD management because it activates dopamine receptors in the CNS to increase dopamine secretion?', opts:['Anticholinergics','Anti-cholinesterase','Dopamine agonists','Antivirals (Amantadine)'], ans:2, exp:'Dopamine agonists, such as Bromocriptine, Selegeline, and Pramipexole, activate the dopamine receptor in the CNS to increase the secretion of dopamine.' },
          { q:"What type of surgery involves the placement of a neurostimulator (brain pacemaker) that sends electrical impulses through implanted electrodes to specific targets in the brain for Parkinson's Disease?", opts:['Thymectomy','Ablation surgery (Thalamotomy)','Deep Brain Stimulation (DBS)','Fetal neural tissue transplantation'], ans:2, exp:'The placement of a medical device - a neurostimulator (brain pacemaker) - which sends electrical impulses through implanted electrodes to specific targets in the brain is known as Deep Brain Stimulation.' },
          { q:'Amantadine, classified as an antiviral drug, helps reduce the effects of parkinsonism by performing what action?', opts:['Blocking reuptake of dopamine into presynaptic neurons','Activating the acetylcholine receptor','Preventing dopamine from crossing the BBB','Destroying cholinesterase enzymes'], ans:0, exp:'Amantadine (an antiviral drug) blocks reuptake of dopamine into presynaptic neurons and reduces the effects of parkinsonism.' },
          { q:"Ablation surgery for Parkinson's Disease includes which of the following specific procedures targeting areas in the brain?", opts:['Thymectomy, Plasmapheresis, and Transplantation','Thalamotomy, Pallidotomy, and Subthalamic Nucleotomy','Deep Brain Stimulation only','EMG and Nerve conduction study'], ans:1, exp:'Ablation surgery involves the stereotactic ablation of areas in the thalamus (thalamotomy), globus pallidus (pallidotomy), and subthalamic nucleus (subthalamic nucleotomy).' }
            ]
          },
          {
            name: 'CNS V',
            questions: [
          { q:'Which of the following is considered the most sensitive and earliest clinical manifestation of increased Intracranial Pressure (ICP)?', opts:['Projectile vomiting','Bradycardia','Altered Level of Consciousness (LOC)','Papilledema'], ans:2, exp:'Altered LOC is listed as the most sensitive and earliest indication of increased ICP.' },
          { q:"The pathological changes in Alzheimer's Disease are associated with the abnormal formation of which specific proteins?", opts:['Glucagon and Insulin','Serotonin and Dopamine','Tau and Beta Amyloid','Albumin and Globulin'], ans:2, exp:"Pathological changes in the brain associated with Alzheimer's Disease involve the abnormal formation of Tau and Beta Amyloid proteins, which lead to plaque formation and disrupt normal function." },
          { q:"A patient with Alzheimer's Disease is demonstrating an inability to execute familiar skillful activities, such as brushing their teeth or buttoning a shirt. This clinical manifestation is known as:", opts:['Amnesia','Agnosia','Apraxia','Aphasia'], ans:2, exp:'Apraxia is defined as the inability to execute familiar skillful activities.' },
          { q:"The Cholinergic hypothesis of Alzheimer's Disease suggests that the primary cause is a reduction in which specific neurotransmitter?", opts:['Epinephrine','Dopamine','Gamma-aminobutyric acid (GABA)','Acetylcholine (Ach)'], ans:3, exp:"The Cholinergic hypothesis posits that a reduction in Ach causes Alzheimer's Disease (AD)." },
          { q:"Which of the following medications is a centrally-acting acetylcholinesterase inhibitor listed for the management of Alzheimer's Disease?", opts:['Carbamazepine','Prednisolone','Donepezil (Aricept)','Neostigmine bromide'], ans:2, exp:'Aricept (Donepezil) is listed as a centrally-acting acetylcholinesterase inhibitor, along with Tacrine (Cognex), Rivastigmine (Exelon), and Galantamine (Reminyl).' },
          { q:"Which factor is specifically listed as a risk factor for Alzheimer's Disease (AD)?", opts:['Type 2 Diabetes Mellitus','Chronic Kidney Disease','Downs syndrome','Severe Hypertension'], ans:2, exp:"Downs syndrome is explicitly listed as a risk factor for AD, along with advanced age, family history, obesity, dyslipidemia, and brain injury." },
          { q:'Trigeminal neuralgia (Tic Douloureux) is a disorder affecting which branch of the V cranial nerve (trigeminal nerve)?', opts:['The motor branch','The efferent branch','The sensory or afferent branch','The autonomic branch'], ans:2, exp:'Trigeminal neuralgia is a disorder of the sensory or afferent branch of the V cranial nerve (trigeminal nerve).' },
          { q:'A patient experiencing sharp facial pain associated with Trigeminal Neuralgia reports that the pain is often triggered by simple activities. Which of the following is listed as a common trigger?', opts:['Lying supine','Washing the face','Mild ambient temperature changes','Taking warm baths'], ans:1, exp:'Conditions may be triggered by cold and hot substances, washing the face, chewing foods, or extremely hot or cold fluids.' },
          { q:'In the management of Trigeminal Neuralgia, nursing interventions regarding nutrition include:', opts:['Encouraging large, solid, high-fiber meals','Providing hot beverages and cold desserts','Instructing the patient to chew food on the unaffected side','Administering analgesics for mealtime pain relief'], ans:2, exp:'Nursing management includes instructing the patient to chew food on the unaffected side and providing small feedings of liquids and soft foods.' },
          { q:'Which class of medication is considered the first-line therapy for Trigeminal Neuralgia?', opts:['Antivirals (Acyclovir)','Anticonvulsants (Carbamazepine)','Anticholinesterases (Neostigmine)','Corticosteroids (Prednisolone)'], ans:1, exp:'Anti-convulsants (e.g., Carbamazepine, valproate, phenytoin) are considered the first-line therapy for trigeminal neuralgia to decrease trigeminal nerve activity.' },
          { q:"Bell's Palsy is a disease affecting the motor branch of which specific cranial nerve?", opts:['CN V (Trigeminal)','CN VII (Facial)','CN IX (Glossopharyngeal)','CN XII (Hypoglossal)'], ans:1, exp:"Bell's Palsy is a disease of the motor branch of the facial nerve (VII cranial nerve)." },
          { q:"Which symptom is characteristic of Bell's Palsy clinical manifestations?", opts:['Pain lasting 1-15 minutes along the trigeminal nerve','Bilateral facial paralysis','Unilateral loss of taste','Atrophy of the cerebral cortex'], ans:2, exp:"Clinical manifestations of Bell's Palsy include flaccid facial muscles, inability to raise the eyebrow/smile/close the eyeball, and unilateral loss of taste." },
          { q:"In the nursing management of Bell's Palsy, which intervention is crucial to prevent the loss of muscle tone?", opts:['Protecting the eye with artificial tear instillation','Promoting frequent oral care','Encouraging the patient to do facial exercises','Instructing the client to chew on the unaffected side'], ans:2, exp:'Nursing interventions include encouraging the patient to do facial exercises to prevent the loss of muscle tone.' },
          { q:"Which antiviral medication is listed for the management of Bell's Palsy?", opts:['Pyridostigmine','Acyclovir','Gabapentin','Mannitol'], ans:1, exp:"Antiviral - Acyclovir is listed under the management for Bell's Palsy." },
          { q:'What is the established normal range for Intracranial Pressure (ICP) measurement?', opts:['1-5 mm Hg','7-15 mm Hg','16-20 mm Hg','20-30 mm Hg'], ans:1, exp:'The Normal ICP is specified as 7-15 mm Hg.' },
          { q:'According to the Monroe Kellie Doctrine, if there is an increase in the volume of the brain tissue within the skull, what must occur to maintain a constant pressure?', opts:['The overall volume must increase, leading to a seizure','The CSF volume must increase','There must be a decrease in one or both of the other components (blood or CSF)','Cerebral perfusion pressure will drop instantly to zero'], ans:2, exp:'The Monroe Kellie Doctrine states that the volume of blood, brain, and CSF is constant, and an increase in any component leads to a decrease in one or both components from the cranium.' },
          { q:'In the context of Cerebral Blood Flow (CBF), a hike (increase) in PaCO2 results in which physiological change?', opts:['Cerebral vasoconstriction, leading to decreased ICP','Systemic hypotension, stabilizing ICP','Cerebral vasodilatation, resulting in increased ICP','Autoregulation failure, regardless of MAP'], ans:2, exp:'A hike in PaCO2 results in cerebral vasodilatation, and hence, ICP will also increase.' },
          { q:'Cerebral Perfusion Pressure (CPP) is calculated using which formula?', opts:['CPP = ICP + Mean Arterial Pressure (MAP)','CPP = MAP - Intracranial Pressure (ICP)','CPP = Systolic Blood Pressure (SBP) - Diastolic Blood Pressure (DBP)','CPP = ICP - MAP'], ans:1, exp:'The formula provided is CPP = Mean Arterial Pressure (MAP) - Intracranial Pressure (ICP).' },
          { q:"Which combination of vital signs is characteristic of Cushing's triad, a classical sign of increased ICP?", opts:['Hypotension, Tachycardia, Rapid/Deep respirations','Systolic HTN, Narrowed pulse pressure, Tachycardia','Systolic HTN, Widening of pulse pressure, Bradycardia','Hypotension, Bradycardia, Irregular heart rhythm'], ans:2, exp:"Cushing's triad consists of Systolic HTN, Widening of pulse pressure, and Bradycardia, often accompanied by irregular respiration or bradypnea." },
          { q:'A patient with severe increased ICP exhibits Decorticate (flexor) posturing. This specific posturing pattern is associated with a lesion in which area?', opts:['Brainstem (Pons, mid-brain)','Spinal cord','Cortex','Cerebellum'], ans:2, exp:'Decorticate (Flexor) posturing is associated with a Cortex lesion.' },
          { q:'Which clinical manifestation is listed as a late sign of increased ICP?', opts:['Altered LOC','Headache','Projectile vomiting','Lethargy'], ans:2, exp:'Projectile vomiting is a severe manifestation associated with significantly elevated ICP, listed as a classical sign when pressure is significantly high.' },
          { q:'In the management of increased ICP, the head of the bed should be elevated to what degree?', opts:['15 degrees','30 degrees','45 degrees','60 degrees'], ans:1, exp:'Management includes elevating the head of the bed to 30 degrees.' },
          { q:'Which type of pharmacological agent is specifically used in ICP management to decrease the production of CSF?', opts:['Osmotic diuretic (Mannitol)','Antihypertensives','Anticonvulsants','Carbonic anhydrase inhibitors'], ans:3, exp:'Carbonic anhydrase inhibitors are used to decrease the production of CSF and lower ICP.' },
          { q:"Autoregulation, the brain's ability to maintain a steady cerebral blood flow (CBF), is unable to function when the Mean Arterial Pressure (MAP) is below which critical threshold?", opts:['Less than 15 mm Hg','Less than 50 mm Hg','Greater than 150 mm Hg','Between 70 and 100 mm Hg'], ans:1, exp:'When the mean arterial pressure (MAP) is less than 50 mm Hg or greater than 150 mm Hg, the arterioles are unable to autoregulate.' },
          { q:'Which surgical intervention is used to divert CSF from the ventricles to the peritoneum for the management of increased ICP?', opts:['Craniotomy','Endarterectomy','VP shunt','External ventricular drain (EVD)'], ans:2, exp:'VP shunt is listed under surgical management to divert CSF from ventricles to the peritoneum.' }
            ]
          }
        ]
      },      {
        name: 'GI System', icon: 'fa-utensils', color: '#f59e0b',
        sections: [
          {
            name: 'GI System I',
            questions: [
          { q:"McBurney's point tenderness (appendicitis) is located at:", opts:['Left lower quadrant','Right lower quadrant â€” 1/3 between ASIS and umbilicus','Epigastric region','Right upper quadrant'], ans:1, exp:"McBurney's point: 1/3 of the way from the right ASIS to the umbilicus â€” the appendix location." },
          { q:"Cullen's sign (periumbilical ecchymosis) indicates:", opts:['Appendicitis','Retroperitoneal hemorrhage â€” classic in hemorrhagic pancreatitis','Bowel obstruction','Cholecystitis'], ans:1, exp:"Cullen's sign (periumbilical bruising) + Grey-Turner's sign (flank bruising) both indicate retroperitoneal hemorrhage." },
          { q:'When auscultating the abdomen, the correct order of assessment is:', opts:['Inspect, palpate, percuss, auscultate','Inspect, auscultate, percuss, palpate','Auscultate, inspect, percuss, palpate','Palpate, percuss, auscultate, inspect'], ans:1, exp:'Auscultation before palpation/percussion is critical â€” palpation can alter bowel sounds.' },
          { q:'A patient with liver cirrhosis is most likely to exhibit:', opts:['Peripheral cyanosis and clubbing','Spider angiomata, jaundice, palmar erythema, and ascites','Barrel chest and pursed-lip breathing','JVD and pedal edema only'], ans:1, exp:'Cirrhosis signs: jaundice, spider nevi, palmar erythema, ascites, caput medusae, asterixis (flapping tremor).' },
          { q:'Dietary management for hepatic encephalopathy includes:', opts:['High-protein, high-carbohydrate diet','Protein restriction and lactulose to reduce ammonia production','High-fat, low-carbohydrate diet','Unrestricted diet with albumin supplementation'], ans:1, exp:'Hepatic encephalopathy is driven by ammonia. Protein is restricted; lactulose traps NH3 in the colon as NH4+ and speeds elimination.' },
          { q:"Which feature distinguishes Crohn's disease from ulcerative colitis?", opts:["Crohn's: continuous from rectum; UC: skip lesions","Crohn's: transmural skip lesions, any GI segment; UC: mucosal-only continuous colitis","Crohn's: colon only; UC: involves small bowel","Both are clinically identical"], ans:1, exp:"Crohn's = skip lesions, transmural, any part of GI tract. UC = continuous, mucosal only, colon only, bloody diarrhea." },
          { q:'Dumping syndrome typically occurs:', opts:['12-24 hours after eating','15-30 minutes after eating (early) or 1-3 hours (late)','Only when fasting','Only with high-fat foods'], ans:1, exp:'Early dumping (15-30 min): rapid gastric emptying causes osmotic shift. Late (1-3 hr): reactive hypoglycemia. Tx: small frequent meals, high protein/fat, low simple carbs.' },
          { q:"Murphy's sign (acute cholecystitis) is:", opts:['Rebound tenderness in the RLQ','Inspiratory arrest on deep RUQ palpation due to pain','Periumbilical ecchymosis','Shoulder pain on RUQ palpation'], ans:1, exp:"Murphy's sign: patient inhales deeply while examiner presses under the right costal margin â€” pain causes inspiratory arrest." },
          { q:'Initial management of acute pancreatitis includes:', opts:['Early high-fat oral feeding','NPO (or early enteral nutrition), IV fluids, pain control, and monitoring','Immediate surgery','Antacids and H2 blockers'], ans:1, exp:'Acute pancreatitis: bowel rest, aggressive IV hydration (Lactated Ringer preferred), analgesia, monitoring for complications.' },
          { q:'A nurse finds absent bowel sounds 6 hours post-abdominal surgery. Priority action:', opts:['Encourage oral fluids immediately','Keep NPO, document, and monitor for paralytic ileus','Administer a laxative','Vigorous ambulation immediately'], ans:1, exp:'Absent bowel sounds post-op suggest paralytic ileus. NPO, monitoring, early ambulation (when cleared), and IV fluids are priorities.' },
          { q:'Esophageal varices develop as a complication of:', opts:['GERD','Portal hypertension from liver cirrhosis','Peptic ulcer disease','Mallory-Weiss tear'], ans:1, exp:'Portal hypertension causes collateral circulation through gastroesophageal varices. Rupture causes massive upper GI bleeding.' },
          { q:'A healthy stoma should appear:', opts:['Pale pink with slight edema','Bright red to beefy-red and moist','Blue-black or dark purple','Dry and white'], ans:1, exp:'A healthy stoma is bright red (like oral mucosa) and moist. Blue/black = ischemia â€” report immediately.' },
          { q:'The most accurate method to verify NG tube placement is:', opts:['Auscultating air insufflation','Checking pH of aspirate (pH below 5.5)','Chest X-ray (radiograph)','Observing for respiratory distress'], ans:2, exp:'Gold standard for NG tube placement = chest X-ray. pH testing is a secondary check; auscultation alone is unreliable.' },
          { q:'GERD management includes:', opts:['Sleeping flat and large meals before bed','Elevating head of bed 30 degrees, small frequent meals, and avoiding triggers','High-fat diet and antacids only','Tight abdominal binders'], ans:1, exp:'GERD: HOB elevation, small meals, avoid lying down 2-3 hours post-meal, avoid caffeine/alcohol/spicy/fatty foods, PPIs.' },
          { q:'H. pylori eradication (first-line triple therapy) consists of:', opts:['Antacid + antibiotics for 3 days','PPI + clarithromycin + amoxicillin for 14 days','H2 blocker + one antibiotic for 7 days','Surgery only'], ans:1, exp:'Triple therapy: PPI + 2 antibiotics (clarithromycin + amoxicillin or metronidazole) x 14 days. Compliance is critical.' },
          { q:'TPN (total parenteral nutrition) is most commonly associated with:', opts:['Respiratory alkalosis','CLABSI and hyperglycemia','Hypokalemia from insulin release','Peripheral vein thrombosis only'], ans:1, exp:'TPN risks: central line-associated bloodstream infection (CLABSI), hyperglycemia, electrolyte imbalances, hepatic steatosis.' },
          { q:'Hematemesis (vomiting blood) most likely indicates bleeding from:', opts:['Lower GI tract (below ligament of Treitz)','Upper GI tract (esophagus, stomach, or duodenum)','Urinary tract','Respiratory tract'], ans:1, exp:'Hematemesis = upper GI bleed (above ligament of Treitz). Melena also indicates upper GI bleed. Hematochezia = lower GI bleed.' },
          { q:'Celiac disease requires lifelong:', opts:['Lactose-free diet','Gluten-free diet (no wheat, barley, rye)','Low-FODMAP diet','High-fibre diet'], ans:1, exp:'Celiac = immune-mediated enteropathy triggered by gluten. Strict gluten-free diet allows mucosal healing.' },
          { q:'Hepatitis A is transmitted via:', opts:['Blood and body fluids','Fecal-oral route (contaminated food and water)','Sexual contact primarily','Vertical (mother-to-child)'], ans:1, exp:'Hep A: fecal-oral. Self-limiting, no chronic form. Vaccine available.' },
          { q:'Hepatitis B is transmitted via:', opts:['Fecal-oral route only','Blood, sexual contact, and vertical (perinatal) transmission','Airborne droplets','Insect bites'], ans:1, exp:'Hep B: parenteral, sexual, and vertical (mother to baby during birth). Can progress to chronic hepatitis, cirrhosis, HCC.' },
          { q:'Ascites is managed with:', opts:['High-sodium diet and oral steroids','Sodium restriction, spironolactone, and therapeutic paracentesis','High-protein diet and furosemide alone','Antibiotics and fluid restriction'], ans:1, exp:'Ascites: sodium restriction (below 2 g/day), spironolactone (first-line diuretic), furosemide, large-volume paracentesis for symptomatic/refractory cases.' },
          { q:'Signs of peritonitis include:', opts:['Soft abdomen with normal bowel sounds','Rigid board-like abdomen, rebound tenderness, and absent bowel sounds','Distended abdomen with hyperactive bowel sounds','Epigastric pain relieved by food'], ans:1, exp:'Peritonitis: intense diffuse abdominal pain, guarding, rigidity, rebound tenderness, absent bowel sounds, fever â€” surgical emergency.' },
          { q:'Compared to a colostomy, an ileostomy produces:', opts:['Formed stool similar to normal defecation','Liquid to semi-liquid output (large bowel water absorption is bypassed)','No output for the first week','Bloody output for 2-3 days'], ans:1, exp:'Ileostomy = small bowel stoma â€” liquid/semi-liquid output. Colostomy output is more formed depending on location.' },
          { q:'Priority monitoring for a patient with a Sengstaken-Blakemore tube:', opts:['Urinary retention','Airway obstruction from balloon migration','Wound dehiscence','Electrolyte imbalance only'], ans:1, exp:'Blakemore tube balloons can migrate and compress the airway â€” always have scissors at bedside to cut tube if needed.' },
          { q:'Which lab finding is characteristic of acute pancreatitis?', opts:['Elevated troponin I','Elevated serum amylase and lipase (above 3x upper limit of normal)','Elevated AST and ALT only','Elevated ALP and GGT'], ans:1, exp:'Amylase and lipase both rise in pancreatitis; lipase is more specific. Aminotransferases suggest hepatitis; ALP/GGT suggests biliary disease.' }
            ]
          },
          {
            name: 'GI System II',
            questions: [
          { q:'GERD (gastroesophageal reflux disease) is best diagnosed by:', opts:['CT scan of the abdomen','24-hour pH monitoring (gold standard) or esophageal manometry'], ans:1, exp:'24-hour ambulatory pH monitoring: records acid exposure in esophagus over 24 hours. Gold standard for GERD diagnosis when empirical PPI trial is inconclusive.' },
          { q:'Proton pump inhibitors (PPIs) like omeprazole should be taken:', opts:['With food or immediately after eating','30-60 minutes before the first meal of the day (peak acid suppression)'], ans:1, exp:'PPIs are prodrugs activated by acid. Best taken 30-60 min before first meal to inhibit active proton pumps. Evening dose if nocturnal symptoms.' },
          { q:'Mallory-Weiss tear results from:', opts:['H. pylori infection','Forceful vomiting causing a mucosal tear at the gastroesophageal junction'], ans:1, exp:'Mallory-Weiss tear: longitudinal mucosal laceration at GEJ from forceful vomiting (classically in alcoholics). Presents with hematemesis after vomiting. Usually self-limiting; endoscopic treatment if significant.' },
          { q:'Acute bleeding esophageal varices are managed with:', opts:['Emergency surgery only','IV octreotide (vasopressin analogue), endoscopic band ligation, and antibiotic prophylaxis'], ans:1, exp:'Variceal bleed: octreotide reduces portal pressure, endoscopic band ligation controls bleeding, antibiotics prevent SBP (ceftriaxone). TIPSS for refractory cases.' },
          { q:'Achalasia is characterized by:', opts:['Hypermotility of the esophagus with rapid emptying','Failure of lower esophageal sphincter relaxation with absent peristalsis causing dysphagia'], ans:1, exp:'Achalasia: LES fails to relax + absent peristalsis. Progressive dysphagia to solids then liquids, regurgitation, weight loss. Barium swallow: bird-beak narrowing. Treat: pneumatic dilation or Heller myotomy.' },
          { q:'Sliding hiatal hernia vs paraesophageal hernia:', opts:['Both are clinically identical','Sliding (most common): GEJ herniates â€” causes GERD. Paraesophageal: fundus herniates alongside GEJ â€” risk of strangulation'], ans:1, exp:'Sliding hiatal hernia (95%): GEJ slides above diaphragm â€” GERD symptoms. Paraesophageal hernia: fundus herniates but GEJ stays â€” risk of volvulus and strangulation (surgical emergency).' },
          { q:'Dumping syndrome dietary management includes:', opts:['Large meals 3 times daily, high simple carbohydrates','Small frequent meals (6 per day), high protein and fat, low simple carbs, avoid fluids with meals'], ans:1, exp:'Dumping syndrome: small frequent meals, lie down 30 min after eating (delays gastric emptying), avoid simple sugars and fluids with meals. Octreotide for refractory cases.' },
          { q:'Upper GI bleed management priorities include:', opts:['Oral antacids and observation','IV access x2 large bore, fluid resuscitation, type and crossmatch, NPO, urgent endoscopy'], ans:1, exp:'Upper GI bleed: large-bore IV x2, aggressive fluid resuscitation, blood transfusion (target Hb 7-8 g/dL), NPO, urgent EGD (diagnostic + therapeutic). PPI infusion reduces re-bleeding.' },
          { q:'Coffee ground emesis indicates:', opts:['Fresh active arterial bleeding','Old blood â€” digestion of hemoglobin by gastric acid (slower upper GI bleed)'], ans:1, exp:'Coffee ground emesis = blood oxidized by gastric acid = slower upper GI bleed (peptic ulcer, gastric cancer). Bright red hematemesis = active arterial bleed (variceal, severe ulcer).' },
          { q:'Melena (black tarry stool) indicates:', opts:['Lower GI bleed below sigmoid colon','Upper GI bleed (typically) â€” blood passes through GI tract and is digested, appearing black and tarry'], ans:1, exp:'Melena: upper GI bleed. Requires approximately 50-80 mL blood in upper GI tract. Characteristic foul tarry odor. Hematochezia (bright red per rectum): lower GI bleed or massive upper GI bleed.' },
          { q:'Peptic ulcer disease: gastric vs duodenal ulcer pain difference:', opts:['Both cause identical constant pain','Gastric ulcer: pain worsened by eating. Duodenal ulcer: pain relieved by eating, worsened 2-4 hours later (hunger pain)'], ans:1, exp:'Gastric ulcer: eating worsens pain (food stimulates acid/gastric motor activity). Duodenal ulcer: food buffers acid â€” eating relieves pain, then pain returns 2-4 hours later (acid rebound).' },
          { q:'Nasogastric tube (NGT) insertion nursing steps include:', opts:['Insert with head extended, check by auscultation only','Measure NEX (nose-earlobe-xiphoid) length, use water-based lubricant, head flexed, confirm by X-ray'], ans:1, exp:'NGT insertion: NEX measurement, lubricate tip, head flexed (closes airway), advance to measured length, confirm by X-ray before use. Never force past resistance.' },
          { q:'Esophageal cancer risk factors include:', opts:['Frequent exercise and high fiber diet','GERD and Barrett esophagus (adenocarcinoma), smoking and alcohol (squamous cell carcinoma)'], ans:1, exp:'Esophageal cancer: adenocarcinoma (rising) â€” GERD, Barrett esophagus, obesity. Squamous cell carcinoma â€” tobacco, alcohol, achalasia, hot liquids. Progressive dysphagia (solids to liquids) is the classic presentation.' },
          { q:'Gastric outlet obstruction causes:', opts:['Diarrhea and hypokalemia','Projectile non-bilious vomiting leading to metabolic alkalosis and hypokalemia (from HCl and K+ loss)'], ans:1, exp:'Gastric outlet obstruction: persistent vomiting of gastric contents (HCl, K+) causes hypochloremic hypokalemic metabolic alkalosis. NGT decompression, IV fluid correction.' },
          { q:'H2 receptor blockers (ranitidine, famotidine) mechanism:', opts:['Block proton pump (H+/K+ ATPase)','Block histamine H2 receptors on parietal cells, reducing acid secretion'], ans:1, exp:'H2 blockers: competitive antagonists of histamine H2 receptors on parietal cells. Reduce basal and meal-stimulated acid secretion. Less potent than PPIs but faster onset.' },
          { q:'NSAID gastropathy prevention includes:', opts:['Taking NSAIDs on an empty stomach','Co-administration of PPI or misoprostol, lowest effective NSAID dose, COX-2 selective NSAIDs'], ans:1, exp:'NSAID gastropathy: NSAIDs inhibit COX-1 â†’ reduce prostaglandin (mucosal protection) â†’ ulcers. Prevention: PPI with NSAID, misoprostol, COX-2 selective (celecoxib) â€” lower GI risk.' },
          { q:'Gastric cancer most common type worldwide is:', opts:['Leiomyosarcoma','Adenocarcinoma (intestinal or diffuse type)'], ans:1, exp:'Gastric cancer: 95% adenocarcinoma. H. pylori is the most important risk factor. Diffuse type (signet ring cells): associated with CDH1 mutation, poor prognosis, younger patients. Intestinal type: H. pylori, dietary nitrates.' },
          { q:'Zollinger-Ellison syndrome is caused by:', opts:['H. pylori infection alone','Gastrin-secreting tumor (gastrinoma) causing massive acid hypersecretion and multiple peptic ulcers'], ans:1, exp:'ZES: gastrinoma in pancreas or duodenum secretes excess gastrin. Multiple ulcers in unusual locations (distal duodenum, jejunum), refractory to standard treatment, diarrhea. Diagnose: serum gastrin level.' },
          { q:'Total enteral nutrition (TEN) via NGT is preferred over TPN because:', opts:['TEN is more cost-effective only','TEN preserves gut mucosal integrity, reduces bacterial translocation, CLABSI risk, and is associated with better outcomes in critically ill patients'], ans:1, exp:'Enteral nutrition maintains gut integrity, prevents mucosal atrophy and bacterial translocation. Preferred over TPN in almost all situations where GI tract is functional. "If the gut works, use it."' },
          { q:'Proton pump inhibitors long-term risks include:', opts:['Only minimal side effects at any dose','Hypomagnesemia, C. difficile infection risk, community-acquired pneumonia risk, osteoporosis/hip fractures, Vitamin B12 deficiency'], ans:1, exp:'Long-term PPI: reduces gastric acid (needed for Mg2+ and B12 absorption), increases C. diff risk (altered gut flora), increases pneumonia risk (acid barrier reduced), bone density loss.' },
          { q:'Octreotide (somatostatin analogue) in upper GI bleeding works by:', opts:['Directly lysing blood clots','Reducing portal pressure by inhibiting splanchnic vasodilation and decreasing gastrointestinal hormone secretion'], ans:1, exp:'Octreotide: reduces portal hypertension by inhibiting vasodilatory GI hormones. First-line pharmacological treatment for variceal bleeding alongside endoscopic therapy.' },
          { q:'Barrett esophagus is a risk factor for:', opts:['Squamous cell carcinoma only','Esophageal adenocarcinoma (malignant transformation of metaplastic columnar epithelium)'], ans:1, exp:'Barrett esophagus: GERD-induced replacement of squamous esophageal epithelium with intestinal columnar metaplasia. Increases adenocarcinoma risk 30-125 times. Requires surveillance endoscopy.' },
          { q:'Nasogastric tube feeding aspiration prevention includes:', opts:['Bolus feeding in supine position','HOB elevated 30-45 degrees, check residuals, aspirate before each feeding (intermittent)'], ans:1, exp:'Aspiration prevention: HOB 30-45 degrees at all times during feeding, gastric residual checks (hold if above 200-500 mL per protocol), oral hygiene, confirm tube position before feeding.' },
          { q:'Gastrostomy tube (G-tube) care includes:', opts:['Daily tube rotation and cleaning around insertion site with soap and water','Pulling tube in and out daily to prevent granulation tissue'], ans:0, exp:'G-tube care: rotate tube daily (prevents embedded bumper), clean site with soap and water, check balloon water (deflation monthly), monitor for granulation tissue, leakage, infection.' }
            ]
          },
          {
            name: 'GI System III',
            questions: [
          { q:'Hepatitis B surface antigen (HBsAg) indicates:', opts:['Immunity from prior vaccination','Active hepatitis B infection (acute or chronic) â€” patient is infectious'], ans:1, exp:'HBsAg: present in active HBV infection (acute or chronic). Persists more than 6 months = chronic HBV. HBsAb: indicates immunity (vaccination or resolved infection). HBcAb: past or current infection.' },
          { q:'Hepatitis C treatment (direct-acting antivirals) achieves sustained virological response in:', opts:['Less than 20% of patients','Over 95% of patients with modern DAA regimens'], ans:1, exp:'Modern DAAs (sofosbuvir + ledipasvir, glecaprevir + pibrentasvir): SVR rates above 95% in 8-12 weeks. SVR = cured (undetectable HCV RNA 12 weeks after treatment completion).' },
          { q:'Child-Pugh score for liver cirrhosis assesses:', opts:['Tumor burden in liver cancer','Bilirubin, albumin, PT/INR, ascites, and encephalopathy â€” predicts surgical risk and prognosis'], ans:1, exp:'Child-Pugh score (A/B/C): bilirubin, albumin, PT/INR, presence and severity of ascites and encephalopathy. Score 5-6=A (mild), 7-9=B (moderate), 10-15=C (severe).' },
          { q:'Portal hypertension complications include:', opts:['Hypertension only','Esophageal/gastric varices, ascites, splenomegaly, portosystemic encephalopathy, spontaneous bacterial peritonitis'], ans:1, exp:'Portal hypertension (portal pressure above 12 mmHg): varices (risk of fatal bleed), ascites, hypersplenism (thrombocytopenia), HE, SBP. Caused by cirrhosis in 90% of cases.' },
          { q:'Lactulose treats hepatic encephalopathy by:', opts:['Directly detoxifying ammonia in the blood','Converting NH3 (ammonia) to NH4+ (trapped in colon), acidifying colonic contents, and increasing stool frequency'], ans:1, exp:'Lactulose: metabolized by colonic bacteria producing acid environment that traps ammonia as NH4+ (cannot be absorbed). Also acts as cathartic. Dose adjusted to 2-3 soft stools/day.' },
          { q:'Spontaneous bacterial peritonitis (SBP) diagnosis requires:', opts:['Culture-positive ascitic fluid only','Ascitic fluid PMN count above 250 cells/mcL (with or without positive culture)'], ans:1, exp:'SBP: PMN count above 250 cells/mcL in ascitic fluid. Culture may be negative (culture-negative SBP). Commonest organism: E. coli. Treat: ceftriaxone or ciprofloxacin. Prophylaxis: norfloxacin.' },
          { q:'Hepatorenal syndrome (HRS) is best described as:', opts:['Hepatitis-induced kidney inflammation','Functional renal failure in cirrhosis from severe renal vasoconstriction â€” kidneys histologically normal'], ans:1, exp:'HRS: cirrhosis causes splanchnic vasodilation and reflex renal vasoconstriction. Rising creatinine with no other cause. Two types: HRS-AKI (type 1, rapid) and HRS-CKD (type 2, slower). Treatment: vasoconstrictors + albumin.' },
          { q:'Liver biopsy post-procedure nursing care includes:', opts:['Immediately ambulate and resume full diet','Right lateral position for 2 hours (liver compression), vital signs every 15 min, observe for hemorrhage and pneumothorax'], ans:1, exp:'Post liver biopsy: right lateral decubitus position for 2 hours (compresses liver), bed rest 4-6 hours, vital signs monitoring, watch for right shoulder pain (diaphragmatic irritation), bleeding, pneumothorax.' },
          { q:'Obstructive jaundice (post-hepatic) characteristics:', opts:['Unconjugated bilirubin elevated, dark urine, pale stools','Conjugated bilirubin elevated, dark urine (bilirubin in urine), pale stools (no bile to intestine)'], ans:1, exp:'Post-hepatic (obstructive) jaundice: bile flow blocked (gallstones, pancreatic cancer). Conjugated bilirubin backs up into blood, spills into urine (dark), absent in intestine (pale/clay stools).' },
          { q:'Cholecystitis nursing care includes:', opts:['High-fat diet to stimulate bile flow','NPO initially, IV fluids, analgesics, antibiotics, and preparation for cholecystectomy'], ans:1, exp:'Acute cholecystitis: NPO, IV fluids, analgesics (morphine or ketorolac), antibiotics if complicated, urgent laparoscopic cholecystectomy (ideally within 72 hours of symptom onset).' },
          { q:'Gallstone composition most commonly is:', opts:['Pure uric acid stones','Cholesterol stones (80%) in Western populations'], ans:1, exp:'Cholesterol gallstones (80%): risk factors â€” female, fat, forty, fertile, fair (5Fs). Also obesity, rapid weight loss, pregnancy, OCP. Pigment stones: hemolytic anemia, cirrhosis, biliary infection.' },
          { q:'Ranson criteria (acute pancreatitis severity) at admission include:', opts:['Temperature above 39C and lipase above 1000','Age above 55, WBC above 16,000, glucose above 200, LDH above 350, AST above 250'], ans:1, exp:'Ranson criteria admission: age above 55, WBC above 16k, glucose above 200, LDH above 350, AST above 250. At 48h: additional 5 criteria. Score above 3 = severe pancreatitis.' },
          { q:'Chronic pancreatitis causes:', opts:['Acute onset abdominal pain only','Malabsorption (steatorrhea) from exocrine insufficiency, diabetes from endocrine failure, chronic pain, and calcifications'], ans:1, exp:'Chronic pancreatitis: progressive fibrosis from repeated injury (alcohol #1, genetic, autoimmune). Exocrine failure causes fat malabsorption (steatorrhea). Endocrine failure causes DM. Pain management is key.' },
          { q:'Pancreatic enzyme replacement therapy (PERT) in chronic pancreatitis is taken:', opts:['Once daily on an empty stomach','With every meal and snack containing fat'], ans:1, exp:'PERT (pancrelipase): must be taken WITH meals (not before/after). Dose adjusted to achieve normal stool consistency. Monitor for adequate response (weight gain, reduced steatorrhea).' },
          { q:'Primary biliary cholangitis (PBC) is characterized by:', opts:['Caused by bile duct gallstones','Autoimmune destruction of intrahepatic bile ducts â€” associated with anti-mitochondrial antibodies (AMA)'], ans:1, exp:'PBC: autoimmune disease, predominantly women, associated with AMA (positive in 95%). Progressive cholestatic liver disease. Pruritus is often the first symptom. Treat: ursodeoxycholic acid.' },
          { q:'ERCP (endoscopic retrograde cholangiopancreatography) post-procedure monitoring includes:', opts:['Only pain assessment','Vital signs, amylase/lipase (post-ERCP pancreatitis), abdominal pain, fever (cholangitis), bleeding'], ans:1, exp:'Post-ERCP complications: pancreatitis (most common â€” 3-5%), cholangitis, perforation, bleeding. Monitor amylase 4-6 hours post-procedure. Report fever, severe abdominal pain, jaundice.' },
          { q:'Liver transplant rejection signs include:', opts:['Normal LFTs with fatigue only','Elevated LFTs, fever, jaundice, malaise â€” confirmed by biopsy'], ans:1, exp:'Liver transplant rejection (acute cellular rejection): elevated bilirubin, ALT/AST rise, fever, malaise, jaundice, right upper quadrant pain. Biopsy confirms. Treat with high-dose IV methylprednisolone.' },
          { q:'Spironolactone is preferred over furosemide as first-line in cirrhotic ascites because:', opts:['It works faster','It counteracts secondary hyperaldosteronism (major mechanism driving ascites formation in cirrhosis)'], ans:1, exp:'In cirrhotic ascites: secondary hyperaldosteronism drives sodium and water retention. Spironolactone (aldosterone antagonist) addresses the mechanism. Furosemide added for additional diuresis (ratio 100:40 mg).' },
          { q:'Pancreatic pseudocyst is a complication of:', opts:['Chronic constipation','Acute or chronic pancreatitis â€” a fluid-filled cavity enclosed by fibrous tissue, not a true epithelial cyst'], ans:1, exp:'Pancreatic pseudocyst: fluid collection after pancreatitis, enclosed in fibrous tissue. Most resolve spontaneously. Large/symptomatic: drainage (endoscopic cystgastrostomy). Monitor for infection, hemorrhage.' },
          { q:'INR is prolonged in liver failure because:', opts:['Kidneys fail to excrete clotting factors','The liver produces coagulation factors (II, VII, IX, X) â€” liver failure reduces their synthesis'], ans:1, exp:'Liver synthesizes: fibrinogen (I), II, V, VII, IX, X, XI, and protein C/S. Liver failure impairs coagulation factor production causing prolonged PT/INR. Vitamin K may partially correct if not true synthetic failure.' },
          { q:'Alpha-fetoprotein (AFP) is elevated in:', opts:['Viral hepatitis only','Hepatocellular carcinoma (HCC) â€” used for surveillance in cirrhotic patients'], ans:1, exp:'AFP: tumor marker for HCC. Used for HCC surveillance (AFP + liver ultrasound every 6 months in cirrhosis). Also elevated in yolk sac tumors and occasionally benign liver disease. Diagnosis: imaging + biopsy.' },
          { q:'Non-alcoholic fatty liver disease (NAFLD) management includes:', opts:['Specific medication targeting NAFLD only','Weight loss (7-10%), exercise, diabetes and lipid control â€” no approved pharmacotherapy'], ans:1, exp:'NAFLD/NASH: weight loss 7-10% improves histology. Address metabolic risk factors (obesity, diabetes, dyslipidemia). Lifestyle modification is the only proven treatment. Vitamin E in non-diabetic NASH.' },
          { q:'Grey-Turner sign in pancreatitis appears at:', opts:['Epigastric area','Flanks (retroperitoneal hemorrhage tracking to flanks)'], ans:1, exp:"Grey-Turner sign: flank ecchymosis from retroperitoneal hemorrhage in severe pancreatitis. Cullen's sign: periumbilical ecchymosis. Both indicate severe hemorrhagic pancreatitis â€” poor prognosis." },
          { q:'Hepatic artery thrombosis post-liver transplant requires:', opts:['Observation for 48 hours','Urgent re-exploration or interventional radiology â€” most serious early vascular complication'], ans:1, exp:'Hepatic artery thrombosis: most serious early post-transplant vascular complication (occurs within 30 days). Causes graft failure and biliary necrosis. Urgent surgical re-exploration or thrombolysis. Retransplant often required.' }
            ]
          },
          {
            name: 'GI System IV',
            questions: [
          { q:'Ulcerative colitis (UC) distinguishing features include:', opts:['Skip lesions, transmural inflammation, rectal sparing','Continuous mucosal inflammation always starting from rectum, blood and mucus in stool'], ans:1, exp:'UC: continuous inflammation from rectum extending proximally (never skips). Mucosal only (not transmural). Bloody diarrhea, urgency, tenesmus. Complication: toxic megacolon.' },
          { q:'Toxic megacolon is a complication of:', opts:['Appendicitis','Severe ulcerative colitis or Crohn colitis â€” colonic dilation above 6 cm with systemic toxicity'], ans:1, exp:'Toxic megacolon: fulminant colitis causing colonic dilation above 6 cm, systemic toxicity (fever, tachycardia, leukocytosis, peritoneal signs). High mortality. Treatment: aggressive medical (bowel rest, IV steroids, antibiotics) or urgent colectomy.' },
          { q:'5-aminosalicylate (5-ASA) medications (mesalamine) are first-line for:', opts:['Crohn disease only','Mild-to-moderate ulcerative colitis â€” maintenance of remission and induction'], ans:1, exp:'5-ASA (mesalamine, sulfasalazine): anti-inflammatory at colonic mucosa. First-line for mild-moderate UC. Available as oral, enema, suppository. Less effective in Crohn disease.' },
          { q:'Biologics (anti-TNF agents like infliximab) in IBD nursing considerations include:', opts:['No special precautions needed','TB screening (TST or IGRA) before initiation, monitor for infections, withhold for serious infection or fever'], ans:1, exp:'Anti-TNF biologics (infliximab, adalimumab): screen for latent TB (IGRA/TST + CXR), hepatitis B, fungal infections. Risk of serious opportunistic infections. Withhold if serious infection develops. Live vaccines contraindicated.' },
          { q:'Bowel obstruction: small bowel vs large bowel characteristics:', opts:['Both present identically','Small bowel: central crampy pain, vomiting early, high-pitched tinkling bowel sounds. Large bowel: distension predominates, vomiting late'], ans:1, exp:'Small bowel obstruction (adhesions #1): periumbilical pain, early vomiting, hyperactive/high-pitched bowel sounds, central distension. Large bowel obstruction (cancer #1): marked distension, late vomiting, peripheral distribution.' },
          { q:'Diverticulitis differs from diverticulosis in that:', opts:['Both are the same condition','Diverticulosis: asymptomatic colonic outpouchings. Diverticulitis: inflamed/infected diverticula causing LLQ pain, fever, leukocytosis'], ans:1, exp:'Diverticulosis: outpouchings (usually sigmoid colon) â€” asymptomatic. Diverticulitis: inflammation/infection â€” LLQ pain, fever, leukocytosis, nausea. CT confirms. Uncomplicated: antibiotics and bowel rest. Complicated: perforation, abscess â€” surgery.' },
          { q:'Appendicitis classic presentation includes:', opts:['LLQ pain and diarrhea without fever','Periumbilical pain migrating to RLQ (McBurney point), nausea, vomiting, fever, rebound tenderness'], ans:1, exp:'Appendicitis: begins as periumbilical/diffuse pain, migrates to RLQ within 24 hours. Anorexia, nausea, fever (low-grade). Rebound tenderness at McBurney point. WBC elevated. CT is most accurate.' },
          { q:'Irritable bowel syndrome (IBS) is characterized by:', opts:['Bloody diarrhea with mucosal inflammation on colonoscopy','Chronic abdominal pain with altered bowel habits (diarrhea, constipation, or mixed) without structural abnormality (Rome IV criteria)'], ans:1, exp:'IBS: functional GI disorder, no mucosal inflammation. Rome IV criteria: recurrent abdominal pain at least 1 day/week for 3 months, related to defecation, onset + change in stool form/frequency. Stress and diet trigger.' },
          { q:'Colorectal cancer screening starts at what age for average-risk individuals?', opts:['Age 30','Age 45 (updated from 50 by USPSTF in 2021)'], ans:1, exp:'ACS and USPSTF now recommend colorectal cancer screening beginning at age 45 for average-risk individuals. Options: colonoscopy every 10 years, annual FIT (fecal immunochemical test), flexible sigmoidoscopy.' },
          { q:'Rectal prolapse nursing care includes:', opts:['Manual reduction only by the patient at home','Applying moist saline gauze to protect mucosa, gentle manual reduction with steady pressure, notify provider'], ans:1, exp:'Rectal prolapse: apply wet saline gauze to protect exposed mucosa, keep moist, gentle manual reduction with constant steady pressure (not rapid force), elevate hips if possible, notify provider urgently.' },
          { q:'Colostomy irrigation is done to:', opts:['Treat an active infection','Regulate colostomy output and reduce use of pouch in some sigmoid colostomy patients'], ans:1, exp:'Colostomy irrigation: instilling water to stimulate defecation. Only suitable for sigmoid/descending colostomies with firm predictable output. Patient may be pouch-free between irrigations once regulated.' },
          { q:'Clostridium difficile (C. diff) infection prevention requires:', opts:['Standard precautions with gloves only','Contact precautions, soap and water handwashing (not alcohol gel â€” spores resistant to alcohol), dedicated equipment'], ans:1, exp:'C. diff: contact precautions, private room if possible. Alcohol hand gel DOES NOT kill C. diff spores â€” soap and water required. Bleach disinfection of environment. Precipitants: recent antibiotics, PPIs.' },
          { q:'Crohn disease extra-intestinal manifestations include:', opts:['None â€” Crohn is confined to GI tract','Uveitis, episcleritis, erythema nodosum, pyoderma gangrenosum, ankylosing spondylitis, primary sclerosing cholangitis, aphthous ulcers'], ans:1, exp:'Crohn extra-intestinal manifestations: joints (arthritis, ankylosing spondylitis), eyes (uveitis, episcleritis), skin (EN, PG), liver (PSC â€” more common in UC). May precede or parallel bowel activity.' },
          { q:'Hemorrhoids: internal vs external:', opts:['Both cause identical pain and bleeding','Internal: above dentate line, painless bleeding. External: below dentate line, painful, can thrombose'], ans:1, exp:'Internal hemorrhoids: above dentate line (no somatic innervation) â€” painless bright red rectal bleeding. External hemorrhoids: below dentate line (rich innervation) â€” painful, especially if thrombosed.' },
          { q:'Bowel preparation for colonoscopy typically involves:', opts:['48-hour fast only','Low-residue diet then polyethylene glycol (PEG) solution or sodium phosphate â€” clears colon for visualization'], ans:1, exp:'Colonoscopy prep: split-dose PEG solution (4L or 2L + adjuncts), bisacodyl, or sodium picosulfate. Low-residue diet 1-2 days before. Clear liquids day before. NPO 4-6 hours before procedure.' },
          { q:'After colonoscopy, patients should be informed:', opts:['Resume all activity and diet immediately including driving','Expect bloating and gas from air insufflation, minor bleeding if polyp removed, avoid driving 24 hours if sedated, return if severe pain or heavy bleeding'], ans:1, exp:'Post-colonoscopy: bloating and cramping normal (air insufflation). Minor spotting after polypectomy normal. Report: severe abdominal pain (perforation), heavy rectal bleeding, fever. No driving 24 hours if sedated.' },
          { q:'Antidiarrheal agents (loperamide â€” Imodium) are CONTRAINDICATED in:', opts:['All cases of diarrhea','Bloody diarrhea, suspected infectious colitis (C. diff, E. coli O157:H7), or inflammatory bowel disease flare'], ans:1, exp:'Loperamide: slows intestinal motility. Contraindicated in bloody/inflammatory diarrhea â€” retains toxins and bacteria, can cause toxic megacolon. Use only in non-infectious functional diarrhea.' },
          { q:'Celiac disease diagnostic testing includes:', opts:['Colonoscopy alone','Serology (anti-tTG IgA antibody + total IgA) followed by small bowel biopsy (gold standard)'], ans:1, exp:'Celiac diagnosis: anti-tissue transglutaminase IgA (most sensitive and specific). Check total IgA (IgA deficiency causes false negative). Duodenal biopsy on gluten-containing diet: villous atrophy confirms.' },
          { q:'Lactose intolerance management includes:', opts:['Complete avoidance of all dairy products','Reducing lactose-containing foods, using lactase enzyme supplements, or consuming fermented dairy (yogurt, hard cheese)'], ans:1, exp:'Lactose intolerance: reduced lactase enzyme. Manage: reduce lactose intake, use lactase drops/tablets with dairy, choose hard cheese and yogurt (less lactose), lactose-free dairy products. Not the same as milk allergy.' },
          { q:'Acute mesenteric ischemia presentation is:', opts:['Gradual onset crampy pain that improves with eating','Sudden severe abdominal pain out of proportion to physical findings â€” vascular emergency'], ans:1, exp:'Acute mesenteric ischemia: sudden severe pain out of proportion to exam (early), then peritonitis as bowel infarcts. AF embolism is most common cause. Urgent CT angiography. High mortality.' },
          { q:'Laxative types: osmotic vs stimulant:', opts:['Both work identically','Osmotic (lactulose, PEG): draw water into colon. Stimulant (bisacodyl, senna): stimulate peristalsis by irritating colon wall'], ans:1, exp:'Osmotic laxatives (PEG, lactulose, MgOH): increase luminal water. Stimulant laxatives (bisacodyl, senna, castor oil): stimulate colon motility directly. Bulk-forming (psyllium): increase stool bulk.' },
          { q:'Volvulus (sigmoid most common) management:', opts:['Conservative management always','Urgent endoscopic decompression (sigmoidoscope/rectal tube) or surgery if compromised bowel'], ans:1, exp:'Sigmoid volvulus: sigmoid colon twists on its mesentery causing obstruction. Decompression with sigmoidoscope if no peritonitis. Surgery (sigmoid resection) for recurrence or gangrenous bowel.' },
          { q:'Anorectal fistula (fistula-in-ano) nursing care includes:', opts:['No special care required after surgery','Sitz baths, wound care, dressing changes â€” patient education on drainage, hygiene, and follow-up'], ans:1, exp:'Fistula-in-ano: abnormal tract between anal canal and perianal skin (often from abscess). Surgical treatment (fistulotomy or seton placement). Post-op: sitz baths, wound care, dressing changes, avoid constipation.' }
            ]
          },
          {
            name: 'GI System V',
            questions: [
          { q:'Abdominal assessment sequence is:', opts:['Inspect, palpate, percuss, auscultate','Inspect, auscultate, percuss, palpate'], ans:1, exp:'Auscultation BEFORE palpation/percussion in abdominal assessment to prevent alteration of bowel sounds. Inspect for distension, scars, peristalsis, then auscultate, percuss, palpate.' },
          { q:'Serum albumin as a nutritional marker reflects:', opts:['Caloric intake over the past 24 hours','Nutritional status over 2-3 weeks (half-life 20 days) â€” marker of chronic malnutrition'], ans:1, exp:'Albumin: half-life 20 days â€” reflects chronic (weeks to months) nutritional status. Normal: 3.5-5 g/dL. Below 3.5: hypoalbuminemia (malnutrition, liver failure, protein-losing states). Prealbumin: half-life 2-3 days â€” more acute.' },
          { q:'Prealbumin (transthyretin) is preferred over albumin for monitoring nutritional response because:', opts:['It is a better marker of chronic malnutrition','It has a shorter half-life (2-3 days) reflecting recent changes in nutritional intake'], ans:1, exp:'Prealbumin (half-life 2-3 days): rapidly changes with nutrition support â€” better for monitoring response to treatment. Albumin (half-life 20 days): too slow for short-term monitoring.' },
          { q:'Nasogastric feeding residual volume check â€” hold feed if residual exceeds:', opts:['25 mL','Institutional protocol (commonly 200-500 mL) â€” if elevated, hold and reassess in 1-2 hours'], ans:1, exp:'High gastric residual volumes (above 200-500 mL per protocol) indicate delayed gastric emptying â€” risk of aspiration. Hold feeding, reposition, assess for ileus, consider prokinetic agent (metoclopramide).' },
          { q:'Ondansetron (Zofran) mechanism of action is:', opts:['Dopamine D2 receptor antagonist','Serotonin (5-HT3) receptor antagonist â€” blocks receptors in gut and CTZ'], ans:1, exp:'Ondansetron: 5-HT3 antagonist. Blocks serotonin receptors in the GI tract and chemoreceptor trigger zone (CTZ). Effective for chemotherapy-induced, post-operative, and radiation-induced nausea/vomiting.' },
          { q:'Metoclopramide (Reglan) side effect of concern is:', opts:['Hypertension and tachycardia','Extrapyramidal symptoms (EPS) â€” tardive dyskinesia with long-term use'], ans:1, exp:'Metoclopramide: dopamine D2 antagonist and 5-HT4 agonist. EPS risk (acute dystonia, parkinsonism, akathisia, tardive dyskinesia with long-term use). Contraindicated in Parkinson disease and bowel obstruction.' },
          { q:'Loperamide (Imodium) mechanism:', opts:['Stimulates intestinal secretion','Acts on opioid receptors in the intestine (does not cross BBB) â€” slows motility and reduces secretion'], ans:1, exp:'Loperamide: peripheral opioid receptor agonist in intestinal wall. Slows peristalsis, reduces intestinal secretion and increases sphincter tone. Does not enter CNS. No analgesic effect.' },
          { q:'Lactulose dose in hepatic encephalopathy is titrated to:', opts:['Blood ammonia level normalization only','2-3 soft stools per day â€” sign of adequate bowel acidification and ammonia trapping'], ans:1, exp:'Lactulose target: 2-3 soft stools per day. Excessive lactulose causes diarrhea and dehydration (worsen HE from prerenal azotemia). Monitor mental status improvement and stool consistency.' },
          { q:'Rifaximin in hepatic encephalopathy works by:', opts:['Directly binding ammonia in blood','Non-absorbable antibiotic reducing ammonia-producing gut bacteria without systemic absorption'], ans:1, exp:'Rifaximin: non-absorbable rifamycin antibiotic. Reduces gut bacterial ammonia production. Added to lactulose in recurrent HE. Minimal systemic absorption (below 1%) â€” safe in liver disease.' },
          { q:'Mesalamine suppositories are used for:', opts:['Right-sided (proximal) colon disease','Rectal and distal sigmoid UC â€” delivers medication directly to inflamed mucosa'], ans:1, exp:'Mesalamine suppositories: reach only rectum/distal sigmoid. Enemas reach splenic flexure. Oral mesalamine for more proximal disease. Match formulation to disease extent for optimal topical effect.' },
          { q:'Azathioprine in IBD requires monitoring of:', opts:['INR and PT only','CBC (myelosuppression â€” agranulocytosis), LFTs, TPMT enzyme activity before initiation'], ans:1, exp:'Azathioprine: thiopurine immunosuppressant. Monitor CBC (leukopenia, thrombocytopenia), LFTs (hepatotoxicity). Check TPMT (thiopurine methyltransferase) before starting â€” low activity increases toxicity risk.' },
          { q:'TPN complications related to the catheter include:', opts:['Only metabolic imbalances','CLABSI, pneumothorax during insertion, air embolism, thrombosis'], ans:1, exp:'TPN catheter complications: CLABSI (most dangerous â€” strict aseptic technique, dedicated TPN line), pneumothorax during central line insertion, venous thrombosis, air embolism. Metabolic: hyperglycemia, electrolyte imbalances.' },
          { q:'Refeeding syndrome risk is highest in:', opts:['Mildly malnourished patients starting oral diet','Severely malnourished patients (anorexia nervosa, prolonged fasting) starting nutrition â€” precipitous falls in phosphate, potassium, magnesium'], ans:1, exp:'Refeeding syndrome: severe malnutrition + rapid nutrition initiation causes intracellular shift of phosphate, K+, Mg2+. Hypophosphatemia (most significant) causes cardiac arrhythmias, respiratory failure, rhabdomyolysis. Start nutrition slowly, correct electrolytes before starting.' },
          { q:'Fecal immunochemical test (FIT) for colorectal cancer screening:', opts:['Detects blood from any GI source','Detects human hemoglobin specifically from lower GI tract â€” done annually'], ans:1, exp:'FIT: human-specific antibody for hemoglobin. More specific than guaiac FOBT (no dietary restrictions). Done annually. Positive FIT requires diagnostic colonoscopy. Sensitivity 79%, specificity 94%.' },
          { q:'Post-endoscopy (EGD) nursing care includes:', opts:['Immediate oral fluids and full diet','NPO until gag reflex returns, monitor for sore throat/complications, semi-recumbent position, observe for bleeding or perforation signs'], ans:1, exp:'Post-EGD: keep NPO until gag reflex fully returns (45-60 min after local anesthetic) to prevent aspiration. Monitor for perforation (severe chest pain, fever), bleeding. Outpatient: escort needed if sedated.' },
          { q:'Stool characteristics: steatorrhea (fatty stools) indicates:', opts:['Lower GI bleeding','Malabsorption (pancreatic exocrine insufficiency, celiac disease, Crohn disease)'], ans:1, exp:'Steatorrhea: large, pale, greasy, malodorous stools that float and are difficult to flush. Indicates fat malabsorption. Causes: pancreatic exocrine insufficiency, celiac disease, short bowel syndrome, Crohn disease.' },
          { q:'Colonoscopy bowel preparation quality affects:', opts:['Patient comfort only','Adenoma detection rate â€” poor prep misses up to 50% of polyps'], ans:1, exp:'Inadequate bowel prep is the most common reason for failed colonoscopy (polyps missed, procedure aborted). Document prep quality (Boston Bowel Preparation Scale). Poor prep: early repeat colonoscopy.' },
          { q:'Sulfasalazine (5-ASA + sulfapyridine) side effects include:', opts:['No significant side effects','Nausea, headache, oligospermia (reversible), folate deficiency â€” supplement folic acid'], ans:1, exp:'Sulfasalazine: sulfa component causes most side effects (nausea, headache, reversible male infertility). Supplement folic acid (sulfa inhibits folate absorption). Check G6PD in susceptible populations.' },
          { q:'Gastrostomy tube (PEG) site infection management includes:', opts:['Removing the tube immediately','Cleaning with soap and water, topical antibiotics for minor infection, IV antibiotics for cellulitis, notify provider'], ans:1, exp:'PEG site infection: clean with soap and water daily, apply topical antibiotics (mupirocin) for mild infection. Cellulitis: oral/IV antibiotics. Embedded bumper or significant infection may require tube removal.' },
          { q:'Paralytic ileus differs from mechanical obstruction in that:', opts:['Both require surgery','Paralytic ileus: bowel is open but not moving (absent bowel sounds). Mechanical: physical blockage (high-pitched then absent sounds)'], ans:1, exp:'Paralytic ileus: absent or diminished bowel sounds, generalized distension, no physical blockage. Causes: post-op, electrolyte imbalance, peritonitis, drugs. Treatment: correct cause, NPO, ambulation, NG suction if needed.' },
          { q:'Nutritional assessment tool validated for ICU patients includes:', opts:['BMI only','NUTRIC score (Nutrition Risk in Critically Ill) â€” higher score indicates benefit from early aggressive nutrition support'], ans:1, exp:'NUTRIC score: validated nutritional risk tool for ICU patients. Factors: age, APACHE II, SOFA score, comorbidities, ICU LOS before EN. Score 6+ (without IL-6) = high nutrition risk â€” start EN within 24-48 hours.' },
          { q:'Enema administration technique includes:', opts:['Patient supine, 150 cm above mattress, slow infusion','Patient left lateral (Sims) position, tube lubricated, enema bag 30-45 cm above mattress, slow instillation, hold for prescribed time'], ans:1, exp:'Enema: left lateral Sims position (facilitates flow into sigmoid colon), lubricate rectal tube 7-10 cm, bag 30-45 cm above mattress, instill slowly (avoid cramping), instruct patient to hold 5-15 min.' }
            ]
          }
        ]
      },      {
        name: 'Musculo Skeletal', icon: 'fa-bone', color: '#10b981',
        sections: [
          {
            name: 'Musculo Skeletal I',
            questions: [
          { q:"Compartment syndrome's most URGENT assessment finding is:", opts:['Pressure (tightness)','Pulselessness (absent distal pulses)','Paresthesia (numbness)','Pain out of proportion to injury'], ans:1, exp:'All 6 Ps are serious, but pulselessness indicates critical ischemia requiring emergency fasciotomy.' },
          { q:'Fat embolism syndrome typically appears within ___ of a long bone fracture:', opts:['1-2 hours','24-72 hours','1-2 weeks','Only during surgery'], ans:1, exp:'Fat embolism: fat globules enter circulation. Classic triad: hypoxemia, neurological changes, petechial rash â€” onset 24-72 hours post-fracture.' },
          { q:'The correct order of fracture healing stages is:', opts:['Remodeling, hematoma, callus','Hematoma, fibrocartilaginous callus, bony callus, remodeling','Callus, hematoma, remodeling, repair','Remodeling, ossification, hematoma'], ans:1, exp:'Fracture healing: (1) Hematoma (days 1-5), (2) Fibrocartilaginous callus (2-3 weeks), (3) Bony callus (3-4 months), (4) Remodeling.' },
          { q:'A patient with a new cast complains of increasing pain and tingling. Priority action:', opts:['Elevate higher and give analgesics','Report to physician immediately â€” assess for compartment syndrome','Apply cold pack over the cast','Reassure the patient this is normal swelling'], ans:1, exp:'Increasing pain, tightness, and tingling under a cast = compartment syndrome until proven otherwise. Cast must be split/removed immediately.' },
          { q:'After total hip arthroplasty (THA), which position must be AVOIDED?', opts:['Hip abduction','Hip flexion greater than 90 degrees or internal rotation beyond midline','Hip extension in supine position','Abduction with a pillow'], ans:1, exp:'THA dislocation precautions: no hip flexion above 90 degrees, no adduction past midline, no internal rotation. Use abductor pillow.' },
          { q:'Rheumatoid arthritis (RA) differs from osteoarthritis (OA) in that RA:', opts:['Affects only large joints asymmetrically','Is bilateral, systemic, with morning stiffness above 1 hour and positive RF/anti-CCP','Is a purely degenerative disease without inflammation','Exclusively affects the elderly'], ans:1, exp:'RA: systemic autoimmune, bilateral symmetric, morning stiffness above 1 hour, extra-articular features. OA: degenerative, asymmetric, stiffness below 30 min, worse at end of day.' },
          { q:'Gout results from deposition of which crystals in joints?', opts:['Calcium pyrophosphate','Monosodium urate (uric acid)','Calcium oxalate','Hydroxyapatite'], ans:1, exp:'Gout = monosodium urate crystal deposition (podagra = first MTP joint). Triggered by hyperuricemia, alcohol, purines. Tx: colchicine, NSAIDs, allopurinol.' },
          { q:'A DEXA scan is used to:', opts:['Detect fractures in emergency','Measure bone mineral density to diagnose osteoporosis','Assess joint space in arthritis','Identify bone tumors'], ans:1, exp:'DEXA measures BMD. T-score: -1 to -2.5 = osteopenia; -2.5 or below = osteoporosis.' },
          { q:"Buck's traction is classified as:", opts:['Skeletal traction (pin through bone)','Skin traction applied to soft tissue','Internal fixation','External fixation'], ans:1, exp:"Buck's traction = skin traction using foam boots â€” used short-term pre-op for hip fractures to reduce muscle spasm. Max weight 3-5 kg." },
          { q:'When going UP stairs with an injured left leg and crutches:', opts:['"Lead with the injured (left) leg"','"Lead with the uninjured (right) leg â€” up with the good"','"Both legs simultaneously"','"Never use stairs with crutches"'], ans:1, exp:'Mnemonic: Up with the good, down with the bad. Going UP: uninjured leg first. Going DOWN: injured leg + crutches first.' },
          { q:'Post-amputation stump positioning in the first 24-48 hours should be:', opts:['Kept in dependent position to reduce venous pooling','Elevated for first 24-48 hours, then positioned for hip extension to prevent contracture','Covered with warm compress','Immediately placed in prosthetic socket'], ans:1, exp:'Post-amputation: elevate stump 24-48 hours (edema reduction), then avoid prolonged elevation to prevent flexion contracture.' },
          { q:'A CPM (continuous passive motion) machine after total knee arthroplasty is used to:', opts:['Strengthen the quadriceps','Prevent DVT by maintaining passive joint movement and preventing stiffness','Apply traction to the joint','Immobilize the knee post-surgery'], ans:1, exp:'CPM promotes cartilage healing, prevents adhesions, reduces stiffness, and maintains joint mobility after TKA.' },
          { q:'Rhabdomyolysis is characterized by:', opts:['Elevated serum calcium and albuminuria','Myoglobinuria, markedly elevated CK, and risk of acute kidney injury','Hypoglycemia and muscle cramps only','Decreased CK and normal urine'], ans:1, exp:'Rhabdomyolysis: muscle breakdown causes myoglobin release, renal tubular damage, and AKI risk. Treat with aggressive IV fluids.' },
          { q:'SLE (systemic lupus erythematosus) is best diagnosed by:', opts:['Positive ASO titer and joint X-ray','Positive ANA with butterfly malar rash and multi-organ involvement','Positive rheumatoid factor alone','Elevated uric acid levels'], ans:1, exp:'SLE: ANA-positive (95% sensitive), anti-dsDNA/anti-Smith (specific), butterfly rash, photosensitivity, renal and CNS involvement.' },
          { q:'Carpal tunnel syndrome is characterized by:', opts:['Elbow pain worsening with grip','Wrist pain, numbness, and tingling in median nerve distribution (thumb to ring finger)','Shoulder pain on abduction','Diffuse hand weakness without sensory symptoms'], ans:1, exp:"Carpal tunnel = median nerve compression at wrist. Positive Tinel's (wrist tap causes tingling) and Phalen's signs (wrist flexion 60 sec causes symptoms)." },
          { q:"Volkmann's ischemic contracture results from:", opts:['Prolonged traction force','Untreated compartment syndrome of the forearm causing muscle fibrosis and contracture','Vitamin D deficiency','Nerve root compression'], ans:1, exp:"Volkmann's contracture: sequela of untreated forearm compartment syndrome. Ischemia leads to fibrotic contracture (flexed wrist, extended fingers)." },
          { q:'A patient with a hip fracture typically presents with:', opts:['Hip flexion with internal rotation','Shortened extremity with external rotation and groin/hip pain','Hip abduction with pain only on weight-bearing','Intact ROM with localized tenderness'], ans:1, exp:'Intertrochanteric/femoral neck fracture: shortened extremity, external rotation, groin/hip pain.' },
          { q:'External fixator pin site care involves:', opts:['Leaving pins dry and uncovered','Cleaning each pin site with saline or prescribed solution, observing for infection','Applying thick antibiotic ointment daily','Avoiding any care to prevent contamination'], ans:1, exp:'External fixator pin sites require regular cleaning to prevent osteomyelitis (pin tract infection). Monitor for redness, warmth, purulent discharge.' },
          { q:'Ankylosing spondylitis is strongly associated with which HLA marker?', opts:['HLA-DR4','HLA-B27','HLA-DQ2','HLA-B51'], ans:1, exp:'Ankylosing spondylitis: seronegative spondyloarthropathy, strongly linked to HLA-B27. Affects sacroiliac joints leading to progressive bamboo spine fusion.' },
          { q:'The RICE protocol for acute soft tissue injury stands for:', opts:['Rest, Ice, Compression, Elevation','Rotate, Immobilize, Cool, Exercise','Rest, Immobilize, Compress, Elevate','Reduce, Ice, Cast, Evaluate'], ans:0, exp:'RICE: Rest, Ice (20 min on/off), Compression (reduces swelling), Elevation (above heart level).' },
          { q:'Osteomyelitis is most commonly caused by:', opts:['Streptococcus pneumoniae','Staphylococcus aureus (including MRSA)','Pseudomonas aeruginosa','E. coli'], ans:1, exp:'S. aureus is the most common cause of osteomyelitis in all age groups. Treatment: prolonged IV antibiotics (4-6 weeks) plus or minus surgical debridement.' },
          { q:'The Adams forward bend test screens for:', opts:['Lordosis','Scoliosis (lateral spinal curvature)','Kyphosis','Disc herniation'], ans:1, exp:'Adams test: patient bends forward â€” a rib hump (lateral spinal asymmetry) is visible in scoliosis (lateral curvature above 10 degrees on Cobb angle).' },
          { q:'Bone density maintenance requires which combination?', opts:['Vitamin C and phosphorus','Calcium and Vitamin D with weight-bearing exercise','Vitamin B12 and iron','Magnesium alone'], ans:1, exp:'Calcium (1200 mg/day post-menopause) + Vitamin D (800-1000 IU/day) + weight-bearing exercise prevent osteoporosis.' },
          { q:'A patient cast has a foul smell and the patient has fever. This most likely indicates:', opts:['Normal cast odor from sweat','Infection developing beneath the cast','Cast is wet from bathing','Skin irritation from cast material'], ans:1, exp:'Foul smell + fever with a cast = infection/wound breakdown underneath. The cast must be removed or windowed for inspection.' },
          { q:'Which lab value is most markedly elevated in acute rhabdomyolysis?', opts:['Serum calcium','Creatine kinase (CK) â€” often above 10,000 U/L','Serum albumin','Platelet count'], ans:1, exp:'CK is massively elevated in rhabdomyolysis (often above 10,000 U/L vs normal below 200 U/L) â€” reflects extent of muscle breakdown.' }
            ]
          },
          {
            name: 'Musculo Skeletal II',
            questions: [
          { q:'Rheumatoid arthritis is characterized by:', opts:['Morning stiffness less than 30 minutes','Morning stiffness above 1 hour, bilateral symmetric joint involvement, systemic inflammation'], ans:1, exp:'RA: prolonged morning stiffness above 1 hour (distinguishes from OA stiffness below 30 min). Bilateral, symmetric, small joints (MCP, PIP). Extra-articular: rheumatoid nodules, sicca syndrome, vasculitis.' },
          { q:'Anti-CCP antibodies in rheumatoid arthritis are:', opts:['Non-specific â€” found in many conditions','Highly specific for RA (95%) and predict more erosive disease course'], ans:1, exp:'Anti-cyclic citrullinated peptide (anti-CCP): specificity 95-99% for RA. Present before clinical disease (years earlier). Predicts more severe, erosive disease. RF is sensitive (70%) but less specific.' },
          { q:'Methotrexate in RA requires:', opts:['No special monitoring','Weekly CBC and LFTs â€” folic acid supplementation to reduce side effects'], ans:1, exp:'Methotrexate: first-line DMARD for RA. Monitor CBC (myelosuppression) and LFTs (hepatotoxicity) every 4-8 weeks. Supplement folic acid 5 mg/week (reduces GI side effects and myelosuppression).' },
          { q:'Gout acute attack treatment includes:', opts:['Allopurinol started immediately during flare','Colchicine, NSAIDs, or corticosteroids â€” start urate-lowering therapy weeks after flare resolves'], ans:1, exp:'Gout acute flare: colchicine (first-line), NSAIDs (indomethacin), or corticosteroids. Do NOT start allopurinol during acute attack (can prolong flare). Start allopurinol 2-4 weeks after flare resolves.' },
          { q:'Allopurinol in chronic gout works by:', opts:['Dissolving uric acid crystals directly','Inhibiting xanthine oxidase enzyme â€” reduces uric acid production'], ans:1, exp:'Allopurinol: xanthine oxidase inhibitor reduces uric acid production. Target urate below 6 mg/dL (below 5 for tophaceous gout). Start low, titrate slowly. DRESS syndrome risk (HLA-B*5801 in Asian populations).' },
          { q:'Septic arthritis requires:', opts:['NSAIDs and rest only','Urgent joint aspiration for diagnosis, IV antibiotics, and surgical drainage if needed'], ans:1, exp:'Septic arthritis: urgent joint aspiration (diagnosis and therapeutic). Most common: S. aureus. IV antibiotics (vancomycin pending culture). Surgical washout if no improvement or deep infection. Delay causes cartilage destruction.' },
          { q:'Pseudogout is caused by deposition of:', opts:['Monosodium urate crystals','Calcium pyrophosphate dihydrate (CPPD) crystals'], ans:1, exp:'Pseudogout: CPPD crystal deposition in cartilage (chondrocalcinosis on X-ray). Affects larger joints (knee most common). Crystals under polarized microscopy: positively birefringent (blue when parallel to light â€” rhomboid shaped).' },
          { q:'SLE (lupus) butterfly rash characteristics:', opts:['Involves nasolabial folds','Malar rash spares the nasolabial folds â€” over cheeks and nose bridge'], ans:1, exp:'SLE malar (butterfly) rash: erythematous rash over cheeks and nose bridge, classically sparing nasolabial folds. Photosensitive. Present in 40-50% of SLE patients. Also: discoid rash, oral ulcers, photosensitivity.' },
          { q:'Anti-dsDNA antibody specificity in SLE:', opts:['Low specificity â€” found in many autoimmune diseases','High specificity (95-99%) for SLE and correlates with disease activity and nephritis'], ans:1, exp:'Anti-dsDNA: very specific for SLE (95-99%). Titers fluctuate with disease activity â€” rising levels may predict lupus nephritis flare. Anti-Sm (anti-Smith): most specific for SLE (70-80% specificity).' },
          { q:'CREST syndrome is a limited form of:', opts:['Rheumatoid arthritis','Systemic sclerosis (scleroderma)'], ans:1, exp:'CREST: Calcinosis, Raynaud phenomenon, Esophageal dysmotility, Sclerodactyly, Telangiectasia. Limited cutaneous systemic sclerosis â€” skin involvement distal to elbows/knees. Anti-centromere antibodies positive.' },
          { q:'Juvenile idiopathic arthritis (JIA) systemic form features:', opts:['Symmetric small joint involvement without fever','Quotidian (daily or twice-daily) spiking fever, salmon-pink rash, arthritis, serositis, lymphadenopathy'], ans:1, exp:'Systemic JIA (Still disease): quotidian fever spikes (39C+), evanescent salmon rash, arthritis, splenomegaly. Risk of macrophage activation syndrome (MAS) â€” life-threatening. Anti-IL-1 (anakinra) effective.' },
          { q:'Bursitis vs tendinitis distinction:', opts:['They are identical conditions','Bursitis: bursa inflammation (subacromial, olecranon, prepatellar). Tendinitis: tendon inflammation (patellar, Achilles, rotator cuff tendons)'], ans:1, exp:'Bursitis: inflamed bursa (fluid-filled sac). Subacromial: shoulder abduction pain (impingement). Olecranon: posterior elbow swelling. Tendinitis: tendon inflammation from overuse. Both: rest, ice, NSAIDs.' },
          { q:'Carpal tunnel syndrome clinical tests include:', opts:['Adams test and straight leg raise','Tinel sign (tapping over carpal tunnel) and Phalen test (wrist flexion 60 sec) â€” reproduce median nerve symptoms'], ans:1, exp:"Tinel's sign: tapping over carpal tunnel at wrist reproduces tingling/numbness in median nerve distribution. Phalen's test: wrist palmar flexion for 60 sec reproduces symptoms. Both 60-70% sensitive." },
          { q:'Total hip arthroplasty (THA) hip precautions include:', opts:['Keep hip in adduction and internal rotation','No hip flexion above 90 degrees, no crossing legs, no internal rotation (posterior approach)'], ans:1, exp:'THA posterior approach precautions: avoid hip flexion above 90 degrees (no sitting in low chairs), adduction past midline (no crossing legs), internal rotation. Use raised toilet seat, long-handled shoe horn.' },
          { q:'After total knee arthroplasty (TKA), priority rehabilitation includes:', opts:['Complete bed rest for 2 weeks','Early ambulation (day of or day after surgery), quadriceps exercises, CPM, DVT prophylaxis'], ans:1, exp:'TKA recovery: early ambulation (reduces DVT, pneumonia, deconditioning), quadriceps sets, straight leg raises, CPM (maintains ROM), anticoagulation (enoxaparin or rivaroxaban) for DVT prevention.' },
          { q:'Gout: dietary modifications to reduce uric acid include:', opts:['High purine diet (organ meats, shellfish, red meat)','Avoid high-purine foods (organ meats, shellfish, red meat), limit alcohol (especially beer), increase hydration'], ans:1, exp:'Gout prevention: reduce purines (organ meats, anchovies, shellfish, red meat), avoid beer and spirits (increase urate), adequate hydration, weight loss, avoid fructose-sweetened drinks.' },
          { q:'Reactive arthritis (formerly Reiter syndrome) follows:', opts:['Autoimmune trigger without preceding infection','Genitourinary (chlamydia) or gastrointestinal (Salmonella, Campylobacter, Shigella) infection'], ans:1, exp:'Reactive arthritis: triad of arthritis, urethritis, conjunctivitis (classic but incomplete in many). Follows STI (chlamydia) or GI infection. HLA-B27 associated. Asymmetric lower limb arthritis.' },
          { q:'Psoriatic arthritis is distinguished by:', opts:['Affecting only the spine','Nail pitting, onycholysis, psoriatic skin plaques, asymmetric or symmetric arthritis, dactylitis (sausage digit)'], ans:1, exp:'Psoriatic arthritis: associated with psoriasis (occurs in 30% of psoriatic patients). Nail changes (pitting, onycholysis), dactylitis, enthesitis, variable joint pattern. RF negative. Anti-TNF therapy effective.' },
          { q:'Osteoarthritis (OA) features include:', opts:['Systemic inflammation with elevated ESR and CRP','Asymmetric joint involvement, Heberden nodes (DIP), Bouchard nodes (PIP), decreased joint space on X-ray, morning stiffness below 30 min'], ans:1, exp:'OA: degenerative joint disease. Heberden nodes (DIP joints), Bouchard nodes (PIP joints). Pain worsens with activity, improves with rest. X-ray: joint space narrowing, osteophytes, subchondral sclerosis.' },
          { q:'Fibromyalgia management includes:', opts:['NSAID therapy and opioids as first-line','Low-impact aerobic exercise, CBT, sleep hygiene, and medications (duloxetine, pregabalin, milnacipran)'], ans:1, exp:'Fibromyalgia: central sensitization syndrome. First-line: exercise (strongest evidence), CBT, sleep improvement. Medications: SNRIs (duloxetine), pregabalin, tramadol. NSAIDs and opioids are ineffective.' },
          { q:'Rotator cuff tear nursing care includes:', opts:['Immediate full shoulder mobilization','Arm sling for comfort, ice, analgesics, avoidance of overhead activities, physical therapy referral'], ans:1, exp:'Rotator cuff tear (supraspinatus most common): sling for comfort (not rigid immobilization), ice, analgesics (NSAIDs), avoid overhead activities. PT for strengthening. Large tears: surgical repair.' },
          { q:'Joint aspiration of synovial fluid in gout shows under polarized microscopy:', opts:['Positively birefringent rhomboid crystals','Negatively birefringent needle-shaped monosodium urate crystals'], ans:1, exp:'Gout crystals: monosodium urate â€” needle-shaped, NEGATIVELY birefringent (yellow when parallel to light). CPPD (pseudogout): rhomboid, POSITIVELY birefringent (blue when parallel). Polarized microscopy is diagnostic.' },
          { q:'Hydroxychloroquine (Plaquenil) use in SLE and RA requires monitoring of:', opts:['Blood glucose and thyroid function','Ophthalmological exams (retinopathy risk â€” annual after 5 years of use)'], ans:1, exp:'Hydroxychloroquine: risk of retinal toxicity (bull-eye maculopathy) with cumulative dose above 5 mg/kg/day. Annual ophthalmology exam after 5 years of use. Otherwise well-tolerated; safe in pregnancy.' }
            ]
          },
          {
            name: 'Musculo Skeletal III',
            questions: [
          { q:'Compartment syndrome (6 P\'s) are:', opts:['Pain, Pallor, Paralysis, Paresthesia, Pulselessness, Perspiration','Pain, Pallor, Pulselessness, Paresthesia, Paralysis, Pressure (Poikilothermia)'], ans:1, exp:'6 P\'s of compartment syndrome: Pain (out of proportion), Pressure (tightness), Pallor, Pulselessness, Paresthesia, Paralysis. Pain with passive stretch of muscles in the compartment is the earliest and most sensitive sign.' },
          { q:'Fasciotomy in compartment syndrome must be performed within:', opts:['24-48 hours after diagnosis','6-8 hours of onset to prevent irreversible muscle and nerve damage'], ans:1, exp:'Compartment syndrome: fasciotomy must be performed within 6-8 hours to prevent irreversible ischemic damage. After 8 hours: permanent nerve and muscle damage (Volkmann contracture). Surgical emergency.' },
          { q:'DVT prophylaxis after orthopedic surgery includes:', opts:['Early ambulation only','Pharmacological anticoagulation (enoxaparin, rivaroxaban, or aspirin) plus mechanical compression (TED stockings or IPC)'], ans:1, exp:'Orthopedic surgery DVT prophylaxis: pharmacological (LMWH, DOAC, or aspirin â€” per joint replacement guidelines) + mechanical (IPC devices, TED stockings). Start within 12-24 hours post-op.' },
          { q:'Neurovascular assessment post-fracture or post-casting includes:', opts:['Vital signs only','5 P\'s (Pain, Pulse, Pallor, Paresthesia, Paralysis) â€” check at least every 2 hours initially'], ans:1, exp:'Neurovascular checks: assess distal pulse, capillary refill, sensation, movement, skin color and temperature every 1-2 hours post-casting or fracture. Early detection of compartment syndrome.' },
          { q:'Skin traction differences from skeletal traction:', opts:['Both use the same application technique','Skin traction: applied to skin via foam/tape (temporary, limited weight). Skeletal traction: Steinmann pin through bone (continuous, heavier weight)'], ans:1, exp:'Skin traction: maximum 3-5 kg, short-term (Buck\'s for hip fractures). Skeletal traction: pin through bone (Steinmann, Kirschner), heavier weight, longer duration, requires pin site care.' },
          { q:'Skeletal traction pin site care involves:', opts:['Daily cleaning with hydrogen peroxide only','Cleaning with saline or sterile water per protocol, observing for infection signs, avoiding ointments that mask infection'], ans:1, exp:'Pin site care: clean with saline or chlorhexidine (per institutional protocol), observe for redness, warmth, purulent discharge (osteomyelitis risk). Avoid petroleum gauze that can harbor bacteria.' },
          { q:'A patient in skeletal traction must be:', opts:['Turned to any position for comfort','Maintained in correct alignment with weights hanging freely and not resting on bed or floor'], ans:1, exp:'Skeletal traction: weights must hang freely at all times (not resting on floor or bed). Maintain body alignment. Patient can turn to unaffected side slightly with nurse assistance.' },
          { q:'Cast syndrome (superior mesenteric artery syndrome) occurs with:', opts:['Hip spica cast or body cast compressing the SMA (superior mesenteric artery) causing duodenal obstruction','Any extremity cast causing pain'], ans:0, exp:'Cast syndrome: body jacket or hip spica cast can compress SMA causing duodenal obstruction. Symptoms: nausea, vomiting, abdominal pain. Treatment: remove or open cast, NG decompression, repositioning.' },
          { q:'Crutch gait: swing-through gait is:', opts:['Safest for most patients with partial weight-bearing','Used by paraplegics â€” swing body through the crutches for maximum speed'], ans:1, exp:'Crutch gaits: 4-point (both legs, alternating â€” most stable), 3-point (non-weight-bearing â€” NWB leg swings through), 2-point (partial WB), swing-through (paraplegics â€” fastest). Match to weight-bearing status.' },
          { q:'Orthopedic post-operative wound infection signs include:', opts:['Mild warmth in first 24 hours only (normal)','Purulent drainage, increasing redness/warmth, fever above 38.5C 3+ days post-op, elevated WBC after day 3'], ans:1, exp:'Normal post-op: mild incisional warmth/redness 24-48 hours. Infection: increasing redness, warmth, swelling, purulent discharge, fever after day 3, tenderness, WBC elevation. Cultures before antibiotics.' },
          { q:'Stump shaping after below-knee amputation uses:', opts:['Elastic bandage in a figure-of-8 from distal to proximal','Cylindrical bandaging only from distal to proximal (not figure-of-8)'], ans:0, exp:'Stump wrapping: figure-of-8 pattern from distal (narrowest) to proximal to shape conical stump for prosthetic fit. Rewrap every 4-8 hours. Rewrap if falls off or feels loose.' },
          { q:'Phantom limb pain management includes:', opts:['No effective treatment available','Mirror therapy, gabapentin/pregabalin, amitriptyline, nerve blocks, TENS, and desensitization techniques'], ans:1, exp:'Phantom limb pain: real pain originating from brain reorganization. Mirror therapy (visual feedback), gabapentin, pregabalin, amitriptyline (TCAs), TENS, dorsal column stimulation. Complex and chronic.' },
          { q:'Open fracture Gustilo classification grade III is:', opts:['Clean wound less than 1 cm','Extensive soft tissue damage, vascular injury, contaminated â€” highest infection risk, worst prognosis'], ans:1, exp:'Gustilo classification: Grade I (less than 1 cm, clean), Grade II (1-10 cm, moderate soft tissue damage), Grade IIIA (extensive but adequate soft tissue), IIIB (periosteal stripping), IIIC (vascular injury requiring repair).' },
          { q:'Post-operative hip replacement positioning includes:', opts:['Legs crossed for comfort','Legs kept apart with abductor pillow, HOB at 60-90 degrees, no turning to operative side'], ans:1, exp:'THA post-op: abductor pillow between legs (prevents adduction and internal rotation), HOB maximum 60-90 degrees (prevents excessive flexion), no turning onto operative side (posterior approach increases dislocation risk).' },
          { q:'Pathological fracture occurs through:', opts:['Healthy bone from excessive force','Abnormal (weakened) bone from metastatic disease, osteoporosis, or Paget disease â€” with minimal force'], ans:1, exp:'Pathological fracture: fracture through diseased/weakened bone. Common sites: vertebrae, femur (proximal). Causes: bone metastases, multiple myeloma, osteoporosis, Paget disease, osteogenesis imperfecta.' },
          { q:'Paget disease of bone causes:', opts:['Diffuse bone demineralization','Disorganized bone remodeling â€” enlarged, deformed, weakened bones with elevated alkaline phosphatase'], ans:1, exp:'Paget disease: abnormal osteoclast then osteoblast activity causing mosaic pattern bone. Elevated ALP (bone isoform), enlarged calvaria, bowing of long bones, hearing loss (skull involvement). Treat: bisphosphonates.' },
          { q:'ORIF (open reduction internal fixation) post-operative nursing care:', opts:['No weight-bearing for 6 months always','Wound care, neurovascular checks, DVT prophylaxis, pain management, weight-bearing per surgeon instructions'], ans:1, exp:'ORIF post-op: neurovascular assessment (5 P\'s), wound care, pain management, DVT prophylaxis, nutritional support, weight-bearing as prescribed (depends on bone, fixation strength, patient status).' },
          { q:'External fixator patient education includes:', opts:['Avoid all movement of the fixated extremity','Pin site cleaning technique, signs of infection (redness, drainage), activity restrictions, follow-up schedule'], ans:1, exp:'External fixator education: daily pin site cleaning (saline or prescribed solution), monitor infection signs, activity restrictions (no weight-bearing through fixator unless prescribed), wound care, follow-up for pin care.' },
          { q:'Bone graft types: autograft vs allograft:', opts:['Both are identical in terms of rejection risk','Autograft (patient\'s own bone) â€” gold standard, no rejection. Allograft (donor bone) â€” rejection risk, disease transmission (minimal)'], ans:1, exp:'Autograft: patient\'s own bone (iliac crest most common donor site) â€” gold standard, no rejection, osteogenic. Allograft: donor bone â€” slower incorporation, small disease transmission risk, avoids donor site morbidity.' },
          { q:'Continuous passive motion (CPM) machine for TKA is programmed with:', opts:['Maximum extension and flexion from day 1','Gradual increase in range of motion per day, starting with tolerated range, increasing daily'], ans:1, exp:'CPM: start with comfortable range (usually 0-40 degrees), increase by 5-10 degrees daily as tolerated. Goals: 0-90 degrees flexion by discharge, 0-120 degrees by 3 months. Correlates with functional outcomes.' },
          { q:'Assessment finding requiring immediate action in a patient with an ORIF:', opts:['Mild post-operative pain at incision site','Pallor, pulselessness, and severe pain distal to the surgical site'], ans:1, exp:'Pallor, pulselessness, paresthesia, paralysis, and severe pain distal to ORIF = vascular compromise or compartment syndrome. URGENT neurosurgical consultation and immediate assessment. Time-critical emergency.' },
          { q:'Fat embolism syndrome triad is:', opts:['Fever, tachycardia, and hypertension','Hypoxemia, petechial rash, and neurological changes (confusion, restlessness)'], ans:1, exp:'Fat embolism syndrome: petechial rash (axillae, conjunctiva, chest â€” pathognomonic), hypoxemia (dyspnea, tachypnea), neurological changes (confusion, seizures). Onset 24-72 hours after long bone or pelvic fracture.' },
          { q:'Nursing responsibilities when applying a plaster cast include:', opts:['Covering wet cast immediately with plastic wrap','Keeping wet plaster cast uncovered (not plastic-wrapped) until set, elevating extremity, padding bony prominences'], ans:1, exp:'Plaster cast application: do NOT cover (needs air to set â€” exothermic reaction). Elevate elevated to reduce edema. Pad bony prominences (fibula head, malleoli) to prevent pressure sores. Cast fully sets in 24-72 hours.' }
            ]
          },
          {
            name: 'Musculo Skeletal IV',
            questions: [
          { q:'Lumbar disc herniation most commonly occurs at:', opts:['L1-L2','L4-L5 and L5-S1 â€” most mobile lumbar levels'], ans:1, exp:'Lumbar disc herniation: L4-L5 (L5 nerve root compression: foot drop, big toe weakness) and L5-S1 (S1 compression: plantar flexion weakness, absent Achilles reflex) are most common.' },
          { q:'Cauda equina syndrome is a surgical emergency because:', opts:['It causes immediate death','Progressive compression causes permanent bowel/bladder dysfunction and lower extremity weakness if not decompressed'], ans:1, exp:'Cauda equina syndrome: compression of cauda equina nerve roots below L1. Saddle anesthesia, bilateral leg weakness, urinary retention (overflow incontinence), loss of rectal tone. Surgical emergency â€” decompress within 48 hours.' },
          { q:'Lumbar laminectomy post-operative positioning:', opts:['Flat supine with legs extended for 24 hours','Log-roll technique for turning, avoid hip flexion above 90 degrees, HOB per surgeon orders (usually flat initially)'], ans:1, exp:'Post-laminectomy: log-roll with pillow between knees (prevents spinal torque), no acute spinal flexion, HOB elevation per surgeon (often flat for 24 hours for CSF leak prevention). Assess lower extremity neurological function.' },
          { q:'Scoliosis screening with Adams forward bend test detects:', opts:['Kyphosis','Lateral spinal curvature â€” asymmetric rib hump'], ans:1, exp:'Adams forward bend test: patient bends forward at waist â€” scoliosis visible as asymmetric rib hump or trunk asymmetry. Positive screen: refer for X-ray (Cobb angle measurement). Above 10 degrees = scoliosis.' },
          { q:'Cervical spine precautions after whiplash injury include:', opts:['Immediate return to full activity','Cervical collar (soft) for comfort, analgesics, early mobilization (after acute pain), physiotherapy'], ans:1, exp:'Whiplash (cervical sprain): soft collar for comfort in first 72 hours, analgesics (NSAIDs), early mobilization exercises (better outcomes than prolonged immobilization), physiotherapy for chronic symptoms.' },
          { q:'Straight leg raise (SLR) test is positive in:', opts:['Hip fracture','Lumbar disc herniation with nerve root compression (L4-S1 distribution)'], ans:1, exp:'SLR test: patient supine, examiner raises leg straight. Positive: leg pain/radiculopathy reproduced below knee at 30-70 degrees of elevation. Indicates L4-S1 nerve root compression (disc herniation or piriformis syndrome).' },
          { q:'Vertebral compression fracture from osteoporosis causes:', opts:['Lateral spinal deformity only','Acute back pain with height loss, kyphosis (dowager hump), decreased respiratory reserve'], ans:1, exp:'Osteoporotic vertebral compression fracture: sudden or gradual onset back pain (often mid-thoracic to upper lumbar), height loss (1-2 cm per fracture), progressive kyphosis, decreased lung expansion. X-ray/MRI confirms.' },
          { q:'Spinal stenosis symptoms are characteristically:', opts:['Worsened by lying down and improved by walking','Worsened by walking/standing (neurogenic claudication), relieved by sitting or bending forward (flexion)'], ans:1, exp:'Lumbar spinal stenosis: neurogenic claudication â€” bilateral leg pain, weakness, numbness worsened by walking, improved by sitting (lumbar flexion opens canal). Shopping cart sign: relief leaning forward. Distinct from vascular claudication.' },
          { q:'Ankylosing spondylitis nursing care priorities include:', opts:['Encouraging patient to remain in flexed position for comfort','Maintaining erect posture, extension exercises (not flexion), deep breathing exercises, avoid flexion activities'], ans:1, exp:'Ankylosing spondylitis: progressive spinal fusion tendency. Posture exercises (extension, not flexion), swimming, deep breathing (chest expansion maintenance). Sleep prone or on firm surface. Avoid flexion contractures.' },
          { q:'Kyphosis vs lordosis:', opts:['Both are lateral spinal curves','Kyphosis: exaggerated thoracic curvature (hunchback). Lordosis: exaggerated lumbar curvature (swayback)'], ans:1, exp:'Kyphosis: excessive thoracic convexity (forward curvature). Causes: osteoporosis, Scheuermann disease. Lordosis: excessive lumbar convexity (inward curve). Scoliosis: lateral curve. Assess with plumb line.' },
          { q:'Spondylolisthesis grading (Meyerding classification) Grade II means:', opts:['5-25% vertebral slip','26-50% vertebral slip'], ans:1, exp:'Spondylolisthesis: Grade I = 1-25% slip, Grade II = 26-50%, Grade III = 51-75%, Grade IV = 76-100%, Grade V (spondyloptosis) = complete displacement. Grade I-II usually managed conservatively.' },
          { q:'Post-spinal fusion surgery log-roll technique requires:', opts:['Patient rolls independently','Minimum 2-3 nurses moving patient as a single unit to prevent spinal twist'], ans:1, exp:'Log-roll: at least 2-3 nurses, move entire spine as one unit. One nurse stabilizes head/cervical spine, others at shoulder/hip level. Pillow between knees. Prevents rotation at fusion site.' },
          { q:'Back pain red flag symptoms requiring urgent evaluation include:', opts:['Typical mechanical back pain worsening with activity','Bowel/bladder dysfunction, saddle anesthesia, progressive weakness, fever, weight loss, night pain, age above 50 with new-onset pain'], ans:1, exp:'Back pain red flags (CAUTION): Cauda equina symptoms (bowel/bladder), Age above 50, Unexplained weight loss, Trauma, Immunosuppression, Osteoporosis, Night pain/rest pain, Steroids. Require imaging urgently.' },
          { q:'Heat therapy for back pain is indicated when:', opts:['Within the first 24-48 hours of acute injury','For chronic pain or muscle spasm (after acute inflammatory phase resolves)'], ans:1, exp:'Heat therapy: chronic pain or muscle spasm (vasodilation, relaxation). Avoid in acute injury (first 24-72 hours â€” increases inflammation). Cold therapy: acute injury, acute flare, post-procedure.' },
          { q:'Body mechanics principles for back injury prevention include:', opts:['Twisting while lifting a load','Keeping load close to body, bending knees (using legs not back), avoid twisting, maintain lumbar lordosis'], ans:1, exp:'Safe lifting: feet shoulder-width apart, bend at knees and hips (not waist), keep load close to body, maintain neutral spine (lordosis), avoid twisting (pivot feet instead), exhale on exertion.' },
          { q:'Cervical collar (hard collar) indications include:', opts:['Routine neck pain from tension','Acute cervical spine injury with instability or fracture until cleared by imaging'], ans:1, exp:'Hard cervical collar (Philadelphia, Miami J): acute cervical fracture, instability, post-operative cervical fusion. Soft collar: comfort only (whiplash, muscle spasm). Check skin integrity under collar every 4 hours.' },
          { q:'Spinal cord compression symptoms requiring emergency response include:', opts:['Mild back pain without other symptoms','Acute onset of bilateral leg weakness or paralysis, ascending sensory loss, bowel/bladder changes'], ans:1, exp:'Spinal cord compression (epidural metastasis, hematoma, abscess): rapidly progressive bilateral weakness, sensory level, urinary retention. MRI urgently. Dexamethasone, urgent surgery or radiation. Every hour of delay = lost function.' },
          { q:'Cervical disc herniation at C6-C7 causes:', opts:['Shoulder abduction weakness and biceps reflex loss (C5-C6)','Triceps weakness, triceps reflex loss, and paresthesia in middle finger (C7 nerve root)'], ans:1, exp:'C7 nerve root compression: triceps weakness (elbow extension), triceps reflex diminished, paresthesia in index and middle fingers. C5-C6 compression: biceps weakness/reflex, lateral arm/forearm paresthesia.' },
          { q:'Occupational therapy (OT) in spinal conditions focuses on:', opts:['Strengthening exercises only','Adaptive equipment for ADLs, energy conservation, ergonomic work modification, assistive devices'], ans:1, exp:'OT role: functional rehabilitation and adaptive strategies. Adaptive equipment (grabbers, sock aids, dressing aids), work ergonomics, home modifications, energy conservation. Goal: maximize independence in ADLs.' },
          { q:'Disc replacement surgery (artificial disc) vs spinal fusion:', opts:['Both have identical outcomes','Disc replacement preserves segmental motion and may reduce adjacent level degeneration vs fusion which eliminates motion at that segment'], ans:1, exp:'Artificial disc replacement (ADR): preserves segmental motion, maintains normal kinematics, potentially reduces adjacent level degeneration. Fusion: eliminates motion permanently. ADR preferred in younger patients with single level disease and no instability.' },
          { q:'Physical therapy for chronic low back pain primarily uses:', opts:['Bed rest and passive modalities only','Active exercise therapy â€” core stabilization, McKenzie exercises, aerobic conditioning â€” evidence-based'], ans:1, exp:'Chronic low back pain: active exercise therapy (core stabilization, McKenzie method) most effective. Passive modalities (heat, TENS, massage) for symptom relief only. Multidisciplinary pain programs for complex cases.' },
          { q:'Bone scan uses radioactive tracer to detect:', opts:['Bone density only (same as DEXA)','Areas of abnormal bone metabolism â€” metastases, stress fractures, osteomyelitis, Paget disease (hot spots)'], ans:1, exp:'Bone scan (technetium-99m): whole-body survey for areas of increased bone turnover. Hot spots: metastases, stress fractures, osteomyelitis, Paget disease. Cold spots: avascular necrosis, myeloma (osteolytic).' }
            ]
          },
          {
            name: 'Musculo Skeletal V',
            questions: [
          { q:'NSAIDs mechanism of action is:', opts:['Blocking opioid receptors peripherally','Inhibiting cyclooxygenase (COX-1 and COX-2) enzymes â€” reduces prostaglandin synthesis (anti-inflammatory, analgesic, antipyretic)'], ans:1, exp:'NSAIDs: non-selective COX inhibitors (ibuprofen, naproxen, indomethacin) inhibit both COX-1 (GI protection, platelets) and COX-2 (inflammation). GI and renal side effects. Reduce platelet aggregation.' },
          { q:'COX-2 selective inhibitors (celecoxib) advantage over traditional NSAIDs:', opts:['Greater anti-inflammatory effect','Reduced GI side effects (spares COX-1 â€” gastric mucosal protection)'], ans:1, exp:'Celecoxib selectively inhibits COX-2 (inflammation/pain) while sparing COX-1 (gastric mucosa, platelet function). Fewer GI ulcers and bleeding. Cardiovascular risk same or slightly higher than non-selective NSAIDs. Caution in CV disease.' },
          { q:'Acetaminophen (paracetamol) maximum daily dose in adults is:', opts:['8 g/day','4 g/day (2 g/day in elderly, liver disease, alcohol use)'], ans:1, exp:'Acetaminophen: maximum 4 g/day in healthy adults. Hepatotoxicity occurs with overdose (NAC antidote). Reduce to 2 g/day in elderly, liver disease, alcohol abuse, malnutrition. Lacks anti-inflammatory effect.' },
          { q:'Opioids for musculoskeletal pain should be prescribed:', opts:['Long-term as first-line for all moderate pain','Short-term, lowest effective dose, for severe acute pain only â€” not first-line for chronic non-cancer MSK pain'], ans:1, exp:'Opioids in MSK: appropriate for acute severe pain (fractures, post-op). NOT first-line for chronic non-cancer pain (tolerance, dependence, hyperalgesia, abuse risk). Exercise, NSAIDs, physiotherapy preferred for chronic pain.' },
          { q:'Muscle relaxants (cyclobenzaprine, baclofen) side effects include:', opts:['Hypertension and tachycardia only','Sedation, dizziness, anticholinergic effects â€” impair driving and cognitive function'], ans:1, exp:'Muscle relaxants: CNS depressants causing sedation, dizziness, dry mouth (anticholinergic). Warn about driving, alcohol interaction. Cyclobenzaprine: structurally related to TCAs (cardiac effects). Short-term use (2-3 weeks).' },
          { q:'Intra-articular corticosteroid injection benefits include:', opts:['Permanent cure for arthritis','Short-term pain relief (weeks to months) for flare of osteoarthritis or inflammatory arthritis'], ans:1, exp:'Joint corticosteroid injection: reduces local inflammation, provides 4-12 weeks of pain relief. Limit to 3-4 injections/year/joint (risk of cartilage damage, tendon rupture, avascular necrosis with repeated injections).' },
          { q:'Topical diclofenac (NSAID gel) advantages over oral NSAIDs:', opts:['More potent anti-inflammatory effect systemically','Local anti-inflammatory effect with minimal systemic absorption â€” reduced GI and renal side effects'], ans:1, exp:'Topical NSAIDs (diclofenac gel/patch): effective for localized OA (knee, hands), minimal systemic absorption (under 5% vs oral). Fewer GI/renal/cardiovascular side effects. Skin reactions possible.' },
          { q:'Bisphosphonates (alendronate, zoledronic acid) in osteoporosis work by:', opts:['Increasing calcium absorption from gut','Inhibiting osteoclast-mediated bone resorption â€” reduce vertebral and hip fracture risk'], ans:1, exp:'Bisphosphonates: bind hydroxyapatite in bone, incorporated into osteoclasts causing apoptosis. Reduce vertebral fractures by 50-70%, hip fractures by 40-50%. Take on empty stomach with full glass of water, remain upright 30 min.' },
          { q:'Bisphosphonate rare but serious jaw complication is:', opts:['Gingival hyperplasia','Osteonecrosis of the jaw (ONJ) â€” risk with dental extractions and IV bisphosphonates'], ans:1, exp:'ONJ (osteonecrosis of the jaw): rare, higher risk with IV bisphosphonates (zoledronic acid for cancer) vs oral. Risk increased with dental extractions. Patients should complete dental work before starting, notify dentist of bisphosphonate use.' },
          { q:'Calcium supplementation for osteoporosis: preferred form is:', opts:['Calcium carbonate taken on empty stomach','Calcium citrate (better absorbed without food) â€” especially in elderly with reduced gastric acid; carbonate with food'], ans:1, exp:'Calcium carbonate (40% elemental Ca): less expensive, taken WITH food (requires acid for absorption). Calcium citrate (21% elemental): absorbed independent of acid â€” better for elderly, achlorhydric, PPI users. Maximum dose 500-600 mg per sitting.' },
          { q:'Vitamin D role in musculoskeletal health:', opts:['Only relevant for calcium absorption','Essential for calcium absorption, bone mineralization, muscle function â€” deficiency increases fracture and fall risk'], ans:1, exp:'Vitamin D (calcitriol): promotes intestinal calcium absorption, bone mineralization. Deficiency: rickets (children), osteomalacia (adults), secondary hyperparathyroidism, increased fracture risk. Target serum 25-OH-D above 30 ng/mL.' },
          { q:'Colchicine mechanism for gout treatment:', opts:['Inhibits xanthine oxidase to reduce uric acid production','Inhibits microtubule polymerization â€” blocks neutrophil migration into joint (anti-inflammatory, not uricosuric)'], ans:1, exp:'Colchicine: prevents neutrophil migration into joint by disrupting microtubule function. Does NOT lower uric acid. For acute gout: 1.2 mg then 0.6 mg 1 hour later. GI side effects (diarrhea, nausea) are dose-limiting.' },
          { q:'Denosumab (Prolia) mechanism in osteoporosis:', opts:['Stimulates osteoblast activity','Monoclonal antibody against RANK-L â€” reduces osteoclast formation, function, and survival (antiresorptive)'], ans:1, exp:'Denosumab: anti-RANK-L monoclonal antibody. Prevents osteoclast differentiation and increases osteoclast apoptosis. Subcutaneous injection every 6 months. Risk: rebound bone loss if discontinued â€” must transition to bisphosphonate.' },
          { q:'Fall prevention strategies in elderly MSK patients include:', opts:['Encourage bed rest to prevent falls','Home hazard modification, assistive devices (cane/walker), vitamin D, strengthen exercises, review polypharmacy'], ans:1, exp:'Fall prevention: multifactorial. Remove home hazards (rugs, poor lighting), strengthen hip/knee extensors, balance training (tai chi), vitamin D supplementation, review polypharmacy (sedatives, antihypertensives), appropriate footwear.' },
          { q:'TENS (transcutaneous electrical nerve stimulation) mechanism:', opts:['Delivers heat to deeper tissues','Delivers low-level electrical stimulation to stimulate large-diameter nerve fibers, activating gate control theory to reduce pain transmission'], ans:1, exp:'TENS: gate control theory â€” stimulating large A-beta fibers closes the gate to pain signals from small C-fibers. Also increases endorphin release. Used for chronic musculoskeletal pain, neuropathy. Non-pharmacological.' },
          { q:'Hydrotherapy (aquatic therapy) benefits in MSK conditions:', opts:['Increases joint loading similar to land-based exercise','Reduces joint loading (buoyancy), warm water promotes muscle relaxation, resistance of water builds strength'], ans:1, exp:'Hydrotherapy: buoyancy reduces joint loading (ideal for non-weight-bearing exercise), hydrostatic pressure reduces swelling, warm water relaxes muscles and reduces pain, resistance builds strength without impact.' },
          { q:'Splinting vs casting in MSK conditions:', opts:['Both are identical in function','Splints are removable (for acute swelling or functional use). Casts are circumferential (for stable fracture fixation)'], ans:1, exp:'Splint (static or dynamic): removable, used for acute injuries (swelling accommodation), temporary immobilization, functional bracing. Cast: circumferential, provides rigid fixation for fractures, non-removable by patient.' },
          { q:'Assistive device selection: walker vs cane:', opts:['Always use the most supportive device available','Walker: bilateral instability, post-joint replacement, maximum support. Cane: unilateral weakness, mild instability â€” hold in OPPOSITE hand to affected leg'], ans:1, exp:'Cane: held in contralateral hand (reduces force on affected hip/leg by 25%). Walker: bilateral upper extremity support, maximum stability â€” standard (pick-up) or wheeled. Crutches: non-weight-bearing.' },
          { q:'Patient education for methotrexate in RA includes:', opts:['Take with alcohol for best absorption','Avoid alcohol (hepatotoxicity risk), reliable contraception (teratogenic), report infections, avoid live vaccines, take folic acid'], ans:1, exp:'Methotrexate education: AVOID alcohol (hepatotoxicity), reliable contraception (teratogenic â€” stop 3 months before conception), folic acid 5 mg/week, report infections (immunosuppression), no live vaccines, regular blood monitoring.' },
          { q:'Occupational therapy role in arthritis management includes:', opts:['Prescribing NSAIDs and DMARDs','Joint protection education, adaptive equipment, splinting, energy conservation, home modification'], ans:1, exp:'OT in arthritis: joint protection principles (avoid ulnar deviation, use larger joints), adaptive equipment (jar openers, built-up handles), static wrist splints for RA (night, acute flare), energy conservation, ergonomic workstation.' },
          { q:'Weight-bearing exercise benefits for osteoporosis include:', opts:['Decreases bone density through mechanical loading','Stimulates osteoblast activity and bone formation through mechanical loading â€” swimming does NOT provide bone benefit'], ans:1, exp:'Weight-bearing exercise: mechanical loading stimulates osteoblasts, increases BMD. Walking, jogging, dancing, resistance training. Swimming/cycling: non-weight-bearing â€” cardiovascular benefit but NOT bone benefit. Minimum 30 min, 3-5 times per week.' },
          { q:'Teriparatide (Forteo) in severe osteoporosis works by:', opts:['Inhibiting osteoclast bone resorption','Anabolic â€” recombinant PTH fragment that stimulates new bone formation (osteoblast stimulation)'], ans:1, exp:'Teriparatide: only FDA-approved anabolic agent for osteoporosis. Recombinant PTH (1-34). Stimulates osteoblasts â€” increases bone formation (not just anti-resorptive). For severe osteoporosis, previous fractures. Daily subcutaneous injection x 2 years.' }
            ]
          }
        ]
      },      {
        name: 'Respiratory', icon: 'fa-lungs', color: '#06b6d4',
        sections: [
          {
            name: 'Respiratory I',
            questions: [
          { q:'Normal adult arterial oxygen saturation (SpO2) by pulse oximetry is:', opts:['70-80%','80-90%','95-100%','100% only'], ans:2, exp:'Normal SpO2: 95-100%. SpO2 below 90% = hypoxemia requiring intervention.' },
          { q:'High-flow oxygen in a COPD patient may:', opts:['Cause nitrogen washout','Suppress the hypoxic respiratory drive and cause respiratory depression','Increase pulmonary vascular resistance','Cause bronchoconstriction'], ans:1, exp:'Some COPD patients (CO2 retainers) rely on hypoxic drive. High-flow O2 removes this drive causing hypoventilation. Target SpO2 88-92% in COPD.' },
          { q:'In tension pneumothorax, tracheal deviation is toward:', opts:['The affected (collapsed) side','The unaffected (opposite) side','The midline only','No deviation occurs'], ans:1, exp:'Tension pneumothorax: air builds under pressure in pleural space causing mediastinum to shift AWAY from affected side â€” tracheal deviation to opposite side.' },
          { q:'Normal arterial blood gas (ABG) values are:', opts:['pH 7.25-7.30, PaCO2 50-60, PaO2 60-70, HCO3 28-32','pH 7.35-7.45, PaCO2 35-45, PaO2 80-100, HCO3 22-26','pH 7.45-7.55, PaCO2 25-35, PaO2 70-80, HCO3 18-22','pH 7.20-7.30, PaCO2 45-55, PaO2 90-100, HCO3 26-30'], ans:1, exp:'Normal ABG: pH 7.35-7.45, PaCO2 35-45 mmHg, PaO2 80-100 mmHg, HCO3 22-26 mEq/L.' },
          { q:'ABG: pH 7.28, PaCO2 58, HCO3 24. This is:', opts:['Metabolic acidosis','Uncompensated respiratory acidosis','Metabolic alkalosis','Respiratory alkalosis'], ans:1, exp:'pH below 7.35 = acidosis. PaCO2 above 45 = CO2 retention = respiratory cause. HCO3 normal = uncompensated respiratory acidosis.' },
          { q:'Pulmonary embolism classically presents with:', opts:['Productive green sputum and fever','Sudden onset dyspnea, pleuritic chest pain, and tachycardia','Gradual progressive dyspnea over weeks','Inspiratory stridor and croup-like cough'], ans:1, exp:'PE: sudden dyspnea, pleuritic chest pain, tachycardia, hemoptysis, hypoxia. CT pulmonary angiography is the gold standard.' },
          { q:'Tuberculosis (TB) requires which type of isolation?', opts:['Contact precautions','Airborne precautions: N95 respirator and negative-pressure room','Droplet precautions','Standard precautions only'], ans:1, exp:'TB = airborne transmission (droplet nuclei below 5 um). Requires N95 respirator (not surgical mask) + negative-pressure room.' },
          { q:'Post-operative incentive spirometry is used to:', opts:['Strengthen respiratory muscles for exercise','Prevent atelectasis and promote alveolar expansion','Measure exact tidal volume','Deliver bronchodilator medications'], ans:1, exp:'Incentive spirometry: sustained maximal inspiration opens collapsed alveoli and prevents post-op atelectasis and pneumonia.' },
          { q:'ARDS (Acute Respiratory Distress Syndrome) is defined by:', opts:['SpO2 below 90% on room air for above 24 hours','PaO2/FiO2 ratio at or below 300 with bilateral infiltrates on CXR within 1 week of insult, not fully cardiac','PaCO2 above 50 with pH below 7.35','Unilateral pneumonia with hypoxia'], ans:1, exp:'ARDS Berlin definition: acute onset (1 week or less), bilateral opacities, not fully explained by cardiac failure, P/F ratio 300 or below (mild), 200 or below (moderate), 100 or below (severe).' },
          { q:'A nasal cannula at 4 L/min delivers approximately what FiO2?', opts:['21% (room air)','36-37%','50%','60%'], ans:1, exp:'Nasal cannula: each 1 L/min adds approximately 4% FiO2. 4 L/min = 21 + (4x4) = 37% FiO2. Non-rebreather mask at 10-15 L/min = 80-100%.' },
          { q:'PEEP (positive end-expiratory pressure) on a ventilator functions by:', opts:['Increasing respiratory rate','Preventing alveolar collapse at end-expiration, improving oxygenation','Reducing tidal volume to prevent barotrauma','Delivering 100% O2 with each breath'], ans:1, exp:'PEEP keeps alveoli open at end-expiration, improves V/Q matching, recruits collapsed alveoli. Essential in ARDS management.' },
          { q:'Tidaling (fluid rise and fall with breathing) in the water seal chamber indicates:', opts:['Air leak requiring immediate reporting','Normal functioning of the water seal drainage system','Clot in the chest tube requiring stripping','Tube is clamped incorrectly'], ans:1, exp:'Tidaling is NORMAL: fluid rises with inspiration and falls with expiration. Absence = tube occlusion or lung re-expansion. Continuous bubbling = air leak.' },
          { q:'A patient with pneumothorax would show which finding on the affected side?', opts:['Dull percussion and decreased breath sounds','Hyperresonant percussion and absent/decreased breath sounds','Crackles and dullness to percussion','Normal breath sounds with increased vocal fremitus'], ans:1, exp:'Pneumothorax (air in pleural space): hyperresonant (tympanic) percussion + absent/decreased breath sounds. Hemothorax: dull + decreased sounds.' },
          { q:'Safe tracheostomy suctioning technique requires:', opts:['30-60 seconds per pass','10-15 seconds per pass with pre-oxygenation','5 minutes continuous suctioning','Only when SpO2 drops to 70%'], ans:1, exp:'Suctioning: pre-oxygenate with 100% O2, maximum 10-15 seconds per pass (prolonged suctioning causes hypoxia and dysrhythmias).' },
          { q:'Asthma differs from COPD in that asthma:', opts:['Is irreversible and progressive','Is largely reversible bronchoconstriction, often allergic, with normal FEV1 between attacks','Occurs only in elderly smokers','Shows barrel chest and pursed-lip breathing early'], ans:1, exp:'Asthma = reversible airway obstruction (bronchospasm + inflammation). COPD = progressive irreversible obstruction, mainly from smoking.' },
          { q:'A patient with epiglottitis should be positioned:', opts:['Supine with head flat','In tripod position (sitting forward) and airway management made ready','Trendelenburg','Lateral recumbent'], ans:1, exp:'Epiglottitis: tripod/sniffing position. Do NOT examine the throat â€” could precipitate complete airway obstruction. Secure airway in OR.' },
          { q:'Cor pulmonale refers to:', opts:['Left heart failure causing pulmonary edema','Right heart failure secondary to chronic pulmonary hypertension','Pulmonary embolism causing cardiac arrest','Biventricular failure from cardiomyopathy'], ans:1, exp:'Cor pulmonale: RV enlargement/failure from pulmonary hypertension caused by chronic pulmonary disease (COPD, fibrosis, PE).' },
          { q:'Proper MDI (metered-dose inhaler) technique includes:', opts:['Inhale as fast as possible after actuation','Exhale fully, activate MDI, then inhale slowly and deeply, hold breath 10 seconds','Inhale before pressing the canister','Hold inhaler 10 cm from open mouth'], ans:1, exp:'MDI technique: shake, exhale fully, seal lips, press canister while inhaling slowly (3-5 sec), hold breath 10 seconds. A spacer improves delivery.' },
          { q:'Cheyne-Stokes respiration is characterized by:', opts:['Rapid, deep, regular breathing','Cycles of gradually increasing depth with gradually decreasing depth and apneic periods','Slow shallow breathing with no variation','Prolonged inspiration with short expiration'], ans:1, exp:'Cheyne-Stokes: crescendo-decrescendo breathing pattern with apneic periods. Seen in severe heart failure and neurological damage.' },
          { q:'A ventilated patient develops sudden high peak airway pressures and absent left breath sounds. Priority action:', opts:['Increase PEEP','Assess for right mainstem intubation or left pneumothorax â€” call for immediate evaluation','Increase FiO2 to 100%','Administer nebulized bronchodilator'], ans:1, exp:'Sudden unilateral absent breath sounds + high airway pressure: right mainstem intubation or left-sided pneumothorax. Medical emergency requiring immediate assessment.' },
          { q:'Pursed-lip breathing benefits COPD patients by:', opts:['Increasing respiratory rate to compensate for hypoxia','Slowing expiration and preventing dynamic airway collapse, reducing air trapping','Maximizing inspiratory volume','Delivering oxygen more effectively than a mask'], ans:1, exp:'Pursed-lip breathing creates intrinsic PEEP preventing dynamic airway collapse during expiration â€” prolongs expiration, reduces air trapping in emphysema.' },
          { q:'Crackles (rales) heard on auscultation indicate:', opts:['Narrowed airways (as in asthma)','Fluid or secretions in alveoli or small airways','High-pitched inspiratory stridor','Pleural surface inflammation'], ans:1, exp:'Crackles = fluid/secretions in alveoli or small airways (heard in pneumonia, pulmonary edema, heart failure, fibrosis). Wheezes = narrowed airways.' },
          { q:'When a chest tube is accidentally removed, the nurse should immediately:', opts:['Clamp the tube with a hemostat and call physician','Cover the insertion site with a petroleum gauze dressing and notify the physician','Leave the site open to allow air to escape','Apply pressure with dry gauze only'], ans:1, exp:'Accidental removal: immediately cover with petroleum (occlusive) gauze to prevent air entry (open pneumothorax). Notify physician for reinsertion.' },
          { q:'Pulse oximetry (SpO2) may be FALSELY normal in:', opts:['Anemia (mild)','Carbon monoxide poisoning (COHb)','Hyperthermia','Tachycardia'], ans:1, exp:'Pulse oximetry cannot distinguish oxyhemoglobin from carboxyhemoglobin â€” in CO poisoning SpO2 reads 98-100% while patient is severely hypoxic. Use co-oximetry/ABG.' }
            ]
          },
          {
            name: 'Respiratory II',
            questions: [
          { q:'COPD GOLD staging is based on:', opts:['Symptoms and exacerbation history only','Post-bronchodilator FEV1/FVC below 0.70 plus FEV1 percentage predicted (GOLD 1-4)'], ans:1, exp:'COPD GOLD classification: spirometry-confirmed obstruction (FEV1/FVC below 0.70). GOLD 1: FEV1 above 80%. GOLD 2: 50-79%. GOLD 3: 30-49%. GOLD 4: below 30%. Combined with symptom burden and exacerbation history (GOLD ABE groups).' },
          { q:'FEV1/FVC ratio in obstructive lung disease is:', opts:['Normal (above 0.70)','Reduced (below 0.70)'], ans:1, exp:'Obstructive pattern: FEV1/FVC below 0.70 (airflow limitation). COPD, asthma, bronchiectasis. Restrictive pattern: FVC reduced, FEV1/FVC normal or increased â€” fibrosis, neuromuscular disease.' },
          { q:'Pursed-lip breathing technique:', opts:['Inhale through pursed lips, exhale through nose','Inhale through nose (2 counts), exhale slowly through pursed lips (4-6 counts)'], ans:1, exp:'Pursed-lip breathing: inhale through nose (2 counts), exhale slowly through pursed lips (as if blowing a candle â€” 4-6 counts). Creates back-pressure, prevents airway collapse, slows breathing rate.' },
          { q:'Tripod position used in COPD is:', opts:['Lying flat with legs elevated','Sitting upright leaning forward with hands on knees or a surface, elbows out'], ans:1, exp:'Tripod position: maximizes use of accessory respiratory muscles (sternocleidomastoid, scalene, intercostals). Used in acute dyspnea from COPD, asthma, CHF. Nurse should facilitate, not force supine position.' },
          { q:'Oxygen delivery target SpO2 in COPD exacerbation (CO2 retainers) is:', opts:['Above 98%','88-92% (prevents suppression of hypoxic drive and hypercapnia worsening)'], ans:1, exp:'COPD with hypercapnia: target SpO2 88-92%. Titrate O2 (start 24-28% Venturi mask). Above 92%: risk of suppressing hypoxic drive causing CO2 retention and respiratory acidosis.' },
          { q:'Short-acting beta-2 agonist (SABA) like salbutamol works by:', opts:['Blocking histamine receptors in airways','Stimulating beta-2 receptors in bronchial smooth muscle causing bronchodilation'], ans:1, exp:'Salbutamol (albuterol): beta-2 agonist. Stimulates smooth muscle adenylyl cyclase, increases cAMP, relaxes bronchial smooth muscle. Onset 5-15 min. Used for acute bronchospasm (reliever).' },
          { q:'Tiotropium (Spiriva) is classified as:', opts:['Short-acting beta-2 agonist (SABA)','Long-acting muscarinic antagonist (LAMA) â€” bronchodilator for COPD maintenance'], ans:1, exp:'Tiotropium: LAMA. Blocks muscarinic receptors in airways (M3) preventing acetylcholine-mediated bronchoconstriction. Once-daily inhalation. First-line for COPD maintenance. Reduces exacerbations.' },
          { q:'Pulmonary rehabilitation for COPD patients:', opts:['Is contraindicated in severe COPD','Improves exercise tolerance, dyspnea, and quality of life regardless of COPD severity â€” not disease-modifying but functionally significant'], ans:1, exp:'Pulmonary rehabilitation: supervised exercise training, education, and behavioral intervention. Most effective non-pharmacological treatment for COPD. Reduces hospitalizations and dyspnea. All GOLD stages benefit.' },
          { q:'Smoking cessation benefits for COPD:', opts:['No benefit after significant lung damage','Slows the rate of FEV1 decline (most effective intervention to slow COPD progression), reduces exacerbation frequency'], ans:1, exp:'Smoking cessation: the single most effective intervention to slow COPD progression. Reduces FEV1 decline rate from COPD patient rate to non-smoker rate. Reduces exacerbations, cardiovascular events, lung cancer risk.' },
          { q:'Asthma peak expiratory flow rate (PEFR) zones:', opts:['Only one threshold matters','Green: above 80% personal best (controlled). Yellow: 50-79% (caution, increase treatment). Red: below 50% (emergency, immediate action)'], ans:1, exp:'PEFR zones: green (above 80% = well-controlled), yellow (50-79% = caution, increase treatment per action plan), red (below 50% = medical emergency, call emergency services).' },
          { q:'Metered-dose inhaler (MDI) technique requires a spacer in:', opts:['All adult patients for better effect','Young children, elderly, those who cannot coordinate actuation and inhalation, or with corticosteroid MDIs'], ans:1, exp:'Spacer (valved holding chamber): reduces need for precise coordination, reduces oropharyngeal deposition of drug (especially ICS), improves lung deposition. Mandatory for children below 8 years.' },
          { q:'Inhaled corticosteroid (ICS) patient instructions include:', opts:['Swallow immediately after inhalation','Rinse mouth with water and spit after each use to prevent oral candidiasis'], ans:1, exp:'ICS (fluticasone, budesonide): rinse mouth and throat after use to prevent oral thrush (candida) and hoarseness from local steroid deposition. This is the most important patient education point for ICS.' },
          { q:'Status asthmaticus is defined as:', opts:['Any severe asthma attack','Severe asthma attack unresponsive to initial bronchodilator therapy â€” respiratory failure risk'], ans:1, exp:'Status asthmaticus: severe, prolonged asthma attack failing to respond to inhaled bronchodilators (SABA) and corticosteroids. SpO2 declining, rising PaCO2, altered LOC = impending respiratory failure. ICU admission required.' },
          { q:'Magnesium sulfate IV in severe asthma works by:', opts:['Increasing airway mucociliary clearance','Relaxing bronchial smooth muscle (calcium antagonist effect) â€” used in severe acute asthma not responding to bronchodilators'], ans:1, exp:'IV magnesium sulfate 1.2-2g over 20 min: bronchodilation via calcium antagonism in smooth muscle. Used in severe acute asthma or status asthmaticus when SABA/ipratropium/steroids insufficient.' },
          { q:'Exercise-induced bronchoconstriction (EIB) management includes:', opts:['Stopping all exercise permanently','Pre-exercise SABA (15 min before exercise), warm-up exercises, consider LABA or montelukast for regular EIB'], ans:1, exp:'EIB: bronchospasm within 5-10 min of exercise onset. Pre-treatment: inhaled SABA 15-20 min before. Warm-up period reduces severity. Daily controller therapy (ICS, montelukast) if frequent EIB.' },
          { q:'Leukotriene modifier (montelukast) is most effective in:', opts:['Severe acute asthma attacks','Mild persistent asthma, allergic asthma, aspirin-sensitive asthma, and exercise-induced bronchoconstriction'], ans:1, exp:'Montelukast (Singulair): leukotriene receptor antagonist. Reduces airway inflammation and bronchoconstriction. Add-on therapy for persistent asthma, allergic rhinitis, aspirin-sensitive asthma, EIB. Once-daily oral.' },
          { q:'Asthma triggers to avoid include:', opts:['Physical exercise always â€” permanent avoidance','Allergens (dust mites, pet dander, mold, pollen), smoke, air pollutants, cold air, respiratory infections, NSAIDs, beta-blockers'], ans:1, exp:'Asthma triggers: allergens (house dust mites, animal dander, cockroach), tobacco smoke, air pollution, cold dry air, exercise (manageable), ASA/NSAIDs (aspirin-exacerbated respiratory disease), beta-blockers.' },
          { q:'COPD exacerbation is most commonly triggered by:', opts:['Physical exertion alone','Respiratory tract infections (viral 50-70% â€” rhinovirus, influenza; bacterial â€” H. influenzae, Streptococcus pneumoniae, Moraxella)'], ans:1, exp:'COPD exacerbation: respiratory infections are the most common trigger (viral above bacterial). Also: air pollution, cold weather, aspiration. Influenza and pneumococcal vaccines are essential prevention.' },
          { q:'Salbutamol (albuterol) nebulization in acute asthma is given:', opts:['Only once then wait 4 hours','2.5-5 mg every 20 minutes for 3 doses initially (back-to-back/continuous in severe attacks)'], ans:1, exp:'Acute asthma: salbutamol 2.5-5 mg nebulized every 20 minutes x 3 doses initially (or continuous). Add ipratropium 0.5 mg. Systemic corticosteroids within 1 hour. Magnesium sulfate if severe.' },
          { q:'COPD patient education regarding inhaler technique should emphasize:', opts:['Exhale vigorously before inhaling the inhaler','Coordinate inhalation with activation, slow and deep breath, hold 10 seconds, use spacer, rinse mouth (if ICS)'], ans:1, exp:'Inhaler adherence: technique must be demonstrated and reassessed at every visit (studies show 90% of patients use incorrect technique). Key: slow-deep inhalation, hold 10 seconds, use spacer, rinse after ICS.' },
          { q:'Bronchiectasis is defined as:', opts:['Reversible bronchial narrowing from spasm','Irreversible abnormal dilation of bronchi from chronic infection/inflammation â€” daily copious purulent sputum'], ans:1, exp:'Bronchiectasis: permanent bronchial wall damage and dilation. Causes: recurrent infection (CF, primary ciliary dyskinesia, childhood pertussis/TB). Hallmark: daily productive cough with copious purulent sputum. CT chest diagnosis.' },
          { q:'Theophylline therapeutic range and toxicity signs:', opts:['5-10 mcg/mL; toxicity causes diarrhea only','10-20 mcg/mL; toxicity: nausea, vomiting, headache, arrhythmias, seizures (narrow therapeutic window)'], ans:1, exp:'Theophylline: narrow therapeutic window (10-20 mcg/mL). Toxicity above 20 mcg/mL: nausea, vomiting, tachycardia, arrhythmias, seizures. Multiple drug interactions (ciprofloxacin, erythromycin, caffeine increase levels).' },
          { q:'Allergic asthma IgE-mediated response involves:', opts:['T-cell direct cytotoxicity','Allergen binding to IgE on mast cells causing degranulation, releasing histamine, leukotrienes causing bronchoconstriction and inflammation'], ans:1, exp:'Allergic asthma: Type I hypersensitivity. IgE sensitization to allergen. Re-exposure: allergen binds IgE on mast cells/basophils causing degranulation. Histamine, leukotrienes, cytokines cause early and late phase bronchoconstriction.' }
            ]
          },
          {
            name: 'Respiratory III',
            questions: [
          { q:'Community-acquired pneumonia (CAP) vs hospital-acquired pneumonia (HAP) definition:', opts:['Both are identical clinically','CAP: outside hospital or within 48 hours of admission. HAP: develops 48+ hours after hospital admission'], ans:1, exp:'CAP: acquired outside hospital (most common â€” S. pneumoniae, H. influenzae, atypicals). HAP: 48+ hours post-admission (gram-negatives, MRSA more common). HCAP (healthcare-associated): patients in chronic care facilities, recent hospitalization.' },
          { q:'Pneumonia physical findings on the affected side include:', opts:['Hyperresonance and absent breath sounds','Dullness to percussion, increased tactile fremitus, bronchial breath sounds, egophony (E to A change)'], ans:1, exp:'Consolidation (pneumonia): dullness on percussion (fluid-filled alveoli), increased tactile fremitus (sound conducted through solid tissue), bronchial breath sounds, egophony. Bronchophony (99 louder), whispered pectoriloquy.' },
          { q:'Ventilator-associated pneumonia (VAP) prevention bundle includes:', opts:['No evidence-based interventions exist','HOB 30-45 degrees, daily sedation vacation, oral care with chlorhexidine, subglottic secretion drainage, peptic ulcer prophylaxis'], ans:1, exp:'VAP bundle: HOB 30-45 degrees (prevents microaspiration), daily sedation vacation (earlier extubation), oral decontamination (chlorhexidine), subglottic suction (prevents pooled secretions), PUD prophylaxis, DVT prophylaxis.' },
          { q:'Aspiration pneumonia is most commonly in the:', opts:['Right lower lobe (RLL) and right upper lobe (RUL) apex â€” in upright patient','Right lower lobe and right upper lobe superior segment â€” gravity-dependent right mainstem anatomy in upright and supine'], ans:0, exp:'Aspiration: right mainstem bronchus is more vertical â€” aspirated material preferentially goes right. Upright: right lower lobe. Supine: right upper lobe superior segment and right lower lobe superior segment.' },
          { q:'Chest physiotherapy (percussion and postural drainage) aims to:', opts:['Strengthen intercostal muscles','Mobilize and drain secretions from airways â€” assists mucociliary clearance'], ans:1, exp:'Chest physiotherapy: percussion (clapping) loosens adherent secretions, postural drainage uses gravity to drain specific lung segments. Used in bronchiectasis, CF, COPD with excess secretions. Position patient for target lobe.' },
          { q:'Incentive spirometry patient instructions:', opts:['Blow forcefully into device','Inhale slowly and deeply to move the ball/indicator to target level, hold 3-5 seconds, repeat 10 times hourly while awake'], ans:1, exp:'Incentive spirometry (IS): patient inhales slowly and deeply (not blows out). Hold inspiration 3-5 seconds to allow alveolar expansion. 10 breaths hourly while awake post-operatively. Prevents atelectasis.' },
          { q:'Tuberculosis (TB) transmission prevention requires:', opts:['Contact precautions and gloves only','Airborne precautions: N95 respirator (not surgical mask), negative-pressure room, patient mask when leaving room'], ans:1, exp:'TB airborne precautions: N95 or higher respirator for all healthcare workers entering room, single-patient negative-pressure room (12 air changes/hour), patient wears surgical mask when leaving room for procedures.' },
          { q:'TB drug regimen (RIPE therapy) first 2 months includes:', opts:['Rifampicin alone','Rifampicin, Isoniazid, Pyrazinamide, Ethambutol (RIPE) for 2 months, then Rifampicin + Isoniazid for 4 months'], ans:1, exp:'Standard TB treatment: RIPE for 2 months (intensive phase) then RI for 4 months (continuation phase). Total 6 months. Drug-resistant TB: individualized regimens. DOT (directly observed therapy) ensures adherence.' },
          { q:'Isoniazid (INH) side effects include:', opts:['Only GI upset','Peripheral neuropathy (prevent with pyridoxine B6), hepatotoxicity (monitor LFTs), drug-induced lupus'], ans:1, exp:'INH side effects: peripheral neuropathy (B6/pyridoxine supplementation required), hepatotoxicity (monitor LFTs), drug-induced lupus, CNS effects (pyridoxine-dependent). Rifampicin causes orange discoloration of body fluids.' },
          { q:'Pleural effusion: Light criteria distinguish transudates from exudates by:', opts:['Clinical symptoms only','Protein ratio, LDH ratio (exudate: protein ratio above 0.5, LDH ratio above 0.6, LDH above 2/3 upper limit)'], ans:1, exp:'Light criteria: exudate if ANY: pleural/serum protein ratio above 0.5, pleural/serum LDH ratio above 0.6, pleural LDH above 2/3 upper normal serum LDH. Transudate: congestive HF, cirrhosis, nephrotic syndrome. Exudate: pneumonia, malignancy, TB.' },
          { q:'Thoracentesis nursing care includes:', opts:['Patient supine throughout procedure','Upright sitting position leaning forward on table, post-procedure CXR (pneumothorax check), vitals monitoring'], ans:1, exp:'Thoracentesis: sitting upright leaning forward (opens intercostal spaces). Post-procedure: CXR (rule out pneumothorax â€” up to 5% risk), vitals, assess breath sounds, monitor for re-expansion pulmonary edema.' },
          { q:'Pneumothorax: tension vs simple:', opts:['Both present the same way','Simple: small, stable, no mediastinal shift. Tension: progressive, tracheal deviation AWAY, absent breath sounds, hypotension, JVD â€” immediate needle decompression'], ans:1, exp:'Tension pneumothorax: life-threatening. Air enters pleural space but cannot exit (one-way valve). Progressive mediastinal shift, compresses heart and great vessels. Clinical diagnosis â€” treat immediately with needle decompression, then chest tube.' },
          { q:'Chest tube insertion nursing care includes:', opts:['Clamp tube immediately if drainage increases','Never clamp without physician order, maintain water seal, monitor drainage (color, amount), keep drainage system below chest level'], ans:1, exp:'Chest tube care: never clamp routinely (except during transport with physician order), maintain water seal, keep system below chest, monitor drainage (greater than 200 mL/hr = notify physician), secure all connections, assess respiratory status.' },
          { q:'Empyema (pus in pleural space) is treated with:', opts:['IV antibiotics alone for all cases','Chest tube drainage plus IV antibiotics â€” VATS or decortication for complex/loculated empyema'], ans:1, exp:'Empyema: infected pleural space (pus). Requires drainage (chest tube) + IV antibiotics. Simple: tube drainage + antibiotics. Complex/organized: VATS (video-assisted thoracic surgery) or decortication. tPA/DNase to break down loculations.' },
          { q:'Influenza pneumonia nursing care priorities include:', opts:['Encourage close contact with other patients for recovery','Droplet precautions, antiviral therapy (oseltamivir within 48 hours), supportive care, influenza vaccination for prevention'], ans:1, exp:'Influenza: droplet precautions, antiviral (oseltamivir/zanamivir â€” most effective within 48 hours), supportive care, monitor for complications (secondary bacterial pneumonia, ARDS). Annual vaccination is primary prevention.' },
          { q:'COVID-19 respiratory nursing considerations include:', opts:['Standard precautions only','Airborne precautions during aerosol-generating procedures, PPE donning/doffing protocols, prone positioning for moderate-severe hypoxemia'], ans:1, exp:'COVID-19: standard + droplet + contact. Airborne precautions (N95) during AGPs (intubation, bronchoscopy, nebulization). Awake proning improves oxygenation in non-intubated patients. Monitor for ARDS and cytokine storm.' },
          { q:'Lung abscess characteristics and nursing care include:', opts:['Small, clean, rapidly resolving with oral antibiotics','Air-fluid level on CXR, foul-smelling purulent sputum, prolonged IV antibiotics (4-6 weeks), postural drainage'], ans:1, exp:'Lung abscess: cavitary lesion with air-fluid level (CXR). Causes: aspiration (#1), necrotizing pneumonia. Foul-smelling sputum. Treatment: prolonged antibiotics (clindamycin or amoxicillin-clavulanate). Postural drainage, bronchoscopy or percutaneous drainage if no improvement.' },
          { q:'Pneumococcal vaccine (PCV20 or PPSV23) is recommended for:', opts:['Healthy adults below 50 only','Adults above 65, immunocompromised patients, and those with chronic lung/heart/liver disease or asplenia'], ans:1, exp:'Pneumococcal vaccination: all adults above 65, immunocompromised (HIV, asplenia, malignancy), chronic diseases (COPD, asthma, CHF, liver disease). Reduces CAP risk significantly.' },
          { q:'MDR-TB (multidrug-resistant TB) is defined as resistance to:', opts:['Any single TB drug','At least rifampicin and isoniazid (the two most effective first-line drugs)'], ans:1, exp:'MDR-TB: resistant to rifampicin AND isoniazid. XDR-TB: also resistant to fluoroquinolones and at least one injectable (kanamycin, amikacin). Treatment: 18-24 months with second-line drugs (bedaquiline, delamanid).' },
          { q:'A patient with TB who has been on adequate therapy for 2 weeks and three consecutive negative sputum smears may:', opts:['Remain in airborne isolation indefinitely','Be considered non-infectious and remove airborne isolation (if clinically improving)'], ans:1, exp:'TB infectiousness criteria for discontinuing airborne isolation: 2 weeks of effective therapy AND clinical improvement AND 3 consecutive negative AFB smears. All 3 criteria must be met before removing precautions.' },
          { q:'Directly observed therapy (DOT) for TB means:', opts:['Patient self-reports medication intake','Healthcare worker observes patient swallowing every dose of anti-TB medication'], ans:1, exp:'DOT: healthcare worker or designated person directly watches patient swallow each TB drug dose. Gold standard for TB adherence globally. Reduces drug resistance, treatment failure, and relapse. Can be video-observed (VOT).' }
            ]
          },
          {
            name: 'Respiratory IV',
            questions: [
          { q:'Type I respiratory failure is characterized by:', opts:['Low PaO2 and high PaCO2 (hypercapnia)','Low PaO2 with normal or low PaCO2 â€” oxygenation failure (V/Q mismatch, shunt, diffusion impairment)'], ans:1, exp:'Type I (hypoxemic) respiratory failure: PaO2 below 60 mmHg with normal/low PaCO2. Causes: pneumonia, ARDS, pulmonary edema, PE (V/Q mismatch, shunt). Supplemental O2 corrects Type I (not shunt).' },
          { q:'Type II respiratory failure is characterized by:', opts:['PaO2 below 60 and PaCO2 below 40','PaO2 below 60 AND PaCO2 above 45 mmHg â€” ventilatory (pump) failure'], ans:1, exp:'Type II (hypercapnic) respiratory failure: PaCO2 above 45 mmHg + PaO2 below 60 mmHg. Pump failure: COPD exacerbation, neuromuscular disease (GBS, MG), drug overdose, chest wall deformity. Requires ventilatory support.' },
          { q:'ARDS lung-protective ventilation strategy uses:', opts:['Large tidal volumes (12-15 mL/kg) to maximize oxygenation','Low tidal volumes (6 mL/kg ideal body weight) to minimize ventilator-induced lung injury (VILI)'], ans:1, exp:'ARDS lung-protective ventilation: TV 6 mL/kg IBW (reduces VILI from overdistension), plateau pressure below 30 cmH2O. ARDSNet trial: 22% mortality reduction. Permissive hypercapnia accepted.' },
          { q:'Prone positioning in ARDS improves oxygenation by:', opts:['Reducing cardiac output and pulmonary blood flow','Redistributing lung perfusion to better-ventilated dorsal regions, reducing V/Q mismatch and improving recruitment'], ans:1, exp:'Prone positioning: redistributes pulmonary blood flow from anterior (now dependent) to posterior (better-aerated). Improves V/Q matching, reduces atrial recruitment. Recommended for severe ARDS (P/F below 150) for 12-16 hours/day. Reduces mortality.' },
          { q:'PEEP in ARDS is used to:', opts:['Reduce FiO2 need only (aesthetic benefit)','Keep recruitable alveoli open at end-expiration, improve oxygenation, and allow reduction of FiO2 (reducing O2 toxicity risk)'], ans:1, exp:'PEEP in ARDS: maintains alveolar recruitment at end-expiration (prevents cyclic collapse and re-opening). Allows lower FiO2 reducing oxygen toxicity. Titrated with FiO2 per ARDS-Net table or optimal PEEP trials.' },
          { q:'Permissive hypercapnia in mechanical ventilation means:', opts:['Treating all elevated PaCO2 with increased respiratory rate','Accepting PaCO2 above 45-55 mmHg (and pH above 7.20) to avoid high airway pressures from large tidal volumes'], ans:1, exp:'Permissive hypercapnia: allow PaCO2 to rise by using small tidal volumes (lung protection). Accept pH above 7.20. Benefits of low TV outweigh harms of moderate hypercapnia. Contraindicated in raised ICP.' },
          { q:'Ventilator mode: Assist-Control (AC) mode means:', opts:['Patient breathes spontaneously with only PEEP support','Every patient-triggered or machine-triggered breath receives full set tidal volume â€” patient sets rate or machine guarantees minimum rate'], ans:1, exp:'AC (Assist-Control): guarantees minimum respiratory rate. Patient can trigger additional breaths â€” each breath (spontaneous or machine-initiated) gets full preset TV. Risk: hyperventilation if patient breathes above set rate.' },
          { q:'Criteria for weaning from mechanical ventilation include:', opts:['Patient must be awake and talking before any weaning trial','Underlying cause resolved/improving, FiO2 below 0.4-0.5, PEEP below 5-8, adequate respiratory drive, hemodynamic stability â€” do spontaneous breathing trial (SBT)'], ans:1, exp:'Weaning criteria (SMART): Spontaneous effort, hemodynamically stable, Minimal FiO2/PEEP, Adequate mental status, Reversible cause. Daily SBT (T-piece or CPAP): if tolerated 30-120 min â€” extubate.' },
          { q:'Spontaneous breathing trial (SBT) failure signs include:', opts:['SpO2 99% and HR 70 bpm','RR above 35, SpO2 below 90%, HR above 140 or 20% change, BP above 180 or below 90, accessory muscle use, altered LOC'], ans:1, exp:'SBT failure: SpO2 below 90%, RR above 35, HR above 140 or greater than 20% change, BP changes, anxiety/altered LOC, increasing WOB. Return to full ventilatory support if SBT fails. Investigate cause.' },
          { q:'Cuffed endotracheal tube cuff pressure should be maintained at:', opts:['5-10 cmH2O','20-30 cmH2O (optimal: 25 cmH2O â€” seals without mucosal ischemia)'], ans:1, exp:'ETT cuff pressure: 20-30 cmH2O (25 cmH2O optimal). Below 20: microaspiration, VAP risk. Above 30: tracheal mucosal ischemia, tracheal stenosis, necrosis. Check with cuff manometer every 8-12 hours.' },
          { q:'Tracheostomy nursing care includes:', opts:['No site care needed once established','Stoma site care (daily cleaning, dressing change), inner cannula cleaning, suctioning, securing ties, emergency equipment at bedside (obturator, spare trache, scissors)'], ans:1, exp:'Tracheostomy care: daily site cleaning (peroxide then saline or per protocol), inner cannula cleaning/replacement, secretion suctioning, tie security (1-2 finger slack), obturator and same-size spare trache at bedside, humidified O2.' },
          { q:'Suctioning an endotracheal tube (ETT) requires:', opts:['Applying suction continuously while advancing catheter','Pre-oxygenation with 100% FiO2, catheter insertion without suction, apply suction while withdrawing, maximum 10-15 seconds'], ans:1, exp:'ETT suctioning: pre-oxygenate 100% O2 for 30-60 sec, advance catheter WITHOUT suction, apply intermittent or continuous suction while withdrawing over 10-15 seconds maximum. Monitor SpO2, HR, BP during procedure.' },
          { q:'ECMO (extracorporeal membrane oxygenation) in respiratory failure is used when:', opts:['Any patient with PaO2 below 80','Refractory hypoxemia or hypercapnia despite optimal ventilator management (P/F below 80, uncompensated respiratory acidosis)'], ans:1, exp:'ECMO: veno-venous ECMO in severe ARDS (P/F below 80 on optimal ventilation, uncompensable CO2 retention). Provides oxygenation and CO2 removal while resting the lungs. Specialized centers only. Risks: bleeding, thrombosis, infection.' },
          { q:'High-flow nasal cannula (HFNC) advantages over standard face mask:', opts:['Delivers exact FiO2 measurement better than Venturi','Delivers heated/humidified gas at 30-60 L/min (high flow flushes anatomical dead space), more comfortable, allows eating and talking, FiO2 up to 100%'], ans:1, exp:'HFNC (Optiflow): high flow (up to 60 L/min) with heated humidity. Flushes nasopharynx dead space (reduces dead space ventilation), generates mild CPAP effect (about 1-2 cmH2O), comfortable, allows oral communication and feeding.' },
          { q:'Non-invasive ventilation (BiPAP) is most appropriate for:', opts:['Any patient with low SpO2','COPD exacerbation with acute hypercapnic respiratory failure (reduces intubation need by 50%), cardiogenic pulmonary edema, immunocompromised patients with respiratory failure'], ans:1, exp:'NIV/BiPAP: most evidence for COPD exacerbation (hypercapnic RF), cardiogenic pulmonary edema. Reduces intubation need, ICU stay, mortality. Contraindications: apnea, cannot protect airway, facial trauma, vomiting.' },
          { q:'Oxygen toxicity (hyperoxia) from prolonged high FiO2 causes:', opts:['Acute bronchospasm immediately','Pulmonary inflammation and lung injury from free radical generation â€” absorbed atelectasis, tracheobronchitis, ARDS-like injury'], ans:1, exp:'O2 toxicity: above 60% FiO2 for prolonged periods (above 24-48 hours) generates reactive oxygen species causing lung injury. Absorption atelectasis (nitrogen washout), tracheobronchitis, interstitial fibrosis. Target lowest FiO2 maintaining SpO2 above 88-94%.' },
          { q:'Barotrauma from mechanical ventilation includes:', opts:['Peripheral nerve damage from high PEEP','Pneumothorax, pneumomediastinum, subcutaneous emphysema from alveolar overdistension and rupture'], ans:1, exp:'Barotrauma: alveolar overdistension from high airway pressure or tidal volume causes rupture, allowing air to track to pleura (pneumothorax), mediastinum, or subcutaneous tissue. Prevention: low TV, plateau pressure below 30 cmH2O.' },
          { q:'Auto-PEEP (intrinsic PEEP or breath stacking) occurs when:', opts:['Inspiratory time is too short','Expiratory time is insufficient for complete exhalation â€” trapped air creates positive pressure at end-expiration (dynamic hyperinflation)'], ans:1, exp:'Auto-PEEP: incomplete exhalation before next breath (obstructive disease, high RR, high TV, short I:E ratio). Air trapping increases FRC. Causes: hemodynamic compromise, difficult triggering, barotrauma. Treatment: reduce RR, TV, prolong expiration.' },
          { q:'Neuromuscular blocking agents (NMBA) in ARDS are used:', opts:['Routinely in all ventilated ARDS patients','For early severe ARDS (P/F below 150) to improve patient-ventilator synchrony and reduce O2 consumption â€” cisatracurium preferred'], ans:1, exp:'NMBA in ARDS: cisatracurium for 48 hours in moderate-severe ARDS (P/F below 150) may reduce ventilator days and mortality (ACURASYS trial). Requires adequate analgesia and sedation. Monitor train-of-four.' },
          { q:'Re-expansion pulmonary edema after large pleural effusion drainage occurs due to:', opts:['Infection of the pleural space','Rapid re-expansion of chronically collapsed lung causing capillary permeability injury â€” limit initial drainage to 1-1.5L'], ans:1, exp:'Re-expansion pulmonary edema: rapid drainage of large effusion causes sudden re-expansion â€” pulmonary capillary injury, unilateral pulmonary edema. Prevention: drain maximum 1-1.5L initially, then clamp 1 hour. Treat with O2, diuretics.' },
          { q:'Capnography (end-tidal CO2) monitoring in intubated patients confirms:', opts:['Oxygen delivery to tissues','ETT position (waveform confirms intratracheal placement), cardiac output during CPR, and ventilation adequacy'], ans:1, exp:'Capnography: EtCO2 waveform confirms ETT in trachea (absent in esophageal intubation). Low EtCO2 during CPR: poor cardiac output (less CO2 arriving at lungs). Continuous monitoring in all intubated patients.' }
            ]
          },
          {
            name: 'Respiratory V',
            questions: [
          { q:'Bronchodilator mechanisms: SABA vs LABA vs SAMA vs LAMA:', opts:['All work identically','SABA/LABA: beta-2 agonists (smooth muscle relaxation). SAMA/LAMA: muscarinic antagonists (block ACh bronchoconstriction). Different mechanisms, often combined'], ans:1, exp:'SABA (salbutamol): beta-2, onset 5-15 min, 4-6 hr. LABA (salmeterol, formoterol): beta-2, 12-24 hr. SAMA (ipratropium): muscarinic blocker, onset 15 min, 6-8 hr. LAMA (tiotropium): muscarinic, 24 hr. LABA+LAMA often combined.' },
          { q:'Salbutamol (albuterol) side effects include:', opts:['Bradycardia and hypertension','Tachycardia, tremor, hypokalemia (beta-2 drives K+ into cells), headache'], ans:1, exp:'Salbutamol side effects: tachycardia (beta-1 cross-reactivity), tremor (beta-2 skeletal muscle), hypokalemia (K+ shifts intracellularly via beta-2 stimulation), headache. High doses: paradoxical bronchospasm.' },
          { q:'Ipratropium (Atrovent) mechanism:', opts:['Beta-2 receptor agonism causing bronchodilation','Anticholinergic (muscarinic receptor antagonist) blocking ACh-mediated bronchoconstriction and mucus secretion'], ans:1, exp:'Ipratropium: quaternary ammonium anticholinergic, poorly absorbed (minimal systemic effects). Blocks M3 muscarinic receptors in airways. Used in COPD (first-line) and added to SABA in acute asthma. Onset 15-30 min.' },
          { q:'Venturi mask (controlled oxygen therapy) is preferred in COPD because:', opts:['It delivers the highest possible FiO2','It delivers precise, fixed FiO2 (24%, 28%, 31%, 35%, 40%, 60%) regardless of patient respiratory pattern'], ans:1, exp:'Venturi mask: entrains fixed amount of room air via Bernoulli effect (color-coded adapters). Delivers precise FiO2 independent of patient flow. Essential for COPD hypercapnic RF where controlled low-flow O2 is needed.' },
          { q:'Non-rebreather mask (NRB) delivers FiO2 of approximately:', opts:['24-28%','60-80% (or up to 90-100% if good seal and high flow)'], ans:1, exp:'Non-rebreather mask: reservoir bag + one-way valves prevent exhalation into reservoir. At 10-15 L/min: approximately 60-80% FiO2 (up to 90% if seal is perfect). For acute hypoxemia not requiring intubation (PE, pneumonia, CO poisoning).' },
          { q:'Simple face mask FiO2 range is approximately:', opts:['21% (room air) only','35-60% at 5-10 L/min (approximately 35% at 5L, 60% at 10L)'], ans:1, exp:'Simple face mask: 5-10 L/min delivers 35-60% FiO2. Minimum 5 L/min to prevent CO2 rebreathing. No reservoir bag. Less precise than Venturi. Intermediate oxygen delivery between nasal cannula and NRB.' },
          { q:'Spirometry interpretation â€” restrictive pattern shows:', opts:['Reduced FEV1/FVC ratio with normal FVC','Reduced FVC with normal or increased FEV1/FVC ratio'], ans:1, exp:'Restrictive pattern: FVC reduced, FEV1 reduced proportionally, FEV1/FVC normal or increased (above 0.70). Causes: pulmonary fibrosis, pleural disease, neuromuscular weakness, obesity, kyphoscoliosis. Total lung capacity reduced.' },
          { q:'CXR (chest X-ray) finding in pneumothorax shows:', opts:['Bilateral infiltrates in lower zones','Absence of lung markings at periphery and visible visceral pleural line (whitish line with no lung markings beyond it)'], ans:1, exp:'Pneumothorax CXR: visible visceral pleural line (thin white line), NO lung markings lateral to the line (airspace). Expiratory CXR enhances pneumothorax. Tension: tracheal shift, mediastinal deviation to opposite side.' },
          { q:'Pulse oximetry limitations include:', opts:['It accurately measures all hemoglobin types','Cannot distinguish carboxyhemoglobin (CO poisoning), methemoglobin, measures SpO2 not PaO2, inaccurate with poor perfusion or nail polish'], ans:1, exp:'SpO2 limitations: cannot distinguish COHb (CO poisoning â€” reads falsely high) or MetHb (methemoglobinemia), inaccurate in hypothermia/poor perfusion, dark nail polish (blue/black), motion artifact. Use ABG for definitive assessment.' },
          { q:'Bronchoscopy nursing pre-procedure care includes:', opts:['Full meal 2 hours before procedure','NPO 6-8 hours, remove dentures, baseline vitals and SpO2, IV access, consent, pre-medications (sedative, atropine)'], ans:1, exp:'Bronchoscopy prep: NPO 6-8 hours, remove dentures/jewelry, IV access (for sedation and emergency), baseline vital signs, consent, pre-medication (midazolam, atropine to dry secretions), topical anesthetic to airway.' },
          { q:'After bronchoscopy, patient should be:', opts:['Given full oral diet and fluids immediately','Kept NPO until gag reflex fully returns, monitored for hemoptysis, bronchospasm, pneumothorax (post-biopsy), fever'], ans:1, exp:'Post-bronchoscopy: NPO until gag reflex returns (local anesthetic effect â€” aspiration risk), monitor SpO2, watch for hemoptysis (normal: small streaks â€” report: large volume), pneumothorax if biopsy performed, vital signs monitoring.' },
          { q:'Postural drainage position for right lower lobe drainage:', opts:['Patient upright and leaning forward','Head of bed flat or lowered (Trendelenburg), patient on left side to allow right lower lobe to be uppermost â€” gravity drainage'], ans:1, exp:'Postural drainage: position target lung segment uppermost (gravity assists drainage). Right lower lobe: left lateral position with head down. Perform 15-20 min per position, followed by huffing/coughing and suctioning.' },
          { q:'High-frequency chest wall oscillation (HFCWO/vest therapy) is used for:', opts:['Acute asthma attacks','Airway clearance in cystic fibrosis, bronchiectasis, and neuromuscular disease patients with secretion retention'], ans:1, exp:'HFCWO (oscillating vest/ThAIRapy): delivers rapid oscillations to chest wall, loosening and mobilizing secretions. Used in CF, bronchiectasis, COPD with excess secretions, neuromuscular disease. Alternative to manual chest physiotherapy.' },
          { q:'N-acetylcysteine (NAC) in COPD and respiratory conditions works as:', opts:['Bronchodilator only','Mucolytic (cleaves disulfide bonds in mucus) and antioxidant â€” reduces sputum viscosity and may reduce exacerbations in COPD'], ans:1, exp:'NAC: breaks disulfide bonds in glycoprotein mucin chains reducing mucus viscosity. Also potent antioxidant (glutathione precursor). IV form: acetaminophen overdose antidote. Oral/nebulized: mucolytic in COPD, CF (limited evidence).' },
          { q:'Cough assist device (mechanical insufflation-exsufflation) is used for:', opts:['Any patient with a cough','Patients with neuromuscular disease (ALS, GBS, SCI) who cannot generate adequate cough flow to clear secretions'], ans:1, exp:'Cough assist (MI-E): applies positive pressure (insufflation) then quickly reverses to negative pressure (exsufflation) â€” simulates a cough in patients who cannot cough effectively. Essential in ALS, MG, GBS, spinal cord injuries (C4 and above).' },
          { q:'ABG interpretation step-by-step: ABG pH 7.50, PaCO2 30, HCO3 24 represents:', opts:['Respiratory acidosis','Uncompensated respiratory alkalosis (low CO2, normal HCO3, high pH)'], ans:1, exp:'pH above 7.45 = alkalosis. PaCO2 30 = low = CO2 blown off (respiratory cause of alkalosis). HCO3 24 = normal (not yet compensated). Diagnosis: uncompensated respiratory alkalosis. Causes: hyperventilation, anxiety, hypoxemia.' },
          { q:'Nebulized bronchodilator therapy technique includes:', opts:['Patient breathes shallowly through mouth throughout','Patient breathes normally (or slightly deeper) through mouthpiece, device held upright, treatment until solution is gone'], ans:1, exp:'Nebulizer technique: mouthpiece preferred (better drug deposition vs face mask â€” reduces nasal filtering). Hold upright (not tilted). Normal breathing or slow deep breaths. Treatment ends when nebulizer sputters (5-10 min). Rinse mouth after corticosteroid.' },
          { q:'Lung function testing FEV1 measures:', opts:['Total amount of air in the lungs after maximum inhalation','Volume of air exhaled in the first second of a forced expiration from full inspiration (forced expiratory volume in 1 second)'], ans:1, exp:'FEV1: volume exhaled in first second of maximal forced expiration. Reflects large and medium airway caliber. Reduced in obstructive disease (COPD, asthma) and moderately reduced in restriction. Best predictor of COPD prognosis and severity.' },
          { q:'Respiratory nursing documentation should include:', opts:['Respiratory rate only','Rate, rhythm, depth, symmetry of chest movement, use of accessory muscles, breath sounds, SpO2, cough characteristics, sputum (color, consistency, amount), O2 delivery and FiO2'], ans:1, exp:'Comprehensive respiratory assessment documentation: respiratory rate (normal 12-20), rhythm (regular/irregular), depth (shallow/normal/deep), symmetry, accessory muscle use, auscultation findings (location, type of sounds), SpO2, O2 delivery method, cough/sputum characteristics.' }
            ]
          }
        ]
      }
    ];
    let SECTIONS = [];

    // ── State ──────────────────────────────────────────────────
    let state = {};

    function resetState(catIdx) {
        const singleCat = (catIdx !== undefined && catIdx !== null && catIdx >= 0);
        if (singleCat) {
            const cat = CATEGORIES[catIdx];
            SECTIONS = cat.sections.map(sec => ({ ...sec, icon: cat.icon, color: cat.color }));
        } else {
            SECTIONS = CATEGORIES.flatMap(cat =>
                cat.sections.map(sec => ({ ...sec, icon: cat.icon, color: cat.color }))
            );
        }
        state = {
            currentSection:  0,
            currentQuestion: 0,
            selectedCategory: singleCat ? catIdx : null,
            sectionStates:   SECTIONS.map(() => 'active'),
            answers:        SECTIONS.map(sec => Array(sec.questions.length).fill(null)),
            sectionResults: SECTIONS.map(() => null),
            chartInstances: {}
        };
    }

    // ── DOM refs ───────────────────────────────────────────────
    const screenWelcome  = document.getElementById('mts-welcome');
    const screenExam     = document.getElementById('mts-exam');
    const screenResults  = document.getElementById('mts-results');
    const tabsScroll     = document.getElementById('mts-tabs-scroll');
    const qCounter       = document.getElementById('mts-q-counter');
    const sectionBadge   = document.getElementById('mts-section-badge');
    const progressFill   = document.getElementById('mts-progress-fill');
    const qNum           = document.getElementById('mts-q-num');
    const qText          = document.getElementById('mts-q-text');
    const optionsWrap    = document.getElementById('mts-options');
    const submitBtn      = document.getElementById('mts-submit-btn');
    const feedbackCard   = document.getElementById('mts-feedback-card');
    const feedbackResult = document.getElementById('mts-feedback-result');
    const correctReveal  = document.getElementById('mts-correct-reveal');
    const explanationEl  = document.getElementById('mts-explanation');
    const navBar         = document.getElementById('mts-nav-bar');
    const prevBtn        = document.getElementById('mts-prev-btn');
    const nextBtn        = document.getElementById('mts-next-btn');
    const navCenter      = document.getElementById('mts-nav-center');
    const sectionDone    = document.getElementById('mts-section-done');
    const doneTitle      = document.getElementById('mts-done-title');
    const doneStats      = document.getElementById('mts-done-stats');
    const nextSectionBtn = document.getElementById('mts-next-section-btn');
    const scAnswered     = document.getElementById('sc-answered');
    const scCorrect      = document.getElementById('sc-correct');
    const scWrong        = document.getElementById('sc-wrong');
    const scScore        = document.getElementById('sc-score');
    const scAccuracy     = document.getElementById('sc-accuracy');
    const scAccFill      = document.getElementById('sc-acc-fill');
    const scoreSection   = document.getElementById('mts-score-section');
    const sectionsMini   = document.getElementById('mts-sections-mini');

    // ── Utility ────────────────────────────────────────────────
    function show(el)  { if (el) el.classList.remove('mts-hidden'); }
    function hide(el)  { if (el) el.classList.add('mts-hidden');    }
    function showScreen(name) {
        [screenWelcome, screenExam, screenResults].forEach(s => { if (s) s.classList.add('mts-hidden'); });
        const target = { welcome: screenWelcome, exam: screenExam, results: screenResults }[name];
        if (target) target.classList.remove('mts-hidden');
    }

    let pendingCatIdx = null;

    // ── Category Nav (left panel) ───────────────────────────────
    function buildCatNav() {
        const catNav = document.getElementById('mts-cat-nav');
        if (!catNav) return;
        catNav.innerHTML = CATEGORIES.map((cat, i) => {
            const isActive = i === state.selectedCategory;
            return `<button class="mts-left-cat${isActive ? ' mts-left-cat-active' : ''}" data-cat-idx="${i}" style="--cat-col:${cat.color}">
                <i class="fa-solid ${cat.icon}"></i>
                <span>${cat.name}</span>
            </button>`;
        }).join('');
        catNav.querySelectorAll('.mts-left-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.catIdx);
                if (idx === state.selectedCategory) return;
                pendingCatIdx = idx;
                openCatConfirm();
            });
        });
    }

    // ── Tabs ───────────────────────────────────────────────────
    function buildTabs() {
        if (!tabsScroll) return;
        tabsScroll.innerHTML = SECTIONS.map((sec, i) => {
            const ans = state.answers[i];
            const answered = ans.filter(a => a !== null).length;
            const allDone = answered === sec.questions.length;
            const isCurrent = i === state.currentSection;

            let cls = 'mts-tab';
            let icon = '';
            if (isCurrent)    { cls += ' mts-tab-active'; icon = '<i class="fa-solid fa-circle-dot"></i> '; }
            else if (allDone) { cls += ' mts-tab-done';   icon = '<i class="fa-solid fa-check"></i> '; }

            const scoreEl = answered > 0
                ? `<span class="mts-tab-score">${answered}/${sec.questions.length}</span>`
                : '';
            return `<button class="${cls}" data-sec="${i}"><span>${icon}Section ${i + 1}</span>${scoreEl}</button>`;
        }).join('');
        tabsScroll.querySelectorAll('.mts-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentSection  = parseInt(btn.dataset.sec);
                state.currentQuestion = 0;
                renderQuestion();
            });
        });
    }

    // ── Score panel ────────────────────────────────────────────
    function updateScorePanel() {
        const sec = state.currentSection;
        const ans = state.answers[sec];
        const answered = ans.filter(a => a !== null).length;
        const correct  = ans.filter(a => a && a.correct).length;
        const wrong    = answered - correct;
        const acc      = answered > 0 ? Math.round(correct / answered * 100) : 0;

        if (scAnswered) scAnswered.textContent = answered;
        if (scCorrect)  scCorrect.textContent  = correct;
        if (scWrong)    scWrong.textContent     = wrong;
        if (scScore)    scScore.textContent     = correct;
        if (scAccuracy) scAccuracy.textContent  = acc + '%';
        if (scAccFill)  scAccFill.style.width   = acc + '%';
        if (scoreSection) scoreSection.textContent = 'Section ' + (sec + 1);

        if (sectionsMini) {
            sectionsMini.innerHTML = SECTIONS.map((s, i) => {
                const ans = state.answers[i];
                const answered = ans.filter(a => a !== null).length;
                const allDone = answered === s.questions.length;
                const isCurrent = i === sec;
                const correctCount = ans.filter(a => a && a.correct).length;

                let cls = 'mts-mini-section';
                if (isCurrent)    { cls += ' mts-mini-active'; }
                else if (allDone) { cls += ' mts-mini-done'; }

                let right = '';
                if (isCurrent) {
                    right = `${answered}/${s.questions.length}`;
                } else if (answered > 0) {
                    right = `<span class="mts-mini-score">${correctCount}✓ &nbsp;${answered}/${s.questions.length}</span>`;
                } else {
                    right = '<span style="opacity:0.4;font-size:0.72rem">Not started</span>';
                }
                return `<div class="${cls}" data-jump-sec="${i}"><span>Section ${i + 1}</span>${right}</div>`;
            }).join('');
            sectionsMini.querySelectorAll('[data-jump-sec]').forEach(row => {
                row.addEventListener('click', () => {
                    state.currentSection  = parseInt(row.dataset.jumpSec);
                    state.currentQuestion = 0;
                    renderQuestion();
                });
            });
        }
    }

    // ── Render question ────────────────────────────────────────
    function renderQuestion() {
        const sec = state.currentSection;
        const qi  = state.currentQuestion;
        const q   = SECTIONS[sec].questions[qi];
        const existing = state.answers[sec][qi];
        const answered = existing !== null;

        show(document.getElementById('mts-question-card'));
        hide(sectionDone);

        if (qNum)     qNum.textContent      = `Q${qi + 1}.`;
        if (qText)    qText.textContent     = q.q;
        if (qCounter) qCounter.textContent  = `Question ${qi + 1} of ${SECTIONS[sec].questions.length}`;
        if (sectionBadge) sectionBadge.textContent = 'Section ' + (sec + 1);
        if (progressFill) progressFill.style.width = ((qi + (answered ? 1 : 0)) / SECTIONS[sec].questions.length * 100) + '%';

        // Build options
        if (optionsWrap) {
            optionsWrap.innerHTML = q.opts.map((opt, idx) => {
                let cls = 'mts-option';
                if (answered) {
                    if (idx === q.ans)               cls += ' mts-opt-correct';
                    else if (idx === existing.selected) cls += ' mts-opt-wrong';
                }
                const disabled = answered ? 'disabled' : '';
                return `<button class="${cls}" data-idx="${idx}" ${disabled}>
                    <span class="mts-opt-key">${String.fromCharCode(65+idx)}</span>${opt}
                </button>`;
            }).join('');

            if (!answered) {
                optionsWrap.querySelectorAll('.mts-option').forEach(btn => {
                    btn.addEventListener('click', () => {
                        optionsWrap.querySelectorAll('.mts-option').forEach(b => b.classList.remove('mts-opt-selected'));
                        btn.classList.add('mts-opt-selected');
                        if (submitBtn) submitBtn.disabled = false;
                    });
                });
            }
        }

        // Submit button — always disabled until an option is selected
        if (submitBtn) {
            submitBtn.disabled = true;
            if (answered) hide(submitBtn); else show(submitBtn);
        }

        // Feedback
        if (answered) {
            showFeedback(sec, qi, existing.selected);
            show(navBar);
            updateNavButtons(sec, qi);
        } else {
            hide(feedbackCard);
            hide(navBar);
        }

        buildCatNav();
        buildTabs();
        updateScorePanel();
    }

    // ── Show feedback ──────────────────────────────────────────
    function showFeedback(sec, qi, selected) {
        const q = SECTIONS[sec].questions[qi];
        const isCorrect = selected === q.ans;

        show(feedbackCard);
        if (feedbackResult) {
            feedbackResult.className = 'mts-feedback-result ' + (isCorrect ? 'mts-correct' : 'mts-wrong');
            feedbackResult.innerHTML = isCorrect
                ? '<i class="fa-solid fa-circle-check"></i> Correct Answer! +1 Mark Awarded'
                : '<i class="fa-solid fa-circle-xmark"></i> Incorrect Answer';
        }
        if (!isCorrect && correctReveal) {
            show(correctReveal);
            correctReveal.innerHTML = `<strong>Correct Answer:</strong> ${q.opts[q.ans]}`;
        } else if (correctReveal) {
            hide(correctReveal);
        }
        if (explanationEl) {
            explanationEl.innerHTML = `<strong>Explanation:</strong> ${q.exp}`;
        }
    }

    // ── Nav buttons ────────────────────────────────────────────
    function updateNavButtons(sec, qi) {
        if (prevBtn) prevBtn.style.visibility = qi > 0 ? 'visible' : 'hidden';
        if (nextBtn) {
            nextBtn.innerHTML = 'Next <i class="fa-solid fa-chevron-right"></i>';
            nextBtn.className = 'mts-nav-btn mts-btn-cyan';
            nextBtn.disabled = (qi >= SECTIONS[sec].questions.length - 1);
        }
        if (navCenter) {
            const secAns = state.answers[sec].filter(a => a !== null).length;
            navCenter.textContent = `${secAns} / ${SECTIONS[sec].questions.length} answered`;
        }
    }

    // ── Submit answer ──────────────────────────────────────────
    function submitAnswer() {
        const selected = optionsWrap ? optionsWrap.querySelector('.mts-opt-selected') : null;
        if (!selected) return;
        const sec = state.currentSection;
        const qi  = state.currentQuestion;
        const selectedIdx = parseInt(selected.dataset.idx);
        const isCorrect   = selectedIdx === SECTIONS[sec].questions[qi].ans;

        state.answers[sec][qi] = { selected: selectedIdx, correct: isCorrect };
        hide(submitBtn);
        renderQuestion();
    }

    // ── Complete section (saves results; no longer blocks navigation) ─────
    function completeSection() {
        const sec = state.currentSection;
        const ans = state.answers[sec];
        const correct = ans.filter(a => a && a.correct).length;
        const wrong   = ans.filter(a => a && !a.correct).length;
        state.sectionResults[sec] = { correct, wrong, score: correct };
        buildCatNav();
        buildTabs();
        updateScorePanel();
    }

    // ── Results screen ─────────────────────────────────────────
    function showResults() {
        showScreen('results');

        // Compute results from answers (all attempted sections)
        const attempted = SECTIONS.map((sec, i) => {
            const ans = state.answers[i];
            const answered = ans.filter(a => a !== null).length;
            if (answered === 0) return null;
            const correct = ans.filter(a => a && a.correct).length;
            const wrong   = answered - correct;
            return { i, r: { correct, wrong, score: correct } };
        }).filter(Boolean);
        const totalQs    = attempted.reduce((sum, {i}) => sum + SECTIONS[i].questions.length, 0);
        const totCorrect = attempted.reduce((s, {r}) => s + r.correct, 0);
        const totWrong   = attempted.reduce((s, {r}) => s + r.wrong, 0);
        const totalScore = totCorrect;
        const pct        = totalQs > 0 ? Math.round(totCorrect / totalQs * 100) : 0;
        const passed     = pct >= 60;

        const subEl = document.getElementById('mts-results-sub');
        if (subEl) subEl.textContent = `Score: ${totalScore}/${totalQs} · ${pct}% · ${passed ? '✅ PASS' : '❌ NEEDS IMPROVEMENT'}`;

        // Section scores — only attempted sections
        const secScoresEl = document.getElementById('mts-section-scores');
        if (secScoresEl) {
            secScoresEl.innerHTML = attempted.map(({i, r}) => {
                const pctW = Math.round(r.correct / SECTIONS[i].questions.length * 100);
                return `<div class="mts-sec-score-row">
                    <span class="mts-sec-score-label">${SECTIONS[i].name}</span>
                    <div class="mts-sec-score-bar-wrap"><div class="mts-sec-score-bar" style="width:0%" data-target="${pctW}"></div></div>
                    <span class="mts-sec-score-val">${r.correct}/${SECTIONS[i].questions.length}</span>
                </div>`;
            }).join('');
            setTimeout(() => {
                secScoresEl.querySelectorAll('.mts-sec-score-bar').forEach(b => {
                    b.style.width = b.dataset.target + '%';
                });
            }, 100);
        }

        // Total row
        const totEl = document.getElementById('mts-total-score-row');
        if (totEl) {
            totEl.innerHTML = `<span class="mts-total-score-left">Total Score</span>
                <span class="mts-total-score-right">${totalScore} / ${totalQs} &nbsp;·&nbsp; ${pct}%</span>`;
        }

        // Analytics
        const scores = attempted.map(({i, r}) => ({ i, correct: r.correct }));
        const best   = scores.reduce((a, b) => b.correct > a.correct ? b : a, scores[0]);
        const worst  = scores.reduce((a, b) => b.correct < a.correct ? b : a, scores[0]);
        const anaEl  = document.getElementById('mts-analytics-grid');
        if (anaEl) {
            anaEl.innerHTML = [
                ['Accuracy', pct + '%', passed ? 'Pass' : 'Below 60%'],
                ['Total Correct', totCorrect, `of ${totalQs}`],
                ['Total Wrong', totWrong, `of ${totalQs}`],
                ...(scores.length > 1 ? [
                    ['Strongest', SECTIONS[best.i].name, `${best.correct}/${SECTIONS[best.i].questions.length}`],
                    ['Weakest',   SECTIONS[worst.i].name, `${worst.correct}/${SECTIONS[worst.i].questions.length}`]
                ] : []),
                ['Status', passed ? 'PASS' : 'FAIL', '']
            ].map(([lbl, val, sub]) =>
                `<div class="mts-analytic-item">
                    <div class="mts-analytic-label">${lbl}</div>
                    <div class="mts-analytic-val">${val}</div>
                    ${sub ? `<div class="mts-analytic-sub">${sub}</div>` : ''}
                </div>`
            ).join('');
        }

        // Charts
        buildCharts(totCorrect, totWrong, scores, totalQs);

        // Question review
        buildReviewList('all');
        const filterBtns = document.querySelectorAll('.mts-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('mts-filter-active'));
                btn.classList.add('mts-filter-active');
                buildReviewList(btn.dataset.filter);
            });
        });
    }

    // ── Charts ─────────────────────────────────────────────────
    function buildCharts(totCorrect, totWrong, scores, totalQs) {
        if (typeof Chart === 'undefined') return;

        Object.values(state.chartInstances).forEach(c => { try { c.destroy(); } catch(e) {} });
        state.chartInstances = {};

        // Donut
        const donutCtx = document.getElementById('mts-donut-chart');
        if (donutCtx) {
            state.chartInstances.donut = new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Correct', 'Wrong'],
                    datasets: [{ data: [totCorrect, totWrong], backgroundColor: ['#06b6d4','#f43f5e'], borderWidth: 0, hoverOffset: 6 }]
                },
                options: {
                    cutout: '68%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}` } } },
                    animation: { animateRotate: true, duration: 1000 }
                }
            });
        }
        const centerEl = document.getElementById('mts-donut-center');
        if (centerEl) {
            const pct = totalQs > 0 ? Math.round(totCorrect / totalQs * 100) : 0;
            centerEl.innerHTML = `<strong>${pct}%</strong><span>Accuracy</span>`;
        }
        const legendEl = document.getElementById('mts-donut-legend');
        if (legendEl) {
            legendEl.innerHTML = [['#06b6d4','Correct', totCorrect], ['#f43f5e','Wrong', totWrong]].map(([c, lbl, val]) =>
                `<div class="mts-donut-legend-item"><div class="mts-legend-dot" style="background:${c}"></div>${lbl}: ${val}</div>`
            ).join('');
        }

        // Bar
        const barCtx = document.getElementById('mts-bar-chart');
        if (barCtx) {
            const maxQs = Math.max(...scores.map(s => SECTIONS[s.i].questions.length));
            state.chartInstances.bar = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: scores.map(s => SECTIONS[s.i].name.split(' ')[0]),
                    datasets: [{
                        data: scores.map(s => s.correct),
                        backgroundColor: scores.map((s, i) => ['#06b6d4','#3b82f6','#7c3aed','#14b8a6','#f59e0b'][i]),
                        borderRadius: 8, borderSkipped: false
                    }]
                },
                options: {
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` Score: ${ctx.raw}/${SECTIONS[scores[ctx.dataIndex].i].questions.length}` } } },
                    scales: {
                        y: { min: 0, max: maxQs, ticks: { stepSize: Math.ceil(maxQs / 5), font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
                        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
                    },
                    animation: { duration: 800 }
                }
            });
        }
    }

    // ── Question review ────────────────────────────────────────
    function buildReviewList(filter) {
        const listEl = document.getElementById('mts-review-list');
        if (!listEl) return;
        let items = [];
        SECTIONS.forEach((sec, si) => {
            sec.questions.forEach((q, qi) => {
                const ans = state.answers[si][qi];
                if (!ans) return;
                const isCorrect = ans.correct;
                if (filter === 'correct' && !isCorrect) return;
                if (filter === 'wrong'   && isCorrect)  return;
                items.push({ si, qi, q, ans, isCorrect });
            });
        });
        listEl.innerHTML = items.map(({ si, qi, q, ans, isCorrect }) => `
            <div class="mts-review-item ${isCorrect ? 'mts-rev-correct' : 'mts-rev-wrong'}">
                <div class="mts-review-q">S${si+1} Q${qi+1}: ${q.q}</div>
                <div class="mts-review-answers">
                    <div class="mts-review-row">
                        <span class="mts-review-row-label">Your Ans</span>
                        <span class="mts-review-row-val ${isCorrect ? 'mts-val-correct' : 'mts-val-wrong'}">${q.opts[ans.selected]}</span>
                    </div>
                    ${!isCorrect ? `<div class="mts-review-row"><span class="mts-review-row-label">Correct</span><span class="mts-review-row-val mts-val-correct">${q.opts[q.ans]}</span></div>` : ''}
                </div>
                <span class="mts-review-status ${isCorrect ? 'mts-status-correct' : 'mts-status-wrong'}">${isCorrect ? '✓ Correct' : '✗ Wrong'}</span>
            </div>`
        ).join('') || '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:0.85rem;">No questions to show.</div>';
    }

    // ── Retest ─────────────────────────────────────────────────
    function retest() {
        if (screenResults) screenResults.classList.add('mts-hidden');
        if (screenExam)    screenExam.classList.add('mts-hidden');
        if (screenWelcome) screenWelcome.classList.remove('mts-hidden');
    }

    // ── Category selection (welcome screen) ────────────────────
    let selectedCatIdx = 0;
    const catGrid = document.getElementById('mts-cat-grid');
    if (catGrid) {
        catGrid.querySelectorAll('.mts-cat-card').forEach(card => {
            card.addEventListener('click', () => {
                catGrid.querySelectorAll('.mts-cat-card').forEach(c => c.classList.remove('mts-cat-active'));
                card.classList.add('mts-cat-active');
                selectedCatIdx = parseInt(card.dataset.cat);
            });
        });
    }

    // ── Wire events ────────────────────────────────────────────
    const startBtn = document.getElementById('mts-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => {
        resetState(selectedCatIdx);
        showScreen('exam');
        renderQuestion();
    });

    if (submitBtn) submitBtn.addEventListener('click', submitAnswer);

    if (prevBtn) prevBtn.addEventListener('click', () => {
        if (state.currentQuestion > 0) {
            state.currentQuestion--;
            renderQuestion();
        }
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (state.currentQuestion < SECTIONS[state.currentSection].questions.length - 1) {
            state.currentQuestion++;
            renderQuestion();
        }
    });

    if (nextSectionBtn) nextSectionBtn.addEventListener('click', () => {
        const next = state.currentSection + 1;
        if (next >= SECTIONS.length) {
            showResults();
        } else {
            state.currentSection  = next;
            state.currentQuestion = 0;
            renderQuestion();
        }
    });

    const retestBtn  = document.getElementById('mts-retest-btn');
    if (retestBtn) retestBtn.addEventListener('click', retest);

    // Exit button — show confirm modal
    const exitBtn         = document.getElementById('mts-exit-btn');
    const exitModal       = document.getElementById('mts-exit-modal');
    const exitCancelBtn   = document.getElementById('mts-exit-cancel-btn');
    const exitConfirmBtn  = document.getElementById('mts-exit-confirm-btn');

    function openExitModal()  { if (exitModal) exitModal.classList.remove('mts-hidden'); }
    function closeExitModal() { if (exitModal) exitModal.classList.add('mts-hidden'); }

    if (exitBtn)        exitBtn.addEventListener('click', openExitModal);
    if (exitCancelBtn)  exitCancelBtn.addEventListener('click', closeExitModal);
    if (exitConfirmBtn) exitConfirmBtn.addEventListener('click', () => {
        closeExitModal();
        retest();
    });
    // Close on backdrop click
    if (exitModal) exitModal.addEventListener('click', (e) => {
        if (e.target === exitModal) closeExitModal();
    });

    // ── Category switch confirmation (from left nav) ────────────
    const catConfirmModal = document.getElementById('mts-cat-confirm-modal');
    const catCancelBtn    = document.getElementById('mts-cat-cancel-btn');
    const catConfirmBtn   = document.getElementById('mts-cat-confirm-btn');

    function openCatConfirm()  { if (catConfirmModal) catConfirmModal.classList.remove('mts-hidden'); }
    function closeCatConfirm() { if (catConfirmModal) catConfirmModal.classList.add('mts-hidden'); }

    if (catCancelBtn) catCancelBtn.addEventListener('click', () => { pendingCatIdx = null; closeCatConfirm(); });
    if (catConfirmBtn) catConfirmBtn.addEventListener('click', () => {
        if (pendingCatIdx !== null) {
            selectedCatIdx = pendingCatIdx;
            const idx = pendingCatIdx;
            pendingCatIdx = null;
            closeCatConfirm();
            resetState(idx);
            showScreen('exam');
            renderQuestion();
        }
    });
    if (catConfirmModal) catConfirmModal.addEventListener('click', e => {
        if (e.target === catConfirmModal) { pendingCatIdx = null; closeCatConfirm(); }
    });

    // Init: disable submit until option selected
    if (submitBtn) submitBtn.disabled = true;
}

// ===========================================
// HOW TO PREPARE — Accordion
// Hover on desktop, click on touch devices
// ===========================================
function initPrepareAccordion() {
    const steps = document.querySelectorAll('.prepare-timeline .prepare-step');
    if (!steps.length) return;

    const isTouch = () => window.matchMedia('(hover: none)').matches;
    let openStep = null;

    function open(step) {
        if (openStep && openStep !== step) close(openStep);
        step.classList.add('is-open');
        step.setAttribute('aria-expanded', 'true');
        openStep = step;
    }

    function close(step) {
        step.classList.remove('is-open');
        step.setAttribute('aria-expanded', 'false');
        if (openStep === step) openStep = null;
    }

    function toggle(step) {
        step.classList.contains('is-open') ? close(step) : open(step);
    }

    steps.forEach(step => {
        // Desktop: hover
        step.addEventListener('mouseenter', () => {
            if (!isTouch()) open(step);
        });
        step.addEventListener('mouseleave', () => {
            if (!isTouch()) close(step);
        });

        // Touch: click/tap
        step.addEventListener('click', () => {
            if (isTouch()) toggle(step);
        });

        // Keyboard: Enter / Space always works
        step.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(step);
            }
        });
    });
}

// ===========================================
// SYLLABUS TAB EXPLORER
// ===========================================
function initSyllabusTabs() {
    const tabs = document.querySelectorAll('.syl-tab');
    const panels = document.querySelectorAll('.syl-panel');
    if (!tabs.length) return;

    function activateTab(tab) {
        const target = tab.dataset.tab;

        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');

        panels.forEach(p => {
            p.classList.remove('active', 'entering');
        });
        const panel = document.getElementById(`syl-panel-${target}`);
        if (panel) {
            panel.classList.add('active');
            void panel.offsetWidth; // force reflow to restart animation
            panel.classList.add('entering');
        }
    }

    tabs.forEach((tab, idx) => {
        tab.setAttribute('tabindex', idx === 0 ? '0' : '-1');
        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', (e) => {
            const arr = Array.from(tabs);
            const i = arr.indexOf(tab);
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const next = arr[(i + 1) % arr.length];
                next.focus();
                activateTab(next);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = arr[(i - 1 + arr.length) % arr.length];
                prev.focus();
                activateTab(prev);
            } else if (e.key === 'Home') {
                e.preventDefault();
                arr[0].focus();
                activateTab(arr[0]);
            } else if (e.key === 'End') {
                e.preventDefault();
                arr[arr.length - 1].focus();
                activateTab(arr[arr.length - 1]);
            }
        });
    });

    // Trigger entrance animation on first panel
    const firstPanel = document.querySelector('.syl-panel.active');
    if (firstPanel) {
        void firstPanel.offsetWidth;
        firstPanel.classList.add('entering');
    }
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
        if (!track) return;

        const cards = Array.from(track.children);
        const totalCards = cards.length;
        if (totalCards === 0) return;
        const visibleCount = 2;
        const autoplayDelay = parseInt(viewport.dataset.autoplay) || 8000;
        const transitionDuration = '1s cubic-bezier(0.25, 1, 0.5, 1)';

        let currentSlide = 0;
        let interval = null;
        let isPaused = false;
        let isCardExpanded = false;
        let wheelLocked = false;
        const totalSlides = Math.ceil(totalCards / visibleCount);

        function goToSlide(index, smooth = true) {
            if (index >= totalSlides) index = 0;
            if (index < 0) index = totalSlides - 1;
            currentSlide = index;
            const cardHeight = cards[0] ? cards[0].offsetHeight : 180;
            const gap = 16;
            const offset = currentSlide * (cardHeight * visibleCount + gap * visibleCount);
            track.style.transition = smooth ? `transform ${transitionDuration}` : 'none';
            track.style.transform = `translateY(-${offset}px)`;
            updateDots();
            updateActiveCards();
        }

        function next() { goToSlide(currentSlide + 1); }
        function prev() { goToSlide(currentSlide - 1); }

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
            dotsContainer.innerHTML = ''; // clear any stale dots from prior init
            dotsContainer.classList.add('vertical-dots');
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('div');
                dot.className = 'vdot' + (i === 0 ? ' active' : '');
                dot.dataset.index = i;
                dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); });
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            if (!dotsContainer) return;
            dotsContainer.querySelectorAll('.vdot').forEach((d, i) => {
                d.classList.toggle('active', i === currentSlide);
            });
        }

        // --- Autoplay (independent per viewport) ---
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

        // --- Hover pause (only this column) ---
        viewport.addEventListener('mouseenter', () => { isPaused = true; });
        viewport.addEventListener('mouseleave', () => { isPaused = false; });

        // --- Mouse wheel with debounce (only this column) ---
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (wheelLocked) return;
            wheelLocked = true;
            if (e.deltaY > 0) next();
            else prev();
            resetAutoplay();
            setTimeout(() => { wheelLocked = false; }, 900);
        }, { passive: false });

        // --- Touch swipe (only this column) ---
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

        // --- Keyboard navigation (only when focused) ---
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
            const newFront = front.cloneNode(true);
            front.parentNode.replaceChild(newFront, front);
            newFront.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');
                ageCards.forEach(c => c.classList.remove('expanded'));
                if (!isExpanded) {
                    card.classList.add('expanded');
                    isCardExpanded = true;
                } else {
                    isCardExpanded = false;
                }
            });
        });

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
    const cards      = Array.from(section.querySelectorAll('.journey-card'));
    const progressFill   = document.getElementById('journey-progress-fill');
    const counterCurrent = document.getElementById('journey-current');
    const prevBtn = document.getElementById('journey-prev');
    const nextBtn = document.getElementById('journey-next');
    if (!milestones.length || !cards.length) return;

    const totalSteps = milestones.length;
    let currentStep = -1; // -1 forces first activate(0) to run fully

    function activate(index) {
        if (index < 0 || index >= totalSteps || index === currentStep) return;
        currentStep = index;

        // Milestones
        milestones.forEach((m, i) => m.classList.toggle('active', i === index));

        // Exit all cards, then force a reflow so the entrance transition fires from opacity:0
        cards.forEach(c => c.classList.remove('active'));
        const nextCard = cards[index];
        if (nextCard) {
            void nextCard.offsetWidth; // flush style so transition starts from hidden state
            nextCard.classList.add('active');
        }

        // Progress bar
        const pct = totalSteps > 1 ? (index / (totalSteps - 1)) * 100 : 100;
        if (progressFill) progressFill.style.width = pct + '%';

        // Counter
        if (counterCurrent) counterCurrent.textContent = index + 1;

        // Button states
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === totalSteps - 1;

        // Scroll milestone into view only on small screens
        if (milestones[index] && window.innerWidth <= 768) {
            milestones[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // Milestone clicks
    milestones.forEach((m, i) => m.addEventListener('click', () => activate(i)));

    // Nav buttons
    if (prevBtn) prevBtn.addEventListener('click', () => activate(currentStep - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => activate(currentStep + 1));

    // Keyboard
    section.setAttribute('tabindex', '0');
    section.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    { e.preventDefault(); activate(currentStep - 1); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { e.preventDefault(); activate(currentStep + 1); }
    });

    // Swipe on roadmap
    const roadmap = section.querySelector('.journey-roadmap');
    if (roadmap) {
        let touchStartX = 0;
        roadmap.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        roadmap.addEventListener('touchend',   (e) => {
            const delta = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(delta) > 40) activate(delta < 0 ? currentStep + 1 : currentStep - 1);
        }, { passive: true });
    }

    // Swipe on detail cards area too
    const detailCards = section.querySelector('.journey-detail-cards');
    if (detailCards) {
        let touchStartX = 0;
        detailCards.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        detailCards.addEventListener('touchend',   (e) => {
            const delta = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(delta) > 40) activate(delta < 0 ? currentStep + 1 : currentStep - 1);
        }, { passive: true });
    }

    activate(0);
}


 // 2. Faculty Data Pool (Replaces Alumni Pool for Fade-in Grid)
    const facultyPool = [
        // Batch 1
        { name: "Shine Stephen", role: "Asst. Professor (Ex-AIIMS)", badge: "MSc (N)", icon: '<i class="fa-solid fa-trophy"></i>', desc: "A PGIMER & INC-WHO PhD Scholar, former AIIMS faculty, and multi-rank holder in KPSC exams.", img: "assets/images/faculties/SHINE.png" },
        { name: "Nayana Shaji", role: "M Pharm Pharmacology", badge: "GPAT Ranker", icon: '<i class="fa-solid fa-award"></i>', desc: "A GPAT Ranker and distinction holder across various Kerala & Central competitive pharmacy exams.", img: "assets/images/faculties/NAYANA.jpeg" },
        { name: "Vidhu R Vijayan", role: "MSc Nursing (Orthopedic)", badge: "NCLEX RN", icon: '<i class="fa-solid fa-stethoscope"></i>', desc: "An Orthopedic Nursing specialist who successfully passed the international NCLEX RN certification.", img: "assets/images/faculties/VIDHU.JPG.jpeg" },
        // Batch 2
        { name: "Honey Mol P. V", role: "MSc Molecular Biology", badge: "Distinction", icon: '<i class="fa-solid fa-dna"></i>', desc: "A Molecular Biology distinction holder and proven rank holder in Kerala PSC state recruitment.", img: "assets/images/faculties/HONEY.JPG.jpeg" },
        { name: "Sreelekshmi E. M", role: "MSc Microbiology", badge: "2nd Rank", icon: '<i class="fa-solid fa-microscope"></i>', desc: "Achieved 2nd Rank in state-level health recruitment for Microbiology specialists.", img: "assets/images/faculties/SREELEKSHMI.jpeg" },
        { name: "Arathy Surendran", role: "MSc Nursing (Pediatrics)", badge: "KUHS Scholar", icon: '<i class="fa-solid fa-baby"></i>', desc: "A Pediatrics Nursing scholar from KUHS and a recognized Kerala PSC nursing rank holder.", img: "assets/images/faculties/ARATHY.JPG.jpeg" },
        // Batch 3
        { name: "Aparna T. M", role: "M Pharm - KUHS", badge: "1st Rank", icon: '<i class="fa-solid fa-capsules"></i>', desc: "A distinguished M Pharm professional and 1st Rank holder in the KUHS pharmacy boards.", img: "assets/images/faculties/APARNA.jpeg" },
        { name: "Dr. Manjima G. S", role: "Doctor of Pharmacy (PharmD)", badge: "Int'l Scholar", icon: '<i class="fa-solid fa-globe"></i>', desc: "Awarded an International Scholarship for MSc Pharmacology in the UK after completing PharmD.", img: "assets/images/faculties/MANJIMA.jpeg" },
        { name: "Jesna Prasad", role: "BSc Nursing", badge: "German B2", icon: '<i class="fa-solid fa-language"></i>', desc: "A BSc Nurse with German A1-B2 proficiency, expert in guiding global migration for healthcare.", img: "assets/images/faculties/JESNA.JPG.jpeg" },
        // Batch 4 (Cycling back with Top Faculty to keep 3 cards)
        { name: "Jeethu Paul", role: "MSc Nursing (Pediatric)", badge: "KPSC Ranker", icon: '<i class="fa-solid fa-user-nurse"></i>', desc: "A specialized Pediatric Nurse with consistent ranking records in various Kerala PSC exams.", img: "assets/images/faculties/JEETHU.JPG.jpeg" },
        { name: "Shine Stephen", role: "Asst. Professor (Ex-AIIMS)", badge: "MSc (N)", icon: '<i class="fa-solid fa-trophy"></i>', desc: "A PGIMER & INC-WHO PhD Scholar, former AIIMS faculty, and multi-rank holder in KPSC exams.", img: "assets/images/faculties/SHINE.png" },
        { name: "Nayana Shaji", role: "M Pharm Pharmacology", badge: "GPAT Ranker", icon: '<i class="fa-solid fa-award"></i>', desc: "A GPAT Ranker and distinction holder across various Kerala & Central competitive pharmacy exams.", img: "assets/images/faculties/NAYANA.jpeg" }
    ];

    let currentFacultyBatch = 0; // Tracks which group of 3 is currently displayed
    
    // --- PERFORMANCE FIX: Shadowing DOM Nodes instead of arbitrary innerHTML insertion ---
    // And decoupling Parallax animation layer from Fade animation layer 
    const activeWrappers = document.querySelectorAll('.alumni-card-wrapper');
    const facultyDOMNodes = Array.from(activeWrappers).map(wrapper => {
        return {
            wrapper:   wrapper,
            cycleNode: wrapper.querySelector('.alumni-cycle-animator') || wrapper,
            img:       wrapper.querySelector('img'),
            badge:     wrapper.querySelector('.rank-badge'),
            name:      wrapper.querySelector('.alumni-text-overlay h3') || wrapper.querySelector('h3'),
            role:      wrapper.querySelector('.exam-name'),
            icon:      wrapper.querySelector('.dest-icon'),
            desc:      wrapper.querySelector('.placement-dest span:last-child')
        };
    });

    function bindTiltPhysics(nodeInfo) {
        const wrapper = nodeInfo.wrapper;
        const card = wrapper.querySelector('.prismatic-card');
        if (!card) return;

        let rect, centerX, centerY;
        let activeRAF = null;

        wrapper.addEventListener('mouseenter', () => {
            rect = wrapper.getBoundingClientRect();
            centerX = rect.width / 2;
            centerY = rect.height / 2;
            card.style.transition = "none";
        });

        wrapper.addEventListener('mousemove', (e) => {
            if(!rect) return; 
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            
            // Cancel unexecuted frames to prevent bottlenecking
            if(activeRAF) window.cancelAnimationFrame(activeRAF);

            activeRAF = window.requestAnimationFrame(() => {
                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);
            });
        });

        wrapper.addEventListener('mouseleave', () => {
            if(activeRAF) window.cancelAnimationFrame(activeRAF);
            card.style.transition = `transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.6s ease`;
            card.style.transform = `rotateX(0deg) rotateY(0deg)`;
            setTimeout(() => {
                card.style.transition = `transform 0.15s ease, box-shadow 0.15s ease`;
            }, 600);
            rect = null; 
        });
    }

    // Bind tilt physics EXACTLY ONCE to avoid Compound Listener Leaks
    facultyDOMNodes.forEach(bindTiltPhysics);

    // Pre-load all images so no pop-in happens during cycle
    facultyPool.forEach(fac => {
        if(fac.img) {
            const img = new Image();
            img.src = fac.img;
        }
    });

    // 3. Cycling Engine (Zero DOM Reflow Edition)
    function cycleFaculty() {
        const totalBatches = Math.ceil(facultyPool.length / 3);
        currentFacultyBatch = (currentFacultyBatch + 1) % totalBatches;
        const batch = facultyPool.slice(currentFacultyBatch * 3, currentFacultyBatch * 3 + 3);

        // Phase 1: Fade Out + Jump Up (staggered cascade strictly on decopled inner node)
        facultyDOMNodes.forEach((node, i) => {
            setTimeout(() => {
                node.cycleNode.classList.add('cycling-out');
            }, i * 150);
        });

        // Phase 2: Direct Text Modification safely masked by CSS invisibility
        setTimeout(() => {
            facultyDOMNodes.forEach((node, i) => {
                const fac = batch[i];
                if (fac) {
                    if(node.img) { node.img.src = fac.img; node.img.alt = fac.name; }
                    if(node.badge) node.badge.textContent = fac.badge;
                    if(node.name) node.name.textContent = fac.name;
                    if(node.role) node.role.textContent = fac.role;
                    if(node.icon) node.icon.innerHTML = fac.icon;
                    if(node.desc) node.desc.textContent = fac.desc;
                }
                
                node.cycleNode.classList.remove('cycling-out');
                node.cycleNode.classList.add('cycling-in');
            });

            // Phase 3: Jump Reveal from Below 
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    facultyDOMNodes.forEach((node, i) => {
                        setTimeout(() => {
                            node.cycleNode.classList.remove('cycling-in');
                        }, i * 150);
                    });
                });
            });
        }, 800);
    }

    // Start cycling every 5 seconds
    setInterval(cycleFaculty, 5000);

    // --- 11. GSAP Testimonials Reveal ---
    gsap.set(".g-test-reveal", { autoAlpha: 1 });
    gsap.from(".g-test-reveal", {
        scrollTrigger: { trigger: ".testimonials-premium-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out",
        clearProps: "filter,transform"
    });
