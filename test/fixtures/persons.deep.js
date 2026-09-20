// Linear ancestor/descendant chain: person 0 is the youngest, person
// (length - 1) is the eldest known ancestor (pere: null). Every person's
// `pere` points to the next index up; `enfants` points back down.
function makeDeepAncestorChain(length = 5) {
  const persons = [];
  for (let i = 0; i < length; i++) {
    persons.push({
      id: i,
      nom: 'Chain',
      prenom: `Gen${i}`,
      sexe: i % 2 === 0 ? 'H' : 'F',
      dateNaissance: null,
      dateMort: null,
      pere: i + 1 < length ? i + 1 : null,
      mere: null,
      enfants: i > 0 ? [i - 1] : [],
      mariages: []
    });
  }
  return persons;
}

module.exports = { makeDeepAncestorChain };
