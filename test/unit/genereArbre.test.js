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

  test('creerArbreAsc walks up to the true eldest ancestor before rendering descendants', () => {
    const wrapper = mountArbre(makeDeepAncestorChain(5), 0); // 0 (youngest) .. 4 (eldest)

    const topLevelLink = wrapper.find('li > a');
    expect(topLevelLink.text()).toBe('Chain Gen4');
  });

  test('creerArbreDesc renders the full nested descendant chain in the right order', () => {
    const wrapper = mountArbre(makeDeepAncestorChain(5), 0);

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
