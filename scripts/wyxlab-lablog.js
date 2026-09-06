/**
 * WYX LAB — Lab Log renderer
 * - {% wyxlab_lablog %}  : full timeline page (/lablog/)
 * - homepage "Recent Lab Logs" section injected at build time
 *   through the after_render:html filter (single data source:
 *   source/_data/lablog.yml).
 */
'use strict';

const TYPE_MAP = {
  'research': { icon: 'fas fa-flask' },
  'experiment': { icon: 'fas fa-vial' },
  'simulation': { icon: 'fas fa-wave-square' },
  'reading': { icon: 'fas fa-book' },
  'development': { icon: 'fas fa-code' },
  'website': { icon: 'fas fa-globe' },
  'note': { icon: 'fas fa-note-sticky' }
};

const LOG_STATUS_MAP = {
  'completed': { label: 'Completed', slug: 'completed' },
  'progress': { label: 'In Progress', slug: 'progress' },
  'note': { label: 'Note', slug: 'note' }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const escape = value => String(value == null ? '' : value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const logDate = entry => String(entry.date || '').slice(0, 10);

const shortDate = iso => {
  const parts = iso.split('-');
  if (parts.length < 3) return escape(iso);
  const month = MONTHS[parseInt(parts[1], 10) - 1];
  return month ? `${month} ${parts[2]}` : escape(iso);
};

const loadLogs = () => {
  const list = (hexo.locals.get('data') || {}).lablog || [];
  return (Array.isArray(list) ? list : [])
    .slice()
    .sort((a, b) => logDate(b).localeCompare(logDate(a)));
};

const projectNames = () => {
  const list = (hexo.locals.get('data') || {}).projects || [];
  return new Set((Array.isArray(list) ? list : []).map(item => item.name));
};

const typeChip = type => {
  if (!type) return '';
  const info = TYPE_MAP[String(type).toLowerCase()];
  const icon = info ? `<i class="${info.icon}" aria-hidden="true"></i>` : '';
  return `<span class="wyxlab-log-type">${icon}${escape(type)}</span>`;
};

const statusChip = status => {
  if (!status) return '';
  const info = LOG_STATUS_MAP[String(status).toLowerCase()];
  const label = info ? info.label : status;
  const slug = info ? info.slug : 'custom';
  return `<span class="wyxlab-log-status status-${slug}">${escape(label)}</span>`;
};

const tagsList = tags => {
  if (!Array.isArray(tags) || !tags.length) return '';
  return `<ul class="wyxlab-log-tags">${tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul>`;
};

const safeHref = url => {
  const s = String(url || '').trim();
  return /^(https?:\/\/|mailto:|#|\/(?!\/))/i.test(s) ? s : '';
};

const relatedLine = (entry, names) => {
  const parts = [];
  if (entry.project) {
    const chipText = `Project: ${escape(entry.project)}`;
    parts.push(names.has(entry.project)
      ? `<a class="wyxlab-log-project" href="/projects/">${chipText}</a>`
      : `<span class="wyxlab-log-project">${chipText}</span>`);
  }
  const link = safeHref(entry.link);
  if (link) {
    const external = /^https?:\/\//i.test(link);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    parts.push(`<a class="wyxlab-log-link"${attrs} href="${escape(link)}">Related<i class="fas fa-arrow-right" aria-hidden="true"></i></a>`);
  }
  return parts.length ? `<div class="wyxlab-log-related">${parts.join('')}</div>` : '';
};

const logItem = (entry, names) => [
  '<li class="wyxlab-log-item">',
  `<div class="wyxlab-log-date"><time datetime="${escape(logDate(entry))}">${shortDate(logDate(entry))}</time></div>`,
  '<div class="wyxlab-log-main">',
  `<div class="wyxlab-log-meta">${typeChip(entry.type)}${statusChip(entry.status)}</div>`,
  `<h3 class="wyxlab-log-title">${escape(entry.title)}</h3>`,
  entry.content ? `<p class="wyxlab-log-content">${escape(entry.content)}</p>` : '',
  tagsList(entry.tags),
  relatedLine(entry, names),
  '</div>',
  '</li>'
].join('');

hexo.extend.tag.register('wyxlab_lablog', () => {
  const logs = loadLogs();
  const names = projectNames();
  if (!logs.length) return '';

  const groups = [];
  let currentYear = null;
  logs.forEach(entry => {
    const year = logDate(entry).slice(0, 4);
    if (year !== currentYear) {
      groups.push({ year, items: [] });
      currentYear = year;
    }
    groups[groups.length - 1].items.push(entry);
  });

  const html = groups.map(group => [
    '<section class="wyxlab-lablog-year">',
    `<h2 class="wyxlab-lablog-year-title">${escape(group.year)}</h2>`,
    `<ol class="wyxlab-lablog-list">${group.items.map(entry => logItem(entry, names)).join('')}</ol>`,
    '</section>'
  ].join(''));

  return `<div class="wyxlab-lablog nc">${html.join('')}</div>`;
});

const summary = content => {
  const text = String(content || '').trim();
  if (text.length <= 88) return text;
  const cut = text.slice(0, 88);
  const stop = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('！'), cut.lastIndexOf('？'), cut.lastIndexOf('.'));
  return stop >= 24 ? cut.slice(0, stop + 1) : `${cut.replace(/\s+$/, '')}…`;
};

const recentLogsHtml = () => {
  const logs = loadLogs().slice(0, 3);
  if (!logs.length) return '';

  const items = logs.map(entry => [
    '<li class="wyxlab-recent-log-item">',
    `<div class="wyxlab-recent-log-date"><time datetime="${escape(logDate(entry))}">${escape(logDate(entry))}</time></div>`,
    '<div class="wyxlab-recent-log-main">',
    `<div class="wyxlab-recent-log-head">${typeChip(entry.type)}<h3 class="wyxlab-log-title">${escape(entry.title)}</h3></div>`,
    entry.content ? `<p class="wyxlab-log-content">${escape(summary(entry.content))}</p>` : '',
    '</div>',
    '</li>'
  ].join(''));

  return [
    '<section class="wyxlab-recent-logs" id="wyxlab-recent-logs">',
    '<h2 class="wyxlab-recent-logs-title">Recent Lab Logs <span>最近日志</span></h2>',
    `<ol class="wyxlab-recent-logs-list">${items.join('')}</ol>`,
    '<a class="wyxlab-recent-logs-more" href="/lablog/">View all logs<i class="fas fa-arrow-right" aria-hidden="true"></i></a>',
    '</section>'
  ].join('');
};

hexo.extend.filter.register('after_render:html', (html, data) => {
  if (!data || data.path !== 'index.html') return html;

  const section = recentLogsHtml();
  if (!section) return html;

  return html.replace(
    /(<div class="recent-posts[^"]*" id="recent-posts">)/,
    match => match + section
  );
});
