/**
 * DADEX PRESENTATION ENGINE
 * Production-ready version with critical fixes:
 * - Typewriter animations now start only when the slide is active and reset on navigation.
 * - Typewriter RAFs are paused/resumed correctly with the presentation.
 * - Timeline transition handlers and timeouts are properly cleared on pause.
 * - WebKit scrollbar hiding (CSS note) – added in CSS.
 * - Improved performance and reliability.
 */
(function (global) {
  'use strict';

  const CONFIG = {
    defaultTiming: 8,
    autoStart: true,
    loopDefault: false,
    activationDelay: 100,
    toastDuration: 2500,
    initialAutoStartDelay: 600,
    timelineSyncFallback: 200,
    wordStaggerDefault: 0.06,
    typewriterCharSpeed: 40,
    typewriterBatchSize: 3,
    willChangeDuration: 5200,
  };

  const SPEED_MAP = {
    'very-fast': 0.3,
    'fast': 0.5,
    'normal': 0.8,
    'slow': 1.2,
    'very-slow': 1.9,
    'very-very-slow': 3,
  };

  function getDuration(speed) {
    return SPEED_MAP[speed] || SPEED_MAP['normal'];
  }

  function setPlaybackStatus(state) {
    const el = document.getElementById('playbackStatus');
    if (!el) return;
    const labels = { playing: 'PLAYING', paused: 'PAUSED', stopped: 'STOPPED', ended: 'ENDED' };
    el.classList.remove('is-paused', 'is-stopped', 'is-ended');
    if (state !== 'playing') el.classList.add(`is-${state}`);
    const text = el.querySelector('.status-text');
    if (text) text.textContent = labels[state] || state.toUpperCase();
  }

  /* ============================================================
     PRESENTATION ENGINE
     ============================================================ */
  class PresentationEngine {
    constructor(slidesData) {
      this.data = slidesData;
      this.currentIndex = 0;
      this.isPlaying = false;
      this.isLooping = CONFIG.loopDefault;
      this.totalSlides = slidesData.length;

      this.timer = null;
      this.progressRAF = null;
      this.slideElapsed = 0;
      this.slideStartedAt = null;
      this.lastProgressTimestamp = 0;

      // Typewriter management
      this.typewriterQueue = []; // entries: { el, slideEl, data, rafId }

      // Timeline management
      this.timeline = {
        slideRef: null,
        currentIndex: 0,
        interval: null,
        dotTimeout: null,
        transitionHandler: null,
        progressLine: null,
      };

      this.track = document.getElementById('slidesTrack');
      this.progressFill = document.getElementById('progressFill');
      this.slideCounter = document.getElementById('slideCounter');
      this.liveRegion = document.getElementById('slide-live-region');
      this.deck = document.getElementById('deck');
      this.playBtn = document.getElementById('playBtn');
      this.pauseBtn = document.getElementById('pauseBtn');
      this.loopToggle = document.getElementById('loopToggle');

      this._toastTimer = null;
      this._isOverlayOpen = false;
      this._activationTimeout = null;
      this._focusTimeout = null;
      this._willChangeTimeout = null;
      this._reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.init();
    }

    // ---------- INIT ----------
    init() {
      this.renderSlides();
      this.updateUI();
      this.bindControls();

      const loader = document.getElementById('loading-screen');
      if (loader) {
        const hideLoader = () => {
          if (!loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
            setTimeout(() => { loader.style.display = 'none'; }, 800);
          }
        };
        window.addEventListener('load', hideLoader);
        setTimeout(hideLoader, 4000);
      }

      setPlaybackStatus('paused');
      if (CONFIG.autoStart) {
        setTimeout(() => this.play(), CONFIG.initialAutoStartDelay);
      }

      window.addEventListener('beforeunload', () => this.clearAllTimers());
      document.addEventListener('fullscreenchange', () => this.updateFullscreenIcon());
      this.updateFullscreenIcon();
      this.updateLoopUI();

      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', (e) => {
        this._reducedMotion = e.matches;
        document.body.classList.toggle('reduced-motion', e.matches);
      });
      document.body.classList.toggle('reduced-motion', this._reducedMotion);

      // Detect low-power / non-desktop devices for blob simplification
      const isLowPower = (
        window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 4)
      );
      if (isLowPower || this._reducedMotion) {
        document.body.classList.add('simple-blobs');
      }
    }

    // ---------- CLEANUP ----------
    clearAllTimers() {
      clearTimeout(this.timer);
      if (this.progressRAF) {
        cancelAnimationFrame(this.progressRAF);
        this.progressRAF = null;
      }
      clearTimeout(this._activationTimeout);
      clearTimeout(this._focusTimeout);
      clearTimeout(this._toastTimer);
      clearTimeout(this._willChangeTimeout);
      this.timer = null;
      this._activationTimeout = null;
      this._focusTimeout = null;
      this._toastTimer = null;
      this._willChangeTimeout = null;

      this.clearTypewriterTimers();
      this.clearTimeline(true);
      this.clearAllWillChange();
    }

    clearTypewriterTimers() {
      this.typewriterQueue.forEach(entry => {
        if (entry.rafId) cancelAnimationFrame(entry.rafId);
      });
      this.typewriterQueue = [];
    }

    clearTimeline(resetState = false) {
      if (this.timeline.interval) {
        clearInterval(this.timeline.interval);
        this.timeline.interval = null;
      }
      if (this.timeline.dotTimeout) {
        clearTimeout(this.timeline.dotTimeout);
        this.timeline.dotTimeout = null;
      }
      // Remove transitionend listener if any
      if (this.timeline.transitionHandler && this.timeline.progressLine) {
        this.timeline.progressLine.removeEventListener('transitionend', this.timeline.transitionHandler);
        this.timeline.transitionHandler = null;
      }
      if (resetState) {
        this.timeline.slideRef = null;
        this.timeline.currentIndex = 0;
        this.timeline.progressLine = null;
      }
    }

    // ---------- GPU OPTIMIZATION ----------
    applyWillChange(activeSlide) {
      if (this._reducedMotion) return;
      this.clearAllWillChange();
      clearTimeout(this._willChangeTimeout);
      if (!activeSlide) return;

      activeSlide.style.willChange = 'transform, opacity';
      const selectors = [
        '.anim-fade', '.anim-fade-up', '.anim-zoom', '.anim-wipe-left',
        '.anim-blur', '.anim-scale-fade', '.anim-letter', '.anim-stagger',
        '.card', '.anim-word-fade'
      ];
      activeSlide.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (el.classList.contains('anim-blur')) {
          el.style.willChange = 'transform, opacity, filter';
        } else if (el.classList.contains('anim-letter')) {
          el.style.willChange = 'transform, opacity, letter-spacing';
        } else {
          el.style.willChange = 'transform, opacity';
        }
      });

      this._willChangeTimeout = setTimeout(() => this.clearAllWillChange(), CONFIG.willChangeDuration);
    }

    clearAllWillChange() {
      if (!this.track) return;
      const layered = this.track.querySelectorAll('.slide[style*="will-change"], .slide [style*="will-change"]');
      layered.forEach(el => { el.style.willChange = ''; });
    }

    // ---------- RENDER ----------
    renderSlides() {
      if (!this.track) {
        console.error('Slides track not found');
        return;
      }
      this.track.innerHTML = '';
      let hasError = false;

      this.data.forEach((slide, idx) => {
        try {
          const slideEl = this.createSlideElement(slide, idx);
          this.track.appendChild(slideEl);
        } catch (err) {
          console.error(`Error rendering slide ${idx}:`, err);
          hasError = true;
          const fallback = document.createElement('div');
          fallback.className = 'slide slide-glass';
          fallback.textContent = `Slide ${idx + 1} (error)`;
          this.track.appendChild(fallback);
        }
      });

      if (hasError) {
        this.showToast('Some slides could not be rendered properly');
      }
    }

    createSlideElement(slide, index) {
      const slideEl = document.createElement('div');
      slideEl.className = `slide slide-${slide.id}`;
      slideEl.setAttribute('role', 'group');
      slideEl.setAttribute('aria-roledescription', 'slide');
      const label = slide.label || `Slide ${index + 1} of ${this.totalSlides}`;
      slideEl.setAttribute('aria-label', label);

      if (slide.variant === 'glass') slideEl.classList.add('slide-glass');
      if (slide.variant === 'divider') slideEl.classList.add('slide-divider');

      if (slide.bgImage) {
        slideEl.classList.add('slide-has-bg');
        const bgContainer = document.createElement('div');
        bgContainer.className = 'slide-bg';
        const img = document.createElement('img');
        img.src = slide.bgImage;
        img.alt = slide.label || 'Background';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.onerror = () => { bgContainer.style.display = 'none'; };
        bgContainer.appendChild(img);
        slideEl.appendChild(bgContainer);
      }

      const content = document.createElement('div');
      content.className = 'slide-content';

      if (slide.label) {
        const eyebrow = document.createElement('div');
        eyebrow.className = 'eyebrow anim-fade';
        eyebrow.style.transitionDelay = '0.2s';
        eyebrow.style.transitionDuration = '0.6s';
        eyebrow.textContent = slide.label;
        content.appendChild(eyebrow);
      }

      const tmpl = slide.template || 'centre';
      try {
        if (tmpl === 'centre' || tmpl === 'bullets' || tmpl === 'cards') {
          slide.content.forEach(item => {
            const el = this.createItem(item, slideEl);
            if (el) content.appendChild(el);
          });
        } else if (tmpl === 'two-col') {
          const wrapper = document.createElement('div');
          wrapper.className = 'two-col';
          ['left', 'right'].forEach(side => {
            const col = document.createElement('div');
            col.className = 'col';
            if (side === 'right') col.classList.add('col-center');
            const blocks = slide.content[side] || [];
            blocks.forEach(item => {
              const el = this.createItem(item, slideEl);
              if (el) col.appendChild(el);
            });
            wrapper.appendChild(col);
          });
          content.appendChild(wrapper);
        } else if (tmpl === 'timeline') {
          this.renderTimeline(content, slide.content);
        }
      } catch (err) {
        console.error('Error creating content for slide:', slide.id, err);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'Content could not be loaded.';
        content.appendChild(errorMsg);
      }

      slideEl.appendChild(content);
      return slideEl;
    }

    createPlaceholderImage(altText, width = 400, height = 300) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#f8f5f0');
      grad.addColorStop(1, '#e8e0d8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#D32F2F';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, width - 20, height - 20);
      ctx.fillStyle = '#D32F2F';
      ctx.font = 'bold 24px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🖼️', width / 2, height / 2 - 30);
      ctx.font = '18px Poppins, sans-serif';
      ctx.fillStyle = '#555';
      ctx.fillText(altText || 'Image', width / 2, height / 2 + 30);
      return canvas.toDataURL('image/png');
    }

    // ---------- TYPEWRITER ----------
    /**
     * Sets up a typewriter element without starting the animation.
     * The element is marked with class 'typewriter-element' and its full text
     * is stored in dataset for later reset.
     */
    applyTypewriter(el, item, slideEl) {
      const fullText = item.text || '';
      if (!fullText) return el;

      const charSpeed = item.charSpeed || CONFIG.typewriterCharSpeed;

      el.classList.add('typewriter-element');
      el.dataset.typewriterText = fullText;
      el.innerHTML = '';
      el.style.opacity = '1';

      // Store data on element for later use
      el._typewriterData = {
        fullText,
        charSpeed,
        currentIndex: 0,
        isComplete: false,
        isActive: false,
        paused: false,
      };
      el.dataset.typewriterActive = 'true';

      if (this._reducedMotion) {
        el.textContent = fullText;
        el._typewriterData.isComplete = true;
        el.dataset.typewriterActive = 'false';
      }
      return el;
    }

    /**
     * Starts the typewriter animation for a given element.
     * Assumes the element is already set up with _typewriterData.
     */
    startTypewriterForElement(el) {
      const data = el._typewriterData;
      if (!data || data.isComplete || data.isActive) return;

      // Remove any existing queue entry for this element
      this.typewriterQueue = this.typewriterQueue.filter(entry => entry.el !== el);

      const slideEl = el.closest('.slide');
      const entry = { el, slideEl, data, rafId: null };
      this.typewriterQueue.push(entry);

      data.isActive = true;
      data.paused = false;
      this.runTypewriterRaf(entry);
    }

    runTypewriterRaf(entry) {
      const { el, data } = entry;
      let lastFrame = performance.now();

      const tick = (now) => {
        // Stop if element is no longer in DOM or if data indicates completion/pause
        if (!document.contains(el) || data.isComplete) {
          data.isActive = false;
          el.dataset.typewriterActive = 'false';
          return;
        }

        // If paused, just request next frame (no progress)
        if (data.paused || !this.isPlaying) {
          entry.rafId = requestAnimationFrame(tick);
          return;
        }

        const elapsed = now - lastFrame;
        const charsToAdd = Math.max(1, Math.floor(elapsed / data.charSpeed));
        const end = Math.min(data.currentIndex + charsToAdd, data.fullText.length);

        if (data.currentIndex < data.fullText.length) {
          // Append characters
          const currentText = el.textContent || '';
          const newText = data.fullText.slice(0, end);
          el.textContent = newText;
          data.currentIndex = end;
          lastFrame = now;
        }

        if (data.currentIndex >= data.fullText.length) {
          data.isComplete = true;
          data.isActive = false;
          el.dataset.typewriterActive = 'false';
          return;
        }

        entry.rafId = requestAnimationFrame(tick);
      };

      entry.rafId = requestAnimationFrame(tick);
    }

    /**
     * Resets and starts typewriters for the active slide.
     * Called when a slide becomes active.
     */
    activateTypewritersForSlide(slideEl) {
      if (!slideEl) return;
      // Remove all typewriter entries for this slide (cleanup)
      this.typewriterQueue = this.typewriterQueue.filter(entry => entry.slideEl !== slideEl);

      // Find all typewriter elements in this slide
      const elements = slideEl.querySelectorAll('.typewriter-element');
      elements.forEach(el => {
        const data = el._typewriterData;
        if (!data) return;

        // Reset to initial state
        data.currentIndex = 0;
        data.isComplete = false;
        data.isActive = false;
        data.paused = false;
        el.textContent = '';
        el.dataset.typewriterActive = 'true';

        // If reduced motion, just show full text
        if (this._reducedMotion) {
          el.textContent = data.fullText;
          data.isComplete = true;
          el.dataset.typewriterActive = 'false';
          return;
        }

        // Start if presentation is playing
        if (this.isPlaying) {
          this.startTypewriterForElement(el);
        }
      });
    }

    /**
     * Pauses all typewriters on the current slide.
     */
    pauseTypewritersForSlide(slideEl) {
      if (!slideEl) return;
      this.typewriterQueue.forEach(entry => {
        if (entry.slideEl === slideEl && !entry.data.isComplete) {
          entry.data.paused = true;
          if (entry.rafId) {
            cancelAnimationFrame(entry.rafId);
            entry.rafId = null;
          }
        }
      });
    }

    /**
     * Resumes typewriters on the current slide.
     */
    resumeTypewritersForSlide(slideEl) {
      if (!slideEl) return;
      this.typewriterQueue.forEach(entry => {
        if (entry.slideEl === slideEl && !entry.data.isComplete && entry.data.paused) {
          entry.data.paused = false;
          this.runTypewriterRaf(entry);
        }
      });
    }

    // ---------- WORD-BY-WORD ----------
    applyWordAnimation(el, item) {
      const text = item.text || '';
      if (!text) return el;

      const words = text.split(' ');
      const baseDelay = item.delay || 0;
      const stagger = item.wordStagger || CONFIG.wordStaggerDefault;
      const duration = getDuration(item.speed || 'normal');

      el.innerHTML = '';
      el.style.display = 'flex';
      el.style.flexWrap = 'wrap';
      el.style.justifyContent = 'center';
      el.style.gap = '0.15em 0.3em';
      el.setAttribute('aria-label', text);

      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.textContent = word;
        const delay = baseDelay + i * stagger;
        span.style.transitionDelay = delay + 's';
        span.style.transitionDuration = duration + 's';
        span.className = 'anim-word-fade';
        span.setAttribute('aria-hidden', 'true');
        el.appendChild(span);
      });

      return el;
    }

    // ---------- CREATE ITEM ----------
    createItem(item, slideEl) {
      if (!item) return null;
      const anim = item.animation || 'fade';
      const delay = item.delay || 0;
      const duration = getDuration(item.speed || 'normal');
      const style = `transition-duration: ${duration}s; --anim-delay: ${delay}s;`;

      let el;

      const textTypes = ['mainheading','heading', 'subheading', 'paragraph', 'quote', 'caption'];

      if (anim === 'typewriter' && textTypes.includes(item.type)) {
        if (item.type === 'mainheading') el = document.createElement('h1');
        if (item.type === 'heading') el = document.createElement('h2');
        else if (item.type === 'subheading') el = document.createElement('h3');
        else if (item.type === 'paragraph' || item.type === 'caption') {
          el = document.createElement('p');
          if (item.type === 'caption') el.classList.add('caption');
        } else if (item.type === 'quote') {
          el = document.createElement('blockquote');
          el.classList.add('quote');
        }
        return this.applyTypewriter(el, item, slideEl);
      }

      if (anim === 'word-fade' && textTypes.includes(item.type)) {
        if (item.type === 'mainheading') el = document.createElement('h1');
        if (item.type === 'heading') el = document.createElement('h2');
        else if (item.type === 'subheading') el = document.createElement('h3');
        else if (item.type === 'paragraph' || item.type === 'caption') {
          el = document.createElement('p');
          if (item.type === 'caption') el.classList.add('caption');
        } else if (item.type === 'quote') {
          el = document.createElement('blockquote');
          el.classList.add('quote');
        }
        return this.applyWordAnimation(el, item);
      }

      switch (item.type) {
        case 'mainheading':
          el = document.createElement('h1');
          el.className = `anim-${anim}`;
          el.setAttribute('style', style);
          el.textContent = item.text;
          break;
        case 'heading':
          el = document.createElement('h2');
          el.className = `anim-${anim}`;
          el.setAttribute('style', style);
          el.textContent = item.text;
          break;
        case 'subheading':
          el = document.createElement('h3');
          el.className = `anim-${anim}`;
          el.setAttribute('style', style);
          el.textContent = item.text;
          break;
        case 'paragraph':
          el = document.createElement('p');
          el.className = `anim-${anim}`;
          el.setAttribute('style', style);
          el.textContent = item.text;
          break;
        case 'quote':
          el = document.createElement('blockquote');
          el.className = `quote anim-${anim}`;
          el.setAttribute('style', style);
          el.textContent = item.text;
          break;
        case 'caption':
          el = document.createElement('p');
          el.className = `caption anim-${anim}`;
          el.setAttribute('style', style);
          el.textContent = item.text;
          break;
        case 'image': {
          el = document.createElement('div');
          el.className = `slide-image ${item.cssClass || ''} anim-${anim}`;
          el.setAttribute('style', style);
          const img = document.createElement('img');
          const altText = item.alt || 'Image';
          img.alt = altText;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.src = item.src;
          img.onerror = () => {
            const placeholder = this.createPlaceholderImage(altText, 400, 300);
            img.src = placeholder;
            img.onerror = null;
            console.warn(`Image not found: ${item.src}, using placeholder.`);
          };
          el.appendChild(img);
          break;
        }
        case 'bullet-list': {
          el = document.createElement('ul');
          el.className = 'mission-grid';
          const baseDelay = item.delay || 0;
          const stagger = item.stagger || 0.3;
          const dur = getDuration(item.speed || 'normal');
          (item.items || []).forEach((liText, i) => {
            const li = document.createElement('li');
            li.textContent = liText;
            const d = baseDelay + i * stagger;
            li.className = `anim-${item.animation || 'fade-up'}`;
            li.style.transitionDuration = dur + 's';
            li.style.setProperty('--anim-delay', d + 's');
            el.appendChild(li);
          });
          break;
        }
        case 'card-grid': {
          el = document.createElement('div');
          const cols = item.cols || 3;
          el.className = `card-grid cols-${cols}`;
          const baseDelay = Number(item.delay ?? 0.5);
          const stagger = Number(item.stagger ?? 0.15);
          const dur = getDuration(item.speed || 'normal');
          (item.cards || []).forEach((card, i) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            cardDiv.style.setProperty('--card-delay', `${baseDelay + i * stagger}s`);
            cardDiv.style.setProperty('--card-duration', `${dur}s`);

            if (card.icon) {
              const icon = document.createElement('div');
              icon.className = 'icon';
              const iEl = document.createElement('i');
              iEl.className = `fas ${getIcon(card.icon)}`;
              icon.appendChild(iEl);
              cardDiv.appendChild(icon);
            }

            const title = document.createElement('h4');
            title.textContent = card.title;
            cardDiv.appendChild(title);

            const desc = document.createElement('p');
            desc.textContent = card.desc || '';
            cardDiv.appendChild(desc);

            el.appendChild(cardDiv);
          });
          break;
        }
        case 'contact-info': {
          el = document.createElement('div');
          el.className = 'epilogue-contact';
          const baseDelay = item.delay || 0;
          const stagger = item.stagger || 0.4;
          const dur = getDuration(item.speed || 'normal');
          (item.items || []).forEach((contact, i) => {
            const span = document.createElement('span');
            const icon = document.createElement('i');
            icon.className = `fas ${getIcon(contact.icon)}`;
            span.appendChild(icon);
            span.appendChild(document.createTextNode(` ${contact.text}`));
            const d = baseDelay + i * stagger;
            span.className = `anim-${item.animation || 'fade-up'}`;
            span.style.transitionDuration = dur + 's';
            span.style.setProperty('--anim-delay', d + 's');
            el.appendChild(span);
          });
          break;
        }
        default:
          return null;
      }
      return el;
    }

    renderTimeline(container, data) {
      if (!data || typeof data !== 'object') return;
      const wrapper = document.createElement('div');
      wrapper.className = 'timeline-container';

      if (data.era) {
        const era = document.createElement('div');
        era.className = 'eyebrow anim-fade';
        era.style.transitionDelay = '0.25s';
        era.style.transitionDuration = '0.65s';
        era.textContent = data.era;
        wrapper.appendChild(era);
      }
      if (data.title) {
        const title = document.createElement('h2');
        title.textContent = data.title;
        title.className = 'anim-fade-up';
        title.style.transitionDelay = '0.5s';
        title.style.transitionDuration = '0.8s';
        wrapper.appendChild(title);
      }
      if (data.intro) {
        const intro = document.createElement('p');
        intro.textContent = data.intro;
        intro.className = 'anim-fade';
        intro.style.transitionDelay = '2s';
        intro.style.transitionDuration = '0.8s';
        wrapper.appendChild(intro);
      }

      const trackEl = document.createElement('div');
      trackEl.className = 'timeline-track';

      const bgLine = document.createElement('div');
      bgLine.className = 'timeline-bg-line';
      trackEl.appendChild(bgLine);

      const progressLine = document.createElement('div');
      progressLine.className = 'timeline-progress-line';
      progressLine.style.width = '0%';
      trackEl.appendChild(progressLine);

      const items = document.createElement('ul');
      items.className = 'timeline-items';
      items.setAttribute('role', 'list');
      items.setAttribute('aria-label', 'Timeline events');
      const events = data.events || [];
      items.style.setProperty('--timeline-count', Math.max(events.length, 1));
      events.forEach((evt) => {
        const item = document.createElement('li');
        item.className = 'timeline-item';
        item.setAttribute('role', 'listitem');
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        item.appendChild(dot);
        const year = document.createElement('span');
        year.className = 'timeline-year';
        year.textContent = evt.year || '';
        item.appendChild(year);
        const title = document.createElement('span');
        title.className = 'timeline-title';
        title.textContent = evt.title || '';
        item.appendChild(title);
        if (evt.desc) {
          const desc = document.createElement('span');
          desc.className = 'timeline-desc';
          desc.textContent = evt.desc;
          item.appendChild(desc);
        }
        items.appendChild(item);
      });
      trackEl.appendChild(items);
      wrapper.appendChild(trackEl);
      container.appendChild(wrapper);
    }

    // ---------- UI UPDATE ----------
    updateUI() {
      clearTimeout(this._activationTimeout);
      this.clearTimeline(true);
      // We'll handle typewriters in activation

      if (!this.track) return;

      this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

      const currentSlideData = this.data[this.currentIndex];
      if (this.deck) {
        this.deck.classList.toggle('has-bg-active', !!(currentSlideData && currentSlideData.bgImage));
      }

      const slides = this.track.querySelectorAll('.slide');
      slides.forEach((slide, i) => {
        if (i !== this.currentIndex) {
          slide.classList.remove('active');
          slide.setAttribute('aria-hidden', 'true');
          slide.setAttribute('inert', '');
        } else {
          slide.removeAttribute('inert');
        }
      });

      this._activationTimeout = setTimeout(() => {
        const activeSlide = slides[this.currentIndex];
        if (activeSlide) {
          activeSlide.classList.add('active');
          activeSlide.setAttribute('aria-hidden', 'false');
          activeSlide.removeAttribute('inert');

          // Apply GPU optimisation
          this.applyWillChange(activeSlide);

          // Activate typewriters for this slide
          this.activateTypewritersForSlide(activeSlide);

          // Initialize timeline if present
          if (activeSlide.querySelector('.timeline-container')) {
            this.timeline.currentIndex = 0;
            this.initTimeline(activeSlide);
          }

          // Focus management
          const activeEl = document.activeElement;
          const inNav = activeEl && activeEl.closest('.deck-nav');
          if (!inNav) {
            const heading = activeSlide.querySelector('h2, h3, h1');
            if (heading) {
              heading.setAttribute('tabindex', '-1');
              heading.focus({ preventScroll: true });
            }
          }
        }
      }, CONFIG.activationDelay);

      if (this.slideCounter) {
        this.slideCounter.textContent = `${this.currentIndex + 1} / ${this.totalSlides}`;
      }

      if (this.liveRegion) {
        const heading = slides[this.currentIndex]?.querySelector('h2, h3, h1');
        this.liveRegion.textContent = heading ? heading.textContent.trim() : `Slide ${this.currentIndex + 1}`;
      }

      this.updateProgress(0);
      const progressEl = document.querySelector('.footer-progress');
      if (progressEl) progressEl.setAttribute('aria-valuenow', '0');
      if (this.progressFill) {
        this.progressFill.classList.remove('no-transition');
      }

      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      if (prevBtn) {
        prevBtn.disabled = this.currentIndex === 0 && !this.isLooping;
      }
      if (nextBtn) {
        nextBtn.disabled = this.currentIndex === this.totalSlides - 1 && !this.isLooping;
      }
    }

    // ---------- TIMELINE ----------
    initTimeline(slideEl) {
      this.clearTimeline(true);

      const items = slideEl.querySelectorAll('.timeline-item');
      if (!items.length) return;

      this.timeline.slideRef = slideEl;
      this.timeline.currentIndex = 0;

      const progressLine = slideEl.querySelector('.timeline-progress-line');
      this.timeline.progressLine = progressLine;
      if (progressLine) {
        progressLine.style.setProperty('--progress-width', '0%');
        progressLine.style.width = '0%';
      }

      items.forEach(item => {
        item.classList.remove('past', 'current', 'future', 'visible');
        item.classList.add('future');
      });

      if (items.length > 0) {
        this._updateTimelineItemsSync(items, 0, true);
      }

      if (this.isPlaying) {
        this.startTimelineAutoAdvance(slideEl);
      }
    }

    startTimelineAutoAdvance(slideEl) {
      this.clearTimeline(false);

      const items = slideEl.querySelectorAll('.timeline-item');
      if (!items.length) return;

      const total = items.length;
      if (total <= 1) {
        if (this.timeline.progressLine) {
          this.timeline.progressLine.style.setProperty('--progress-width', '100%');
          this.timeline.progressLine.style.width = '100%';
        }
        this._updateTimelineItemsSync(items, 0, true);
        return;
      }

      let currentIndex = this.timeline.currentIndex || 0;
      const slideData = this.data[this.currentIndex] || {};
      const totalMs = Math.max(1000, (slideData.timing || CONFIG.defaultTiming) * 1000);
      const openingMs = Math.min(1200, Math.max(0, totalMs * 0.06));
      const timelineMs = Math.max(1000, totalMs - openingMs);
      const intervalMs = Math.max(700, Math.floor(timelineMs / (total - 1)));
      const reducedMotion = document.body.classList.contains('reduced-motion');
      const syncMs = reducedMotion ? 0 : Math.min(1200, Math.max(450, Math.round(intervalMs * 0.28)));
      slideEl.style.setProperty('--timeline-transition', `${syncMs / 1000}s`);

      this.timeline.currentIndex = currentIndex;
      this._updateTimelineItemsSync(items, currentIndex, true);

      this.timeline.interval = setInterval(() => {
        if (!this.isPlaying) {
          clearInterval(this.timeline.interval);
          this.timeline.interval = null;
          return;
        }

        currentIndex++;
        if (currentIndex >= total) {
          currentIndex = total - 1;
          this.timeline.currentIndex = currentIndex;
          this._updateTimelineItemsSync(items, currentIndex);
          clearInterval(this.timeline.interval);
          this.timeline.interval = null;
          return;
        } else {
          this.timeline.currentIndex = currentIndex;
          this._updateTimelineItemsSync(items, currentIndex);
        }
      }, intervalMs);
    }

    _updateTimelineItemsSync(items, currentIndex, instant = false) {
      const total = items.length;
      const slideEl = items[0]?.closest('.slide');
      const progressLine = this.timeline.progressLine || slideEl?.querySelector('.timeline-progress-line');

      const progress = total <= 1 ? 100 : (currentIndex / (total - 1)) * 100;
      const progressPct = Math.min(progress, 100);

      if (progressLine) {
        progressLine.style.setProperty('--progress-width', progressPct + '%');
        progressLine.style.width = progressPct + '%';
      }

      const updateDots = () => {
        items.forEach((item, i) => {
          item.classList.remove('past', 'current', 'future', 'visible');
          if (i < currentIndex) {
            item.classList.add('past');
          } else if (i === currentIndex) {
            item.classList.add('current', 'visible');
            item.style.opacity = '1';
          } else {
            item.classList.add('future');
          }
        });
      };

      if (instant) {
        updateDots();
        return;
      }

      const syncMs = document.body.classList.contains('reduced-motion')
        ? 0
        : Math.min(1200, Math.max(450, Math.round(
          ((this.data[this.currentIndex]?.timing || CONFIG.defaultTiming) * 1000) /
          Math.max(items.length - 1, 1) * 0.28
        )));

      if (progressLine) {
        // Remove any previous listener
        if (this.timeline.transitionHandler) {
          progressLine.removeEventListener('transitionend', this.timeline.transitionHandler);
          this.timeline.transitionHandler = null;
        }

        const handler = () => {
          progressLine.removeEventListener('transitionend', handler);
          this.timeline.transitionHandler = null;
          updateDots();
        };
        progressLine.addEventListener('transitionend', handler);
        this.timeline.transitionHandler = handler;

        clearTimeout(this.timeline.dotTimeout);
        this.timeline.dotTimeout = setTimeout(() => {
          if (this.timeline.transitionHandler) {
            progressLine.removeEventListener('transitionend', this.timeline.transitionHandler);
            this.timeline.transitionHandler = null;
          }
          updateDots();
          this.timeline.dotTimeout = null;
        }, syncMs + CONFIG.timelineSyncFallback);
      } else {
        clearTimeout(this.timeline.dotTimeout);
        this.timeline.dotTimeout = setTimeout(() => {
          updateDots();
          this.timeline.dotTimeout = null;
        }, syncMs);
      }
    }

    // ---------- PLAYBACK ----------
    play() {
      if (this.isPlaying) return;

      this.isPlaying = true;
      setPlaybackStatus('playing');

      if (this.playBtn) this.playBtn.hidden = true;
      if (this.pauseBtn) this.pauseBtn.hidden = false;
      document.body.classList.add('auto-playing');

      this.showToast('Playing');

      // Resume typewriters for current slide
      const currentSlide = this.track?.children[this.currentIndex];
      if (currentSlide) {
        this.resumeTypewritersForSlide(currentSlide);
        // Resume timeline if present
        if (currentSlide.querySelector('.timeline-container')) {
          if (!this.timeline.interval) {
            this.startTimelineAutoAdvance(currentSlide);
          }
        }
      }

      this.startTimer();
    }

    pause(silent = false) {
      if (!this.isPlaying) return;

      const slide = this.data[this.currentIndex];
      const time = (slide.timing || CONFIG.defaultTiming) * 1000;

      if (this.slideStartedAt) {
        this.slideElapsed += Date.now() - this.slideStartedAt;
        this.slideElapsed = Math.min(this.slideElapsed, time);
      }
      this.slideStartedAt = null;
      this.isPlaying = false;
      setPlaybackStatus('paused');

      if (this.playBtn) this.playBtn.hidden = false;
      if (this.pauseBtn) this.pauseBtn.hidden = true;
      document.body.classList.remove('auto-playing');

      clearTimeout(this.timer);
      if (this.progressRAF) {
        cancelAnimationFrame(this.progressRAF);
        this.progressRAF = null;
      }
      this.timer = null;

      // Pause timeline (stop interval and remove transition listeners)
      this.clearTimeline(false); // don't reset state, just stop

      // Pause typewriters for current slide
      const currentSlide = this.track?.children[this.currentIndex];
      if (currentSlide) {
        this.pauseTypewritersForSlide(currentSlide);
      }

      if (!silent) this.showToast('Paused');
    }

    stop() {
      this.pause(true);
      this.currentIndex = 0;
      this.resetSlideTimer();
      // Reset typewriters for new slide (which will be activated in updateUI)
      this.clearTypewriterTimers(); // clear all typewriter entries
      this.clearTimeline(true);
      this.updateUI();
      setPlaybackStatus('stopped');
      this.showToast('Stopped');
    }

    // ---------- SLIDE TIMER ----------
    startTimer() {
      const slide = this.data[this.currentIndex];
      const time = (slide.timing || CONFIG.defaultTiming) * 1000;
      const remaining = Math.max(0, time - this.slideElapsed);

      clearTimeout(this.timer);
      if (this.progressRAF) {
        cancelAnimationFrame(this.progressRAF);
        this.progressRAF = null;
      }

      this.slideStartedAt = performance.now();
      this.lastProgressTimestamp = this.slideStartedAt;

      const updateProgressLoop = () => {
        if (!this.isPlaying) return;
        const now = performance.now();
        const delta = now - this.lastProgressTimestamp;
        this.lastProgressTimestamp = now;

        this.slideElapsed = Math.min(time, this.slideElapsed + delta);
        const pct = (this.slideElapsed / time) * 100;
        this.updateProgress(pct);

        const progressEl = document.querySelector('.footer-progress');
        if (progressEl) {
          progressEl.setAttribute('aria-valuenow', Math.round(pct));
        }

        if (this.isPlaying && this.slideElapsed < time) {
          this.progressRAF = requestAnimationFrame(updateProgressLoop);
        }
      };
      this.progressRAF = requestAnimationFrame(updateProgressLoop);

      this.timer = setTimeout(() => {
        this.slideElapsed = time;
        this.updateProgress(100);
        const progressEl = document.querySelector('.footer-progress');
        if (progressEl) progressEl.setAttribute('aria-valuenow', '100');

        if (this.progressRAF) {
          cancelAnimationFrame(this.progressRAF);
          this.progressRAF = null;
        }
        this.timer = null;

        if (this.currentIndex < this.totalSlides - 1) {
          this.currentIndex++;
          this.slideElapsed = 0;
          this.slideStartedAt = null;
          this.updateUI();
          this.startTimer();
        } else if (this.isLooping) {
          this.currentIndex = 0;
          this.slideElapsed = 0;
          this.slideStartedAt = null;
          this.updateUI();
          this.startTimer();
        } else {
          this.isPlaying = false;
          this.slideStartedAt = null;
          if (this.playBtn) this.playBtn.hidden = false;
          if (this.pauseBtn) this.pauseBtn.hidden = true;
          document.body.classList.remove('auto-playing');
          setPlaybackStatus('ended');
          this.clearTimeline(true);
          // Pause all typewriters
          this.typewriterQueue.forEach(entry => {
            if (entry.rafId) {
              cancelAnimationFrame(entry.rafId);
              entry.rafId = null;
            }
            entry.data.isActive = false;
          });
        }
      }, remaining);
    }

    resetSlideTimer() {
      clearTimeout(this.timer);
      if (this.progressRAF) {
        cancelAnimationFrame(this.progressRAF);
        this.progressRAF = null;
      }
      this.timer = null;
      this.slideElapsed = 0;
      this.slideStartedAt = null;
      if (this.progressFill) {
        this.progressFill.classList.add('no-transition');
        this.updateProgress(0);
        void this.progressFill.offsetHeight;
        this.progressFill.classList.remove('no-transition');
      } else {
        this.updateProgress(0);
      }
      const progressEl = document.querySelector('.footer-progress');
      if (progressEl) progressEl.setAttribute('aria-valuenow', '0');
    }

    updateProgress(pct) {
      if (this.progressFill) {
        this.progressFill.style.width = `${pct}%`;
      }
    }

    // ---------- HELPERS ----------
    showToast(msg) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => toast.classList.remove('show'), CONFIG.toastDuration);
    }

    updateFullscreenIcon() {
      const btn = document.getElementById('fullscreenBtn');
      if (!btn) return;
      const icon = btn.querySelector('i');
      if (document.fullscreenElement) {
        icon.className = 'fas fa-compress';
      } else {
        icon.className = 'fas fa-expand';
      }
    }

    updateLoopUI() {
      if (this.loopToggle) {
        this.loopToggle.style.color = this.isLooping ? 'var(--brand)' : '';
        this.loopToggle.setAttribute('aria-pressed', this.isLooping ? 'true' : 'false');
      }
    }

    goToSlide(index) {
      this.pause(true);
      this.clearTimeline(true);
      // Clear typewriter entries (they will be re-created on activation)
      this.clearTypewriterTimers();
      this.currentIndex = Math.max(0, Math.min(index, this.totalSlides - 1));
      this.resetSlideTimer();
      this.updateUI();
      setPlaybackStatus('paused');
    }

    // ---------- CONTROLS ----------
    bindControls() {
      const nextBtn = document.getElementById('nextBtn');
      const prevBtn = document.getElementById('prevBtn');
      const playBtn = this.playBtn;
      const pauseBtn = this.pauseBtn;
      const stopBtn = document.getElementById('stopBtn');
      const homeBtn = document.getElementById('homeBtn');
      const fullscreenBtn = document.getElementById('fullscreenBtn');
      const loopToggle = this.loopToggle;
      const helpBtn = document.getElementById('helpBtn');
      const helpClose = document.getElementById('helpClose');
      const helpOverlay = document.getElementById('helpOverlay');

      nextBtn?.addEventListener('click', () => {
        const next = this.currentIndex + 1;
        if (next < this.totalSlides) this.goToSlide(next);
        else if (this.isLooping) this.goToSlide(0);
      });

      prevBtn?.addEventListener('click', () => {
        const prev = this.currentIndex - 1;
        if (prev >= 0) this.goToSlide(prev);
        else if (this.isLooping) this.goToSlide(this.totalSlides - 1);
      });

      playBtn?.addEventListener('click', () => this.play());
      pauseBtn?.addEventListener('click', () => this.pause());
      stopBtn?.addEventListener('click', () => this.stop());
      homeBtn?.addEventListener('click', () => this.goToSlide(0));

      fullscreenBtn?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => this.showToast('Fullscreen not supported'));
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      });

      loopToggle?.addEventListener('click', () => {
        this.isLooping = !this.isLooping;
        this.updateLoopUI();
        this.showToast(this.isLooping ? 'Loop On' : 'Loop Off');
      });
      this.updateLoopUI();

      const openHelp = () => {
        this._isOverlayOpen = true;
        helpOverlay?.classList.add('open');
        helpOverlay?.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
          const closeBtn = document.getElementById('helpClose');
          if (closeBtn) closeBtn.focus();
        }, 100);
      };
      const closeHelp = () => {
        this._isOverlayOpen = false;
        helpOverlay?.classList.remove('open');
        helpOverlay?.setAttribute('aria-hidden', 'true');
        helpBtn?.focus();
      };

      helpBtn?.addEventListener('click', openHelp);
      helpClose?.addEventListener('click', closeHelp);

      helpOverlay?.addEventListener('click', (e) => {
        if (e.target === helpOverlay) closeHelp();
      });

      helpOverlay?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeHelp();
          return;
        }
        if (e.key === 'Tab') {
          const focusable = helpOverlay.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });

      document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

        if (this._isOverlayOpen) {
          if (e.key === 'Escape') {
            e.preventDefault();
            closeHelp();
          }
          return;
        }

        switch (e.key) {
          case 'ArrowRight': e.preventDefault(); nextBtn?.click(); break;
          case 'ArrowLeft':  e.preventDefault(); prevBtn?.click(); break;
          case ' ':
            e.preventDefault();
            if (this.isPlaying) this.pause();
            else this.play();
            break;
          case 'Home': e.preventDefault(); this.goToSlide(0); break;
          case 'End':  e.preventDefault(); this.goToSlide(this.totalSlides - 1); break;
          case 'f':
          case 'F': e.preventDefault(); fullscreenBtn?.click(); break;
          case 'l':
          case 'L': e.preventDefault(); loopToggle?.click(); break;
          case 'Escape':
            if (helpOverlay?.classList.contains('open')) closeHelp();
            break;
          case '?': e.preventDefault(); openHelp(); break;
        }
      });

      let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
      document.addEventListener('touchstart', (e) => {
        const t = e.changedTouches[0];
        touchStartX = t.screenX;
        touchStartY = t.screenY;
        touchStartTime = Date.now();
      }, { passive: true });

      document.addEventListener('touchend', (e) => {
        const t = e.changedTouches[0];
        const dx = t.screenX - touchStartX;
        const dy = t.screenY - touchStartY;
        const dt = Date.now() - touchStartTime;
        if (dt > 700) return;
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
        const target = e.target.closest('button, a, input, textarea, .deck-nav, .overlay');
        if (target) return;
        if (dx < 0) nextBtn?.click();
        else prevBtn?.click();
      }, { passive: true });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.isPlaying) {
          this.pause();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof slidesData !== 'undefined') {
      const app = new PresentationEngine(slidesData);
      global.app = app;
    } else {
      console.error('slidesData is not defined. Make sure slides.js is loaded before engine.js');
    }
  });
})(window);