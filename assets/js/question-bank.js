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
