/* ============================================================
   Peak Up – main.js
   Nav · Scroll Reveal · Counter · Accordion · Lightbox
   Show-More · WhatsApp Form · 3D Card Tilt · Particles
   ============================================================ */

'use strict';

/* ─── Helpers ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── Page Loader ─────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = $('#pageLoader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 600);
  }
});

/* ─── Current Year ────────────────────────────────────────── */
const yearEl = $('#currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── Smooth Scroll for anchor links ─────────────────────── */
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
  const top = target.getBoundingClientRect().top + window.scrollY - headerH;
  window.scrollTo({ top, behavior: 'smooth' });

  // Close mobile nav if open
  closeMobileNav();
});

/* ─── Header Scroll Shrink ────────────────────────────────── */
const header = $('#siteHeader');
function updateHeader() {
  if (!header) return;
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ─── Mobile Nav ──────────────────────────────────────────── */
const hamburger  = $('#hamburger');
const mobileNav  = $('#mobileNav');
const mobileOverlay = $('#mobileNavOverlay');
const mobileClose = $('#mobileNavClose');

function openMobileNav() {
  mobileNav?.classList.add('open');
  mobileOverlay?.classList.add('show');
  mobileNav?.setAttribute('aria-hidden', 'false');
  hamburger?.setAttribute('aria-expanded', 'true');
  hamburger?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  mobileNav?.classList.remove('open');
  mobileOverlay?.classList.remove('show');
  mobileNav?.setAttribute('aria-hidden', 'true');
  hamburger?.setAttribute('aria-expanded', 'false');
  hamburger?.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  mobileNav?.classList.contains('open') ? closeMobileNav() : openMobileNav();
});
mobileClose?.addEventListener('click', closeMobileNav);
mobileOverlay?.addEventListener('click', closeMobileNav);

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileNav();
});

/* ─── Scroll Reveal (IntersectionObserver) ────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Counter Animation ───────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '+';
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

$$('.counter').forEach(el => counterObserver.observe(el));

/* ─── FAQ Accordion ───────────────────────────────────────── */
$$('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item    = btn.closest('.faq-item');
    const answer  = item.querySelector('.faq-answer');
    const isOpen  = item.classList.contains('open');

    // Close all
    $$('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      const a = openItem.querySelector('.faq-answer');
      a.style.maxHeight = '0';
      openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      openItem.querySelector('.faq-answer').setAttribute('aria-hidden', 'true');
    });

    // Open clicked (if wasn't open)
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
      answer.setAttribute('aria-hidden', 'false');
    }
  });
});

/* ─── Project Gallery Show More ───────────────────────────── */
const showMoreBtn = $('#showMoreBtn');
const hiddenProjects = $$('.project-item.hidden');

showMoreBtn?.addEventListener('click', () => {
  hiddenProjects.forEach((item, i) => {
    setTimeout(() => {
      item.classList.remove('hidden');
      // Trigger reveal animation
      item.style.opacity = '0';
      item.style.transform = 'scale(.95)';
      requestAnimationFrame(() => {
        item.style.transition = 'opacity .4s ease, transform .4s ease';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      });
    }, i * 40);
  });
  showMoreBtn.style.display = 'none';
});

/* ─── Lightbox ────────────────────────────────────────────── */
const lightbox     = $('#lightbox');
const lightboxImg  = $('#lightboxImg');
const lightboxClose = $('#lightboxClose');
const lightboxPrev = $('#lightboxPrev');
const lightboxNext = $('#lightboxNext');
const lightboxCounter = $('#lightboxCounter');

let currentLightboxIndex = 0;
let allProjectItems = [];

function openLightbox(index) {
  allProjectItems = $$('.project-item:not(.hidden)');
  currentLightboxIndex = index;
  const item = allProjectItems[index];
  const img  = item?.querySelector('img');
  if (!img) return;
  lightboxImg.src = img.src.replace('-300x251', ''); // try full size
  lightboxImg.alt = img.alt;
  lightboxCounter.textContent = `${index + 1} / ${allProjectItems.length}`;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightboxImg.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function prevLightbox() {
  currentLightboxIndex = (currentLightboxIndex - 1 + allProjectItems.length) % allProjectItems.length;
  openLightbox(currentLightboxIndex);
}

function nextLightbox() {
  currentLightboxIndex = (currentLightboxIndex + 1) % allProjectItems.length;
  openLightbox(currentLightboxIndex);
}

// Open on project click
document.addEventListener('click', e => {
  const item = e.target.closest('.project-item');
  if (!item) return;
  allProjectItems = $$('.project-item:not(.hidden)');
  const idx = allProjectItems.indexOf(item);
  if (idx >= 0) openLightbox(idx);
});

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', prevLightbox);
lightboxNext?.addEventListener('click', nextLightbox);

// Click outside image to close
lightbox?.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!lightbox?.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   prevLightbox();
  if (e.key === 'ArrowRight')  nextLightbox();
});

// Swipe support
let touchStartX = 0;
lightbox?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox?.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? nextLightbox() : prevLightbox();
});

/* ─── WhatsApp Contact Form ───────────────────────────────── */
const contactForm = $('#contactForm');
const WA_NUMBER   = '905307075272';

contactForm?.addEventListener('submit', e => {
  e.preventDefault();

  const name    = $('#fullName')?.value.trim();
  const phone   = $('#phone')?.value.trim();
  const email   = $('#email')?.value.trim();
  const service = $('#service')?.value;
  const message = $('#message')?.value.trim();

  // Basic validation
  if (!name) { alert('Lütfen adınızı soyadınızı giriniz.'); return; }
  if (!email) { alert('Lütfen e-posta adresinizi giriniz.'); return; }

  const text = [
    `*Merhaba Peak Up!*`,
    ``,
    `*Ad Soyad:* ${name}`,
    phone   ? `*Telefon:* ${phone}` : '',
    `*E-posta:* ${email}`,
    `*Hizmet:* ${service}`,
    message ? `*Mesaj:* ${message}` : '',
  ].filter(Boolean).join('\n');

  const encoded = encodeURIComponent(text);
  const url     = `https://wa.me/${WA_NUMBER}?text=${encoded}`;

  // Open WhatsApp
  window.open(url, '_blank', 'noopener,noreferrer');
});

/* ─── Scroll-to-Top Button ────────────────────────────────── */
const scrollTopBtn = $('#scrollTop');
window.addEventListener('scroll', () => {
  if (!scrollTopBtn) return;
  scrollTopBtn.classList.toggle('show', window.scrollY > 400);
}, { passive: true });

scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─── 3D Card Tilt Effect ─────────────────────────────────── */
function initCardTilt() {
  $$('.card-3d').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * 8;
      const rotY   =  dx * 8;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
initCardTilt();

/* ─── Hero Particles ──────────────────────────────────────── */
function createParticles() {
  const container = $('#particles');
  if (!container) return;
  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 2 + Math.random() * 6;
    const delay = Math.random() * 12;
    const duration = 8 + Math.random() * 10;
    const left = Math.random() * 100;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%;
      animation-delay:${delay}s;
      animation-duration:${duration}s;
      opacity:${0.2 + Math.random() * 0.4};
    `;
    container.appendChild(p);
  }
}
createParticles();

/* ─── Active Nav Link on Scroll ───────────────────────────── */
const sections = $$('section[id], div[id]').filter(el =>
  ['biz-kimiz','hizmetlerimiz','projelerimiz','iletisim'].includes(el.id)
);
const navLinks = $$('.nav-menu a');

const activeNavObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.fontWeight = link.getAttribute('href') === `#${entry.target.id}` ? '700' : '500';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => activeNavObserver.observe(s));

/* ─── Lazy Load Images Fallback ───────────────────────────── */
if ('loading' in HTMLImageElement.prototype) {
  // Native lazy loading supported, nothing extra needed
} else {
  // Fallback: load all lazy images immediately
  $$('img[loading="lazy"]').forEach(img => {
    img.src = img.dataset.src || img.src;
  });
}

/* ─── Image Error Fallback ────────────────────────────────── */
$$('img').forEach(img => {
  img.addEventListener('error', function () {
    this.style.opacity = '0.3';
    this.alt = this.alt || 'Görsel yüklenemedi';
  });
});
