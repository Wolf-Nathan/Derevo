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

  test('a person with no dates at all never matches any search', () => {
    const vm = getVm(makeByYearFixture());
    vm.year = 1975;

    vm.searchByYear();

    expect(vm.alivePersons.map((p) => p.nom)).not.toContain('NoDates');
  });
});
