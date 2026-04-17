# guanshengju

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
Personal website built with Vue 3 + Vite, including a standalone blog section.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development
## Development

```sh
npm run dev
```

### Compile and Minify for Production
## Production Build

```sh
npm run build
```

## Blog Usage

The blog is a standalone route:

- `/blog` for the blog index page
- `/blog/:slug` for each post detail page

### 1. Create a new post

Add a Markdown file under:

```text
src/content/blog/
```

The file name becomes the post slug.  
For example:

```text
src/content/blog/my-first-note.md
```

will be available at:

```text
/blog/my-first-note
```

### 2. Add frontmatter

Each post needs at least these fields:

```yaml
---
title: My First Note
date: 2026-04-14
summary: A short sentence shown in the blog list.
tags:
  - Notes
  - Thinking
cover: /blog-assets/my-first-note/cover.png
---
```

Required fields:

- `title`
- `date`
- `summary`

Optional fields:

- `tags`
- `cover`
- `draft`

If you set:

```yaml
draft: true
```

the post will not appear on the site.

### 3. Write content in Markdown

After the frontmatter, write the article body in normal Markdown.

Supported behavior:

- headings, paragraphs, lists, quotes, code blocks
- automatic rendering into the blog page style
- automatic reading time estimation
- automatic date sorting, newest first

### 4. Add images or cover assets

Put blog assets in:

```text
public/blog-assets/<slug>/
```

Example:

```text
public/blog-assets/my-first-note/cover.png
```

Then reference it in Markdown or frontmatter with a root path:

```text
/blog-assets/my-first-note/cover.png
```

### 5. Publish

Once the Markdown file is added with valid frontmatter, the post is automatically picked up by the blog.

No extra route file or manual registration is needed.

## Notes

- Posts are loaded from `src/content/blog/*.md`
- The filename is used as the slug
- External links open in a new tab
- Blog images are lazy-loaded automatically