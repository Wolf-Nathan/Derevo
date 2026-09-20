const { loadScript } = require('../helpers/loadScript');
const { snapshotGlobals, cleanupNewGlobals } = require('../helpers/globalLeakGuard');
const { makeDeepAncestorChain } = require('../fixtures/persons.deep');

describe('infos.js', () => {
  let globalsBefore;

  beforeEach(() => {
    globalsBefore = snapshotGlobals();
    localStorage.clear();
  });

  afterEach(() => {
    cleanupNewGlobals(globalsBefore);
  });

  function getVm(family, id) {
    localStorage.setItem('persons', JSON.stringify(family));
    return loadScript('infos.js', { fixtureId: 'infos', url: `/infos?id=${id}` });
  }

  test('findAncestors(), driven from mounted(), walks the full ancestor chain in order', () => {
    const vm = getVm(makeDeepAncestorChain(5), 0); // 0 -> 1 -> 2 -> 3 -> 4 (eldest, pere: null)

    expect(vm.ancetres.map((a) => `${a.nom} ${a.prenom}`)).toEqual([
      'Chain Gen1',
      'Chain Gen2',
      'Chain Gen3',
      'Chain Gen4'
    ]);
    expect(vm.ancetres[0].link).toBe('/infos?id=1');
  });

  // The eldest ancestor's own pere/mere are `null` — findAncestors() guards
  // with `person.pere >= 0` (true for null, since null coerces to 0), but
  // `this.persons[null]` is simply `undefined`, and the inner `if (pere)`
  // check stops the recursion cleanly. No crash, contrary to what the
  // `>= 0` guard alone might suggest.
  test('findAncestors() no-ops safely when pere/mere are null', () => {
    const vm = getVm(makeDeepAncestorChain(5), 0);
    vm.ancetres = [];

    expect(() => vm.findAncestors({ pere: null, mere: null, enfants: [] })).not.toThrow();
    expect(vm.ancetres).toEqual([]);
  });

  // Same reasoning applies to the `-1` sentinel used elsewhere in the
  // codebase for "no parent" — `this.persons[-1]` is also `undefined`.
  test('findAncestors() no-ops safely when pere/mere are the -1 sentinel', () => {
    const vm = getVm(makeDeepAncestorChain(5), 0);
    vm.ancetres = [];

    expect(() => vm.findAncestors({ pere: -1, mere: -1, enfants: [] })).not.toThrow();
    expect(vm.ancetres).toEqual([]);
  });

  test('findDescendants(), driven from mounted(), walks the full descendant chain in order', () => {
    const vm = getVm(makeDeepAncestorChain(5), 4); // eldest -> descendants 3,2,1,0

    expect(vm.descendants.map((d) => d.prenom)).toEqual(['Gen3', 'Gen2', 'Gen1', 'Gen0']);
  });

  test('findDescendants() leaves descendants unchanged for a childless person', () => {
    const vm = getVm(makeDeepAncestorChain(5), 0); // youngest, enfants: []

    expect(vm.descendants).toEqual([]);
  });

  test('mounted() sets the leaked global personInfo', () => {
    const vm = getVm(makeDeepAncestorChain(5), 0);

    expect(global.personInfo).toBeDefined();
    expect(global.personInfo.id).toBe(0);
  });
});
