(function () {
    'use strict';

    // Detect if we're in a subdirectory and get the base path
    function getBasePath() {
        const path = window.location.pathname;
        // Check if we're in the courses folder or any other subdirectory
        if (path.includes('/courses/') || path.includes('/pages/')) {
            return '../';
        }
        return '';
    }

    const basePath = getBasePath();

    // Component paths - automatically adjusted for subdirectories
    const components = {
        header: basePath + 'components/header.html',
        footer: basePath + 'components/footer.html',
        chat: basePath + 'components/chat.html'
    };

    /**
     * Load a component into a container element
     * @param {string} componentPath - Path to the component HTML file
     * @param {string} containerId - ID of the container element
     */
    function loadComponent(componentPath, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        fetch(componentPath)
            .then(response => {
                if (!response.ok) throw new Error('Component not found: ' + componentPath);
                return response.text();
            })
            .then(html => {
                // Fix relative paths if we are in a subdirectory
                if (basePath && basePath !== '') {
                    html = html.replace(/(href|src)="((?!http|#|mailto|\/).*?)"/g, '$1="' + basePath + '$2"');
                }

                container.innerHTML = html;

                if (containerId === 'header-container') {
                    highlightActiveNav();
                    initMobileNavbar();
                    window.dispatchEvent(new Event('headerLoaded'));
                }

                if (containerId === 'footer-container') {
                    initScrollToTop();
                    window.dispatchEvent(new Event('footerLoaded'));
                }

                if (containerId === 'chat-container') {
                    initChatFab();
                }
            })
            .catch(error => {
                console.error('Error loading component:', error);
            });
    }

    /**
     * Initialize Scroll To Top Button
     */
    function initScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTopBtn');
        if (!scrollBtn) return;

        // Show/Hide on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        }, { passive: true });

        // Smooth scroll to top
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Initialize the Premium Chat FAB button
     * - Delayed entrance animation on scroll
     * - Toggle active state on click (opens panel)
     * - Quick replies, message sending, typing indicator
     */
    function initChatFab() {
        const chatFab = document.getElementById('chatFab');
        const chatBtn = document.getElementById('chatFabBtn');
        const chatPanelClose = document.getElementById('chatPanelClose');
        const chatBody = document.getElementById('chatPanelBody');
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');

        if (!chatFab || !chatBtn) return;

        let chatShown = false;

        // Show chat button after scrolling 300px OR after 4 seconds
        const showChat = () => {
            if (chatShown) return;
            chatShown = true;
            chatFab.classList.add('visible');
        };

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) showChat();
        }, { passive: true });

        setTimeout(showChat, 4000);

        // Toggle panel on FAB click
        chatBtn.addEventListener('click', () => {
            chatFab.classList.toggle('active');
            
            // Add class to body to hide scroll-to-top button
            const isActive = chatFab.classList.contains('active');
            document.body.classList.toggle('chat-is-open', isActive);

            if (isActive && chatInput) {
                setTimeout(() => chatInput.focus(), 450);
            }
        });

        // Close panel via minimize button
        if (chatPanelClose) {
            chatPanelClose.addEventListener('click', () => {
                chatFab.classList.remove('active');
                document.body.classList.remove('chat-is-open');
            });
        }

        // --- Helpers ---
        function getTimeString() {
            return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        function scrollToBottom() {
            if (chatBody) {
                setTimeout(() => {
                    chatBody.scrollTop = chatBody.scrollHeight;
                }, 50);
            }
        }

        function addUserMessage(text) {
            if (!chatBody) return;
            const msg = document.createElement('div');
            msg.className = 'chat-msg chat-msg-user';
            msg.innerHTML = `
                <div class="chat-msg-avatar">U</div>
                <div class="chat-msg-bubble">
                    <p>${text}</p>
                    <span class="chat-msg-time">${getTimeString()}</span>
                </div>
            `;
            chatBody.appendChild(msg);
            scrollToBottom();
        }

        function showTyping() {
            if (!chatBody) return;
            const typing = document.createElement('div');
            typing.className = 'chat-msg chat-msg-bot';
            typing.id = 'chatTyping';
            typing.innerHTML = `
                <div class="chat-msg-avatar">E</div>
                <div class="chat-msg-bubble">
                    <div class="chat-typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;
            chatBody.appendChild(typing);
            scrollToBottom();
        }

        function removeTyping() {
            const typing = document.getElementById('chatTyping');
            if (typing) typing.remove();
        }

        function addBotMessage(text) {
            removeTyping();
            if (!chatBody) return;
            const msg = document.createElement('div');
            msg.className = 'chat-msg chat-msg-bot';
            msg.innerHTML = `
                <div class="chat-msg-avatar">E</div>
                <div class="chat-msg-bubble">
                    <p>${text}</p>
                    <span class="chat-msg-time">${getTimeString()}</span>
                </div>
            `;
            chatBody.appendChild(msg);
            scrollToBottom();
        }

        // Bot reply based on topic
        function getBotReply(userMsg) {
            const msg = userMsg.toLowerCase();
            if (msg.includes('course')) return "We offer elite coaching for Nursing, Pharmacy, and Lab Technology. Would you like details on a specific program? 📚";
            if (msg.includes('admission')) return "Admissions for the 2026 batch are now open! You can apply online or visit our campus. Shall I share the application link? 🎓";
            if (msg.includes('placement')) return "Our students have a 95%+ placement rate across top hospitals and healthcare networks. Want to see our placement report? 💼";
            if (msg.includes('call') || msg.includes('talk')) return "Absolutely! Our counselor will call you shortly. You can also reach us directly at +91 8111850054 📞";
            return "Thanks for reaching out! Our team will get back to you shortly. Is there anything specific you'd like to know about Eduooz? 😊";
        }

        // Handle sending a message
        function handleSend() {
            if (!chatInput) return;
            const text = chatInput.value.trim();
            if (!text) return;

            // Remove quick replies on first user message
            const quickReplies = chatBody.querySelector('.chat-quick-replies');
            if (quickReplies) quickReplies.remove();

            addUserMessage(text);
            chatInput.value = '';

            // Show typing then reply
            setTimeout(showTyping, 400);
            setTimeout(() => {
                addBotMessage(getBotReply(text));
            }, 1400 + Math.random() * 800);
        }

        // Send button click
        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', handleSend);
        }

        // Enter key
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                }
            });
        }

        // Quick reply buttons
        const quickBtns = document.querySelectorAll('.chat-quick-btn');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const msg = btn.getAttribute('data-msg');
                if (!msg) return;

                // Remove quick replies
                const quickReplies = chatBody.querySelector('.chat-quick-replies');
                if (quickReplies) quickReplies.remove();

                addUserMessage(msg);

                setTimeout(showTyping, 400);
                setTimeout(() => {
                    addBotMessage(getBotReply(msg));
                }, 1400 + Math.random() * 800);
            });
        });
    }

    /**
     * Initialize mobile navbar functionality
     * - Close on outside click
     * - Toggle overlay
     * - Close on nav link click
     */
    function initMobileNavbar() {
        const navbarToggler = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (!navbarToggler || !navLinks) return;

        navbarToggler.addEventListener('click', function () {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close navbar when clicking a nav link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function () {
                navbarToggler.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    /**
     * Highlight the active navigation link based on current page
     */
    function highlightActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-links a');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');

            // Check if this link matches current page
            if (link.classList.contains('header-cta')) return;

            if (href === currentPage ||
                (currentPage === 'index.html' && href === '#home') ||
                (currentPage === '' && href === '#home')) {
                link.classList.add('active');
            } else if (!href.startsWith('#')) {
                link.classList.remove('active');
            }
        });
    }

    // Load components when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        loadComponent(components.header, 'header-container');
        loadComponent(components.footer, 'footer-container');
        loadComponent(components.chat, 'chat-container');
    });

})();
