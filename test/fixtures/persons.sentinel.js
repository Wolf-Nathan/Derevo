// Exercises the "no parent" sentinel inconsistency: some code guards with
// `!== null`, other code guards with `>= 0` (so `-1` and `null` both mean
// "no parent" depending on which file you're in).
function makeSentinelFamily() {
  return [
    { id: 0, nom: 'NullParents', prenom: 'A', sexe: 'H', dateNaissance: null, dateMort: null, pere: null, mere: null, enfants: [], mariages: [] },
    { id: 1, nom: 'NegativeParents', prenom: 'B', sexe: 'F', dateNaissance: null, dateMort: null, pere: -1, mere: -1, enfants: [], mariages: [] }
  ];
}

module.exports = { makeSentinelFamily };
