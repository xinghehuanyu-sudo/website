/**
 * WYX LAB — custom home pagination
 * Page 1 shows `first_per_page` posts (default 3),
 * later pages show `per_page` posts (default 5).
 * Overrides hexo-generator-index's `index` generator.
 */
'use strict';

function wyxlabIndex(locals) {
  const config = hexo.config;
  const conf = config.index_generator || {};
  const posts = locals.posts.sort(conf.order_by);
  posts.data.sort((a, b) => (b.sticky || 0) - (a.sticky || 0));

  const paginationDir = conf.pagination_dir || config.pagination_dir || 'page';
  const base = conf.path ? (conf.path.endsWith('/') ? conf.path : conf.path + '/') : '';
  const first = conf.first_per_page != null ? conf.first_per_page : 3;
  const rest = conf.per_page || 5;

  const sizes = [];
  let remaining = posts.length;
  if (remaining > 0) {
    sizes.push(Math.min(first, remaining));
    remaining -= sizes[0];
    while (remaining > 0) {
      sizes.push(Math.min(rest, remaining));
      remaining -= sizes[sizes.length - 1];
    }
  } else {
    sizes.push(0);
  }
  const total = sizes.length;
  const url = i => (i > 1 ? base + paginationDir + '/' + i + '/' : base);

  const routes = [];
  let offset = 0;
  for (let i = 1; i <= total; i++) {
    const size = sizes[i - 1];
    routes.push({
      path: url(i),
      layout: conf.layout || ['index', 'archive'],
      data: {
        base,
        total,
        current: i,
        current_url: url(i),
        posts: size === 0 ? posts : posts.slice(offset, offset + size),
        prev: i > 1 ? i - 1 : 0,
        prev_link: i > 1 ? url(i - 1) : '',
        next: i < total ? i + 1 : 0,
        next_link: i < total ? url(i + 1) : '',
        __index: true
      }
    });
    offset += size;
  }
  return routes;
}

hexo.extend.generator.register('index', wyxlabIndex);

// Guarantee the override even if the default plugin registers later.
hexo.extend.filter.register('generateBefore', () => {
  const store = hexo.extend.generator.store;
  if (store && store.index !== wyxlabIndex) store.index = wyxlabIndex;
});
