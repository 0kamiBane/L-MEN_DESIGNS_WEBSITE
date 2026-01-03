/**
 * LØMEN ARCHIVE | MULTI-SECTION SYSTEM 2025
 * VERSION: 3.6.2 - COMPLETE SYSTEM REPLACEMENT
 */

const LomenApp = {
    init() {
        this.handleLoader();
        this.handleNavToggle();
        this.handleScrollIndicator();
        this.handleDynamicAcquisition();
        this.handleFormSubmission();
        
        // CRITICAL: Trigger the form autofill immediately on init
        this.handleOrderAutofill();

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

        // Apply general reveals to pages that aren't specific landing types
        if (!document.body.classList.contains('archive-page') && 
            !document.body.classList.contains('identity-page') &&
            !document.body.classList.contains('protocol-page')) {
            this.handleRevealAnimations();
        }

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
        document.addEventListener('click', function(e) {
            const button = e.target.closest('.dynamic-inquiry');
            if (!button) return;
            
            e.preventDefault();
            const card = button.closest('.product-card');
            if (!card) return;

            const productId = card.getAttribute('data-id') || '';
            const productName = card.querySelector('.product-name')?.textContent || '';
            const productImg = card.querySelector('img')?.src || '';
            
            // Find the price element - adjust '.product-price' to match your HTML class
            const priceEl = card.querySelector('.product-price') || card.querySelector('.price');
            const productPrice = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, '') : '0';
            
            window.location.href = `order.html?id=${encodeURIComponent(productId)}&name=${encodeURIComponent(productName)}&img=${encodeURIComponent(productImg)}&price=${encodeURIComponent(productPrice)}`;
        });
    },

    handleOrderAutofill() {
        // Detect if we are on the order page
        const isOrderPage = window.location.pathname.includes('order.html') || 
                           document.body.classList.contains('order-page') ||
                           document.body.classList.contains('protocol-order-page');
        
        if (!isOrderPage) return;

        console.log("Order System: Extracting product data...");

       // 1. Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const productName = urlParams.get('name');
        const productImg = urlParams.get('img');
        const productPrice = urlParams.get('price');

        // 2. Map to Hidden/Form Inputs (for submission)
        const refInput = document.getElementById('productReferenceId');
        const nameInput = document.getElementById('productNameInput');
        const priceInput = document.getElementById('productPriceInput'); 
        
        // Push data into the hidden fields
        if (refInput && productId) refInput.value = productId;
        if (nameInput && productName) nameInput.value = productName;
        if (priceInput && productPrice) priceInput.value = productPrice;

        // 3. Map to Visual UI Components (what the user sees)
        const displayDiv = document.getElementById('productDisplay');
        const visualImg = document.getElementById('productImage');
        const visualName = document.getElementById('productName');
        const visualRef = document.getElementById('productRef');
        const visualPrice = document.getElementById('productPrice');
        
        // Check if we have any data to show
        if (displayDiv && (productId || productName || productPrice)) {
            displayDiv.style.display = 'block';
            
            if (visualImg && productImg) {
                visualImg.src = productImg;
            }
            
            if (visualName && productName) {
                visualName.textContent = productName;
            }
            
            if (visualRef && productId) {
                visualRef.textContent = productId;
            }

            // PRICE LOGIC:
            if (visualPrice) {
                if (productPrice && productPrice !== '0') {
                    // Strip existing $ and re-add it to ensure clean formatting
                    const cleanPrice = productPrice.replace('$', '');
                    visualPrice.textContent = `$${cleanPrice}`;
                } else {
                    // Fallback if price is missing or 0
                    visualPrice.textContent = "INQUIRY UPON REQUEST";
                }
            }
            
            console.log("Order Visuals successfully populated.");
        }
    },

    handleFormSubmission() {
        const orderForm = document.getElementById('orderForm');
        if (!orderForm) return;

        orderForm.addEventListener('submit', (e) => {
            // 1. Check if the form is valid
            if (!orderForm.checkValidity()) {
                e.preventDefault(); 
                // This triggers the actual "Please select an option" bubble
                orderForm.reportValidity(); 
                return;
            }

            // 2. If valid, proceed with transmission
            e.preventDefault(); 
            const submitBtn = orderForm.querySelector('.submit-btn');
            submitBtn.textContent = "TRANSMITTING...";
            submitBtn.disabled = true;

            const formData = new FormData(orderForm);
            
            fetch(orderForm.action, {
                method: 'POST',
                body: formData,
                mode: 'no-cors' 
            })
            .then(() => {
                submitBtn.textContent = "TRANSMISSION SUCCESSFUL";
                // Your Royal Purple
                submitBtn.style.background = "#922adcff"; 
                submitBtn.style.color = "#ffffffff";
                submitBtn.style.borderColor = "#922adcff";
                
                orderForm.reset();
                
                const displayDiv = document.getElementById('productDisplay');
                if (displayDiv) {
                    displayDiv.style.opacity = "0.3";
                    setTimeout(() => { displayDiv.style.display = 'none'; }, 2000);
                }
            })
            .catch(error => {
                submitBtn.textContent = "ERROR. TRY AGAIN.";
                submitBtn.disabled = false;
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
        this.storeOriginalSectionHTML();
        
        const clothingSections = document.querySelectorAll('.clothing-section');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const sectionAnimations = new Map();
        
        clothingSections.forEach(section => {
            this.initClothingSection(section, sectionAnimations);
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                
                clothingSections.forEach(section => {
                    this.applyFilterToSection(section, filter, sectionAnimations);
                });
                
                // Close mobile filters after click
                if (window.innerWidth <= 768) {
                    const filterNav = document.querySelector('.archive-filter-nav');
                    const mobileTrigger = document.querySelector('.mobile-filter-trigger');
                    const icon = mobileTrigger?.querySelector('.plus-icon');
                    
                    if (filterNav && filterNav.classList.contains('menu-active')) {
                        filterNav.classList.remove('menu-active');
                        if (icon) icon.textContent = '+';
                    }
                }
                
                setTimeout(() => {
                    this.reinitializeAnimationsOnResize(sectionAnimations);
                }, 100);
            });
        });
        
        let resizeTimeout;
        let lastWindowWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const currentWidth = window.innerWidth;
                if ((lastWindowWidth <= 768 && currentWidth > 768) || 
                    (lastWindowWidth > 768 && currentWidth <= 768)) {
                    this.reinitializeAnimationsOnResize(sectionAnimations);
                }
                lastWindowWidth = currentWidth;
            }, 250);
        });
    },
    
    storeOriginalSectionHTML() {
        const clothingSections = document.querySelectorAll('.clothing-section');
        clothingSections.forEach(section => {
            const track = section.querySelector('.archive-track');
            if (track && !track.dataset.originalHtmlStored) {
                track.dataset.originalHtml = track.innerHTML;
                track.dataset.originalHtmlStored = "true";
            }
        });
    },
    
    getOriginalHTML(track) {
        return track.dataset.originalHtml || track.innerHTML;
    },
    
    reinitializeAnimationsOnResize(sectionAnimations) {
        const clothingSections = document.querySelectorAll('.clothing-section');
        clothingSections.forEach(section => {
            const garment = section.dataset.garment;
            const track = section.querySelector('.archive-track');
            const container = section.querySelector('.archive-showcase-container');
            
            if (!track || !container) return;
            
            const existingAnimation = sectionAnimations.get(garment);
            if (existingAnimation) {
                existingAnimation.stopAnimation();
                if (existingAnimation.mouseMoveHandler) {
                    existingAnimation.container.removeEventListener('mousemove', existingAnimation.mouseMoveHandler);
                }
                if (existingAnimation.mouseLeaveHandler) {
                    existingAnimation.container.removeEventListener('mouseleave', existingAnimation.mouseLeaveHandler);
                }
            }
            
            track.innerHTML = this.getOriginalHTML(track);
            track.dataset.doubled = ""; 
            
            this.initClothingSection(section, sectionAnimations);
            
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
                
                if (window.innerWidth > 768) {
                    if (!this.track.dataset.doubled) {
                        this.track.innerHTML = this.originalHTML + this.originalHTML + this.originalHTML;
                        this.track.dataset.doubled = "true";
                        this.track.style.display = "flex";
                    }
                } else {
                    this.track.innerHTML = this.originalHTML;
                    this.track.dataset.doubled = "";
                    this.track.style.display = "grid";
                }
                
                this.track.querySelectorAll('.product-card').forEach(card => {
                    const cat = card.dataset.category;
                    card.classList.toggle('is-hidden', currentFilter !== 'all' && cat !== currentFilter);
                });
                
                this.updateTotal();
            },
            
            getTrueTotal() {
                const visibleCards = Array.from(this.track.querySelectorAll('.product-card:not(.is-hidden)'));
                if (window.innerWidth <= 768 || !this.track.dataset.doubled) return visibleCards.length;
                return Math.max(1, visibleCards.length / 3);
            },
            
            updateTotal() {
                const trueTotalValue = this.getTrueTotal();
                if (this.totalIndexEl) this.totalIndexEl.textContent = Math.ceil(trueTotalValue).toString().padStart(2, '0');
                if (this.itemCountEl) this.itemCountEl.textContent = Math.ceil(trueTotalValue);
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
                        } else if (this.targetX < -(this.segmentWidth * 2)) { 
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
                                card.style.transform = `rotateY(${-distance / 55}deg) translateZ(${-Math.abs(distance) / 12}px)`;
                                card.style.opacity = Math.max(0.2, 1 - Math.abs(distance) / (window.innerWidth * 0.8));
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
                }
                requestAnimationFrame(() => this.animate());
            },
            
            setupMouseControls() {
                this.mouseMoveHandler = (e) => {
                    if (window.innerWidth <= 768) return;
                    const rect = this.container.getBoundingClientRect();
                    const offset = ((e.clientX - rect.left) - rect.width / 2) / (rect.width / 2);
                    
                    if (Math.abs(offset) < this.deadZone) {
                        this.velocity = 0;
                    } else {
                        const normalizedOffset = (Math.abs(offset) - this.deadZone) / (1 - this.deadZone);
                        this.velocity = Math.pow(normalizedOffset, 4) * this.maxSpeed * (offset > 0 ? -1 : 1);
                    }
                };
                
                this.mouseLeaveHandler = () => { this.velocity = 0; };
                
                if (window.innerWidth > 768) {
                    this.container.addEventListener('mousemove', this.mouseMoveHandler);
                    this.container.addEventListener('mouseleave', this.mouseLeaveHandler);
                }
            },
            
            startAnimation() { this.isAnimating = true; this.animate(); },
            stopAnimation() { this.isAnimating = false; }
        };
        
        animationInstance.manageTrackState();
        animationInstance.setupMouseControls();
        animationInstance.resetPosition();
        
        if (window.innerWidth > 768) {
            animationInstance.startAnimation();
        } else {
            animationInstance.stopAnimation();
            track.style.transform = 'none';
            track.style.display = 'grid';
        }
        
        animationMap.set(garment, animationInstance);
    },
    
    applyFilterToSection(section, filter, sectionAnimations) {
        const track = section.querySelector('.archive-track');
        if (!track) return;
        
        let visibleCount = 0;
        track.querySelectorAll('.product-card').forEach(card => {
            const cat = card.dataset.category;
            const shouldHide = filter !== 'all' && cat !== filter;
            card.classList.toggle('is-hidden', shouldHide);
            if (!shouldHide) visibleCount++;
        });
        
        const itemCountEl = section.querySelector('.item-count');
        if (itemCountEl) itemCountEl.textContent = visibleCount;
        
        if (window.innerWidth <= 768) {
            section.style.display = visibleCount === 0 ? 'none' : 'block';
        }
        
        const animation = sectionAnimations.get(section.dataset.garment);
        if (animation) {
            animation.updateTotal();
            animation.resetPosition();
        }
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
    },
    
    handleRevealAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.product-card, .index-showcase').forEach(el => {
            el.style.opacity = "0";
            el.style.transform = "translateY(40px)";
            el.style.transition = "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
            observer.observe(el);
        });
    },

    handleMobileSectionNavigation() {
        const navToggle = document.querySelector('.nav-toggle-mobile');
        const sectionNav = document.querySelector('.section-nav-mobile');
        if (!navToggle || !sectionNav) return;
        
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sectionNav.classList.toggle('active');
        });

        document.querySelectorAll('.nav-section-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const garment = link.dataset.garment;
                const targetSection = document.querySelector(`.clothing-section[data-garment="${garment}"]`);
                if (targetSection) {
                    sectionNav.classList.remove('active');
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    },

    handleBackToTop() {
        const backToTopButton = document.getElementById('backToTop');
        if (!backToTopButton) return;
        window.addEventListener('scroll', () => {
            backToTopButton.classList.toggle('visible', window.scrollY > 300);
        }, { passive: true });
        
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
};

// ==============================================
// INITIALIZE
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    LomenApp.init();
});