/**
 * WYX LAB — {% wyxlab_about %} tag
 * Build-time aggregation of the three existing data sources:
 *   site.data.projects + site.data.lablog + site.data.timeline
 * No new data, no browser-side fetch, no duplication.
 */
'use strict';

const PROFILE = {
  name: 'WYX LAB',
  tagline: 'Personal Digital Lab',
  lead: '这里记录我在物理、代码、科研与生活中的实验。',
  second: '我喜欢把学习过程、科研进展和自己做出来的东西记录下来。这里既是博客，也是项目档案、实验日志与成长记录。',
  keywords: ['Physics', 'Code', 'Research', 'Life'],
  avatar: '/img/avatar-cartoon.webp'
};

const INTERESTS = [
  { group: 'Research', items: ['Chirality', 'Optics', 'Spectroscopy', 'COMSOL', 'Data Analysis'] },
  { group: 'Building & Life', items: ['AI', 'Web Development', 'Photography'] }
];

const EXPLORE = [
  { href: '/projects/', icon: 'fas fa-flask', name: 'Projects', desc: 'What I build.' },
  { href: '/lablog/', icon: 'fas fa-clipboard-list', name: 'Lab Log', desc: 'What I am working on.' },
  { href: '/timeline/', icon: 'fas fa-route', name: 'Timeline', desc: 'Important milestones.' },
  { href: '/archives/', icon: 'fas fa-box-archive', name: 'Posts', desc: 'Long-form notes and articles.' }
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const escape = value => String(value == null ? '' : value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Same multi-precision date logic as scripts/wyxlab-timeline.js
const sortable = iso => {
  const [year, month, day] = String(iso || '').split('-');
  const norm = [year || '0000', month || '00', day || '00'].join('-');
  return /^\d{4}(-\d{2}){0,2}$/.test(String(iso || '')) ? norm : '0000-00-00';
};

const formatDate = iso => {
  const parts = String(iso || '').split('-');
  if (parts.length === 1) return parts[0] || '';
  const month = MONTHS[parseInt(parts[1], 10) - 1];
  if (!month) return String(iso);
  return parts.length >= 3 ? `${month} ${parts[2]}, ${parts[0]}` : `${month} ${parts[0]}`;
};

const statusPill = status => {
  if (!status) return '';
  const slug = String(status).toLowerCase().replace(/\s+/g, '-');
  return `<span class="wyxlab-about-status status-${escape(slug)}">${escape(status)}</span>`;
};

const firstSentence = (text, max) => {
  const value = String(text || '').trim();
  if (!value) return '';
  const end = value.search(/[。！？!?.]/);
  const sentence = end >= 0 ? value.slice(0, end + 1) : value;
  return sentence.length > max ? `${sentence.slice(0, max).replace(/\s+$/, '')}…` : sentence;
};

const dataList = key => {
  const list = (hexo.locals.get('data') || {})[key];
  return Array.isArray(list) ? list : [];
};

const section = (title, zh, inner) => inner
  ? `<section class="wyxlab-about-block"><h2 class="wyxlab-about-heading">${title} <span>${zh}</span></h2>${inner}</section>`
  : '';

const moreLink = (href, label) => `<a class="wyxlab-about-more" href="${escape(href)}">${escape(label)}<i class="fas fa-arrow-right" aria-hidden="true"></i></a>`;

/* ---------- blocks ---------- */

const profileHtml = () => [
  '<section class="wyxlab-about-profile">',
  `<div class="wyxlab-about-avatar-wrap"><img class="wyxlab-about-avatar" src="${escape(PROFILE.avatar)}" alt="WYX LAB avatar" loading="lazy"></div>`,
  '<div class="wyxlab-about-intro">',
  `<h2 class="wyxlab-about-name">${escape(PROFILE.name)}</h2>`,
  `<p class="wyxlab-about-tagline">${escape(PROFILE.tagline)}</p>`,
  `<p class="wyxlab-about-lead">${escape(PROFILE.lead)}</p>`,
  `<p class="wyxlab-about-second">${escape(PROFILE.second)}</p>`,
  `<ul class="wyxlab-about-keywords">${PROFILE.keywords.map(k => `<li>${escape(k)}</li>`).join('')}</ul>`,
  '<p class="wyxlab-about-statusline"><span class="wyxlab-about-status-label">LAB STATUS</span>Researching · Building · Learning</p>',
  '</div>',
  '</section>'
].join('');

const interestsHtml = () => {
  const groups = INTERESTS.map(g => [
    '<div class="wyxlab-about-interest-group">',
    `<h3>${escape(g.group)}</h3>`,
    `<ul class="wyxlab-about-chips">${g.items.map(i => `<li>${escape(i)}</li>`).join('')}</ul>`,
    '</div>'
  ].join(''));
  return `<div class="wyxlab-about-interests">${groups.join('')}</div>`;
};

const currentlyHtml = projects => {
  const find = status => projects.find(p => p.featured && String(p.status || '').toLowerCase() === status.toLowerCase());
  const slots = [
    { heading: 'Researching', project: find('In Progress') },
    { heading: 'Building', project: find('Maintaining') }
  ].filter(s => s.project).map(s => {
    const p = s.project;
    const subtitle = p.subtitle ? `<p class="wyxlab-about-project-subtitle">${escape(p.subtitle)}</p>` : '';
    const desc = p.description ? `<p class="wyxlab-about-project-desc">${escape(firstSentence(p.description, 64))}</p>` : '';
    return [
      '<div class="wyxlab-about-current-item">',
      `<h3 class="wyxlab-about-current-heading">${escape(s.heading)}</h3>`,
      `<div class="wyxlab-about-current-project"><span class="wyxlab-about-current-name">${escape(p.name)}</span>${statusPill(p.status)}</div>`,
      subtitle,
      desc,
      '</div>'
    ].join('');
  });
  return slots.length ? `<div class="wyxlab-about-current">${slots.join('')}</div>` : '';
};

const featuredHtml = projects => {
  const cards = projects.filter(p => p.featured).slice(0, 3).map(p => {
    const subtitle = p.subtitle ? `<p class="wyxlab-about-project-subtitle">${escape(p.subtitle)}</p>` : '';
    const desc = p.description ? `<p class="wyxlab-about-project-desc">${escape(p.description)}</p>` : '';
    const tags = Array.isArray(p.tags) && p.tags.length
      ? `<ul class="wyxlab-about-project-tags">${p.tags.slice(0, 4).map(t => `<li>${escape(t)}</li>`).join('')}</ul>`
      : '';
    return [
      '<a class="wyxlab-about-project" href="/projects/">',
      `<div class="wyxlab-about-project-head"><h3>${escape(p.name)}</h3>${statusPill(p.status)}</div>`,
      subtitle,
      desc,
      tags,
      '</a>'
    ].join('');
  });
  return cards.length
    ? `<div class="wyxlab-about-featured">${cards.join('')}</div>${moreLink('/projects/', 'View all projects')}`
    : '';
};

const milestoneHtml = (timeline, names) => {
  const latest = timeline
    .filter(t => (t.milestone === true || String(t.milestone) === 'true') && t.date)
    .sort((a, b) => sortable(b.date).localeCompare(sortable(a.date)))[0];
  if (!latest) return '';
  const mDate = String(latest.date);

  const cat = latest.category
    ? `<span class="wyxlab-about-milestone-category">${escape(latest.category)}</span>`
    : '';
  let project = '';
  if (latest.project) {
    const chipText = `Project: ${escape(latest.project)}`;
    project = names.has(latest.project)
      ? `<a class="wyxlab-about-milestone-project" href="/projects/">${chipText}</a>`
      : `<span class="wyxlab-about-milestone-project">${chipText}</span>`;
  }
  const desc = latest.description ? `<p class="wyxlab-about-milestone-desc">${escape(latest.description)}</p>` : '';

  return [
    '<div class="wyxlab-about-milestone">',
    `<div class="wyxlab-about-milestone-meta"><time datetime="${escape(mDate)}">${escape(formatDate(mDate))}</time>${cat}</div>`,
    `<h3 class="wyxlab-about-milestone-title">${escape(latest.title)}</h3>`,
    desc,
    project ? `<div class="wyxlab-about-milestone-related">${project}</div>` : '',
    '</div>',
    moreLink('/timeline/', 'View timeline')
  ].join('');
};

const activityHtml = logs => {
  const items = logs
    .filter(l => l && l.date && l.title)
    .slice()
    .sort((a, b) => sortable(b.date).localeCompare(sortable(a.date)))
    .slice(0, 2)
    .map(l => {
      const date = String(l.date).slice(0, 10);
      const excerpt = l.content ? `<p class="wyxlab-about-activity-desc">${escape(firstSentence(l.content, 56))}</p>` : '';
      return [
        '<li class="wyxlab-about-activity-item">',
        `<div class="wyxlab-about-activity-date"><time datetime="${escape(date)}">${escape(date)}</time></div>`,
        '<div class="wyxlab-about-activity-main">',
        `<div class="wyxlab-about-activity-head">${l.type ? `<span class="wyxlab-about-activity-type">${escape(l.type)}</span>` : ''}<h3>${escape(l.title)}</h3></div>`,
        excerpt,
        '</div>',
        '</li>'
      ].join('');
    });
  return items.length
    ? `<ul class="wyxlab-about-activity">${items.join('')}</ul>${moreLink('/lablog/', 'View Lab Log')}`
    : '';
};

const exploreHtml = () => [
  '<div class="wyxlab-about-explore">',
  EXPLORE.map(e => [
    `<a class="wyxlab-about-link-card" href="${escape(e.href)}">`,
    `<i class="${escape(e.icon)}" aria-hidden="true"></i>`,
    `<span class="wyxlab-about-link-name">${escape(e.name)}</span>`,
    `<span class="wyxlab-about-link-desc">${escape(e.desc)}</span>`,
    '</a>'
  ].join('')).join(''),
  '</div>'
].join('');

hexo.extend.tag.register('wyxlab_about', () => {
  const projects = dataList('projects');
  const logs = dataList('lablog');
  const timeline = dataList('timeline');
  const names = new Set(projects.map(p => p && p.name).filter(Boolean));

  return ['<div class="wyxlab-about nc">',
    profileHtml(),
    section('Research &amp; Interests', '研究与兴趣', interestsHtml()),
    section('Currently', '正在进行', currentlyHtml(projects)),
    section('Featured Projects', '精选项目', featuredHtml(projects)),
    section('Latest Milestone', '最新里程碑', milestoneHtml(timeline, names)),
    section('Latest Lab Activity', '最近动态', activityHtml(logs)),
    section('Explore WYX LAB', '浏览实验室', exploreHtml()),
    '</div>'
  ].join('');
});
