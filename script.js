document.addEventListener('DOMContentLoaded', () => {

  /* ============ PRELOADER ============ */
  const preloader = document.getElementById('preloader');
  const barFill = document.querySelector('.preloader__bar span');
  const pctText = document.querySelector('.preloader__pct');
  let progress = 0;
  const loadTimer = setInterval(() => {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadTimer);
      setTimeout(() => preloader.classList.add('is-hidden'), 250);
    }
    barFill.style.width = progress + '%';
    pctText.textContent = Math.floor(progress) + '%';
  }, 160);

  /* ============ NAV: scrolled state + burger ============ */
  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const navBurger = document.getElementById('navBurger');

  navBurger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navBurger.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navBurger.setAttribute('aria-expanded', 'false');
  }));

  /* ============ SCROLL: battery indicator + nav bg + timeline fill ============ */
  const batteryFill = document.getElementById('batteryFill');
  const batteryPct = document.getElementById('batteryPct');
  const timelineFill = document.getElementById('timelineFill');
  const timelineSection = document.getElementById('proceso');
  const maxFillWidth = 19; // matches svg rect width budget

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;

    nav.classList.toggle('is-scrolled', scrollTop > 20);
    batteryFill.setAttribute('width', (pct / 100 * maxFillWidth).toFixed(1));
    batteryPct.textContent = pct + '%';
    batteryFill.setAttribute('fill', pct < 20 ? '#ff6b6b' : 'var(--cyan)');

    if (timelineSection) {
      const rect = timelineSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh - rect.top) / (rect.height + vh * 0.3);
      const clamped = Math.max(0, Math.min(1, raw));
      timelineFill.style.width = (clamped * 100) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============ REVEAL ON SCROLL ============ */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ============ STATS COUNTER ============ */
  const statNumbers = document.querySelectorAll('.stats__number');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = value.toLocaleString('es-CO') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('es-CO') + suffix;
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => statObserver.observe(el));

  /* ============ SERVICE CARD SPOTLIGHT (mouse position) ============ */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  /* ============ CATALOGO: FILTROS POR MARCA + CONDICIÓN ============ */
  const brandTabs = document.querySelectorAll('.brand-tab');
  const conditionChips = document.querySelectorAll('.condition-chip');
  const productCards = document.querySelectorAll('.product-card');
  const catalogEmpty = document.getElementById('catalogEmpty');

  let activeBrand = 'todos';
  let activeCondition = 'todos';

  function applyFilters() {
    let visibleCount = 0;
    productCards.forEach((card, i) => {
      const brandMatch = activeBrand === 'todos' || card.dataset.brand === activeBrand;
      const conditionMatch = activeCondition === 'todos' || card.dataset.condition === activeCondition;
      const match = brandMatch && conditionMatch;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        visibleCount++;
        card.style.animation = 'none';
        void card.offsetWidth; // reflow para reiniciar la animación
        card.style.animation = `product-in .5s var(--ease) ${Math.min(i, 8) * 0.04}s both`;
      }
    });
    catalogEmpty.hidden = visibleCount !== 0;
  }

  brandTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeBrand = tab.dataset.brand;
      brandTabs.forEach(t => t.classList.toggle('brand-tab--active', t === tab));
      applyFilters();
    });
  });

  conditionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      activeCondition = chip.dataset.condition;
      conditionChips.forEach(c => c.classList.toggle('condition-chip--active', c === chip));
      applyFilters();
    });
  });

  /* ============ SEDES: TABS ============ */
  const locationTabs = document.querySelectorAll('.locations__tab');
  const locationCards = document.querySelectorAll('.location-card');
  locationTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.location;
      locationTabs.forEach(t => t.classList.toggle('locations__tab--active', t === tab));
      locationCards.forEach(card => card.classList.toggle('location-card--active', card.dataset.panel === target));
    });
  });

  /* ============ HERO CITY PILLS (visual sync with sedes tabs) ============ */
  const cityPills = document.querySelectorAll('.city-pill');
  cityPills.forEach(pill => {
    pill.addEventListener('click', () => {
      cityPills.forEach(p => p.classList.toggle('city-pill--active', p === pill));
      const matchingTab = document.querySelector(`.locations__tab[data-location="${pill.dataset.city}"]`);
      if (matchingTab) matchingTab.click();
    });
  });

  /* ============ ACCORDION (FAQ) ============ */
  document.querySelectorAll('.accordion__item').forEach(item => {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.accordion__item').forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.accordion__panel').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ============ TESTIMONIALS CAROUSEL ============ */
  const track = document.getElementById('testTrack');
  const cards = track ? track.querySelectorAll('.testimonial-card') : [];
  const dotsWrap = document.getElementById('testDots');
  const prevBtn = document.getElementById('testPrev');
  const nextBtn = document.getElementById('testNext');
  let currentIndex = 0;

  function cardsPerView() {
    if (window.innerWidth <= 720) return 1;
    if (window.innerWidth <= 980) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - cardsPerView());
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const dot = document.createElement('span');
      if (i === currentIndex) dot.classList.add('is-active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(maxIndex(), index));
    if (!cards.length) return;
    const cardWidth = cards[0].getBoundingClientRect().width + 22;
    track.scrollTo({ left: currentIndex * cardWidth, behavior: 'smooth' });
    [...dotsWrap.children].forEach((dot, i) => dot.classList.toggle('is-active', i === currentIndex));
  }

  if (track && cards.length) {
    buildDots();
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    let autoplay = setInterval(() => {
      goTo(currentIndex >= maxIndex() ? 0 : currentIndex + 1);
    }, 4500);

    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplay));
    track.parentElement.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => {
        goTo(currentIndex >= maxIndex() ? 0 : currentIndex + 1);
      }, 4500);
    });

    window.addEventListener('resize', () => { buildDots(); goTo(0); });
  }

  /* ============ HERO CHAT ANIMATION (loop) ============ */
  const chatBody = document.getElementById('chatBody');
  const conversation = [
    { side: 'in', text: 'Hola, se me partió la pantalla del celular 📱' },
    { side: 'out', text: '¡Hola! Con gusto te ayudamos. ¿Qué modelo es?' },
    { side: 'in', text: 'Es un Samsung A54' },
    { side: 'out', text: 'Perfecto, tenemos el repuesto. Diagnóstico gratis hoy mismo 👍' },
  ];

  let chatTimeouts = [];
  function playChat() {
    chatTimeouts.forEach(t => clearTimeout(t));
    chatTimeouts = [];
    chatBody.innerHTML = '';
    conversation.forEach((msg, i) => {
      const t = setTimeout(() => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble chat-bubble--${msg.side}`;
        bubble.textContent = msg.text;
        chatBody.appendChild(bubble);
        while (chatBody.children.length > 4) chatBody.removeChild(chatBody.firstChild);
      }, i * 1600);
      chatTimeouts.push(t);
    });
    const restart = setTimeout(playChat, conversation.length * 1600 + 2800);
    chatTimeouts.push(restart);
  }
  if (chatBody) playChat();

  /* ============ COTIZADOR RÁPIDO ============ */
  const repairData = {
    iphone: {
      label: 'iPhone',
      models: ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'],
      damages: {
        'Pantalla rota': [150000, 450000],
        'Batería': [90000, 150000],
        'Puerto de carga': [80000, 140000],
        'Cámara': [120000, 220000],
        'No enciende / placa': [150000, 380000]
      }
    },
    samsung: {
      label: 'Samsung',
      models: ['Galaxy A15', 'Galaxy A55', 'Galaxy S22', 'Galaxy S23', 'Galaxy S24'],
      damages: {
        'Pantalla rota': [130000, 380000],
        'Batería': [80000, 130000],
        'Puerto de carga': [70000, 120000],
        'Cámara': [100000, 190000],
        'No enciende / placa': [140000, 350000]
      }
    },
    xiaomi: {
      label: 'Xiaomi',
      models: ['Redmi Note 12', 'Redmi Note 13', 'Poco X6', 'Mi 11'],
      damages: {
        'Pantalla rota': [110000, 280000],
        'Batería': [70000, 110000],
        'Puerto de carga': [60000, 100000],
        'Cámara': [90000, 160000],
        'No enciende / placa': [120000, 300000]
      }
    },
    motorola: {
      label: 'Motorola',
      models: ['Moto G84', 'Edge 40', 'Edge 50', 'Moto G54'],
      damages: {
        'Pantalla rota': [110000, 300000],
        'Batería': [70000, 115000],
        'Puerto de carga': [60000, 105000],
        'Cámara': [90000, 165000],
        'No enciende / placa': [120000, 310000]
      }
    }
  };

  const cfgBrand = document.getElementById('cfgBrand');
  const cfgModel = document.getElementById('cfgModel');
  const cfgDamage = document.getElementById('cfgDamage');
  const cfgResult = document.getElementById('cfgResult');
  const cfgPrice = document.getElementById('cfgPrice');
  const cfgWhatsapp = document.getElementById('cfgWhatsapp');

  function formatCOP(n) {
    return '$' + n.toLocaleString('es-CO');
  }

  function resetSelect(select, placeholder) {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    select.disabled = true;
  }

  if (cfgBrand) {
    cfgBrand.addEventListener('change', () => {
      const brand = repairData[cfgBrand.value];
      cfgResult.hidden = true;
      if (!brand) {
        resetSelect(cfgModel, 'Primero elige la marca');
        resetSelect(cfgDamage, 'Primero elige el modelo');
        return;
      }
      cfgModel.innerHTML = '<option value="">Selecciona...</option>' +
        brand.models.map(m => `<option value="${m}">${m}</option>`).join('');
      cfgModel.disabled = false;
      resetSelect(cfgDamage, 'Primero elige el modelo');
    });

    cfgModel.addEventListener('change', () => {
      const brand = repairData[cfgBrand.value];
      cfgResult.hidden = true;
      if (!brand || !cfgModel.value) {
        resetSelect(cfgDamage, 'Primero elige el modelo');
        return;
      }
      cfgDamage.innerHTML = '<option value="">Selecciona...</option>' +
        Object.keys(brand.damages).map(d => `<option value="${d}">${d}</option>`).join('');
      cfgDamage.disabled = false;
    });

    cfgDamage.addEventListener('change', () => {
      const brand = repairData[cfgBrand.value];
      if (!brand || !cfgDamage.value) { cfgResult.hidden = true; return; }
      const [min, max] = brand.damages[cfgDamage.value];
      cfgPrice.textContent = `${formatCOP(min)} - ${formatCOP(max)}`;
      const msg = `Hola, quiero cotizar mi ${cfgModel.value} (${cfgDamage.value}). Vi el estimado de ${formatCOP(min)} a ${formatCOP(max)} en la página.`;
      cfgWhatsapp.href = `https://wa.me/573004027883?text=${encodeURIComponent(msg)}`;
      cfgResult.hidden = false;
    });
  }

  /* ============ FOOTER YEAR ============ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
