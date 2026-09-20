// Covers byYear.js's 3 branches: both dates known, birth-only, death-only,
// plus a person with no dates at all (must never match any search).
function makeByYearFixture() {
  return [
    { id: 0, nom: 'BothKnown', prenom: 'A', sexe: 'H', dateNaissance: '1 janvier 1950', dateMort: '1 janvier 2000', pere: null, mere: null, enfants: [], mariages: [] },
    { id: 1, nom: 'BirthOnly', prenom: 'B', sexe: 'F', dateNaissance: '1 janvier 1960', dateMort: null, pere: null, mere: null, enfants: [], mariages: [] },
    { id: 2, nom: 'DeathOnly', prenom: 'C', sexe: 'H', dateNaissance: null, dateMort: '1 janvier 1980', pere: null, mere: null, enfants: [], mariages: [] },
    { id: 3, nom: 'NoDates', prenom: 'D', sexe: 'F', dateNaissance: null, dateMort: null, pere: null, mere: null, enfants: [], mariages: [] }
  ];
}

module.exports = { makeByYearFixture };
