document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu functionality
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navToggle.querySelector('i').classList.add('fa-bars');
                navToggle.querySelector('i').classList.remove('fa-times');
            }
        });
    }

    // Services Slider
    const sliderContainer = document.querySelector('.services-slider-container');
    const slider = document.querySelector('.services-slider');
    
    if (slider && sliderContainer) {
        const cards = slider.querySelectorAll('.service-card');
        const prevBtn = sliderContainer.querySelector('.prev');
        const nextBtn = sliderContainer.querySelector('.next');
        const dotsContainer = document.querySelector('.slider-dots');
        
        let currentIndex = 1; // Start at 1 because of cloned slide
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let lastTranslate = 0;
        let animationFrame = null;

        function getVisibleSlides() {
            return window.innerWidth <= 768 ? 1 : window.innerWidth <= 992 ? 2 : 3;
        }

        function getSlideWidth() {
            return 100 / getVisibleSlides();
        }

        function getMaxIndex() {
            return cards.length - getVisibleSlides() - 1; // -1 for cloned slides
        }

        // Create dots
        if (dotsContainer) {
            const totalDots = getMaxIndex() - 1;
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.classList.add('slider-dot');
                dot.setAttribute('aria-label', `Slide ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i + 1));
                dotsContainer.appendChild(dot);
            }
        }

        function setSliderPosition(position, animate = true) {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            slider.style.transition = animate ? 'transform 0.5s ease' : 'none';
            slider.style.transform = `translateX(${position}%)`;
            lastTranslate = position;
        }

        function updateSlider(animate = true) {
            const position = -(currentIndex * getSlideWidth());
            setSliderPosition(position, animate);

            // Update dots
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.slider-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex - 1);
                });
            }

            // Update buttons
            if (prevBtn) {
                prevBtn.disabled = currentIndex <= 1;
                prevBtn.style.opacity = currentIndex <= 1 ? '0.5' : '1';
            }
            if (nextBtn) {
                nextBtn.disabled = currentIndex >= getMaxIndex();
                nextBtn.style.opacity = currentIndex >= getMaxIndex() ? '0.5' : '1';
            }
        }

        function goToSlide(index, animate = true) {
            currentIndex = Math.max(1, Math.min(index, getMaxIndex()));
            updateSlider(animate);
            resetAutoplay();
        }

        // Navigation
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 1) {
                    currentIndex--;
                    updateSlider();
                    resetAutoplay();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex < getMaxIndex()) {
                    currentIndex++;
                    updateSlider();
                    resetAutoplay();
                }
            });
        }

        // Touch/Mouse events
        function dragStart(e) {
            if (e.type === 'touchstart') {
                startPos = e.touches[0].clientX;
            } else {
                startPos = e.clientX;
                e.preventDefault();
            }

            isDragging = true;
            slider.style.transition = 'none';
            slider.style.cursor = 'grabbing';

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        }

        function dragMove(e) {
            if (!isDragging) return;

            e.preventDefault();
            const currentPosition = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const diff = currentPosition - startPos;
            const movePercent = (diff / sliderContainer.offsetWidth) * 100;

            currentTranslate = lastTranslate + movePercent;
            setSliderPosition(currentTranslate, false);
        }

        function dragEnd() {
            if (!isDragging) return;

            isDragging = false;
            slider.style.cursor = 'grab';

            const movePercent = currentTranslate - lastTranslate;
            const threshold = 20;

            if (Math.abs(movePercent) > threshold) {
                if (movePercent > 0 && currentIndex > 1) {
                    currentIndex--;
                } else if (movePercent < 0 && currentIndex < getMaxIndex()) {
                    currentIndex++;
                }
            }

            updateSlider();
            resetAutoplay();
        }

        // Event listeners
        slider.addEventListener('mousedown', dragStart);
        slider.addEventListener('touchstart', dragStart, { passive: true });
        window.addEventListener('mousemove', dragMove);
        window.addEventListener('touchmove', dragMove, { passive: false });
        window.addEventListener('mouseup', dragEnd);
        window.addEventListener('touchend', dragEnd);
        window.addEventListener('mouseleave', dragEnd);

        // Prevent context menu
        slider.addEventListener('contextmenu', (e) => e.preventDefault());

        // Handle resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                currentIndex = Math.min(currentIndex, getMaxIndex());
                updateSlider();
            }, 100);
        });

        // Autoplay
        let autoplayInterval;

        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                if (currentIndex < getMaxIndex()) {
                    currentIndex++;
                } else {
                    goToSlide(1, false);
                }
                updateSlider();
            }, 5000);
        }

        function resetAutoplay() {
            clearInterval(autoplayInterval);
            startAutoplay();
        }

        // Pause autoplay on hover/touch
        slider.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
        slider.addEventListener('touchstart', () => clearInterval(autoplayInterval));
        slider.addEventListener('mouseleave', startAutoplay);
        slider.addEventListener('touchend', startAutoplay);

        // Initialize
        updateSlider(false);
        startAutoplay();
    }

    // Close menu when window is resized to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    });
});

