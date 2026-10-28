# saemundsson.se

The blog at [saemundsson.se](https://saemundsson.se) ("Azure, tech and other random stuff"), moved from WordPress to a static [Astro](https://astro.build) site. Every post and page keeps its WordPress URL. GitHub Actions builds the site and GitHub Pages serves it.

## Layout

| Path | Holds |
|---|---|
| `src/content/posts/` | One Markdown file per post. `permalink` in the frontmatter is the post's URL |
| `src/content/pages/` | Redirect pages: LinkedIn, GitHub and Credly in the header, as on WordPress, and `/cv/` (kept out of the header with `menu: false`) to the CV |
| `src/data/taxonomy.json` | Category and tag names by slug |
| `public/wp-content/uploads/` | The WordPress uploads, at their old paths, so old image URLs keep working |
| `public/images/YYYY/MM/` | Images for new posts (`npm run promote` puts them there) |
| `src/pages/` | Routes: posts and pages, home, `/category/<slug>/`, `/tag/<slug>/`, feeds, robots.txt, 404 |
| `src/styles/global.css` | The look: one stylesheet, system fonts, light and dark themes |
| `import/` | The raw WordPress export (JSON), so the conversion can be rerun |
| `tools/` | Export, conversion, promote and the dist check |
| `drafts/` | Your drafts (gitignored, not in the repository) |

## Write a post

1. Create `drafts/<slug>.md`. The frontmatter needs only a title:

   ```markdown
   ---
   title: My new post
   description: One or two sentences for the home page, search results and link previews.
   categories: [director-driven-development]
   tags: [azure, powershell]
   image: ./diagram.png          # optional: the image for link previews
   imageAlt: What the diagram shows
   ---

   The text, in Markdown. ![What it shows](./diagram.png)
   ```

   Put images next to the draft in `drafts/` and link them with relative paths. Categories and tags are slugs; a new one shows its slug until you add a display name in `src/data/taxonomy.json`.
2. Preview it with `npm run dev` (http://localhost:4321). Drafts appear at the top of the home page, marked as drafts, at `/drafts/<file>/`. Restart the dev server after creating `drafts/` for the first time. `npm run build` never includes drafts.
3. Publish it with `npm run promote -- drafts/<slug>.md` (add `--date YYYY-MM-DD` for another day than today). The script sets the date and modified time, takes the slug from the file name (or the title), sets the permalink `/YYYY/MM/DD/<slug>/`, moves the post to `src/content/posts/`, moves its images to `public/images/YYYY/MM/` and rewrites their links. It refuses if the slug, the permalink or an image path already exists.
4. Commit and push. The workflow builds and deploys `main`.

Links between posts are root-relative (`/2026/10/19/what-directing-ai-agents-costs/`); the build adds the base path when the site is served from a subfolder.

## Build locally

Node 22.23 or newer (CI uses 24).

```sh
npm ci
npm run dev       # preview with drafts, at http://localhost:4321
npm run build     # the site, in dist/
npm run check     # astro check (TypeScript, strict)
npm run verify    # checks dist/: every WordPress URL, feeds, sitemap, links and images
```

To build as the project site, under `/saemundsson.se/`, set the same variables the workflow sets:

```sh
PAGES_BASE_URL=https://freakling.github.io/saemundsson.se PAGES_BASE_PATH=/saemundsson.se npm run build
PAGES_BASE_PATH=/saemundsson.se npm run verify
```

(In Git Bash on Windows, prefix `MSYS_NO_PATHCONV=1` so `/saemundsson.se` isn't turned into a Windows path.)

## How URLs work

- **Posts** are served at their WordPress permalink, `/YYYY/MM/DD/<slug>/`, from the `permalink` field. Pages are at `/<slug>/`.
- **Canonical URLs** and `og:url` always point at `https://saemundsson.se`, also while the site is served from github.io, so search engines treat that copy as a duplicate of the real domain.
- **Short links**: WordPress sent `/?p=<id>` (and `/?page_id=<id>`) to the post. A small inline script on the home page does the same for every imported post.
- **Feeds**: `/feed.xml` and `/rss.xml` are the RSS feed, served as XML. `/feed/`, the WordPress feed address subscribers already have, holds the same RSS XML; GitHub Pages can serve a folder only as `index.html`, with an HTML content type, which feed readers accept because they read the body. The pages link `/feed.xml` for new subscribers. Imported posts keep their WordPress guids, so readers don't show them again.
- **Sitemap**: `/sitemap-index.xml`, named in `/robots.txt`; it lists the URLs on the host the site is served from.

## Deploy and the cutover

The workflow (`.github/workflows/deploy.yml`) builds and checks the site on every push. It deploys `main` to GitHub Pages only when the repository variable `PAGES_ENABLED` is `true`; until then the build uses base `/` and site `https://saemundsson.se`, and nothing is published. When Pages is on, `actions/configure-pages` gives the build its `base_url` and `base_path`, so the same workflow serves the project site at `https://freakling.github.io/saemundsson.se/` and, after the domain move, `https://saemundsson.se/`, with no code change.

Cutover, in order:

1. Make the repository public (GitHub Pages on a free plan needs that).
2. Enable Pages: Settings > Pages > Build and deployment > Source: **GitHub Actions**.
3. Set the repository variable `PAGES_ENABLED` to `true` (Settings > Secrets and variables > Actions > Variables), then run the workflow (push, or Actions > Build and deploy > Run workflow).
4. Check the site at `https://freakling.github.io/saemundsson.se/`: a few old post URLs, an image, `/feed/`, a `/?p=<id>` short link and the 404 page.
5. Move the domain:
   - In Settings > Pages > Custom domain, enter `saemundsson.se`. With a GitHub Actions source this setting is the custom domain; a `public/CNAME` file is optional and not needed.
   - At the DNS host, point the apex `saemundsson.se` at GitHub Pages with `A` records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and `AAAA` records `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`), and `www` with a `CNAME` to `freakling.github.io`. Remove the old `A`/`AAAA` records for the WordPress host.
   - Optionally verify the domain for your account (Settings > Pages > Add a domain) to protect it from takeover.
   - When the certificate is issued, tick **Enforce HTTPS**.
   - Run the workflow once more: `configure-pages` now reports `https://saemundsson.se` with an empty base path, and the site builds for the root.

## Rerun the WordPress import

Only needed while WordPress is still the source; it overwrites the generated posts and pages.

```sh
node tools/export-wordpress.mjs    # public REST API, read-only, one request at a time; skips images already downloaded
node tools/convert.mjs             # import/ -> src/content/ and src/data/taxonomy.json
```
