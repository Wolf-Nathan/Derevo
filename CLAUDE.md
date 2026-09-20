# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Derevo is a French-language family tree (arbre généalogique) app. It's a small
Express server that serves static, hand-written HTML pages; all application
logic runs client-side with Vue 2, and all data lives in the browser's
`localStorage` — there is no database and no backend API/routes for CRUD.

## Commands

```
npm install     # install dependencies
npm start       # start the server (node server.js), default port 8080
node server.js  # equivalent to npm start
```

There is no functional test suite (`npm test` is a stub that always exits
with an error) and no working lint setup (`npm run lint` calls `eslint
server.js` but eslint is not installed and no ESLint config exists in the
repo) — don't rely on either command actually validating anything.

## Architecture

### Server (`server.js`)

A minimal Express app with no templating engine and no API endpoints. Each
route just serves a static file:

- `/` → `index.html` (home/list page)
- `/add` → `views/addPerson.html`
- `/edit` → `views/editPerson.html`
- `/infos` → `views/infos.html`
- `/delete` → `views/deletePerson.html`
- `/year` → `views/byYear.html`
- `/about` → `views/about.html`

Static assets are mounted directly: `/images` → `assets/images/`, `/css` →
`dev/css/`, `/js` → `dev/js/`. Page-specific ids (e.g. `/infos?id=0`,
`/edit?id=0`) are read client-side via `URLSearchParams`, not by the server.

### Client-side data model

There is no backend persistence layer. Every page that needs data reads/
writes a single `localStorage` key, `"persons"`, holding a JSON array of
person objects:

```js
{
  id: number,            // == the array index
  nom, prenom, sexe,      // sexe is 'H' or 'F'
  dateNaissance, dateMort, // localized French date strings, or null
  pere: number|null,      // father's id (array index)
  mere: number|null,      // mother's id (array index)
  enfants: number[],      // children ids
  mariages: [{ maryId, mariageDate, divorceDate }]
}
```

`id` is always the person's index in the array — code relies on this (e.g.
`this.persons[person.id]`, `personModif = this.persons[urlParams.get('id')]`).
Relationships are **bidirectional and denormalized**: adding/removing a
parent or a marriage means updating both persons' records (see
`dev/js/editPerson.js` for the reference logic that keeps `pere`/`mere`/
`enfants`/`mariages` in sync on both sides). Any change to person data must
preserve this consistency or the tree rendering and lookups will break.

### Page scripts (`dev/js/*.js`)

Each HTML page in `views/` (plus `index.html`) bootstraps its own Vue 2
instance in a matching script:

- `addPerson.js` — create form, assigns new `id` as `persons.length`, wires
  up parent/child/marriage back-references.
- `editPerson.js` — edit form; diffs the form against the loaded person and
  patches both sides of any changed relationship.
- `deletePerson.js`, `byYear.js`, `infos.js` — page-specific read/delete
  logic against the same `persons` array in `localStorage`.
- `genereArbre.js` — renders the family tree for `/infos?id=`. It walks up
  from the selected person to the eldest known ancestor (`creerArbreAsc`),
  then recursively renders descendants and spouses (`creerArbreDesc`/
  `creerMariage`) using a Vue render function (no templates) with custom
  `Arbre`/`Personne` components.
- `pagination.js` — jQuery-based table pagination/search, used on the home
  page's person list; operates purely on the rendered DOM (`table-id`), not
  on the underlying data.
- `vue.js` is the vendored Vue.js 2.6.11 library itself — do not edit it.

### Third-party dependencies

Bootstrap, Font Awesome, AOS (scroll animations), jQuery, and
`vuejs-datepicker` (+ its French locale) are all loaded via CDN `<script>`/
`<link>` tags directly in each HTML file under `views/`, not bundled — there
is no build step. When adding a new page, mirror the `<head>` includes of an
existing view (e.g. `views/addPerson.html`) to keep them consistent.