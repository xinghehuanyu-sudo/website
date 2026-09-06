/**
 * WYX LAB — {% wyxlab_timeline %} tag
 * Renders the /timeline/ page at build time from source/_data/timeline.yml.
 * Dates accept "YYYY-MM-DD", "YYYY-MM" and "YYYY" precisions.
 */
'use strict';

const CATEGORY_MAP = {
  '科研': { icon: 'fas fa-flask' },
  '项目': { icon: 'fas fa-diagram-project' },
  '学习': { icon: 'fas fa-book' },
  '网站': { icon: 'fas fa-globe' },
  '成就': { icon: 'fas fa-trophy' }
};

const escape = value => String(value == null ? '' : value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const isoDate = entry => String(entry.date || '').trim();

const sortable = iso => {
  const [year, month, day] = iso.split('-');
  const norm = [year || '0000', month || '00', day || '00'].join('-');
  return /^\d{4}(-\d{2}){0,2}$/.test(iso) ? norm : '0000-00-00';
};

const formatDate = iso => {
  const parts = iso.split('-');
  if (parts.length === 1) return `${iso} 年`;
  const month = parseInt(parts[1], 10);
  if (!month || month > 12) return iso;
  return parts.length >= 3 ? `${parts[0]} 年 ${month} 月 ${parseInt(parts[2], 10)} 日` : `${parts[0]} 年 ${month} 月`;
};

const projectNames = () => {
  const list = (hexo.locals.get('data') || {}).projects || [];
  return new Set((Array.isArray(list) ? list : []).map(item => item.name));
};

const categoryChip = category => {
  if (!category) return '';
  const info = CATEGORY_MAP[String(category).toLowerCase()];
  const icon = info ? `<i class="${info.icon}" aria-hidden="true"></i>` : '';
  return `<span class="wyxlab-timeline-category">${icon}${escape(category)}</span>`;
};

const safeHref = url => {
  const s = String(url || '').trim();
  return /^(https?:\/\/|mailto:|#|\/(?!\/))/i.test(s) ? s : '';
};

const relatedLine = (entry, names) => {
  const parts = [];
  if (entry.project) {
    const chipText = `项目：${escape(entry.project)}`;
    parts.push(names.has(entry.project)
      ? `<a class="wyxlab-timeline-project" href="/projects/">${chipText}</a>`
      : `<span class="wyxlab-timeline-project">${chipText}</span>`);
  }
  const link = safeHref(entry.link);
  if (link) {
    const external = /^https?:\/\//i.test(link);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    parts.push(`<a class="wyxlab-timeline-link"${attrs} href="${escape(link)}">查看相关内容<i class="fas fa-arrow-right" aria-hidden="true"></i></a>`);
  }
  return parts.length ? `<div class="wyxlab-timeline-related">${parts.join('')}</div>` : '';
};

const timelineItem = (entry, names) => {
  const milestone = entry.milestone === true || String(entry.milestone) === 'true';
  const iso = isoDate(entry);
  const media = entry.image
    ? `<div class="wyxlab-timeline-media"><img src="${escape(entry.image)}" alt="${escape(entry.title)}" loading="lazy"></div>`
    : '';

  return [
    `<li class="wyxlab-timeline-item${milestone ? ' is-milestone' : ''}">`,
    `<div class="wyxlab-timeline-date"><time datetime="${escape(iso)}">${escape(formatDate(iso))}</time></div>`,
    '<div class="wyxlab-timeline-body">',
    '<span class="wyxlab-timeline-dot" aria-hidden="true"></span>',
    `<div class="wyxlab-timeline-meta">${categoryChip(entry.category)}${milestone ? '<span class="wyxlab-timeline-milestone">里程碑</span>' : ''}</div>`,
    `<h3 class="wyxlab-timeline-title">${escape(entry.title)}</h3>`,
    entry.description ? `<p class="wyxlab-timeline-description">${escape(entry.description)}</p>` : '',
    media,
    relatedLine(entry, names),
    '</div>',
    '</li>'
  ].join('');
};

hexo.extend.tag.register('wyxlab_timeline', () => {
  const list = (hexo.locals.get('data') || {}).timeline || [];
  const items = (Array.isArray(list) ? list : [])
    .slice()
    .sort((a, b) => sortable(isoDate(b)).localeCompare(sortable(isoDate(a))));
  if (!items.length) return '';

  const names = projectNames();
  const groups = [];
  let currentYear = null;
  items.forEach(entry => {
    const year = isoDate(entry).slice(0, 4);
    if (year !== currentYear) {
      groups.push({ year, items: [] });
      currentYear = year;
    }
    groups[groups.length - 1].items.push(entry);
  });

  const html = groups.map(group => [
    '<section class="wyxlab-timeline-year">',
    `<h2 class="wyxlab-timeline-year-title">${escape(group.year)}</h2>`,
    `<ol class="wyxlab-timeline-list">${group.items.map(entry => timelineItem(entry, names)).join('')}</ol>`,
    '</section>'
  ].join(''));

  return `<div class="wyxlab-timeline nc">${html.join('')}</div>`;
});
