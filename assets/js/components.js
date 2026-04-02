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
        footer: basePath + 'components/footer.html'
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
        });

        // Smooth scroll to top
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
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
    });

})();
