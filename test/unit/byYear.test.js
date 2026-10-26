const { loadScript } = require('../helpers/loadScript');
const { snapshotGlobals, cleanupNewGlobals } = require('../helpers/globalLeakGuard');
const { makeByYearFixture } = require('../fixtures/persons.byYear');

describe('byYear.js', () => {
  let globalsBefore;

  beforeEach(() => {
    globalsBefore = snapshotGlobals();
    localStorage.clear();
  });

  afterEach(() => {
    cleanupNewGlobals(globalsBefore);
  });

  function getVm(family) {
    localStorage.setItem('persons', JSON.stringify(family));
    return loadScript('byYear.js', { fixtureId: 'yearForm' });
  }

  test('both dates known, year in range: included', () => {
    const vm = getVm(makeByYearFixture()); // BothKnown: 1950-2000
    vm.year = 1975;

    vm.searchByYear();

    expect(vm.alivePersons.map((p) => p.nom)).toContain('BothKnown');
  });

  test('both dates known, year out of range: excluded', () => {
    const vm = getVm(makeByYearFixture());
    vm.year = 1940;

    vm.searchByYear();

    expect(vm.alivePersons.map((p) => p.nom)).not.toContain('BothKnown');
  });

  test('only dateNaissance known, year within the assumed 100-year window: included', () => {
    const vm = getVm(makeByYearFixture()); // BirthOnly: born 1960
    vm.year = 2000; // within [1960, 1960+100)

    vm.searchByYear();

    expect(vm.alivePersons.map((p) => p.nom)).toContain('BirthOnly');
  });

  // Regression test for a real bug: the original code used two independent
  // `if` statements instead of `if / else if / else`, so after handling the
  // "birth unknown" branch it also fell into the "both dates known" `else`
  // branch and called `.split()` on a `null` dateNaissance. This is a
  // realistic genealogy case (death date on record, birth date lost) — see
  // the fix in dev/js/byYear.js (chained into `else if`).
  test('only dateMort known, year within the assumed 100-year window: included, does not throw', () => {
    const vm = getVm(makeByYearFixture()); // DeathOnly: died 1980
    vm.year = 1950; // within [1980-100, 1980]

    expect(() => vm.searchByYear()).not.toThrow();
    expect(vm.alivePersons.map((p) => p.nom)).toContain('DeathOnly');
  });

  test('only dateMort known, year outside the assumed 100-year window: excluded', () => {
    const vm = getVm(makeByYearFixture()); // DeathOnly: died 1980
    vm.year = 1500;

    vm.searchByYear();

    expect(vm.alivePersons.map((p) => p.nom)).not.toContain('DeathOnly');
  });

  test('boundary: year exactly equal to the birth year is included', () => {
    const vm = getVm(makeByYearFixture()); // BirthOnly: born 1960
    vm.year = 1960;

    vm.searchByYear();

    expect(vm.alivePersons.map((p) => p.nom)).toContain('BirthOnly');
  });

  test('boundary: year exactly equal to the death year is included', () => {
    const vm = getVm(makeByYearFixture()); // BothKnown: 1950-2000
    vm.year = 2000;

    vm.searchByYear();

    expect(vm.alivePersons.map((p) => p.nom)).toContain('BothKnown');
  });

  // The real <input> yields a string: `year + 100` used to concatenate
  // ("1950100") and turn comparisons lexicographic.
  test('year given as a string (as typed in the input): death-only window still works', () => {
    const vm = getVm(makeByYearFixture()); // DeathOnly: died 1980
    vm.year = '1950';

    vm.searchByYear();

    expect(vm.alivePersons.map((p) => p.nom)).toContain('DeathOnly');
  });

  test('year given as a string: birth-only and both-dates branches still work', () => {
    const vm = getVm(makeByYearFixture());
    vm.year = '1975';

    vm.searchByYear();

    expect(vm.alivePersons.map((p) => p.nom)).toEqual(['BothKnown', 'BirthOnly', 'DeathOnly']);
  });

  test('year given as a string: out-of-range death-only person is excluded', () => {
    const vm = getVm(makeByYearFixture()); // DeathOnly: died 1980
    vm.year = '800';

    vm.searchByYear();

    expect(vm.alivePersons).toEqual([]);
  });

  test('a non-numeric year yields no results and does not throw', () => {
    const vm = getVm(makeByYearFixture());
    vm.year = 'abc';

    expect(() => vm.searchByYear()).not.toThrow();
    expect(vm.alivePersons).toEqual([]);
  });

  test('a deleted person (tombstone {id: -1}) is skipped without throwing', () => {
    const family = makeByYearFixture();
    family.push({ id: -1 });
    family.splice(1, 0, { id: -1 });
    const vm = getVm(family);
    vm.year = 1975;

    expect(() => vm.searchByYear()).not.toThrow();
    expect(vm.alivePersons.map((p) => p.nom)).toEqual(['BothKnown', 'BirthOnly', 'DeathOnly']);
  });

  test('a person whose dates are undefined (missing keys) never matches and does not throw', () => {
    const vm = getVm([{ id: 0, nom: 'Partial', prenom: 'P', sexe: 'H', pere: null, mere: null, enfants: [], mariages: [] }]);
    vm.year = 1975;

    expect(() => vm.searchByYear()).not.toThrow();
    expect(vm.alivePersons).toEqual([]);
  });

  test('a person with no dates at all never matches any search', () => {
    const vm = getVm(makeByYearFixture());
    vm.year = 1975;

    vm.searchByYear();

    expect(vm.alivePersons.map((p) => p.nom)).not.toContain('NoDates');
  });
});
