document.addEventListener("DOMContentLoaded", () => {
  
  // 0. CUSTOM CURSOR
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
    
    cursorRing.animate({
      left: `${e.clientX}px`,
      top: `${e.clientY}px`
    }, { duration: 400, fill: "forwards" });
  });

  const interactives = document.querySelectorAll('a, button, .tracker-card, .logo');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // 1. Mouse tracking glass card effect (The $30k interaction)
  const cards = document.querySelectorAll(".tracker-card");

  const updateCardGlow = (e) => {
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
        const rotateX = ((y - centerY) / centerY) * -2; 
        const rotateY = ((x - centerX) / centerX) * 2;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        card.style.transition = 'transform 0.1s ease';
      } else {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      }
    }
  };

  window.addEventListener("mousemove", updateCardGlow);
  
  // 2. SCROLL PINNED MATT FOUNDER EFFECT
  const scrollWrapper = document.querySelector('.scroll-pin-wrapper');
  const mattImg = document.getElementById('matt-img');
  const bioText = document.getElementById('matt-bio-text');
  const typeCursor = document.getElementById('matt-type-cursor');
  
  if (scrollWrapper && bioText) {
    const fullText = bioText.getAttribute('data-text');
    
    mattImg.style.opacity = 0;
    mattImg.style.transform = `scale(1.1)`;
    bioText.textContent = "";
    typeCursor.style.opacity = 0;
    
    window.addEventListener('scroll', () => {
      const rect = scrollWrapper.getBoundingClientRect();
      const wrapperTop = rect.top; 
      
      const scrollableDistance = rect.height - window.innerHeight; 
      
      if (wrapperTop <= 0 && wrapperTop >= -scrollableDistance) {
        const progress = Math.max(0, Math.min(1, -wrapperTop / scrollableDistance));
        
        const imgOpacity = Math.min(1, progress / 0.15);
        mattImg.style.opacity = imgOpacity;
        
        mattImg.style.transform = `scale(${1.1 - (imgOpacity * 0.1)})`;

        if (progress > 0.15) {
          typeCursor.style.opacity = 1;
          // Finish typing by 50% scroll progress so user has time to read
          const textProgress = Math.min(1, Math.max(0, (progress - 0.15) / 0.35));
          const charsToShow = Math.floor(textProgress * fullText.length);
          bioText.textContent = fullText.substring(0, charsToShow);
          
          if (textProgress >= 1) typeCursor.style.opacity = 0; 
        } else {
          bioText.textContent = "";
          typeCursor.style.opacity = 0;
        }
        
      } else if (wrapperTop < -scrollableDistance) {
        mattImg.style.opacity = 1;
        mattImg.style.transform = `scale(1)`;
        bioText.textContent = fullText;
        typeCursor.style.opacity = 0;
      } else {
        mattImg.style.opacity = 0;
        mattImg.style.transform = `scale(1.1)`;
        bioText.textContent = "";
        typeCursor.style.opacity = 0;
      }
    });
  }

  // 3. Fixed Reveal Text Logic & Scrubbable Animation Registration
  const revealTexts = document.querySelectorAll(".reveal-text");
  
  revealTexts.forEach(el => {
    const text = el.textContent.trim();
    if (!el.innerHTML.includes('<span') && !el.innerHTML.includes('<br>')) {
      el.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'reveal-text-container ' + (el.parentElement.classList.contains('text-center') ? '' : 'left');
      
      const words = text.split(/\s+/);
      
      words.forEach((word, idx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'reveal-word';
        wordSpan.setAttribute('data-idx', idx);
        wordSpan.textContent = word;
        container.appendChild(wordSpan);
      });
      
      el.appendChild(container);
    } else {
      el.classList.add('fade-scale-in');
    }
  });

  // 4. SUB-PIXEL SCRUBBABLE SCROLL ENGINE
  const scrubElements = document.querySelectorAll('.fade-scale-in, .fade-scroll, .reveal-word');
  
  function scrubbableScroll() {
    const wh = window.innerHeight;
    
    scrubElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      let offset = 0;
      
      // Class-based offsets for staggered cascade effect
      if (el.classList.contains('stagger-1')) offset += 40;
      if (el.classList.contains('stagger-2')) offset += 80;
      if (el.classList.contains('stagger-3')) offset += 120;
      if (el.classList.contains('stagger-4')) offset += 160;
      
      // Word-based offsets for cascading header builds
      if (el.classList.contains('reveal-word')) {
        const idx = parseInt(el.getAttribute('data-idx')) || 0;
        offset += idx * 25; 
      }
      
      const effectiveDist = (wh - rect.top) - offset;
      const fadeThreshold = 250; // How many px of scroll triggers a full fade-in to 1.0
      
      if (effectiveDist > 0 && rect.bottom > -wh) {
        let progress = Math.max(0, Math.min(1, effectiveDist / fadeThreshold));
        
        el.style.opacity = progress;
        
        if (el.classList.contains('fade-scroll')) {
           el.style.transform = `translateY(${50 * (1 - progress)}px) scale(${0.95 + 0.05 * progress})`;
        } else if (el.classList.contains('fade-scale-in')) {
           el.style.transform = `translateY(${20 * (1 - progress)}px) scale(${0.98 + 0.02 * progress})`;
        } else if (el.classList.contains('reveal-word')) {
           el.style.transform = `translateY(${20 * (1 - progress)}px) scale(${0.98 + 0.02 * progress})`;
        }
      } else if (effectiveDist <= 0) {
        el.style.opacity = 0;
        if (el.classList.contains('fade-scroll')) el.style.transform = `translateY(50px) scale(0.95)`;
        if (el.classList.contains('fade-scale-in')) el.style.transform = `translateY(20px) scale(0.98)`;
        if (el.classList.contains('reveal-word')) el.style.transform = `translateY(20px) scale(0.98)`;
      }
    });
  }

  // Bind to rAF for 120fps sync
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        scrubbableScroll();
        isScrolling = false;
      });
      isScrolling = true;
    }
  });
  
  // Initial fire on load
  scrubbableScroll();

}); // End of DOMContentLoaded
