document.addEventListener("DOMContentLoaded", () => {
    // GSAP scroll reveal for FAQ section
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.set(".g-faq-reveal", { autoAlpha: 1 });
        gsap.from(".g-faq-reveal", {
            scrollTrigger: { trigger: ".faq-elite-section", start: "top 80%" },
            y: 40, opacity: 0, filter: "blur(10px)",
            duration: 1, stagger: 0.15, ease: "power3.out",
            clearProps: "filter"
        });
    }

    // FAQ accordion
    const faqWrapper = document.getElementById('faq-accordion');
    const faqItems = document.querySelectorAll('.faq-item');

    if (faqWrapper && faqItems.length > 0) {
        faqItems.forEach(item => {
            const button = item.querySelector('.faq-question');
            if (!button) return;

            button.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                faqItems.forEach(other => other.classList.remove('active'));

                if (!isActive) {
                    item.classList.add('active');
                    faqWrapper.classList.add('has-active');
                } else {
                    faqWrapper.classList.remove('has-active');
                }
            });
        });
    }
});
