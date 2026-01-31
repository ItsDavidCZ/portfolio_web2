const form = document.getElementById("my-form");
const formContent = document.getElementById("form-content");
const successMsg = document.getElementById("success-msg");
const btn = document.getElementById("submit-btn");
const navToggle = document.getElementById('nav-toggle');
const navList = document.getElementById('nav-list');
const galleryModalBtn = document.getElementById('gallery-modal-btn');
const galleryModal = document.getElementById('gallery-modal');
const modalClose = document.querySelector('.modal-close');

// Performance: Lazy loading for all images
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.src = entry.target.src || entry.target.dataset.src;
                observer.unobserve(entry.target);
            }
        });
    });
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Plynulý posun po kliknutí na menu
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (navList.classList.contains('open')) {
            navList.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Mobile nav toggle
if (navToggle) {
    navToggle.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
}

// Lightbox for gallery images
document.querySelectorAll('.gallery-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const src = this.href;
        openLightbox(src);
    });
});

function openLightbox(src) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = `<button class="close" aria-label="Zavřít">&times;</button><img src="${src}" alt="Zvětšená fotografie">`;
    document.body.appendChild(box);
    document.body.style.overflow = 'hidden';
    box.querySelector('.close').addEventListener('click', closeLightbox);
    box.addEventListener('click', (e) => { if (e.target === box) closeLightbox(); });
    document.addEventListener('keydown', escClose);

    function escClose(e) { if (e.key === 'Escape') closeLightbox(); }
    function closeLightbox() { box.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', escClose); }
}

// Gallery Modal handlers
if (galleryModalBtn) {
    galleryModalBtn.addEventListener('click', () => {
        galleryModal.classList.add('open');
        galleryModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    });
}

if (modalClose) {
    modalClose.addEventListener('click', () => {
        galleryModal.classList.remove('open');
        galleryModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    });
}

// Close modal on ESC or clicking outside
galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
        galleryModal.classList.remove('open');
        galleryModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && galleryModal.classList.contains('open')) {
        galleryModal.classList.remove('open');
        galleryModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
});

// Full gallery links also use lightbox (event delegation)
galleryModal.addEventListener('click', function(e) {
    if (e.target.closest('.gallery-link')) {
        e.preventDefault();
        const link = e.target.closest('.gallery-link');
        const src = link.href;
        openLightbox(src);
    }
});

// AJAX odesílání formuláře s lepším UX
async function handleSubmit(event) {
    event.preventDefault();
    btn.disabled = true;
    const origText = btn.innerText;
    btn.innerText = "Odesílám...";

    const data = new FormData(event.target);

    try {
        const response = await fetch(event.target.action, {
            method: form.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            formContent.style.display = 'none';
            successMsg.style.display = 'block';
            form.reset();
        } else {
            const json = await response.json().catch(() => ({}));
            const msg = json && json.errors ? json.errors.map(e => e.message).join(', ') : 'Odeslání se nezdařilo.';
            alert(msg);
            btn.disabled = false;
            btn.innerText = origText;
        }
    } catch (err) {
        alert('Něco se nepovedlo, zkontroluj připojení.');
        btn.disabled = false;
        btn.innerText = origText;
    }
}

if (form) form.addEventListener('submit', handleSubmit);

// Project buttons behavior (example placeholders)
document.querySelectorAll('.project-actions button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const el = e.currentTarget;
        const role = el.innerText.trim().toLowerCase();
        // If this is a Detail button and has data attributes, open modal
        if (role === 'detail' && el.dataset.title) {
            openProjectModal({
                title: el.dataset.title,
                image: el.dataset.image || '',
                desc: el.dataset.desc || '',
                url: el.dataset.url || ''
            });
            return;
        }

        // Live / Ukázka / Galerie buttons: open link if provided, otherwise placeholder
        if (el.dataset.url && el.dataset.url !== '#') {
            window.open(el.dataset.url, '_blank');
        } else {
            alert('Ukázka není k dispozici. Můžu přidat live odkaz, chceš?');
        }
    });
});

// Modal logic
const projectModal = document.getElementById('project-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalLive = document.getElementById('modal-live');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCloseX = document.querySelector('.close-modal');

function openProjectModal({title, image, desc, url}){
    modalTitle.innerText = title || '';
    modalDesc.innerText = desc || '';
    if (image) { modalImage.src = image; modalImage.style.display = 'block'; } else { modalImage.style.display = 'none'; }
    if (url && url !== '#') { modalLive.href = url; modalLive.style.display = 'inline-flex'; } else { modalLive.style.display = 'none'; }
    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    // focus management
    modalCloseBtn.focus();
    document.addEventListener('keydown', modalKeyHandler);
}

function closeProjectModal(){
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', modalKeyHandler);
}

function modalKeyHandler(e){ if (e.key === 'Escape') closeProjectModal(); }

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
if (modalCloseX) modalCloseX.addEventListener('click', closeProjectModal);
if (projectModal) projectModal.addEventListener('click', (e)=>{ if (e.target === projectModal) closeProjectModal(); });

// IntersectionObserver to animate elements on scroll (fade-up)
const ioOptions = { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 };
const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
        }
    });
}, ioOptions);

// Observe project cards and gallery items and section titles with staggered delays
document.querySelectorAll('.project-card, .gallery-item, .section-title, .web-card').forEach((el, i) => {
    el.classList.add('fade-up');
    // staggered entrance
    el.style.transitionDelay = `${(i % 6) * 80}ms`;
    io.observe(el);
});

// Back-to-top button and nav state on scroll
const backToTop = document.getElementById('back-to-top');
const nav = document.querySelector('nav');

function onScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    if (backToTop) {
        if (scrollTop > 300) backToTop.classList.add('show'); else backToTop.classList.remove('show');
    }

    if (nav) {
        if (scrollTop > 50) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Back to top
if (backToTop) backToTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

// Ripple effect on buttons
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn, .btn-outline');
    if (!btn || btn.disabled) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    const left = e.clientX - rect.left - size / 2;
    const top = e.clientY - rect.top - size / 2;
    ripple.style.left = left + 'px';
    ripple.style.top = top + 'px';
    // ensure position
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

// small enhancement: smooth focus for buttons opened from keyboard
document.addEventListener('keydown', (e)=>{
    if (e.key === 'Tab') document.documentElement.classList.add('show-focus');
});

/* Filters and contact modal removed per user request */

// Basic local analytics (counts in localStorage)
function recordEvent(name, props={}){
    try {
        const key = 'site_analytics_v1';
        const raw = localStorage.getItem(key); const data = raw ? JSON.parse(raw) : { pageViews:0, events:[] };
        if (name === 'pageview') data.pageViews = (data.pageViews||0) + 1;
        else data.events.push({ event:name, props, ts: Date.now() });
        localStorage.setItem(key, JSON.stringify(data));
        // debug log
        console.debug('Analytics:', name, props);
    } catch (e) { /* ignore */ }
}

// Active section tracking for nav underline
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            navLinks.forEach(link => {
                const href = link.getAttribute('href').substring(1); // remove #
                if (href === sectionId) {
                    link.classList.add('active-section');
                } else {
                    link.classList.remove('active-section');
                }
            });
        }
    });
}, {
    threshold: 0.3
});

sections.forEach(section => {
    sectionObserver.observe(section);
});

// initial pageview
recordEvent('pageview');
