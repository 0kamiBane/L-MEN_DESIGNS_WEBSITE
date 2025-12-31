/**
 * LØMEN ARCHIVE | MULTI-SECTION SYSTEM 2025
 * VERSION: 3.3.0 - FIXED CARD DUPLICATION ON RESIZE
 */

const LomenApp = {
    init() {
        this.handleLoader();
        this.handleNavToggle();
        this.handleScrollIndicator();
        this.handleDynamicAcquisition();

        if (document.body.classList.contains('archive-page')) {
            this.handleMultiSectionGallery();
            this.handleMobileFilterToggle();
            this.handleMobileSectionNavigation();
        }

        if (document.body.classList.contains('identity-page')) {
            this.handleIdentityReveal();
        }

        if (document.body.classList.contains('protocol-page')) {
            this.handleProtocolReveal();
        }

        if (!document.body.classList.contains('archive-page') && 
            !document.body.classList.contains('identity-page') &&
            !document.body.classList.contains('protocol-page')) {
            this.handleRevealAnimations();
        }

        // NEW: Initialize back to top button
        this.handleBackToTop();
    },

    handleLoader() {
        window.addEventListener('load', () => {
            const loader = document.getElementById('loader');
            const waitTime = document.body.classList.contains('home-page') ? 1500 : 800;
            setTimeout(() => {
                if (loader) loader.style.opacity = '0';
                document.body.classList.remove('loading');
                setTimeout(() => loader?.remove(), 1000);
            }, waitTime);
        });
    },

    handleNavToggle() {
        const toggle = document.querySelector('.nav-toggle');
        const navList = document.querySelector('.nav-list');
        if (toggle && navList) {
            toggle.addEventListener('click', () => {
                const isActive = toggle.classList.toggle('active');
                navList.classList.toggle('active');
                document.body.style.overflow = isActive ? 'hidden' : '';
            });
        }
    },

    handleDynamicAcquisition() {
        const buttons = document.querySelectorAll('.dynamic-inquiry, .silent-link');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(btn.getAttribute('href') && btn.getAttribute('href').includes('docs.google.com')) return;
                
                e.preventDefault();
                const card = btn.closest('.product-card');
                const productId = card ? (card.getAttribute('data-id') || card.querySelector('.product-name').textContent) : 'GENERAL_INQUIRY';
                const googleFormUrl = `https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?usp=pp_url&entry.1234567=${productId}`;
                window.open(googleFormUrl, '_blank');
            });
        });
    },

    handleScrollIndicator() {
        const indicator = document.querySelector('.scroll-indicator');
        if (!indicator) return;
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            if (scrollTop + windowHeight >= docHeight - 1400) {
                indicator.style.animation = 'none';
                indicator.style.opacity = '0';
            } else {
                indicator.style.animation = 'scrollPulse 1.5s ease-in-out infinite';
                indicator.style.opacity = '1';
            }
        }, { passive: true });
    },

    handleIdentityReveal() {
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    entry.target.style.filter = "blur(0px)";
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.reveal-text, .visual-pane, .text-pane, .spec-row, .protocol-code, .img-caption');
        elements.forEach((el, index) => {
            el.style.opacity = "0";
            el.style.transform = "translateY(60px)";
            el.style.filter = "blur(20px)";
            el.style.transition = `opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s, transform 1.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s, filter 1.4s ease ${index * 0.15}s`;
            observer.observe(el);
        });
    },

    handleProtocolReveal() {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    entry.target.style.filter = "blur(0px)";
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.protocol-header, .protocol-item, .care-box, .log-card, .contact-box');
        elements.forEach((el, index) => {
            el.style.opacity = "0";
            el.style.transform = "translateY(30px)";
            el.style.filter = "blur(10px)";
            el.style.transition = `all 1.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`;
            observer.observe(el);
        });
    },

    handleMultiSectionGallery() {
        // Store original HTML for each section BEFORE any modifications
        this.storeOriginalSectionHTML();
        
        // Initialize each clothing section
        const clothingSections = document.querySelectorAll('.clothing-section');
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        // Store animation instances for each section
        const sectionAnimations = new Map();
        
        // Initialize each section
        clothingSections.forEach(section => {
            this.initClothingSection(section, sectionAnimations);
        });
        
        // Handle filter changes
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                
                // Apply filter to all sections
                clothingSections.forEach(section => {
                    this.applyFilterToSection(section, filter, sectionAnimations);
                });
                
                // FIX: Close mobile filter menu after selection
                if (window.innerWidth <= 768) {
                    const filterNav = document.querySelector('.archive-filter-nav');
                    const mobileTrigger = document.querySelector('.mobile-filter-trigger');
                    const icon = mobileTrigger?.querySelector('.plus-icon');
                    
                    if (filterNav && filterNav.classList.contains('menu-active')) {
                        filterNav.classList.remove('menu-active');
                        if (icon) icon.textContent = '+';
                    }
                }
                
                // Reinitialize animations after filtering
                setTimeout(() => {
                    this.reinitializeAnimationsOnResize(sectionAnimations);
                }, 100);
            });
        });
        
        // Handle window resize
        let resizeTimeout;
        let lastWindowWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const currentWidth = window.innerWidth;
                
                // Only reinitialize if crossing the mobile/desktop threshold
                if ((lastWindowWidth <= 768 && currentWidth > 768) || 
                    (lastWindowWidth > 768 && currentWidth <= 768)) {
                    this.reinitializeAnimationsOnResize(sectionAnimations);
                }
                lastWindowWidth = currentWidth;
            }, 250);
        });
    },
    
    // Store original HTML for each section
    storeOriginalSectionHTML() {
        const clothingSections = document.querySelectorAll('.clothing-section');
        clothingSections.forEach(section => {
            const track = section.querySelector('.archive-track');
            if (track && !track.dataset.originalHtmlStored) {
                // Store original HTML in a data attribute
                track.dataset.originalHtml = track.innerHTML;
                track.dataset.originalHtmlStored = "true";
            }
        });
    },
    
    // Get original HTML for a track
    getOriginalHTML(track) {
        if (track.dataset.originalHtml) {
            return track.dataset.originalHtml;
        }
        // Fallback to current HTML if original not stored
        return track.innerHTML;
    },
    
    // Reinitialize animations when switching view modes
    reinitializeAnimationsOnResize(sectionAnimations) {
        const clothingSections = document.querySelectorAll('.clothing-section');
        
        clothingSections.forEach(section => {
            const garment = section.dataset.garment;
            const track = section.querySelector('.archive-track');
            const container = section.querySelector('.archive-showcase-container');
            
            if (!track || !container) return;
            
            // Clear existing animation if it exists
            const existingAnimation = sectionAnimations.get(garment);
            if (existingAnimation) {
                // Clean up old animation
                existingAnimation.stopAnimation();
                if (existingAnimation.mouseMoveHandler) {
                    existingAnimation.container.removeEventListener('mousemove', existingAnimation.mouseMoveHandler);
                }
                if (existingAnimation.mouseLeaveHandler) {
                    existingAnimation.container.removeEventListener('mouseleave', existingAnimation.mouseLeaveHandler);
                }
            }
            
            // CRITICAL FIX: Restore to original HTML before reinitializing
            const originalHTML = this.getOriginalHTML(track);
            track.innerHTML = originalHTML;
            track.dataset.doubled = ""; // Reset the doubled flag
            
            // Reinitialize the section
            this.initClothingSection(section, sectionAnimations);
            
            // Apply current filter again
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            this.applyFilterToSection(section, activeFilter, sectionAnimations);
        });
    },
    
    initClothingSection(section, animationMap) {
        const garment = section.dataset.garment;
        const container = section.querySelector('.archive-showcase-container');
        const track = section.querySelector('.archive-track');
        const counter = section.querySelector('.archive-counter');
        const currentIndexEl = counter ? counter.querySelector('.current-index') : null;
        const totalIndexEl = counter ? counter.querySelector('.total-index') : null;
        const itemCountEl = section.querySelector('.item-count');
        
        if (!track || !container) return;
        
        // Get original HTML from data attribute
        const originalHTML = this.getOriginalHTML(track);
        
        const animationInstance = {
            track: track,
            container: container,
            currentIndexEl: currentIndexEl,
            totalIndexEl: totalIndexEl,
            itemCountEl: itemCountEl,
            originalHTML: originalHTML,
            
            segmentWidth: 0,
            currentX: 0,
            targetX: 0,
            velocity: 0,
            ease: 0.12,
            maxSpeed: 135,
            deadZone: 0.35,
            isAnimating: false,
            mouseMoveHandler: null,
            mouseLeaveHandler: null,
            
            manageTrackState() {
                const activeBtn = document.querySelector('.filter-btn.active');
                const currentFilter = activeBtn ? activeBtn.dataset.filter : 'all';
                
                // FIX: Only apply triple duplication on DESKTOP (width > 768)
                // AND only if not already tripled
                if (window.innerWidth > 768) {
                    if (!this.track.dataset.doubled) {
                        // CRITICAL: Use original HTML, not current HTML
                        this.track.innerHTML = this.originalHTML + this.originalHTML + this.originalHTML;
                        this.track.dataset.doubled = "true";
                        this.track.style.display = "flex";
                    }
                } else {
                    // MOBILE: Always use single copy of original HTML
                    this.track.innerHTML = this.originalHTML;
                    this.track.dataset.doubled = "";
                    this.track.style.display = "grid";
                }
                
                // Apply filter to cards
                this.track.querySelectorAll('.product-card').forEach(card => {
                    const cat = card.dataset.category;
                    card.classList.toggle('is-hidden', currentFilter !== 'all' && cat !== currentFilter);
                });
                
                this.updateTotal();
            },
            
            getTrueTotal() {
                const visibleCards = Array.from(this.track.querySelectorAll('.product-card:not(.is-hidden)'));
                if (window.innerWidth <= 768 || !this.track.dataset.doubled) {
                    return visibleCards.length;
                }
                return this.track.dataset.doubled ? Math.max(1, visibleCards.length / 3) : visibleCards.length;
            },
            
            updateTotal() {
                const trueTotalValue = this.getTrueTotal();
                if (this.totalIndexEl) {
                    this.totalIndexEl.textContent = Math.ceil(trueTotalValue).toString().padStart(2, '0');
                }
                if (this.itemCountEl) {
                    this.itemCountEl.textContent = Math.ceil(trueTotalValue);
                }
                return trueTotalValue;
            },
            
            resetPosition() {
                if (window.innerWidth > 768 && this.track.dataset.doubled) {
                    this.segmentWidth = this.track.scrollWidth / 3;
                    this.targetX = -this.segmentWidth;
                    this.currentX = -this.segmentWidth;
                    this.velocity = 0;
                }
            },
            
            animate() {
                if (!this.isAnimating) return;
                
                if (window.innerWidth > 768 && this.track.dataset.doubled) {
                    this.segmentWidth = this.track.scrollWidth / 3;
                    if (this.segmentWidth > 0) {
                        this.targetX += this.velocity;
                        if (this.targetX > 0) { 
                            this.targetX -= this.segmentWidth; 
                            this.currentX -= this.segmentWidth; 
                        }
                        else if (this.targetX < -(this.segmentWidth * 2)) { 
                            this.targetX += this.segmentWidth; 
                            this.currentX += this.segmentWidth; 
                        }
                        this.currentX += (this.targetX - this.currentX) * this.ease;
                        this.track.style.transform = `translate3d(${Math.round(this.currentX)}px, 0, 0)`;
                        
                        const visibleCards = Array.from(this.track.querySelectorAll('.product-card:not(.is-hidden)'));
                        const windowCenter = window.innerWidth / 2;
                        let closestIndex = 0;
                        let minDistance = Infinity;
                        
                        visibleCards.forEach((card, index) => {
                            const rect = card.getBoundingClientRect();
                            const cardCenter = rect.left + rect.width / 2;
                            const distance = cardCenter - windowCenter;
                            
                            if (rect.right > 0 && rect.left < window.innerWidth) {
                                const rotateY = distance / 55;
                                const zDepth = -Math.abs(distance) / 12;
                                const opacity = Math.max(0.2, 1 - Math.abs(distance) / (window.innerWidth * 0.8));
                                card.style.transform = `rotateY(${-rotateY}deg) translateZ(${zDepth}px)`;
                                card.style.opacity = opacity;
                                if (Math.abs(distance) < minDistance) {
                                    minDistance = Math.abs(distance);
                                    closestIndex = (index % (visibleCards.length / 3 || 1)) + 1;
                                }
                            }
                        });
                        
                        if (this.currentIndexEl && closestIndex !== 0) {
                            this.currentIndexEl.textContent = Math.floor(closestIndex).toString().padStart(2, '0');
                        }
                    }
                } else {
                    this.track.style.transform = 'none';
                    this.track.querySelectorAll('.product-card').forEach(c => {
                        c.style.transform = 'none';
                        c.style.opacity = '1';
                    });
                }
                requestAnimationFrame(() => this.animate());
            },
            
            setupMouseControls() {
                this.mouseMoveHandler = (e) => {
                    if (window.innerWidth <= 768) return;
                    const rect = this.container.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const centerX = rect.width / 2;
                    let offset = (mouseX - centerX) / centerX;
                    
                    if (Math.abs(offset) < this.deadZone) {
                        this.velocity = 0;
                    } else {
                        const normalizedOffset = (Math.abs(offset) - this.deadZone) / (1 - this.deadZone);
                        this.velocity = Math.pow(normalizedOffset, 4) * this.maxSpeed * (offset > 0 ? -1 : 1);
                    }
                };
                
                this.mouseLeaveHandler = () => { 
                    this.velocity = 0; 
                };
                
                // Remove old listeners if they exist
                this.container.removeEventListener('mousemove', this.mouseMoveHandler);
                this.container.removeEventListener('mouseleave', this.mouseLeaveHandler);
                
                // Add new listeners (only if desktop)
                if (window.innerWidth > 768) {
                    this.container.addEventListener('mousemove', this.mouseMoveHandler);
                    this.container.addEventListener('mouseleave', this.mouseLeaveHandler);
                }
            },
            
            startAnimation() {
                if (this.isAnimating) return;
                this.isAnimating = true;
                this.animate();
            },
            
            stopAnimation() {
                this.isAnimating = false;
            }
        };
        
        // Initialize the animation instance
        animationInstance.manageTrackState();
        animationInstance.setupMouseControls();
        animationInstance.resetPosition();
        
        // Only start animation on desktop
        if (window.innerWidth > 768) {
            animationInstance.startAnimation();
        } else {
            animationInstance.stopAnimation();
            // Ensure mobile layout is clean
            track.style.transform = 'none';
            track.style.display = 'grid';
            track.querySelectorAll('.product-card').forEach(c => {
                c.style.transform = 'none';
                c.style.opacity = '1';
            });
        }
        
        // Store the instance
        animationMap.set(garment, animationInstance);
    },
    
    applyFilterToSection(section, filter, sectionAnimations) {
        const track = section.querySelector('.archive-track');
        if (!track) return;
        
        let visibleCount = 0;
        const cards = Array.from(track.querySelectorAll('.product-card'));
        
        // First, reset all cards
        cards.forEach(card => {
            card.classList.remove('is-hidden');
        });
        
        // Then apply filter
        cards.forEach(card => {
            const cat = card.dataset.category;
            const shouldHide = filter !== 'all' && cat !== filter;
            
            if (shouldHide) {
                card.classList.add('is-hidden');
            } else {
                visibleCount++;
            }
        });
        
        // Update item count
        const itemCountEl = section.querySelector('.item-count');
        if (itemCountEl) {
            itemCountEl.textContent = visibleCount;
        }
        
        // Handle visibility based on viewport
        if (window.innerWidth <= 768) {
            // Mobile specific fixes
            if (visibleCount === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
                track.style.display = 'grid';
                
                // FIX: Force grid reflow for perfect alignment
                setTimeout(() => {
                    track.style.display = 'none';
                    void track.offsetHeight; // Trigger reflow
                    track.style.display = 'grid';
                    track.classList.add('grid-aligned');
                    
                    // Remove the helper class after animation
                    setTimeout(() => {
                        track.classList.remove('grid-aligned');
                    }, 150);
                }, 10);
                
                // Clean up any desktop artifacts
                track.style.transform = 'none';
                track.querySelectorAll('.product-card').forEach(c => {
                    c.style.transform = 'none';
                    c.style.opacity = '1';
                });
            }
        } else {
            // Desktop
            section.style.display = 'block';
            track.style.display = 'flex';
            
            // Restart animation for this section if needed
            const garment = section.dataset.garment;
            const animation = sectionAnimations.get(garment);
            if (animation) {
                animation.updateTotal();
                animation.resetPosition();
            }
        }
        
        return visibleCount;
    },
    
    handleMobileFilterToggle() {
        const mobileTrigger = document.querySelector('.mobile-filter-trigger');
        const filterNav = document.querySelector('.archive-filter-nav');
        if (!mobileTrigger || !filterNav) return;
        
        mobileTrigger.addEventListener('click', () => {
            const isActive = filterNav.classList.toggle('menu-active');
            const icon = mobileTrigger.querySelector('.plus-icon');
            if (icon) icon.textContent = isActive ? '−' : '+';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                filterNav.classList.contains('menu-active') &&
                !filterNav.contains(e.target) && 
                e.target !== mobileTrigger && 
                !mobileTrigger.contains(e.target)) {
                filterNav.classList.remove('menu-active');
                const icon = mobileTrigger.querySelector('.plus-icon');
                if (icon) icon.textContent = '+';
            }
        });
    },
    
    handleRevealAnimations() {
        const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        document.querySelectorAll('.product-card, .index-showcase').forEach(el => {
            el.style.opacity = "0";
            el.style.transform = "translateY(40px)";
            el.style.transition = "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
            revealObserver.observe(el);
        });
    },

    handleMobileSectionNavigation() {
        const navToggle = document.querySelector('.nav-toggle-mobile');
        const sectionNav = document.querySelector('.section-nav-mobile');
        const navLinks = document.querySelectorAll('.nav-section-link');
        const clothingSections = document.querySelectorAll('.clothing-section');
        
        if (!navToggle || !sectionNav) return;
        
        // Toggle menu
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isActive = sectionNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!sectionNav.contains(e.target) && !navToggle.contains(e.target)) {
                sectionNav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Smooth scroll to section
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const garment = link.dataset.garment;
                const targetSection = document.querySelector(`.clothing-section[data-garment="${garment}"]`);
                
                if (targetSection) {
                    // Close menu
                    sectionNav.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    
                    // Smooth scroll to section
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Highlight active link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
        
        // Update active link on scroll (Intersection Observer)
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const garment = entry.target.dataset.garment;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.dataset.garment === garment);
                    });
                }
            });
        }, observerOptions);
        
        clothingSections.forEach(section => {
            observer.observe(section);
        });
        
        // REMOVED: The entire number count updating logic
        // This was causing issues, so it's completely gone
    },

    // NEW: Back to Top Button Functionality
    handleBackToTop() {
        const backToTopButton = document.getElementById('backToTop');
        
        if (!backToTopButton) return;
        
        // Show button when scrolled 300px from top
        const toggleBackToTop = () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        };
        
        // Smooth scroll to top
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if user prefers reduced motion
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (prefersReducedMotion) {
                window.scrollTo({ top: 0, behavior: 'instant' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            // Optional: Focus on header for accessibility
            const header = document.querySelector('header');
            if (header) {
                header.setAttribute('tabindex', '-1');
                header.focus();
            }
        });
        
        // Listen for scroll events
        window.addEventListener('scroll', toggleBackToTop, { passive: true });
        
        // Initial check on page load
        toggleBackToTop();
    }
};

document.addEventListener('DOMContentLoaded', () => LomenApp.init());