---
name: derevo-audit-checklist
description: Checklist d'audit spécifique à Derevo (invariants du modèle de données localStorage, synchro bidirectionnelle des relations, dépendances CDN, tests). Préchargé par l'audit-agent.
user-invocable: false
---

# Checklist d'audit Derevo

Derevo est une app d'arbre généalogique : un serveur Express qui ne sert que des
fichiers statiques, et toute la logique côté client en Vue 2. Les données vivent
uniquement dans `localStorage["persons"]` (voir `CLAUDE.md` pour le modèle complet).
Utilise cette checklist en complément des catégories et criticités de l'agent.

## Périmètre

- **À auditer** : `server.js`, `dev/js/*.js`, `views/*.html`, `index.html`,
  `dev/css/`, `package.json`, `package-lock.json`, `test/`.
- **À exclure** : `dev/js/vue.js` (Vue 2.6.11 vendorisé, ne pas auditer ni proposer
  de le modifier), `node_modules/`, `assets/`.

## Bugs potentiels — invariants du modèle de données (priorité maximale)

Toute rupture de ces invariants casse l'arbre et les recherches : HIGH au minimum,
CRITICAL si elle corrompt durablement les données stockées.

- [ ] `persons[i].id === i` toujours vrai : les ids ne sont jamais réassignés ni
      décalés, y compris après une suppression (`deletePerson.js`) ou un ajout
      (`addPerson.js`, `id = persons.length`).
- [ ] Synchronisation bidirectionnelle, dans **chacun** des flux add / edit / delete :
  - `pere` / `mere` d'un enfant ↔ présence de l'enfant dans `enfants` du parent ;
  - `mariages[].maryId` présent des deux côtés, avec les mêmes `mariageDate` /
    `divorceDate` ;
  - retrait des références lors d'un changement de parent ou de conjoint, et lors
    d'une suppression (pas de référence vers une personne supprimée).
- [ ] Lecture de `?id=` via `URLSearchParams` : cast `Number()` homogène, et garde
      contre `null`, `NaN` et les ids hors bornes ou supprimés avant tout accès.
- [ ] Récursion dans `genereArbre.js` (`creerArbreAsc`, `creerArbreDesc`,
      `creerMariage`) et dans `infos.js` : références obsolètes, cycles
      (une personne est son propre ancêtre), personnes supprimées, `undefined`
      déréférencé.
- [ ] `byYear.js` : branches où `dateNaissance` et/ou `dateMort` valent `null`
      (une seule branche doit s'exécuter par personne), et parsing des dates au
      format français.
- [ ] Les `<button>` dans un `<form>` : sans `type="button"` ni `@submit.prevent`,
      le type par défaut `submit` recharge la page.

## Vulnérabilités

- [ ] XSS : `v-html`, `innerHTML`, `.html()` / `.append()` jQuery (notamment dans
      `pagination.js`) alimentés par des noms ou prénoms saisis par l'utilisateur.
- [ ] Chaque `<script>` / `<link>` CDN des vues : attributs `integrity` (SRI) et
      `crossorigin`, HTTPS, version figée (pas de `latest` ni de version flottante).
- [ ] `npm audit --json` : reporter les avis par sévérité.
- [ ] `server.js` : en-têtes de sécurité (helmet, CSP), `x-powered-by`, chemins
      servis en statique trop larges.
- [ ] `JSON.parse(localStorage.getItem('persons'))` sans try/catch ni valeur par
      défaut (données corrompues ou absentes).

## Bonnes pratiques

- [ ] Logique dupliquée entre les scripts de page (chargement / sauvegarde de
      `persons`, lecture de `?id=`) qui a divergé.
- [ ] Lint non fonctionnel (`npm run lint` appelle eslint, qui n'est pas installé) :
      connu, à signaler en **LOW** uniquement.
- [ ] Couverture de tests : lancer `npm test`, identifier les flux de synchronisation
      ou les cas limites non couverts dans `test/unit/`. `pagination.js` et
      `server.js` sont volontairement non couverts : ne pas le signaler.
- [ ] Cohérence des `<head>` entre les vues (mêmes dépendances, mêmes versions).

## Méthode

1. Lancer `npm test` et `npm audit`, et citer leur résultat dans le résumé
   exécutif.
2. Si `audit.md` existe à la racine, le lire et marquer chaque constat
   **[Nouveau]**, **[Déjà signalé]** ou **[Corrigé]** (pour un constat de
   `audit.md` qui ne se reproduit plus).
3. Ne modifier aucun fichier, ni écrire ou écraser `audit.md` : le rapport est
   renvoyé uniquement dans la réponse.

## Langue du rapport

Rédiger le rapport entièrement en français, en gardant la structure de sortie de
l'agent avec ces titres :

| Agent (anglais) | Rapport (français) |
|---|---|
| Executive Summary | Résumé exécutif |
| Possible Bugs | Bugs potentiels |
| Vulnerabilities | Vulnérabilités |
| Best Practices | Bonnes pratiques |
| Location | Localisation |
| Description | Description |
| Remediation | Remédiation |

Les niveaux de criticité (CRITICAL, HIGH, MEDIUM, LOW) restent en anglais.
