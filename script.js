/* ============================================================
   Manya Jain Portfolio — script.js
   Handles: article rendering, search, filters, nav, animations
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     SVG icon helper (inline arrow for card links)
     ---------------------------------------------------------- */
  const ARROW_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>';

  /* ----------------------------------------------------------
     DATA LOADER
     ---------------------------------------------------------- */
  let articlesCache = null;

  async function loadArticles() {
    if (articlesCache) return articlesCache;
    try {
      const res = await fetch('data/articles.json');
      if (!res.ok) throw new Error('Failed to load articles');
      const data = await res.json();
      /* Sort by date descending */
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      articlesCache = data;
      return data;
    } catch (err) {
      console.error('Article load error:', err);
      return [];
    }
  }

  /* ----------------------------------------------------------
     DATE FORMATTER
     ---------------------------------------------------------- */
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /* ----------------------------------------------------------
     ARTICLE CARD HTML
     ---------------------------------------------------------- */
  function articleCardHTML(article) {
    const tags = (article.tags || [])
      .map(t => '<span class="tag">' + t + '</span>')
      .join('');

    return (
      '<div class="article-card fade-in">' +
        '<h3><a href="' + article.url + '" target="_blank" rel="noopener">' + article.title + '</a></h3>' +
        '<p class="card-excerpt">' + (article.excerpt || '') + '</p>' +
        '<div class="card-meta">' +
          '<span>' + (tags || article.publication) + '</span>' +
          '<a href="' + article.url + '" target="_blank" rel="noopener" class="card-read-link">Read on TOI ' + ARROW_SVG + '</a>' +
        '</div>' +
      '</div>'
    );
  }


  /* ----------------------------------------------------------
     INDEX PAGE: Render Featured Articles (top 4)
     ---------------------------------------------------------- */
  async function renderFeatured() {
    const container = document.getElementById('featured-articles');
    if (!container) return;

    const articles = await loadArticles();
    const featured = articles.slice(0, 4);

    container.innerHTML = featured.map(articleCardHTML).join('');

    /* Trigger stagger animations */
    requestAnimationFrame(() => {
      container.querySelectorAll('.fade-in').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 80);
      });
    });
  }


  /* ----------------------------------------------------------
     ARTICLES PAGE: Full listing with search & filters
     ---------------------------------------------------------- */
  let allArticles = [];

  async function initArticlesPage() {
    const container = document.getElementById('all-articles');
    if (!container) return;

    allArticles = await loadArticles();

    populateFilters();
    renderArticlesList(allArticles);

    /* Bind event listeners */
    const searchInput = document.getElementById('article-search');
    const filterYear = document.getElementById('filter-year');
    const filterTag = document.getElementById('filter-tag');

    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 200));
    if (filterYear) filterYear.addEventListener('change', applyFilters);
    if (filterTag) filterTag.addEventListener('change', applyFilters);
  }

  function populateFilters() {
    const yearSet = new Set();
    const tagSet = new Set();

    allArticles.forEach(a => {
      if (a.date) yearSet.add(new Date(a.date).getFullYear());
      if (a.tags) a.tags.forEach(t => tagSet.add(t));
    });

    const yearSelect = document.getElementById('filter-year');
    const tagSelect = document.getElementById('filter-tag');

    /* Years descending */
    Array.from(yearSet).sort((a, b) => b - a).forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    });

    /* Tags alphabetical */
    Array.from(tagSet).sort().forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      tagSelect.appendChild(opt);
    });
  }

  function applyFilters() {
    const query = (document.getElementById('article-search').value || '').toLowerCase().trim();
    const year = document.getElementById('filter-year').value;
    const tag = document.getElementById('filter-tag').value;

    let filtered = allArticles;

    if (query) {
      filtered = filtered.filter(a =>
        (a.title && a.title.toLowerCase().includes(query)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(query))
      );
    }

    if (year) {
      filtered = filtered.filter(a =>
        new Date(a.date).getFullYear() === parseInt(year)
      );
    }

    if (tag) {
      filtered = filtered.filter(a =>
        a.tags && a.tags.includes(tag)
      );
    }

    renderArticlesList(filtered);
  }

  function renderArticlesList(articles) {
    const container = document.getElementById('all-articles');
    const countEl = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');

    if (!container) return;

    if (articles.length === 0) {
      container.innerHTML = '';
      if (countEl) countEl.textContent = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }

    if (noResults) noResults.style.display = 'none';
    if (countEl) countEl.textContent = articles.length + ' article' + (articles.length !== 1 ? 's' : '');

    container.innerHTML = articles.map(articleCardHTML).join('');

    /* Animate in */
    requestAnimationFrame(() => {
      container.querySelectorAll('.fade-in').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 60);
      });
    });
  }


  /* ----------------------------------------------------------
     NAVIGATION
     ---------------------------------------------------------- */
  function initNav() {
    const nav = document.getElementById('site-nav');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    /* Sticky shadow on scroll */
    if (nav) {
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 10);
      }, { passive: true });
    }

    /* Mobile toggle */
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
      });

      /* Close on link click */
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }


  /* ----------------------------------------------------------
     SCROLL ANIMATIONS (Intersection Observer)
     ---------------------------------------------------------- */
  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }


  /* ----------------------------------------------------------
     SMOOTH SCROLL for anchor links
     ---------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = 70; /* nav height */
          const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  }


  /* ----------------------------------------------------------
     UTILITY: Debounce
     ---------------------------------------------------------- */
  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }



  /* ----------------------------------------------------------
     HERO IMAGE FALLBACK
     If the responsive hero image fails to load, fall back to
     the original photo1.jpg.
     ---------------------------------------------------------- */
  function initHeroFallback() {
    const heroImg = document.querySelector('.hero-bg img');
    if (!heroImg) return;
    heroImg.addEventListener('error', function () {
      this.src = 'assets/photo1.jpg';
      this.srcset = '';
    });
  }


  /* ----------------------------------------------------------
     INIT
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initSmoothScroll();
    initHeroFallback();
    renderFeatured();
    initArticlesPage();

    /* Delayed animation init (let layout settle) */
    requestAnimationFrame(() => {
      setTimeout(initScrollAnimations, 100);
    });
  });

})();
