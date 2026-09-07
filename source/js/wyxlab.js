/**
 * WYX LAB — Home brand & lab entrances
 * Injects hero lines, a faint wave decoration and the
 * "Explore the Lab" card section. PJAX-safe, no dependencies.
 */
(function () {
  'use strict';

  var HERO_TAGLINE = '探索物理、代码与生活。';
  var HERO_KEYWORDS = '物理 · 科研 · 代码 · 生活';

  var CARDS = [
    {
      href: '/tags/手性光/',
      icon: 'fas fa-microscope',
      title: '科研',
      desc: '手性光、光谱、COMSOL、科研与论文阅读'
    },
    {
      href: '/projects/',
      icon: 'fas fa-hammer',
      title: '项目',
      desc: '实验装置、软件、网页与正在构建的项目'
    },
    {
      href: '/categories/教程/',
      icon: 'fas fa-book-open',
      title: '笔记',
      desc: 'AI 工具、编程、技术与学习笔记'
    },
    {
      href: '/categories/随笔/',
      icon: 'fas fa-camera',
      title: '生活',
      desc: '摄影、旅行、观察与生活记录'
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

    var title = el('h2', 'wyxlab-entrance-title', '实验室入口');
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

  function mountCardLink() {
    var card = document.querySelector('.card-widget.card-info');
    if (!card || card.dataset.wyxAboutLink) return;
    card.dataset.wyxAboutLink = '1';
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      if (window.pjax && window.pjax.loadUrl) {
        window.pjax.loadUrl('/about/');
      } else {
        window.location.href = '/about/';
      }
    });
  }

  function mountNavBackHome() {
    var blogInfo = document.querySelector('#body-wrap #blog-info');
    if (!blogInfo || blogInfo.querySelector('.nav-page-title')) return;
    if (document.getElementById('site-info')) return;

    var titleEl = document.querySelector('#page-site-info #site-title');
    var title = titleEl
      ? titleEl.textContent.trim()
      : (document.title || '').split(' - ')[0].trim();
    if (!title || title === 'WYX LAB') return;

    var link = document.createElement('a');
    link.className = 'nav-page-title';
    link.href = '/';

    var name = document.createElement('span');
    name.className = 'site-name';
    name.textContent = title;

    var back = document.createElement('span');
    back.className = 'site-name';
    var icon = document.createElement('i');
    icon.className = 'fa-solid fa-circle-arrow-left';
    icon.setAttribute('aria-hidden', 'true');
    back.appendChild(icon);
    back.appendChild(document.createTextNode(' 返回首页'));

    link.appendChild(name);
    link.appendChild(back);
    blogInfo.appendChild(link);
  }

  function mount() {
    removeExisting();
    mountHero();
    mountCards();
    mountCardLink();
    mountNavBackHome();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
  document.addEventListener('pjax:complete', mount);
})();
