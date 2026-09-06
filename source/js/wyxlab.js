/**
 * WYX LAB — Home brand & lab entrances
 * Injects hero lines, a faint wave decoration and the
 * "Explore the Lab" card section. PJAX-safe, no dependencies.
 */
(function () {
  'use strict';

  var HERO_TAGLINE = 'Experiments across physics, code and life.';
  var HERO_KEYWORDS = 'Physics · Research · Code · Life';

  var CARDS = [
    {
      href: '/tags/手性光/',
      icon: 'fas fa-microscope',
      title: 'Research',
      desc: '手性光、光谱、COMSOL、科研与论文阅读',
      en: 'Optics, spectroscopy and research notes.'
    },
    {
      href: '/projects/',
      icon: 'fas fa-hammer',
      title: 'Projects',
      desc: '实验装置、软件、网页与正在构建的项目',
      en: 'Things I build and experiment with.'
    },
    {
      href: '/categories/教程/',
      icon: 'fas fa-book-open',
      title: 'Notes',
      desc: 'AI 工具、编程、技术与学习笔记',
      en: 'Technical notes and things I learn.'
    },
    {
      href: '/categories/随笔/',
      icon: 'fas fa-camera',
      title: 'Life',
      desc: '摄影、旅行、观察与生活记录',
      en: 'Photography, travel and everyday thoughts.'
    }
  ];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function removeExisting() {
    document.querySelectorAll(
      '.wyxlab-hero-extra, .wyxlab-wave, #wyxlab-entrances'
    ).forEach(function (node) { node.remove(); });
  }

  function mountHero() {
    var siteInfo = document.querySelector('#page-header #site-info');
    if (!siteInfo) return;

    var extra = el('div', 'wyxlab-hero-extra');
    extra.appendChild(el('p', 'wyxlab-hero-tagline', HERO_TAGLINE));
    extra.appendChild(el('p', 'wyxlab-hero-keywords', HERO_KEYWORDS));
    var subtitle = siteInfo.querySelector('#site-subtitle');
    if (subtitle && subtitle.nextSibling) {
      siteInfo.insertBefore(extra, subtitle.nextSibling);
    } else {
      siteInfo.appendChild(extra);
    }

    var header = document.getElementById('page-header');
    if (header && !header.classList.contains('not-top-img')) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'wyxlab-wave');
      svg.setAttribute('viewBox', '0 0 1440 320');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('aria-hidden', 'true');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M0,160 C120,80 240,240 360,160 C480,80 600,240 720,160 C840,80 960,240 1080,160 C1200,80 1320,240 1440,160');
      svg.appendChild(path);
      header.appendChild(svg);
    }
  }

  function mountCards() {
    var recentPosts = document.getElementById('recent-posts');
    if (!recentPosts) return;

    var section = el('section', 'wyxlab-entrances');
    section.id = 'wyxlab-entrances';

    var title = el('h2', 'wyxlab-entrance-title', 'Explore the Lab');
    title.appendChild(el('span', 'wyxlab-entrance-sub', '实验室入口'));
    section.appendChild(title);

    var grid = el('div', 'wyxlab-lab-grid');
    CARDS.forEach(function (card, index) {
      var link = el('a', 'wyxlab-lab-card');
      link.href = card.href;
      link.style.animationDelay = (index * 0.08) + 's';

      var icon = el('i', 'wyxlab-lab-icon ' + card.icon);
      icon.setAttribute('aria-hidden', 'true');
      link.appendChild(icon);
      link.appendChild(el('span', 'wyxlab-lab-name', card.title));
      link.appendChild(el('span', 'wyxlab-lab-desc', card.desc));
      link.appendChild(el('span', 'wyxlab-lab-en', card.en));
      grid.appendChild(link);
    });
    section.appendChild(grid);

    var anchor = document.getElementById('wyxlab-recent-logs');
    if (anchor && anchor.parentNode === recentPosts) {
      recentPosts.insertBefore(section, anchor);
    } else {
      recentPosts.insertBefore(section, recentPosts.firstChild);
    }
  }

  function mount() {
    removeExisting();
    mountHero();
    mountCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
  document.addEventListener('pjax:complete', mount);
})();
