import MarkdownIt from 'markdown-it';

const markdownFiles = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

const ROOT_PATH_PREFIX = /^\/+/;
const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i;
const NON_TRANSFORMABLE_URL_PATTERN = /^(?:#|data:|mailto:|tel:)/i;

function resolveAssetUrl(url) {
  if (!url || ABSOLUTE_URL_PATTERN.test(url) || NON_TRANSFORMABLE_URL_PATTERN.test(url)) {
    return url;
  }

  if (!url.startsWith('/')) {
    return url;
  }

  return `${import.meta.env.BASE_URL}${url.replace(ROOT_PATH_PREFIX, '')}`;
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

const defaultLinkOpen =
  markdown.renderer.rules.link_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href');

  if (href) {
    const normalizedHref = resolveAssetUrl(href);
    tokens[idx].attrSet('href', normalizedHref);

    if (ABSOLUTE_URL_PATTERN.test(normalizedHref)) {
      tokens[idx].attrSet('target', '_blank');
      tokens[idx].attrSet('rel', 'noreferrer noopener');
    }
  }

  return defaultLinkOpen(tokens, idx, options, env, self);
};

const defaultImageRule =
  markdown.renderer.rules.image ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
  const src = tokens[idx].attrGet('src');

  if (src) {
    tokens[idx].attrSet('src', resolveAssetUrl(src));
  }

  tokens[idx].attrSet('loading', 'lazy');
  tokens[idx].attrSet('decoding', 'async');

  return defaultImageRule(tokens, idx, options, env, self);
};

function createSlugFromPath(filePath) {
  return filePath.split('/').pop().replace(/\.md$/, '');
}

function estimateReadingMinutes(markdownSource) {
  const cjkCharacters = (markdownSource.match(/[\u3400-\u9fff]/g) || []).length;
  const latinWords = (markdownSource.match(/[A-Za-z0-9_]+/g) || []).length;
  const totalUnits = cjkCharacters + latinWords;

  return Math.max(1, Math.round(totalUnits / 220));
}

function normalizeDateInput(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T12:00:00`;
  }

  return value;
}

function formatDateValue(value) {
  if (value instanceof Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const date = new Date(normalizeDateInput(value));

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function parseFrontmatterValue(value) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseFrontmatter(rawSource) {
  if (!rawSource.startsWith('---')) {
    return {
      data: {},
      content: rawSource
    };
  }

  const lines = rawSource.split(/\r?\n/);

  if (lines[0].trim() !== '---') {
    return {
      data: {},
      content: rawSource
    };
  }

  const data = {};
  let currentArrayKey = null;
  let closingIndex = -1;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (trimmedLine === '---') {
      closingIndex = index;
      break;
    }

    if (!trimmedLine) {
      continue;
    }

    const arrayItemMatch = trimmedLine.match(/^-\s+(.*)$/);

    if (arrayItemMatch && currentArrayKey) {
      data[currentArrayKey].push(parseFrontmatterValue(arrayItemMatch[1].trim()));
      continue;
    }

    const keyValueMatch = line.match(/^([A-Za-z0-9_-]+):(.*)$/);

    if (!keyValueMatch) {
      currentArrayKey = null;
      continue;
    }

    const [, key, rawValue] = keyValueMatch;
    const value = rawValue.trim();

    if (!value) {
      data[key] = [];
      currentArrayKey = key;
      continue;
    }

    data[key] = parseFrontmatterValue(value);
    currentArrayKey = null;
  }

  if (closingIndex === -1) {
    return {
      data: {},
      content: rawSource
    };
  }

  return {
    data,
    content: lines.slice(closingIndex + 1).join('\n')
  };
}

function parsePost(filePath, rawSource) {
  const { data, content } = parseFrontmatter(rawSource);
  const slug = createSlugFromPath(filePath);

  if (!data.title || !data.date || !data.summary) {
    console.warn(`[blog] "${slug}" is missing required frontmatter fields.`);
    return null;
  }

  if (data.draft === true) {
    return null;
  }

  return {
    slug,
    title: String(data.title),
    date: formatDateValue(data.date),
    summary: String(data.summary),
    tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
    cover: data.cover ? resolveAssetUrl(String(data.cover)) : '',
    readingMinutes: estimateReadingMinutes(content),
    html: markdown.render(content.trim())
  };
}

const posts = Object.entries(markdownFiles)
  .map(([filePath, rawSource]) => parsePost(filePath, rawSource))
  .filter(Boolean)
  .sort((left, right) => new Date(normalizeDateInput(right.date)) - new Date(normalizeDateInput(left.date)));

export function getAllBlogPosts() {
  return posts;
}

export function getBlogPostBySlug(slug) {
  return posts.find((post) => post.slug === slug) || null;
}

export function formatBlogDate(dateString) {
  const date = new Date(normalizeDateInput(dateString));

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
