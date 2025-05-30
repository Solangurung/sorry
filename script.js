document.addEventListener('DOMContentLoaded', function() {
  // ================= CONFIGURATION ================= //
  const config = {
    audio: {
      path: 'audio/WhatsApp Audio 2025-05-30 at 20.05.11_d22ec1e4.mp3',
      volume: 0.7,
      fadeDuration: 1000,
      autoplay: true // Added autoplay flag
    },
    pages: [
      { 
        emoji: '💌', 
        title: 'For You', 
        message: 'A special message from me to you...',
        bgColor: '#fff5f5'
      },
      { 
        emoji: '😔', 
        title: "I'm really, really sorry", 
        message: "My heart aches knowing I hurt you...",
        bgColor: '#fff0f6'
      },
      { 
        emoji: '💔', 
        title: "I never meant to hurt you", 
        message: "If I could take it back, I would...",
        bgColor: '#f8f0ff'
      },
      { 
        emoji: '🌍', 
        title: "You mean the world to me", 
        message: "My days are brighter with you...",
        bgColor: '#f0f4ff'
      },
      { 
        emoji: '🙏', 
        title: "Please give me one more chance", 
        message: "I promise to do better...",
        bgColor: '#f0f9ff'
      },
      { 
        emoji: '❤️', 
        title: "With All My Heart", 
        message: `Mero jannn 🫶\n\nYou are my most precious gift I've ever received 🥺\n\nI know I may have made mistakes, and for that, I'm truly sorry.\nHurting you was never my intention, and it breaks my heart knowing I did.❤️🩹\n\n🌏 You mean the world to me, and every day, I'm reminded of how lucky I am\nto love someone like you my luv 💕\n\nI still can't believe I get to love someone so kind, so genuine,\nso completely incredible. And I'm sorry for any moment that made you\nfeel anything less than cherished 🥺\n\nSo babe I'm here with all my heart—saying I'm sorry, 💞\nand promising to love you better every day.`,
        bgColor: '#ffebee'
      }
    ],
    autoAdvanceDelay: 15000,
    floatingElements: {
      count: 40,
      types: ['heart', 'heart', 'heart', 'sparkle'],
      symbols: { heart: '♥', sparkle: '✧' },
      minSize: 1,
      maxSize: 2.5,
      minOpacity: 0.4,
      maxOpacity: 0.9,
      minDuration: 15,
      maxDuration: 25
    }
  };

  // ================= STATE MANAGEMENT ================= //
  const state = {
    currentPage: 0,
    isPlaying: false,
    advanceTimeout: null,
    audioContext: null,
    gainNode: null
  };

  // ================= AUDIO PLAYER ================= //
  const audio = {
    init: function() {
      this.element = new Audio(config.audio.path);
      this.element.volume = config.audio.volume;
      this.element.loop = true;
      
      try {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = state.audioContext.createMediaElementSource(this.element);
        state.gainNode = state.audioContext.createGain();
        source.connect(state.gainNode);
        state.gainNode.connect(state.audioContext.destination);
      } catch (e) {
        console.warn("Web Audio API not supported");
      }
    },
    
    play: function() {
      if (state.audioContext && state.audioContext.state === 'suspended') {
        state.audioContext.resume();
      }
      
      return this.element.play()
        .then(() => {
          state.isPlaying = true;
          this.fadeIn();
          return true;
        })
        .catch(e => {
          console.log("Playback failed:", e.message);
          return false;
        });
    },
    
    pause: function() {
      this.fadeOut().then(() => {
        this.element.pause();
        state.isPlaying = false;
      });
    },
    
    fadeIn: function() {
      if (!state.gainNode) return;
      
      state.gainNode.gain.setValueAtTime(0, state.audioContext.currentTime);
      state.gainNode.gain.linearRampToValueAtTime(
        config.audio.volume,
        state.audioContext.currentTime + (config.audio.fadeDuration / 1000)
      );
    },
    
    fadeOut: function() {
      if (!state.gainNode) return Promise.resolve();
      
      state.gainNode.gain.linearRampToValueAtTime(
        0,
        state.audioContext.currentTime + (config.audio.fadeDuration / 1000)
      );
      
      return new Promise(resolve => {
        setTimeout(resolve, config.audio.fadeDuration);
      });
    },
    
    // New function to handle autoplay with user interaction
    attemptAutoplay: function() {
      if (!config.audio.autoplay) return;
      
      // Create a one-time click handler for the document
      const enablePlayback = () => {
        this.play().then(success => {
          if (success && ui.heartBtn) {
            ui.heartBtn.innerHTML = '♥';
          }
        });
        document.removeEventListener('click', enablePlayback);
        document.removeEventListener('touchstart', enablePlayback);
      };
      
      // Try to play immediately (may fail due to browser restrictions)
      this.play().catch(() => {
        // If fails, wait for user interaction
        document.addEventListener('click', enablePlayback, { once: true });
        document.addEventListener('touchstart', enablePlayback, { once: true });
      });
    }
  };

  // Initialize audio
  audio.init();

  // ================= UI ELEMENTS ================= //
  const ui = {
    init: function() {
      this.heartBtn = document.querySelector('.btn-heart');
      this.container = document.querySelector('.container');
      this.bindEvents();
    },
    
    bindEvents: function() {
      if (this.heartBtn) {
        this.heartBtn.addEventListener('click', this.togglePlayback.bind(this));
      }
      
      document.addEventListener('click', this.enableAudioContext.bind(this), { once: true });
      
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-next')) {
          e.preventDefault();
          navigation.nextPage();
        }
        
        if (e.target.id === 'restart') {
          navigation.restart();
        }
      });
      
      document.addEventListener('mousemove', navigation.resetTimer);
      document.addEventListener('keydown', navigation.resetTimer);
      document.addEventListener('touchstart', navigation.resetTimer);
    },
    
    togglePlayback: function() {
      if (state.isPlaying) {
        audio.pause();
        this.heartBtn.innerHTML = '♡';
      } else {
        audio.play().then(success => {
          if (success) {
            this.heartBtn.innerHTML = '♥';
            this.heartBtn.style.opacity = '';
          }
        });
      }
    },
    
    enableAudioContext: function() {
      if (state.audioContext && state.audioContext.state === 'suspended') {
        state.audioContext.resume();
      }
    },
    
    renderPage: function(page) {
      if (!this.container) return;
      
      // Format message with line breaks
      const formattedMessage = page.message.replace(/\n/g, '<br>');
      
      this.container.innerHTML = `
        <div class="emoji" aria-hidden="true">${page.emoji}</div>
        <h1>${page.title}</h1>
        <p class="message">${formattedMessage}</p>
        ${state.currentPage < config.pages.length - 1 ? 
          '<button class="btn btn-next" aria-label="Next message">Next</button>' : 
          '<button class="btn" id="restart" aria-label="Start over">Start Over</button>'}
      `;
      
      // Set background color if specified
      if (page.bgColor) {
        document.body.style.backgroundColor = page.bgColor;
      }
      
      document.title = `${page.title} - A Message For You`;
    }
  };

  // ================= NAVIGATION ================= //
  const navigation = {
    nextPage: function() {
      if (state.currentPage < config.pages.length - 1) {
        state.currentPage++;
        this.showCurrentPage();
      }
    },
    
    restart: function() {
      state.currentPage = 0;
      this.showCurrentPage();
    },
    
    showCurrentPage: function() {
      ui.renderPage(config.pages[state.currentPage]);
      this.setupAutoAdvance();
      
      if (state.isPlaying && audio.element.paused) {
        audio.play().catch(e => console.log("Audio resume failed:", e));
      }
    },
    
    setupAutoAdvance: function() {
      clearTimeout(state.advanceTimeout);
      
      if (state.currentPage < config.pages.length - 1) {
        state.advanceTimeout = setTimeout(() => {
          this.nextPage();
        }, config.autoAdvanceDelay);
      }
    },
    
    resetTimer: function() {
      if (state.currentPage < config.pages.length - 1) {
        clearTimeout(state.advanceTimeout);
        navigation.setupAutoAdvance();
      }
    }
  };

  // ================= FLOATING ELEMENTS ================= //
  const effects = {
    createFloatingElements: function() {
      const { types, symbols, count } = config.floatingElements;
      
      // Add CSS animation if not already added
      if (!document.getElementById('floatAnimation')) {
        const style = document.createElement('style');
        style.id = 'floatAnimation';
        style.textContent = `
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
          }
          .float {
            position: fixed;
            pointer-events: none;
            z-index: 1;
            animation-timing-function: linear;
          }
        `;
        document.head.appendChild(style);
      }
      
      for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const el = document.createElement('div');
        el.className = `float ${type}`;
        el.innerHTML = symbols[type];
        el.setAttribute('aria-hidden', 'true');
        
        const size = this.randomInRange(config.floatingElements.minSize, config.floatingElements.maxSize);
        const opacity = this.randomInRange(config.floatingElements.minOpacity, config.floatingElements.maxOpacity);
        const duration = this.randomInRange(config.floatingElements.minDuration, config.floatingElements.maxDuration);
        const delay = Math.random() * 5;
        
        el.style.cssText = `
          font-size: ${size}rem;
          left: ${Math.random() * 100}vw;
          top: ${Math.random() * 100}vh;
          animation: float ${duration}s linear ${delay}s infinite;
          opacity: ${opacity};
          color: ${type === 'heart' ? '#ff6b6b' : '#ffe66d'};
        `;
        
        document.body.appendChild(el);
      }
    },
    
    randomInRange: function(min, max) {
      return Math.random() * (max - min) + min;
    }
  };

  // ================= INITIALIZATION ================= //
  function init() {
    try {
      effects.createFloatingElements();
      ui.init();
      navigation.showCurrentPage();
      
      // Attempt autoplay with fallback to user interaction
      audio.attemptAutoplay();
    } catch (e) {
      console.error("Initialization error:", e);
      if (ui.container) {
        ui.container.innerHTML = '<p class="error">Something went wrong loading this page. Please refresh.</p>';
      }
    }
  }

  init();
});