// =============================================================
// practice-test.js — Reusable FREE PRACTICE TESTS engine
// Reads question data from window.EXAM_QUESTION_BANK
// Initialized by question-bank.js after the bank is loaded
// =============================================================
(function () {
    function init() {
        const wrapper = document.getElementById('mts-wrapper');
        if (!wrapper) return;

        const CATEGORIES = window.EXAM_QUESTION_BANK;
        if (!CATEGORIES || !CATEGORIES.length) {
            console.warn('[PracticeTest] window.EXAM_QUESTION_BANK is empty or not set.');
            return;
        }

        // ── State ──────────────────────────────────────────────────
        let SECTIONS = [];
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

    window.PracticeTest = { init };
})();
