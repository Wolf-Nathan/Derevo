const { mount } = require('@vue/test-utils');
const { loadScript } = require('../helpers/loadScript');
const { snapshotGlobals, cleanupNewGlobals } = require('../helpers/globalLeakGuard');
const { makeBasicFamily } = require('../fixtures/persons.basic');
const { makeDeepAncestorChain } = require('../fixtures/persons.deep');

describe('genereArbre.js', () => {
  let globalsBefore;

  beforeEach(() => {
    globalsBefore = snapshotGlobals();
    localStorage.clear();
  });

  afterEach(() => {
    cleanupNewGlobals(globalsBefore);
  });

  // genereArbre.js's root Vue instance mounts against an empty fixture div,
  // so it never actually renders the nested `Arbre` component itself (no
  // <Arbre> tag exists in the compiled template). Extract the plain `Arbre`
  // component definition off the root instance's options and mount it
  // directly with @vue/test-utils, which is how creerArbreAsc/Desc/
  // creerMariage/findPersonne (all defined on `Arbre`, not on the root)
  // become testable.
  function mountArbre(personnes, selected) {
    localStorage.setItem('persons', JSON.stringify(personnes));
    const rootVm = loadScript('genereArbre.js', { fixtureId: 'arbre', url: `/infos?id=${selected}` });
    const ArbreDef = rootVm.$options.components.Arbre;
    return mount(ArbreDef, { propsData: { personnes, selected } });
  }

  test('findPersonne() matches via loose == across string/number id mismatches', () => {
    const wrapper = mountArbre(makeBasicFamily(), 0);

    expect(wrapper.vm.findPersonne('2')).toMatchObject({ id: 2 });
    expect(wrapper.vm.findPersonne(2)).toMatchObject({ id: 2 });
  });

  test('findPersonne() returns falsy (no throw) for a non-existent id', () => {
    const wrapper = mountArbre(makeBasicFamily(), 0);

    expect(() => wrapper.vm.findPersonne(999)).not.toThrow();
    expect(wrapper.vm.findPersonne(999)).toBeUndefined();
  });

  const noms = (wrapper, selecteur) => wrapper.findAll(`${selecteur} a`).wrappers.map((a) => a.text());

  // Grand-père paternel (0) -> père (1) ; grand-père maternel (2) -> mère (3) ; enfant (4) -> petit-enfant (5).
  function makeTwoSidedFamily() {
    return [
      { id: 0, nom: 'GrandPere', prenom: 'P', sexe: 'H', dateNaissance: null, dateMort: null, pere: null, mere: null, enfants: [1], mariages: [] },
      { id: 1, nom: 'Pere', prenom: 'P', sexe: 'H', dateNaissance: null, dateMort: null, pere: 0, mere: null, enfants: [4], mariages: [{ maryId: 3 }] },
      { id: 2, nom: 'GrandPere', prenom: 'M', sexe: 'H', dateNaissance: null, dateMort: null, pere: null, mere: null, enfants: [3], mariages: [] },
      { id: 3, nom: 'Mere', prenom: 'M', sexe: 'F', dateNaissance: null, dateMort: null, pere: 2, mere: null, enfants: [4], mariages: [{ maryId: 1 }] },
      { id: 4, nom: 'Enfant', prenom: 'E', sexe: 'H', dateNaissance: null, dateMort: null, pere: 1, mere: 3, enfants: [5], mariages: [] },
      { id: 5, nom: 'PetitEnfant', prenom: 'PE', sexe: 'H', dateNaissance: null, dateMort: null, pere: 4, mere: null, enfants: [], mariages: [] }
    ];
  }

  test('a single tree shows both the paternal and maternal ancestors, then the descendants', () => {
    const wrapper = mountArbre(makeTwoSidedFamily(), 4);

    expect(wrapper.findAll('.arbre-commun')).toHaveLength(1);
    // Père et sa lignée d'abord (à gauche), puis mère et sa lignée (à droite).
    expect(noms(wrapper, '.arbre-ancetres')).toEqual(['Pere P', 'GrandPere P', 'Mere M', 'GrandPere M']);
    expect(noms(wrapper, '.arbre-descendance')).toEqual(['Enfant E', 'PetitEnfant PE']);
  });

  test('the selected person appears only once', () => {
    const wrapper = mountArbre(makeTwoSidedFamily(), 4);

    const names = wrapper.findAll('a').wrappers.map((a) => a.text());
    expect(names.filter((n) => n === 'Enfant E')).toHaveLength(1);
  });

  test('father and mother are siblings under the same node (one shared ancestor tree)', () => {
    const wrapper = mountArbre(makeTwoSidedFamily(), 4);

    const parents = wrapper.findAll('.arbre-ancetres > li > ul > li > a').wrappers.map((a) => a.text());
    expect(parents).toEqual(['Pere P', 'Mere M']);
  });

  // Parents (0, 1) ; enfants communs 2, 3 (sélectionné), 4 ; demi-frère 5 (père seul) ; conjoint 6 de 3 ; enfant 7 de 3 ; enfant 8 de 2.
  function makeSiblingsFamily() {
    const p = (id, nom, sexe, pere, mere, enfants, mariages = []) =>
      ({ id, nom, prenom: 'X', sexe, dateNaissance: null, dateMort: null, pere, mere, enfants, mariages });
    return [
      p(0, 'Pere', 'H', null, null, [2, 3, 4, 5]),
      p(1, 'Mere', 'F', null, null, [2, 3, 4]),
      p(2, 'Aine', 'H', 0, 1, [8]),
      p(3, 'Moi', 'F', 0, 1, [7], [{ maryId: 6 }]),
      p(4, 'Cadet', 'H', 0, 1, []),
      p(5, 'DemiFrere', 'H', 0, null, []),
      p(6, 'Conjoint', 'H', null, null, [7], [{ maryId: 3 }]),
      p(7, 'MonEnfant', 'F', 6, 3, []),
      p(8, 'Neveu', 'H', 2, null, [])
    ];
  }

  test('siblings are shown next to the person, in birth order, under the parents', () => {
    const wrapper = mountArbre(makeSiblingsFamily(), 3);

    const fratrie = wrapper.findAll('.arbre-descendance > li > a:first-child').wrappers.map((a) => a.text());
    expect(fratrie).toEqual(['Aine X', 'Moi X', 'Cadet X']);
  });

  test("siblings are shown alone: no nephews, while the person's spouse and children are shown", () => {
    const wrapper = mountArbre(makeSiblingsFamily(), 3);

    const names = noms(wrapper, '.arbre-descendance');
    expect(names).toEqual(['Aine X', 'Moi X', 'Conjoint X', 'MonEnfant X', 'Cadet X']);
    expect(names).not.toContain('Neveu X');
  });

  test('a half-sibling is not drawn as a child of both parents', () => {
    const wrapper = mountArbre(makeSiblingsFamily(), 3);

    expect(noms(wrapper, '.arbre-descendance')).not.toContain('DemiFrere X');
  });

  test("with a single known parent, all of that parent's children are siblings", () => {
    const family = makeSiblingsFamily();
    family[5].mere = null;
    const wrapper = mountArbre(family, 5);

    const fratrie = wrapper.findAll('.arbre-descendance > li > a:first-child').wrappers.map((a) => a.text());
    expect(fratrie).toEqual(['Aine X', 'Moi X', 'Cadet X', 'DemiFrere X']);
  });

  test('walks up the full ancestor chain', () => {
    const wrapper = mountArbre(makeDeepAncestorChain(5), 0); // 0 (youngest) .. 4 (eldest)

    expect(noms(wrapper, '.arbre-ancetres')).toEqual(['Chain Gen1', 'Chain Gen2', 'Chain Gen3', 'Chain Gen4']);
    expect(noms(wrapper, '.arbre-descendance')).toEqual(['Chain Gen0']);
  });

  test('a mother alone is shown when pere is null (null >= 0 trap) or the -1 sentinel', () => {
    for (const pere of [null, -1]) {
      const persons = [
        { id: 0, nom: 'Mere', prenom: 'M', sexe: 'F', dateNaissance: null, dateMort: null, pere: -1, mere: -1, enfants: [1], mariages: [] },
        { id: 1, nom: 'Enfant', prenom: 'E', sexe: 'H', dateNaissance: null, dateMort: null, pere, mere: 0, enfants: [], mariages: [] }
      ];

      const wrapper = mountArbre(persons, 1);

      expect(noms(wrapper, '.arbre-ancetres')).toEqual(['Mere M']);
      expect(noms(wrapper, '.arbre-descendance')).toEqual(['Enfant E']);
    }
  });

  test('no ancestor part when no parent is known', () => {
    const wrapper = mountArbre(makeTwoSidedFamily(), 0);

    expect(wrapper.findAll('.arbre-ancetres')).toHaveLength(0);
    expect(noms(wrapper, '.arbre-descendance')).toEqual(['GrandPere P', 'Pere P', 'Mere M', 'Enfant E', 'PetitEnfant PE']);
  });

  test('cyclic parenthood data (A pere of B, B pere of A) renders without infinite recursion', () => {
    const persons = [
      { id: 0, nom: 'Cycle', prenom: 'A', sexe: 'H', dateNaissance: null, dateMort: null, pere: 1, mere: null, enfants: [1], mariages: [] },
      { id: 1, nom: 'Cycle', prenom: 'B', sexe: 'H', dateNaissance: null, dateMort: null, pere: 0, mere: null, enfants: [0], mariages: [] }
    ];

    const wrapper = mountArbre(persons, 0);

    expect(noms(wrapper, '.arbre-ancetres')).toEqual(['Cycle B']);
    expect(noms(wrapper, '.arbre-descendance')).toEqual(['Cycle A', 'Cycle B']);
  });

  test('the maternal line is still shown when the paternal line loops back (cycle)', () => {
    const persons = [
      { id: 0, nom: 'Enfant', prenom: 'A', sexe: 'H', dateNaissance: null, dateMort: null, pere: 1, mere: 2, enfants: [1], mariages: [] },
      { id: 1, nom: 'Cycle', prenom: 'B', sexe: 'H', dateNaissance: null, dateMort: null, pere: 0, mere: null, enfants: [0], mariages: [] },
      { id: 2, nom: 'Mere', prenom: 'M', sexe: 'F', dateNaissance: null, dateMort: null, pere: null, mere: null, enfants: [0], mariages: [] }
    ];

    const wrapper = mountArbre(persons, 0);

    expect(noms(wrapper, '.arbre-ancetres')).toEqual(['Cycle B', 'Mere M']);
  });

  test('renders an empty tree (no throw) for an unknown selected id', () => {
    const wrapper = mountArbre(makeBasicFamily(), 999);

    expect(wrapper.findAll('a')).toHaveLength(0);
  });

  test('a person listed among its own enfants is not rendered under itself', () => {
    const persons = [
      { id: 0, nom: 'Self', prenom: 'S', sexe: 'H', dateNaissance: null, dateMort: null, pere: null, mere: null, enfants: [0, 1], mariages: [] },
      { id: 1, nom: 'Child', prenom: 'C', sexe: 'H', dateNaissance: null, dateMort: null, pere: 0, mere: null, enfants: [], mariages: [] }
    ];

    const wrapper = mountArbre(persons, 0);

    const names = wrapper.findAll('a').wrappers.map((a) => a.text());
    expect(names).toEqual(['Self S', 'Child C']);
  });

  test('creerArbreDesc renders the full nested descendant chain in the right order', () => {
    const wrapper = mountArbre(makeDeepAncestorChain(5), 4); // 4 = l'aîné, sans parent connu

    const names = wrapper.findAll('a').wrappers.map((a) => a.text());
    expect(names).toEqual(['Chain Gen4', 'Chain Gen3', 'Chain Gen2', 'Chain Gen1', 'Chain Gen0']);
    expect(wrapper.findAll('li')).toHaveLength(5);
  });

  test('creerArbreDesc renders correctly nested <li>/<ul> for a person with multiple children', () => {
    const persons = [
      { id: 0, nom: 'Root', prenom: 'P', sexe: 'H', dateNaissance: null, dateMort: null, pere: null, mere: null, enfants: [1, 2], mariages: [] },
      { id: 1, nom: 'ChildA', prenom: 'P', sexe: 'H', dateNaissance: null, dateMort: null, pere: 0, mere: null, enfants: [3], mariages: [] },
      { id: 2, nom: 'ChildB', prenom: 'P', sexe: 'F', dateNaissance: null, dateMort: null, pere: 0, mere: null, enfants: [], mariages: [] },
      { id: 3, nom: 'GrandchildA1', prenom: 'P', sexe: 'H', dateNaissance: null, dateMort: null, pere: 1, mere: null, enfants: [], mariages: [] }
    ];

    const wrapper = mountArbre(persons, 0);

    const names = wrapper.findAll('a').wrappers.map((a) => a.text());
    expect(names).toEqual(['Root P', 'ChildA P', 'GrandchildA1 P', 'ChildB P']);
  });

  test('creerMariage renders one Personne node per marriage, spouse resolved via findPersonne', () => {
    const wrapper = mountArbre(makeBasicFamily(), 2); // person 2 married to person 3

    const names = wrapper.findAll('a').wrappers.map((a) => a.text());
    expect(names).toContain('Martin Claire');
  });
});
