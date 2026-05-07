/**
 * MESMINE STYLE — app.js
 * Logique frontend : chargement modèles, filtres, modal, WhatsApp, téléchargement
 */

/* ─── Configuration ─────────────────────────────── */
const WHATSAPP_NUMBER = '237671743463';
const API_BASE        = '/api/models';

/* ─── Icônes par catégorie ───────────────────────── */
const CATEGORY_ICONS = {
  'robes':      '👗',
  'robe':       '👗',
  'pantalons':  '👖',
  'pantalon':   '👖',
  'kaba':       '🧣',
  'ensembles':  '✨',
  'ensemble':   '✨',
  'chemises':   '👔',
  'chemise':    '👔',
  'jupes':      '🩱',
  'jupe':       '🩱',
  'default':    '🪡'
};

/* ─── État global ────────────────────────────────── */
let allModels    = [];
let activeFilter = 'all';

/* ─── Init ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initNav();
  loadModels();
  initModal();
});

/* ─── Année footer ───────────────────────────────── */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─── Navigation mobile ──────────────────────────── */
function initNav() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    // Animate hamburger → X
    const spans = btn.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Fermer le menu au clic sur un lien
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      const spans = btn.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });

  // Header scroll effect
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
      header.style.background = window.scrollY > 40
        ? 'rgba(13,27,42,0.99)'
        : 'rgba(13,27,42,0.96)';
    }
  });
}

/* ─── Chargement des modèles ─────────────────────── */
async function loadModels() {
  try {
    // Vérifier si on est sur Vercel
    function isVercel() {
      return window.location.hostname.includes('vercel.app');
    }
    
    let models;
    
    if (isVercel()) {
      // Utiliser localStorage sur Vercel (comme l'admin)
      const stored = localStorage.getItem('fanny_models');
      models = stored ? JSON.parse(stored) : [];
      console.log('Chargement modèles depuis localStorage (Vercel):', models.length);
    } else {
      // Utiliser l'API en local
      const res  = await fetch(API_BASE);
      if (!res.ok) throw new Error('Erreur réseau');
      models = await res.json();
      console.log('Chargement modèles depuis API (local):', models.length);
    }
    
    allModels = models;

    renderCategories(allModels);
    renderFilters(allModels);
    renderModels(allModels);
    updateStats(allModels);
  } catch (err) {
    console.error('Erreur chargement modèles:', err);
    showError();
  }
}

/* ─── Mise à jour stats ──────────────────────────── */
function updateStats(models) {
  const totalEl = document.getElementById('totalModels');
  const catEl   = document.getElementById('totalCategories');

  if (totalEl) totalEl.textContent = models.length;
  if (catEl) {
    const cats = [...new Set(models.map(m => m.category))];
    catEl.textContent = cats.length;
  }
}

/* ─── Rendu catégories (section hero) ────────────── */
function renderCategories(models) {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  // Comptage par catégorie
  const counts = {};
  models.forEach(m => {
    const cat = m.category || 'Autre';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  if (Object.keys(counts).length === 0) {
    grid.innerHTML = `<p style="color:rgba(255,255,255,0.5);text-align:center;grid-column:1/-1;">Aucune catégorie disponible.</p>`;
    return;
  }

  grid.innerHTML = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => {
      const icon = CATEGORY_ICONS[cat.toLowerCase()] || CATEGORY_ICONS['default'];
      return `
        <div class="cat-card" role="button" tabindex="0"
             onclick="filterByCategory('${escapeAttr(cat)}')"
             onkeypress="if(event.key==='Enter') filterByCategory('${escapeAttr(cat)}')"
             aria-label="Filtrer par ${cat} (${count} modèle${count>1?'s':''})">
          <span class="cat-icon" aria-hidden="true">${icon}</span>
          <div class="cat-name">${escapeHtml(cat)}</div>
          <div class="cat-count">${count} modèle${count > 1 ? 's' : ''}</div>
        </div>`;
    }).join('');
}

/* ─── Filtre par catégorie (depuis section héro) ─── */
function filterByCategory(cat) {
  activeFilter = cat;
  const filtered = allModels.filter(m => m.category === cat);
  renderModels(filtered);

  // Mettre à jour les boutons de filtre
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === cat);
  });

  // Scroll vers la section modèles
  const section = document.getElementById('modeles');
  if (section) {
    setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

/* ─── Rendu filtres ──────────────────────────────── */
function renderFilters(models) {
  const bar = document.getElementById('filterBar');
  if (!bar) return;

  const cats = [...new Set(models.map(m => m.category))].sort();

  bar.innerHTML = `
    <button class="filter-btn active" data-filter="all" onclick="applyFilter('all', this)">
      Tout voir (${models.length})
    </button>
    ${cats.map(cat => {
      const count = models.filter(m => m.category === cat).length;
      return `
        <button class="filter-btn" data-filter="${escapeAttr(cat)}"
                onclick="applyFilter('${escapeAttr(cat)}', this)">
          ${escapeHtml(cat)} (${count})
        </button>`;
    }).join('')}
  `;
}

/* ─── Application filtre ─────────────────────────── */
function applyFilter(filter, btn) {
  activeFilter = filter;

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const filtered = filter === 'all'
    ? allModels
    : allModels.filter(m => m.category === filter);

  renderModels(filtered);
}

/* ─── Rendu grille modèles ───────────────────────── */
function renderModels(models) {
  const grid = document.getElementById('modelsGrid');
  if (!grid) return;

  if (models.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🪡</div>
        <h3>Aucun modèle disponible</h3>
        <p>Revenez bientôt pour découvrir nos nouvelles créations.</p>
      </div>`;
    return;
  }

  grid.innerHTML = models.map(model => buildModelCard(model)).join('');

  // Animation d'apparition au scroll
  observeCards();
}

/* ─── Construction d'une carte ───────────────────── */
function buildModelCard(model) {
  const icon    = CATEGORY_ICONS[model.category?.toLowerCase()] || CATEGORY_ICONS['default'];
  const imgSrc  = model.image || '/images/logo.png';
  const waText  = encodeURIComponent(
    `Bonjour, je souhaite commander le modèle ${model.name} (Réf: ${model.id})`
  );
  const waLink  = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

  return `
    <article class="model-card" data-id="${escapeAttr(model.id)}">
      <div class="model-img-wrap">
        <img src="${escapeAttr(imgSrc)}"
             alt="${escapeAttr(model.name)}"
             loading="lazy"
             onerror="this.src='/images/logo.png'" />
        <span class="model-badge">${icon} ${escapeHtml(model.category || 'Modèle')}</span>
        <span class="model-id">${escapeHtml(model.id)}</span>
      </div>
      <div class="model-body">
        <h3 class="model-name">${escapeHtml(model.name)}</h3>
        <p class="model-desc">${escapeHtml(model.description || 'Créations MESMINE STYLE')}</p>
        <div class="model-actions">
          <button class="btn btn-download btn-sm"
                  onclick="downloadModel(event, '${escapeAttr(imgSrc)}', '${escapeAttr(model.name)}')"
                  aria-label="Télécharger le modèle ${model.name}">
            📥 Télécharger
          </button>
          <a href="${waLink}"
             class="btn btn-whatsapp btn-sm"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="Commander ${model.name} sur WhatsApp"
             onclick="showToast('Redirection vers WhatsApp...')">
            💬 Commander
          </a>
        </div>
      </div>
    </article>`;
}

/* ─── Téléchargement image ───────────────────────── */
async function downloadModel(e, imgSrc, name) {
  e.stopPropagation();
  try {
    showToast('Téléchargement en cours...');
    const res   = await fetch(imgSrc);
    const blob  = await res.blob();
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    const ext   = imgSrc.split('.').pop().split('?')[0] || 'jpg';
    a.href      = url;
    a.download  = `FANNY-Design-${name.replace(/\s+/g, '-')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✓ Image téléchargée !');
  } catch (err) {
    console.error('Erreur téléchargement:', err);
    // Fallback direct link
    const a    = document.createElement('a');
    a.href     = imgSrc;
    a.download = `FANNY-Design-${name}.jpg`;
    a.target   = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/* ─── Modal détail ───────────────────────────────── */
function initModal() {
  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('modalClose');

  if (!backdrop || !closeBtn) return;

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });

  // Fermer avec Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

function openModal(model) {
  const backdrop = document.getElementById('modalBackdrop');
  const imgEl    = document.getElementById('modalImg');
  const catEl    = document.getElementById('modalCategory');
  const nameEl   = document.getElementById('modalName');
  const descEl   = document.getElementById('modalDesc');
  const dlBtn    = document.getElementById('modalDownload');
  const waBtn    = document.getElementById('modalWhatsapp');

  if (!backdrop) return;

  const waText = encodeURIComponent(
    `Bonjour, je souhaite commander le modèle ${model.name} (Réf: ${model.id})`
  );

  imgEl.src   = model.image || '/images/logo.png';
  imgEl.alt   = model.name;
  catEl.textContent = model.category || '';
  nameEl.textContent = model.name;
  descEl.textContent = model.description || '';
  dlBtn.href   = model.image || '/images/logo.png';
  dlBtn.setAttribute('download', `FANNY-Design-${model.name}.jpg`);
  waBtn.href   = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── Toast notification ─────────────────────────── */
let toastTimer;
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ─── Intersection Observer (cartes) ─────────────── */
function observeCards() {
  if (!('IntersectionObserver' in window)) {
    // Fallback : tout afficher directement
    document.querySelectorAll('.model-card').forEach(c => c.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.model-card').forEach(card => observer.observe(card));
}

/* ─── État erreur ────────────────────────────────── */
function showError() {
  const grid = document.getElementById('modelsGrid');
  if (grid) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Impossible de charger les modèles</h3>
        <p>Vérifiez votre connexion ou réessayez plus tard.</p>
        <br/>
        <button class="btn btn-primary btn-sm" onclick="loadModels()">Réessayer</button>
      </div>`;
  }

  const catGrid = document.getElementById('categoriesGrid');
  if (catGrid) catGrid.innerHTML = '';
}

/* ─── Helpers sécurité ───────────────────────────── */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  return String(str ?? '').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
