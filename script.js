const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

document.querySelector('#year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.about-copy, .section-heading, .program-card, .timeline article, .award').forEach(element => {
    element.classList.add('reveal');
    observer.observe(element);
  });
}

const header = document.querySelector('.header');
const scrollTopButton = document.querySelector('.scroll-top');
function updateScrollControls() {
  header.classList.toggle('is-scrolled', window.scrollY > 20);
  scrollTopButton.hidden = window.scrollY < 300;
}
window.addEventListener('scroll', updateScrollControls, { passive: true });
window.addEventListener('pageshow', updateScrollControls);
updateScrollControls();
scrollTopButton.addEventListener('click', () => {
  closeMenu();
  document.querySelector('.brand').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});

const hero = document.querySelector('.hero');
if (hero) {
const heroSlides = [...hero.querySelectorAll('.hero-photo')];
const slideButtons = [...hero.querySelectorAll('[data-slide]')];
const pauseButton = hero.querySelector('.carousel-pause');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentSlide = 0;
let slideshowPaused = motionPreference.matches;
let slideshowTimer;
function showHeroSlide(index) {
  currentSlide = index;
  heroSlides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === index);
    slide.setAttribute('aria-hidden', String(i !== index));
    slideButtons[i].setAttribute('aria-pressed', String(i === index));
  });
}
function scheduleSlideshow() {
  clearInterval(slideshowTimer);
  pauseButton.textContent = slideshowPaused ? '▶' : 'Ⅱ';
  pauseButton.setAttribute('aria-label', slideshowPaused ? 'Play slideshow' : 'Pause slideshow');
  if (!slideshowPaused && !document.hidden && !hero.matches(':hover') && !hero.contains(document.activeElement)) {
    slideshowTimer = setInterval(() => showHeroSlide((currentSlide + 1) % heroSlides.length), 6000);
  }
}
slideButtons.forEach((button, index) => button.addEventListener('click', () => {
  showHeroSlide(index);
  scheduleSlideshow();
}));
pauseButton.addEventListener('click', () => {
  slideshowPaused = !slideshowPaused;
  scheduleSlideshow();
});
hero.addEventListener('mouseenter', scheduleSlideshow);
hero.addEventListener('mouseleave', scheduleSlideshow);
hero.addEventListener('focusin', scheduleSlideshow);
hero.addEventListener('focusout', () => setTimeout(scheduleSlideshow, 0));
document.addEventListener('visibilitychange', scheduleSlideshow);
motionPreference.addEventListener('change', event => {
  slideshowPaused = event.matches;
  scheduleSlideshow();
});
scheduleSlideshow();

}

// Prepare a WhatsApp draft only. Visitors review and send it in WhatsApp.
const whatsappLink = document.querySelector('.whatsapp-float');
const enquiryForm = document.querySelector('#enquiry-form');
function updateWhatsAppDraft() {
  const value = name => enquiryForm?.elements.namedItem(name)?.value.trim() || '';
  const message = `Hello, I am interested in chess coaching.\nName: ${value('name')}\nPhone number: ${value('phone')}\nEmail: ${value('email')}`;
  whatsappLink.href = 'https://wa.me/919966830476?text=' + encodeURIComponent(message);
}
if (whatsappLink) {
  whatsappLink.addEventListener('click', updateWhatsAppDraft);
  enquiryForm?.addEventListener('input', updateWhatsAppDraft);
  enquiryForm?.addEventListener('reset', () => setTimeout(updateWhatsAppDraft, 0));
  updateWhatsAppDraft();
}
