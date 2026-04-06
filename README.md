# An Archive of Small Thoughts

A personal writing site built with Jekyll and hosted on GitHub Pages.

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
