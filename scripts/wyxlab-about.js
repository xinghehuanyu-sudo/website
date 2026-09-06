/**
 * WYX LAB — {% wyxlab_about %} tag
 * Build-time aggregation of the three existing data sources:
 *   site.data.projects + site.data.lablog + site.data.timeline
 * No new data, no browser-side fetch, no duplication.
 */
'use strict';

const PROFILE = {
  name: 'WYX LAB',
  tagline: '个人数字实验室',
  lead: '这里记录我在物理、代码、科研与生活中的实验。',
  second: '以物理与光学研究为主线，把模型、实验、代码和思考整理成可以持续生长的个人档案。',
  keywords: ['物理', '代码', '科研', '生活'],
  avatar: '/img/avatar-cartoon.webp'
};

const EDUCATION = {
  school: '西安交通大学',
  college: '',
  major: '光电信息专业'
};

const INTERESTS = [
  { group: '科研', items: ['手性', '光学', '光谱学', 'COMSOL', '数据分析'] },
  { group: '创造与生活', items: ['AI', '网页开发', '摄影'] }
];

const EXPLORE = [
  { href: '/projects/', icon: 'fas fa-flask', name: '项目', desc: '持续构建的研究与作品。' },
  { href: '/lablog/', icon: 'fas fa-clipboard-list', name: '实验日志', desc: '实验、阅读与开发进展。' },
  { href: '/timeline/', icon: 'fas fa-route', name: '时间线', desc: '值得长期保留的重要节点。' },
  { href: '/archives/', icon: 'fas fa-box-archive', name: '文章', desc: '完整的笔记、教程与随笔。' }
];

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
  if (parts.length === 1) return parts[0] ? `${parts[0]} 年` : '';
  const month = parseInt(parts[1], 10);
  if (!month || month > 12) return String(iso);
  return parts.length >= 3 ? `${parts[0]} 年 ${month} 月 ${parseInt(parts[2], 10)} 日` : `${parts[0]} 年 ${month} 月`;
};

const statusPill = status => {
  if (!status) return '';
  const slug = String(status).toLowerCase().replace(/\s+/g, '-');
  const labels = {
    'in progress': '进行中',
    'completed': '已完成',
    'maintaining': '持续维护',
    'paused': '已暂停'
  };
  return `<span class="wyxlab-about-status status-${escape(slug)}">${escape(labels[String(status).toLowerCase()] || status)}</span>`;
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

const section = (title, inner, extraClass = '') => inner
  ? `<section class="wyxlab-about-block${extraClass ? ` ${extraClass}` : ''}"><h2 class="wyxlab-about-heading">${title}</h2>${inner}</section>`
  : '';

const moreLink = (href, label) => `<a class="wyxlab-about-more" href="${escape(href)}">${escape(label)}<i class="fas fa-arrow-right" aria-hidden="true"></i></a>`;

/* ---------- blocks ---------- */

const educationHtml = () => {
  const rows = [
    ['学校', EDUCATION.school],
    ['学院', EDUCATION.college],
    ['专业', EDUCATION.major]
  ].filter(([, value]) => value);
  if (!rows.length) return '';
  return [
    '<aside class="wyxlab-about-education">',
    '<div class="wyxlab-about-education-icon"><i class="fas fa-graduation-cap" aria-hidden="true"></i></div>',
    '<div><p class="wyxlab-about-education-title">教育经历</p>',
    `<dl>${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl></div>`,
    '</aside>'
  ].join('');
};

const profileHtml = () => {
  const education = educationHtml();
  return [
  `<section class="wyxlab-about-profile${education ? ' has-education' : ''}">`,
  `<div class="wyxlab-about-avatar-wrap"><img class="wyxlab-about-avatar" src="${escape(PROFILE.avatar)}" alt="WYX LAB avatar" loading="lazy"></div>`,
  '<div class="wyxlab-about-intro">',
  `<h2 class="wyxlab-about-name">${escape(PROFILE.name)}</h2>`,
  `<p class="wyxlab-about-tagline">${escape(PROFILE.tagline)}</p>`,
  `<p class="wyxlab-about-lead">${escape(PROFILE.lead)}</p>`,
  `<p class="wyxlab-about-second">${escape(PROFILE.second)}</p>`,
  `<ul class="wyxlab-about-keywords">${PROFILE.keywords.map(k => `<li>${escape(k)}</li>`).join('')}</ul>`,
  '<p class="wyxlab-about-statusline"><span class="wyxlab-about-status-label">当前状态</span>研究 · 构建 · 学习</p>',
  '</div>',
  education,
  '</section>'
].join('');
};

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
    { heading: '科研进行中', project: find('In Progress') },
    { heading: '持续构建', project: find('Maintaining') }
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
      ? `<ul class="wyxlab-about-project-tags">${p.tags.slice(0, 5).map(t => `<li>${escape(t)}</li>`).join('')}</ul>`
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
    ? `<div class="wyxlab-about-featured">${cards.join('')}</div>${moreLink('/projects/', '查看全部项目')}`
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
    const chipText = `项目：${escape(latest.project)}`;
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
    moreLink('/timeline/', '查看时间线')
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
    ? `<ul class="wyxlab-about-activity">${items.join('')}</ul>${moreLink('/lablog/', '查看实验日志')}`
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
    '<div class="wyxlab-about-dashboard">',
    section('研究与兴趣', interestsHtml(), 'is-panel'),
    section('正在进行', currentlyHtml(projects), 'is-panel'),
    '</div>',
    section('精选项目', featuredHtml(projects)),
    '<div class="wyxlab-about-updates">',
    section('最新里程碑', milestoneHtml(timeline, names), 'is-panel'),
    section('最近动态', activityHtml(logs), 'is-panel'),
    '</div>',
    section('浏览实验室', exploreHtml()),
    '</div>'
  ].join('');
});
