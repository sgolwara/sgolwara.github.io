# An Archive of Small Thoughts

A personal writing site built with Jekyll and hosted on GitHub Pages.

---

## Deploying to GitHub Pages

1. Create a GitHub account if you don't have one
2. Create a new repository named exactly: `yourusername.github.io`
3. Upload all these files to that repository
4. Go to the repository **Settings → Pages → Source** and set it to **Deploy from a branch**, branch `main`, folder `/ (root)`
5. Your site will be live at `https://yourusername.github.io` within a minute or two

---

## Adding a new piece

### Essay
Create a file in `_essays/` named `your-title.md` with this at the top:

```
---
title: Your Title Here
date: 2026-03-07
---

Your content here...
```

### Story
Same thing, but in `_stories/`.

### Poem
Same thing, but in `_poems/`.

For poems, each stanza should be wrapped like this for proper spacing:

```html
<div class="stanza">

Line one
Line two
Line three

</div>
```

---

## File naming
Use lowercase with hyphens: `my-essay-title.md`, `the-old-house.md`
The filename becomes part of the URL, so keep it clean and readable.

---

## Date format
Always use `YYYY-MM-DD` format in the front matter: `date: 2026-03-07`
