class SentraDeck {
  constructor() {
    this.currentSlide = 1;
    this.totalSlides = 19;
    this.slides = document.querySelectorAll('.slide');
    this.isAnimating = false;
    
    this.init();
  }

  init() {
    this.createSlideIndicators();
    this.bindEvents();
    this.updateUI();
    this.startInitialAnimations();
  }

  createSlideIndicators() {
    const indicatorsContainer = document.getElementById('slideIndicators');
    
    for (let i = 1; i <= this.totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = 'slide-dot';
      if (i === 1) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToSlide(i));
      indicatorsContainer.appendChild(dot);
    }
  }

  bindEvents() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.isAnimating) return;
      
      switch(e.key) {
        case 'ArrowRight':
        case ' ': // Space bar
          e.preventDefault();
          this.nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          this.goToSlide(1);
          break;
        case 'End':
          e.preventDefault();
          this.goToSlide(this.totalSlides);
          break;
      }
    });

    // Navigation buttons
    document.getElementById('nextBtn').addEventListener('click', () => {
      if (!this.isAnimating) this.nextSlide();
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
      if (!this.isAnimating) this.prevSlide();
    });

    // Touch/swipe support for mobile
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      if (this.isAnimating) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = startX - endX;
      const deltaY = Math.abs(startY - endY);
      
      // Only trigger if horizontal swipe is more significant than vertical
      if (Math.abs(deltaX) > 50 && deltaY < 100) {
        if (deltaX > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    });

    // Prevent default touch behaviors that might interfere
    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides) {
      this.goToSlide(this.currentSlide + 1);
    }
  }

  prevSlide() {
    if (this.currentSlide > 1) {
      this.goToSlide(this.currentSlide - 1);
    }
  }

  goToSlide(slideNumber) {
    if (slideNumber === this.currentSlide || this.isAnimating) return;
    
    if (slideNumber < 1 || slideNumber > this.totalSlides) return;
    
    this.isAnimating = true;
    
    // Remove active class from current slide
    this.slides[this.currentSlide - 1].classList.remove('active');
    
    // Add active class to new slide
    setTimeout(() => {
      this.currentSlide = slideNumber;
      this.slides[this.currentSlide - 1].classList.add('active');
      this.updateUI();
      this.triggerSlideAnimations();
      
      // Reset animation lock after transition
      setTimeout(() => {
        this.isAnimating = false;
      }, 500);
    }, 50);
  }

  updateUI() {
    // Update slide counter
    document.getElementById('currentSlide').textContent = this.currentSlide;
    document.getElementById('totalSlides').textContent = this.totalSlides;
    
    // Update progress bar
    const progressPercentage = (this.currentSlide / this.totalSlides) * 100;
    document.getElementById('progressFill').style.width = `${progressPercentage}%`;
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = this.currentSlide === 1;
    nextBtn.disabled = this.currentSlide === this.totalSlides;
    
    // Update slide indicators
    const dots = document.querySelectorAll('.slide-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index + 1 === this.currentSlide);
    });
  }

  triggerSlideAnimations() {
    const currentSlideElement = this.slides[this.currentSlide - 1];
    const animatedElements = currentSlideElement.querySelectorAll('.animate-fade-up');
    
    // Reset animations
    animatedElements.forEach(element => {
      element.style.animation = 'none';
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
    });
    
    // Trigger animations with a small delay
    setTimeout(() => {
      animatedElements.forEach(element => {
        element.style.animation = '';
      });
    }, 100);
  }

  startInitialAnimations() {
    // Trigger animations for the first slide
    this.triggerSlideAnimations();
  }

  // Method to handle auto-advance (optional feature)
  startAutoAdvance(intervalMs = 10000) {
    this.autoAdvanceInterval = setInterval(() => {
      if (!this.isAnimating) {
        if (this.currentSlide < this.totalSlides) {
          this.nextSlide();
        } else {
          // Reset to first slide when reaching the end
          this.goToSlide(1);
        }
      }
    }, intervalMs);
  }

  stopAutoAdvance() {
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
      this.autoAdvanceInterval = null;
    }
  }

  // Method for print-friendly version
  togglePrintMode() {
    document.body.classList.toggle('print-mode');
    
    if (document.body.classList.contains('print-mode')) {
      // Show all slides for printing
      this.slides.forEach(slide => {
        slide.classList.add('active');
      });
    } else {
      // Return to normal mode
      this.slides.forEach((slide, index) => {
        slide.classList.toggle('active', index + 1 === this.currentSlide);
      });
    }
  }
}

// Initialize the deck when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const deck = new SentraDeck();
  
  // Optional: Add global reference for console access
  window.sentraDeck = deck;
  
  // Add some keyboard shortcuts for presentation mode
  document.addEventListener('keydown', (e) => {
    // 'P' key for print mode
    if (e.key === 'p' || e.key === 'P') {
      if (e.ctrlKey || e.metaKey) {
        return; // Allow normal print functionality
      }
      e.preventDefault();
      deck.togglePrintMode();
    }
    
    // 'A' key to toggle auto-advance
    if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      if (deck.autoAdvanceInterval) {
        deck.stopAutoAdvance();
        console.log('Auto-advance stopped');
      } else {
        deck.startAutoAdvance(8000); // 8 seconds per slide
        console.log('Auto-advance started (8s per slide)');
      }
    }
    
    // 'R' key to restart from first slide
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      deck.goToSlide(1);
    }
  });
  
  // Add fullscreen support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(console.error);
      } else {
        document.exitFullscreen().catch(console.error);
      }
    }
  });
  
  // Handle window resize for responsive updates
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      deck.updateUI();
    }, 100);
  });
});

// Add CSS for print mode
const printModeStyles = `
  .print-mode .slide {
    position: static !important;
    opacity: 1 !important;
    visibility: visible !important;
    page-break-after: always;
    height: auto !important;
    min-height: 100vh;
  }
  
  .print-mode .progress-bar,
  .print-mode .slide-counter,
  .print-mode .nav-arrow,
  .print-mode .slide-indicators {
    display: none !important;
  }
  
  .print-mode body {
    overflow: visible !important;
    height: auto !important;
  }
`;

// Inject print mode styles
const styleSheet = document.createElement('style');
styleSheet.textContent = printModeStyles;
document.head.appendChild(styleSheet);

// Console helper for debugging
console.log('Sentra Deck initialized!');
console.log('Controls:');
console.log('• Arrow keys or Space: Navigate slides');
console.log('• A: Toggle auto-advance');
console.log('• F: Toggle fullscreen');
console.log('• P: Toggle print mode');
console.log('• R: Return to first slide');
console.log('• Home/End: Jump to first/last slide');
console.log('• Click dots at bottom to jump to specific slides');