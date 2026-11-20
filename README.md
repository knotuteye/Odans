# Odans Engineering & Construction: website

A plain HTML/CSS/JS site with no build step. Open `index.html` in a browser to preview it, or upload the whole folder to any static host (Netlify, GitHub Pages, cPanel hosting, etc.).

```
index.html  about.html  services.html  projects.html  team.html  contact.html  404.html
style.css   main.js
img/brand/     logo, logo mark (header), favicon
img/photos/    site photography (resized for the web, max 1600px wide)
img/clients/   client logos
video/         homepage background video (compressed)
```

## Placeholders still to fill

Text that still needs real information is wrapped in `<span class="ph">[…]</span>` and shows on the page **highlighted in yellow**, so nothing goes live by accident. Find them all with:

```sh
grep -n 'class="ph"' *.html
```

Some placeholders are not visible text. Search for `PLACEHOLDER` in HTML comments:

| What | Where |
| --- | --- |
| Phone, email, address | Footer of **every page**, plus the contact cards on `contact.html`. Update the `tel:`, `mailto:` and `wa.me` links as well as the visible text. |
| Opening hours, WhatsApp | `contact.html` |
| Social media links | Footer of every page (`href="#"`). Delete any network you don't use. |
| Quote form delivery | `contact.html`: create a free form at formspree.io, then replace `YOUR_FORM_ID`. Until then the form shows a "not connected yet" message instead of losing enquiries. |
| Office map | `contact.html`: paste the Google Maps embed `<iframe>` in place of the placeholder box. |
| Stats ("[XX]+ projects", "[XX] staff") | Homepage and About page |
| Founding story, mission, vision, registrations | `about.html` |
| Project names, clients, locations, years, photos | `projects.html` (6 cards) and the 3 "Recent projects" cards on `index.html`. **Check that the townhouse photo is an Odans project.** |
| Leadership names and roles, team members, careers email | `team.html` |
| Company registration number | Footer of every page |

> The header and footer are copied into every page. When you change one (e.g. adding the phone number), make the same change in all 7 HTML files. A find-and-replace across files does it in one go.

## Adding a project

Copy one `<article class="… project-card …">` block in `projects.html` and set `data-category` to `fuel`, `general`, `steel` or `facility` so the filter buttons pick it up. Put photos in `img/photos/`, ideally landscape, about 1600px wide and under 400 KB.

## Linking to a pre-filled quote form

`contact.html?service=fuel-stations` opens the quote form with that service already selected. The values are `general-construction`, `fuel-stations`, `steel-works`, `facility-management` and `other`.
