/**
 * WYX LAB — {% wyxlab_projects %} tag
 * Renders the /projects/ grid at build time from source/_data/projects.yml.
 */
'use strict';

const STATUS_MAP = {
  'in progress': { emoji: '🟢', slug: 'in-progress' },
  'completed': { emoji: '✅', slug: 'completed' },
  'maintaining': { emoji: '🟡', slug: 'maintaining' },
  'paused': { emoji: '⏸', slug: 'paused' }
};

const escape = value => String(value == null ? '' : value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const placeholderArt = () => [
  '<svg class="wyxlab-project-placeholder" viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">',
  '<path class="wyxlab-project-placeholder-grid" d="M0,75 H600 M0,150 H600 M0,225 H600 M120,0 V300 M240,0 V300 M360,0 V300 M480,0 V300"/>',
  '<path class="wyxlab-project-placeholder-wave" d="M0,150 C75,90 150,210 225,150 C300,90 375,210 450,150 C525,90 562,180 600,150"/>',
  '</svg>'
].join('');

const statusPill = status => {
  if (!status) return '';
  const info = STATUS_MAP[String(status).toLowerCase()];
  const emoji = info ? `<i class="wyxlab-project-status-dot" aria-hidden="true">${info.emoji}</i>` : '';
  const slug = info ? info.slug : 'custom';
  return `<span class="wyxlab-project-status status-${slug}">${emoji}<span>${escape(status)}</span></span>`;
};

const safeHref = url => {
  const s = String(url || '').trim();
  return /^(https?:\/\/|mailto:|#|\/(?!\/))/i.test(s) ? s : '';
};

const linkButton = (rawHref, label, external) => {
  const href = safeHref(rawHref);
  if (!href) return '';
  const attrs = external
    ? ' target="_blank" rel="noopener noreferrer"'
    : '';
  return `<a class="wyxlab-project-link${external ? ' is-external' : ''}" href="${escape(href)}"${attrs}>${escape(label)}<i class="fas fa-arrow-right" aria-hidden="true"></i></a>`;
};

const card = project => {
  const featured = project.featured ? ' is-featured' : '';
  const media = project.image
    ? `<div class="wyxlab-project-media"><img src="${escape(project.image)}" alt="${escape(project.name)}" loading="lazy"></div>`
    : `<div class="wyxlab-project-media">${placeholderArt()}</div>`;

  const subtitle = project.subtitle
    ? `<p class="wyxlab-project-subtitle">${escape(project.subtitle)}</p>`
    : '';
  const description = project.description
    ? `<p class="wyxlab-project-desc">${escape(project.description)}</p>`
    : '';

  const tags = Array.isArray(project.tags) && project.tags.length
    ? `<ul class="wyxlab-project-tags">${project.tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul>`
    : '';

  const started = project.started
    ? `<span class="wyxlab-project-started"><i class="far fa-calendar" aria-hidden="true"></i>Since ${escape(project.started)}</span>`
    : '';

  const links = [
    linkButton(project.article, 'Read More', false),
    linkButton(project.github, 'GitHub', true),
    linkButton(project.demo, 'Demo', true)
  ].join('');
  const linkArea = links ? `<div class="wyxlab-project-links">${links}</div>` : '';

  return [
    `<article class="wyxlab-project-card${featured}">`,
    media,
    '<div class="wyxlab-project-body">',
    `<div class="wyxlab-project-head"><h3 class="wyxlab-project-name">${escape(project.name)}</h3>${statusPill(project.status)}</div>`,
    subtitle,
    description,
    `<div class="wyxlab-project-foot">${tags}<div class="wyxlab-project-actions">${started}${linkArea}</div></div>`,
    '</div>',
    '</article>'
  ].join('');
};

hexo.extend.tag.register('wyxlab_projects', () => {
  const projects = (hexo.locals.get('data') || {}).projects || [];
  const list = Array.isArray(projects) ? projects : [];

  const featured = list.filter(item => item.featured);
  const rest = list.filter(item => !item.featured);
  const sorted = rest.slice().sort((a, b) => String(b.started || '').localeCompare(String(a.started || '')));

  const sections = [];
  if (featured.length) {
    sections.push('<section class="wyxlab-projects-group">',
      '<h2 class="wyxlab-projects-heading">Featured <span>重点项目</span></h2>',
      `<div class="wyxlab-project-grid is-featured-grid">${featured.map(card).join('')}</div>`,
      '</section>');
  }
  if (sorted.length) {
    sections.push('<section class="wyxlab-projects-group">',
      '<h2 class="wyxlab-projects-heading">More Projects <span>更多项目</span></h2>',
      `<div class="wyxlab-project-grid">${sorted.map(card).join('')}</div>`,
      '</section>');
  }

  return `<div class="wyxlab-projects nc">${sections.join('')}</div>`;
});
