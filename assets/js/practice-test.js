// =============================================================
// practice-test.js — Reusable FREE PRACTICE TESTS engine
// Reads question data from window.EXAM_QUESTION_BANK
// Initialized by the question-bank loader below after the bank is fetched
//
// Hierarchy: Category (5) -> Topic (5) -> Section (5) -> Question (25)
// Target content: 5 Categories x 5 Topics x 5 Sections x 25 Questions
// = 3,125 questions. Real per-topic content isn't supplied yet, so each
// topic temporarily reuses the category's existing 5 sections (25 Q each,
// order shuffled per topic instance) — swap in real content by adding a
// `topics` array to a category in the question-bank data file; this
// generator only runs when a category has no `topics` field of its own.
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

        function shuffled(arr) {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        // ── Topics (temporary: category's existing 5 sections, reused by
        //    every topic with question order shuffled per topic) — cached
        //    once per category so the shuffle stays stable during the session.
        const topicsCache = {}; // catIdx -> topics array
        function topicsFor(catIdx) {
            if (topicsCache[catIdx]) return topicsCache[catIdx];
            const cat = CATEGORIES[catIdx];
            const topics = cat.topics || Array.from({ length: 5 }, (_, t) => ({
                name: 'Topic ' + (t + 1),
                sections: cat.sections.map(sec => ({
                    name: sec.name,
                    questions: shuffled(sec.questions)
                }))
            }));
            topicsCache[catIdx] = topics;
            return topics;
        }

        // ── Per-category state — progress persists across category switches;
        //    each topic remembers its own last-visited section/question so
        //    returning to a category or topic resumes exactly where it left off.
        const categoryStates = {}; // catIdx -> state

        function freshCategoryState(catIdx) {
            const topics = topicsFor(catIdx);
            return {
                currentTopic: 0,
                topicCursor:  topics.map(() => ({ section: 0, question: 0 })),
                answers:        topics.map(t => t.sections.map(s => Array(s.questions.length).fill(null))),
                sectionResults: topics.map(t => t.sections.map(() => null))
            };
        }

        let activeCategory = 0;
        let TOPICS = topicsFor(activeCategory);
        let state  = (categoryStates[activeCategory] = freshCategoryState(activeCategory));
        let chartInstances = {};

        function switchToCategory(catIdx) {
            activeCategory = catIdx;
            TOPICS = topicsFor(catIdx);
            if (!categoryStates[catIdx]) categoryStates[catIdx] = freshCategoryState(catIdx);
            state = categoryStates[catIdx];
        }

        // Shorthand accessors for the current position within the active category
        function curCursor()  { return state.topicCursor[state.currentTopic]; }
        function curTopic()   { return TOPICS[state.currentTopic]; }
        function curSection() { return curTopic().sections[curCursor().section]; }

        // ── DOM refs ───────────────────────────────────────────────
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
        const questionCard   = document.getElementById('mts-question-card');
        const doneScreen     = document.getElementById('mts-section-done');
        const doneTitle      = document.getElementById('mts-done-title');
        const doneStats      = document.getElementById('mts-done-stats');
        const doneNextBtn    = document.getElementById('mts-next-section-btn');

        // One-time static text patches (elements never re-rendered by JS)
        const secScoresHeading = document.getElementById('mts-section-scores');
        if (secScoresHeading && secScoresHeading.previousElementSibling) {
            secScoresHeading.previousElementSibling.innerHTML = '<i class="fa-solid fa-chart-bar"></i> Topic-wise Score';
        }
        const barChartCanvas = document.getElementById('mts-bar-chart');
        if (barChartCanvas) barChartCanvas.setAttribute('aria-label', 'Topic-wise score bar chart');

        // ── Utility ────────────────────────────────────────────────
        function show(el)  { if (el) el.classList.remove('mts-hidden'); }
        function hide(el)  { if (el) el.classList.add('mts-hidden');    }
        function showScreen(name) {
            [screenExam, screenResults].forEach(s => { if (s) s.classList.add('mts-hidden'); });
            const target = { exam: screenExam, results: screenResults }[name];
            if (target) target.classList.remove('mts-hidden');
        }

        // ── Per-category score — aggregated across every topic/section
        //    answered so far in that category (independent per category). ──
        function categoryAggregate(catIdx) {
            const cState = categoryStates[catIdx];
            if (!cState) return { answered: 0, correct: 0, wrong: 0 };
            let answered = 0, correct = 0, wrong = 0;
            cState.answers.forEach(topicAnswers => {
                topicAnswers.forEach(sectionAnswers => {
                    sectionAnswers.forEach(a => {
                        if (a === null) return;
                        answered++;
                        if (a.correct) correct++; else wrong++;
                    });
                });
            });
            return { answered, correct, wrong };
        }

        // ── Category + Topic Nav (left panel, accordion) ─────────────
        // Only the active category's topic panel is expanded; switching
        // category is non-destructive — each category keeps its own progress.
        function buildCatNav() {
            const catNav = document.getElementById('mts-cat-nav');
            if (!catNav) return;
            catNav.innerHTML = CATEGORIES.map((cat, i) => {
                const isActive = i === activeCategory;
                const cState   = categoryStates[i];
                const topics   = topicsFor(i);
                const topicIdx = cState ? cState.currentTopic : 0;
                const topicsHtml = topics.map((topic, t) => {
                    const total = topic.sections.reduce((n, s) => n + s.questions.length, 0);
                    const answered = cState ? cState.answers[t].reduce((n, secAns) => n + secAns.filter(a => a !== null).length, 0) : 0;
                    const isTopicActive = isActive && t === topicIdx;
                    const isDone = total > 0 && answered === total;
                    const pct = total > 0 ? Math.round(answered / total * 100) : 0;
                    let cls = 'mts-topic-item';
                    if (isTopicActive) cls += ' mts-topic-item-active';
                    if (isDone)        cls += ' mts-topic-item-done';
                    const badge = isDone ? '<i class="fa-solid fa-check"></i>' : (t + 1);
                    const score = answered > 0 ? `<span class="mts-topic-item-score">${answered}/${total}</span>` : '';
                    return `<button class="${cls}" data-cat-idx="${i}" data-topic-idx="${t}">
                        <span class="mts-topic-item-badge">${badge}</span>
                        <span class="mts-topic-item-body">
                            <span class="mts-topic-item-name">${topic.name}</span>
                            <span class="mts-topic-item-bar"><span class="mts-topic-item-bar-fill" style="width:${pct}%"></span></span>
                        </span>
                        ${score}
                    </button>`;
                }).join('');
                return `<div class="mts-left-cat-group">
                    <button class="mts-left-cat${isActive ? ' mts-left-cat-active' : ''}" data-cat-idx="${i}" style="--cat-col:${cat.color}">
                        <i class="fa-solid ${cat.icon}"></i>
                        <span>${cat.name}</span>
                        <i class="fa-solid fa-chevron-down mts-cat-topic-toggle${isActive ? ' mts-cat-topic-toggle-open' : ''}"></i>
                    </button>
                    <div class="mts-cat-topics${isActive ? '' : ' mts-hidden'}">${topicsHtml}</div>
                </div>`;
            }).join('');

            catNav.querySelectorAll('.mts-left-cat').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.catIdx);
                    if (idx !== activeCategory) switchToCategory(idx);
                    showScreen('exam');
                    renderQuestion();
                });
            });

            catNav.querySelectorAll('.mts-topic-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const catIdx   = parseInt(item.dataset.catIdx);
                    const topicIdx = parseInt(item.dataset.topicIdx);
                    if (catIdx !== activeCategory) switchToCategory(catIdx);
                    state.currentTopic = topicIdx; // that topic's own cursor resumes automatically
                    showScreen('exam');
                    renderQuestion();
                });
            });
        }

        // ── Section tabs (within the active topic) ────────────────────
        function buildTabs() {
            if (!tabsScroll) return;
            const t = state.currentTopic;
            const sections = curTopic().sections;
            tabsScroll.innerHTML = sections.map((sec, i) => {
                const ans = state.answers[t][i];
                const answered = ans.filter(a => a !== null).length;
                const allDone = answered === sec.questions.length;
                const isCurrent = i === curCursor().section;

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
                    const cur = curCursor();
                    cur.section  = parseInt(btn.dataset.sec);
                    cur.question = 0;
                    renderQuestion();
                });
            });
        }

        // ── Category score summary — right side of the section tabs row,
        //    scoped to the currently active category. Created once and
        //    appended as a sibling of #mts-tabs-scroll (never wiped by
        //    buildTabs(), which only touches #mts-tabs-scroll itself). ──
        function updateCatScoreRow() {
            const bar = document.querySelector('.mts-section-tabs-bar');
            if (!bar) return;
            let row = document.getElementById('mts-cat-topscore');
            if (!row) {
                row = document.createElement('div');
                row.id = 'mts-cat-topscore';
                row.className = 'mts-cat-topscore';
                bar.appendChild(row);
            }
            const agg = categoryAggregate(activeCategory);
            row.innerHTML = `
                <span class="mts-cat-topscore-item mts-cat-topscore-answered"><span>Answered</span><strong>${agg.answered}</strong></span>
                <span class="mts-cat-topscore-item mts-cat-topscore-correct"><span>Correct</span><strong>${agg.correct}</strong></span>
                <span class="mts-cat-topscore-item mts-cat-topscore-wrong"><span>Wrong</span><strong>${agg.wrong}</strong></span>
                <span class="mts-cat-topscore-item mts-cat-topscore-total"><span>Score</span><strong>${agg.correct}</strong></span>
            `;
        }

        // ── Render question ────────────────────────────────────────
        function renderQuestion() {
            const t   = state.currentTopic;
            const cur = curCursor();
            const s   = cur.section;
            const qi  = cur.question;
            const sec = curSection();
            const q   = sec.questions[qi];
            const existing = state.answers[t][s][qi];
            const answered = existing !== null;

            show(questionCard);
            hide(doneScreen);
            hide(feedbackCard);
            hide(navBar);

            if (qNum)     qNum.textContent      = `Q${qi + 1}.`;
            if (qText)    qText.textContent     = q.q;
            if (qCounter) qCounter.textContent  = `Question ${qi + 1} of ${sec.questions.length}`;
            if (sectionBadge) sectionBadge.textContent = `Topic ${t + 1} · Section ${s + 1}`;
            if (progressFill) progressFill.style.width = ((qi + (answered ? 1 : 0)) / sec.questions.length * 100) + '%';

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

            // Feedback: Correct/Incorrect, correct answer, explanation — then allow moving on
            if (answered) {
                showFeedback(t, s, qi, existing.selected);
                show(navBar);
                updateNavButtons(t, s, qi);
            }

            buildCatNav();
            buildTabs();
            updateCatScoreRow();
        }

        // ── Show feedback ──────────────────────────────────────────
        function showFeedback(t, s, qi, selected) {
            const q = TOPICS[t].sections[s].questions[qi];
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
        function updateNavButtons(t, s, qi) {
            if (prevBtn) prevBtn.style.visibility = qi > 0 ? 'visible' : 'hidden';
            const sec = TOPICS[t].sections[s];
            const isLastQuestion = qi >= sec.questions.length - 1;
            const isLastSection  = s >= TOPICS[t].sections.length - 1;
            const isLastTopic    = t >= TOPICS.length - 1;
            if (nextBtn) {
                if (isLastQuestion) {
                    nextBtn.innerHTML = (isLastSection && isLastTopic)
                        ? 'View Results <i class="fa-solid fa-flag-checkered"></i>'
                        : isLastSection
                            ? 'Finish Topic <i class="fa-solid fa-check"></i>'
                            : 'Finish Section <i class="fa-solid fa-check"></i>';
                } else {
                    nextBtn.innerHTML = 'Next <i class="fa-solid fa-chevron-right"></i>';
                }
                nextBtn.className = 'mts-nav-btn mts-btn-cyan';
                nextBtn.disabled = false;
            }
            if (navCenter) {
                const sAns = state.answers[t][s].filter(a => a !== null).length;
                navCenter.textContent = `${sAns} / ${sec.questions.length} answered`;
            }
        }

        // ── Submit answer ──────────────────────────────────────────
        function submitAnswer() {
            const selected = optionsWrap ? optionsWrap.querySelector('.mts-opt-selected') : null;
            if (!selected) return;
            const t   = state.currentTopic;
            const cur = curCursor();
            const s   = cur.section;
            const qi  = cur.question;
            const selectedIdx = parseInt(selected.dataset.idx);
            const isCorrect   = selectedIdx === TOPICS[t].sections[s].questions[qi].ans;

            state.answers[t][s][qi] = { selected: selectedIdx, correct: isCorrect };
            hide(submitBtn);
            renderQuestion();
        }

        // ── Complete a section (saves its result) ─────────────────────
        function completeSection(t, s) {
            const ans = state.answers[t][s];
            const correct = ans.filter(a => a && a.correct).length;
            const wrong   = ans.filter(a => a && !a.correct).length;
            state.sectionResults[t][s] = { correct, wrong, score: correct };
        }

        function topicAggregate(t) {
            const results = state.sectionResults[t].filter(Boolean);
            return {
                correct: results.reduce((n, r) => n + r.correct, 0),
                wrong:   results.reduce((n, r) => n + r.wrong, 0),
                total:   TOPICS[t].sections.reduce((n, sec) => n + sec.questions.length, 0)
            };
        }

        // ── "Done" screen — reused for both section-complete (advance to
        //    the next section within this topic) and topic-complete
        //    (advance to the next topic) transitions. ─────────────────
        function showSectionDone(t, s) {
            hide(questionCard);
            hide(feedbackCard);
            hide(navBar);
            show(doneScreen);

            const r = state.sectionResults[t][s] || { correct: 0, wrong: 0 };
            const total = TOPICS[t].sections[s].questions.length;
            const pct = total > 0 ? Math.round(r.correct / total * 100) : 0;

            if (doneTitle) doneTitle.textContent = `Section ${s + 1} Completed!`;
            if (doneStats) {
                doneStats.innerHTML = `
                    <div class="mts-done-stat"><strong>${r.correct}</strong><span>Correct</span></div>
                    <div class="mts-done-stat"><strong>${r.wrong}</strong><span>Wrong</span></div>
                    <div class="mts-done-stat"><strong>${pct}%</strong><span>Accuracy</span></div>
                `;
            }
            if (doneNextBtn) {
                doneNextBtn.innerHTML = `Go to Section ${s + 2} <i class="fa-solid fa-arrow-right"></i>`;
                doneNextBtn.onclick = () => {
                    const cur = curCursor();
                    cur.section  = s + 1;
                    cur.question = 0;
                    renderQuestion();
                };
            }
        }

        function showTopicDone(t) {
            hide(questionCard);
            hide(feedbackCard);
            hide(navBar);
            show(doneScreen);

            const agg = topicAggregate(t);
            const pct = agg.total > 0 ? Math.round(agg.correct / agg.total * 100) : 0;

            if (doneTitle) doneTitle.textContent = `Topic ${t + 1} Completed!`;
            if (doneStats) {
                doneStats.innerHTML = `
                    <div class="mts-done-stat"><strong>${agg.correct}</strong><span>Correct</span></div>
                    <div class="mts-done-stat"><strong>${agg.wrong}</strong><span>Wrong</span></div>
                    <div class="mts-done-stat"><strong>${pct}%</strong><span>Accuracy</span></div>
                `;
            }
            if (doneNextBtn) {
                doneNextBtn.innerHTML = `Go to Topic ${t + 2} <i class="fa-solid fa-arrow-right"></i>`;
                doneNextBtn.onclick = () => {
                    state.currentTopic = t + 1;
                    renderQuestion();
                };
            }
        }

        // ── Results screen — scoped to the active category, aggregated
        //    per topic (each topic sums its 5 sections). ───────────────
        function showResults() {
            showScreen('results');

            const attempted = TOPICS.map((topic, i) => {
                const answered = state.answers[i].reduce((n, secAns) => n + secAns.filter(a => a !== null).length, 0);
                if (answered === 0) return null;
                const correct = state.answers[i].reduce((n, secAns) => n + secAns.filter(a => a && a.correct).length, 0);
                const wrong   = answered - correct;
                return { i, r: { correct, wrong, score: correct } };
            }).filter(Boolean);
            const topicTotal = i => TOPICS[i].sections.reduce((n, sec) => n + sec.questions.length, 0);

            const totalQs    = attempted.reduce((sum, {i}) => sum + topicTotal(i), 0);
            const totCorrect = attempted.reduce((s, {r}) => s + r.correct, 0);
            const totWrong   = attempted.reduce((s, {r}) => s + r.wrong, 0);
            const totalScore = totCorrect;
            const pct        = totalQs > 0 ? Math.round(totCorrect / totalQs * 100) : 0;
            const passed     = pct >= 60;

            const subEl = document.getElementById('mts-results-sub');
            if (subEl) subEl.textContent = `Score: ${totalScore}/${totalQs} · ${pct}% · ${passed ? '✅ PASS' : '❌ NEEDS IMPROVEMENT'}`;

            // Topic scores — only attempted topics
            const secScoresEl = document.getElementById('mts-section-scores');
            if (secScoresEl) {
                secScoresEl.innerHTML = attempted.map(({i, r}) => {
                    const total = topicTotal(i);
                    const pctW = Math.round(r.correct / total * 100);
                    return `<div class="mts-sec-score-row">
                        <span class="mts-sec-score-label">Topic ${i + 1}</span>
                        <div class="mts-sec-score-bar-wrap"><div class="mts-sec-score-bar" style="width:0%" data-target="${pctW}"></div></div>
                        <span class="mts-sec-score-val">${r.correct}/${total}</span>
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
                        ['Strongest', `Topic ${best.i + 1}`, `${best.correct}/${topicTotal(best.i)}`],
                        ['Weakest',   `Topic ${worst.i + 1}`, `${worst.correct}/${topicTotal(worst.i)}`]
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
            buildCharts(totCorrect, totWrong, scores, totalQs, topicTotal);

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
        function buildCharts(totCorrect, totWrong, scores, totalQs, topicTotal) {
            if (typeof Chart === 'undefined') return;

            Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(e) {} });
            chartInstances = {};

            // Donut
            const donutCtx = document.getElementById('mts-donut-chart');
            if (donutCtx) {
                chartInstances.donut = new Chart(donutCtx, {
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
                const maxQs = Math.max(...scores.map(s => topicTotal(s.i)));
                chartInstances.bar = new Chart(barCtx, {
                    type: 'bar',
                    data: {
                        labels: scores.map(s => `Topic ${s.i + 1}`),
                        datasets: [{
                            data: scores.map(s => s.correct),
                            backgroundColor: scores.map((s, i) => ['#06b6d4','#3b82f6','#7c3aed','#14b8a6','#f59e0b'][i]),
                            borderRadius: 8, borderSkipped: false
                        }]
                    },
                    options: {
                        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` Score: ${ctx.raw}/${topicTotal(scores[ctx.dataIndex].i)}` } } },
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
            TOPICS.forEach((topic, ti) => {
                topic.sections.forEach((sec, si) => {
                    sec.questions.forEach((q, qi) => {
                        const ans = state.answers[ti][si][qi];
                        if (!ans) return;
                        const isCorrect = ans.correct;
                        if (filter === 'correct' && !isCorrect) return;
                        if (filter === 'wrong'   && isCorrect)  return;
                        items.push({ ti, si, qi, q, ans, isCorrect });
                    });
                });
            });
            listEl.innerHTML = items.map(({ ti, si, qi, q, ans, isCorrect }) => `
                <div class="mts-review-item ${isCorrect ? 'mts-rev-correct' : 'mts-rev-wrong'}">
                    <div class="mts-review-q">T${ti+1}.S${si+1} Q${qi+1}: ${q.q}</div>
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

        // ── Retest — resets ONLY the active category's progress ──────
        //    (a full multi-category reset is intentionally not wired up here)
        function retest() {
            categoryStates[activeCategory] = freshCategoryState(activeCategory);
            state = categoryStates[activeCategory];
            showScreen('exam');
            renderQuestion();
        }

        // ── Wire events ────────────────────────────────────────────
        if (submitBtn) submitBtn.addEventListener('click', submitAnswer);

        if (prevBtn) prevBtn.addEventListener('click', () => {
            const cur = curCursor();
            if (cur.question > 0) {
                cur.question--;
                renderQuestion();
            }
        });

        if (nextBtn) nextBtn.addEventListener('click', () => {
            const t   = state.currentTopic;
            const cur = curCursor();
            const s   = cur.section;
            const sec = TOPICS[t].sections[s];
            const isLastQuestion = cur.question >= sec.questions.length - 1;

            if (!isLastQuestion) {
                cur.question++;
                renderQuestion();
                return;
            }

            // Last question of the section answered — complete it, then advance
            completeSection(t, s);
            const isLastSection = s >= TOPICS[t].sections.length - 1;
            const isLastTopic   = t >= TOPICS.length - 1;

            if (!isLastSection) {
                showSectionDone(t, s);
            } else if (!isLastTopic) {
                showTopicDone(t);
            } else {
                showResults();
            }
        });

        const retestBtn = document.getElementById('mts-retest-btn');
        if (retestBtn) retestBtn.addEventListener('click', retest);

        // Init: disable submit until option selected
        if (submitBtn) submitBtn.disabled = true;

        // ── Boot straight into Cardiology (category 1), Topic 1, Section 1,
        //    Question 1 — its panel expanded, no click required.
        showScreen('exam');
        renderQuestion();
    }

    window.PracticeTest = { init };
})();




// =============================================================
// question-bank.js — Question repository loader
// Reads data-question-bank from #mts-wrapper, fetches the
// matching file from /components/question-banks/, parses
// the question data, sets window.EXAM_QUESTION_BANK, then
// calls window.PracticeTest.init() to start the engine.
//
// To add a new exam type:
//   1. Create /components/question-banks/<key>.html
//   2. Add data-question-bank="<key>" to #mts-wrapper
//   No other changes required.
// =============================================================
(function () {
    function resolveUrl(bankKey) {
        var origin = window.location.origin;
        return origin + '/components/question-banks/' + bankKey + '.html';
    }

    function loadQuestionBank() {
        var wrapper = document.getElementById('mts-wrapper');
        if (!wrapper) return;

        var bankKey = wrapper.getAttribute('data-question-bank');
        if (!bankKey) return;

        var url = resolveUrl(bankKey);

        fetch(url)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('[QuestionBank] HTTP ' + response.status + ' loading ' + url);
                }
                return response.text();
            })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                var scriptEl = doc.querySelector('script[type="application/x-exam-questions"]');
                if (!scriptEl) {
                    throw new Error('[QuestionBank] No <script type="application/x-exam-questions"> found in ' + url);
                }

                var data = (new Function('return ' + scriptEl.textContent.trim()))();
                if (!Array.isArray(data) || !data.length) {
                    throw new Error('[QuestionBank] Parsed data is empty or not an array.');
                }

                window.EXAM_QUESTION_BANK = data;

                if (window.PracticeTest && typeof window.PracticeTest.init === 'function') {
                    window.PracticeTest.init();
                } else {
                    console.warn('[QuestionBank] window.PracticeTest not available — ensure practice-test.js is loaded first.');
                }
            })
            .catch(function (err) {
                console.error('[QuestionBank]', err);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadQuestionBank);
    } else {
        loadQuestionBank();
    }
})();
