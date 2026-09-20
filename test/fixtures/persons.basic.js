// 3-generation family with one marriage: grandparents (0, 1) -> father (2)
// married to (3) -> child (4). Fresh objects on every call.
function makeBasicFamily() {
  return [
    { id: 0, nom: 'Dupont', prenom: 'Henri', sexe: 'H', dateNaissance: '1 janvier 1920', dateMort: '1 janvier 1990', pere: null, mere: null, enfants: [2], mariages: [] },
    { id: 1, nom: 'Dupont', prenom: 'Marie', sexe: 'F', dateNaissance: '1 janvier 1922', dateMort: '1 janvier 1995', pere: null, mere: null, enfants: [2], mariages: [] },
    { id: 2, nom: 'Dupont', prenom: 'Paul', sexe: 'H', dateNaissance: '1 janvier 1950', dateMort: null, pere: 0, mere: 1, enfants: [4], mariages: [{ maryId: 3, mariageDate: '1 juin 1975', divorceDate: null }] },
    { id: 3, nom: 'Martin', prenom: 'Claire', sexe: 'F', dateNaissance: '1 janvier 1952', dateMort: null, pere: null, mere: null, enfants: [4], mariages: [{ maryId: 2, mariageDate: '1 juin 1975', divorceDate: null }] },
    { id: 4, nom: 'Dupont', prenom: 'Luc', sexe: 'H', dateNaissance: '1 janvier 1978', dateMort: null, pere: 2, mere: 3, enfants: [], mariages: [] }
  ];
}

module.exports = { makeBasicFamily };
