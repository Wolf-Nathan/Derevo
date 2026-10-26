const { loadScript } = require('../helpers/loadScript');
const { suppressNavigation } = require('../helpers/locationStub');
const { snapshotGlobals, cleanupNewGlobals } = require('../helpers/globalLeakGuard');
const { makeBasicFamily } = require('../fixtures/persons.basic');

describe('deletePerson.js', () => {
  let globalsBefore;
  let nav;

  beforeEach(() => {
    globalsBefore = snapshotGlobals();
    localStorage.clear();
    // deleteYes() ends with `location.href = '/'`; jsdom can't be made to
    // actually navigate (or even record the href), it just logs a
    // "not implemented" error via console.error — suppress that noise for
    // every test in this file since every test calls deleteYes().
    nav = suppressNavigation();
  });

  afterEach(() => {
    nav.restore();
    cleanupNewGlobals(globalsBefore);
  });

  function getVm(family, id) {
    localStorage.setItem('persons', JSON.stringify(family));
    return loadScript('deletePerson.js', { fixtureId: 'deleteDiv', url: `/delete?id=${id}` });
  }

  test("deleteYes() removes the deleted id from the old pere's and mere's enfants[]", () => {
    const vm = getVm(makeBasicFamily(), 2); // pere: 0, mere: 1

    vm.deleteYes();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[0].enfants).not.toContain(2);
    expect(persons[1].enfants).not.toContain(2);
  });

  test('orphans children by nulling pere when personDel.sexe is H', () => {
    const vm = getVm(makeBasicFamily(), 2); // sexe: H, enfants: [4]

    vm.deleteYes();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].pere).toBeNull();
    expect(persons[4].mere).toBe(3);
  });

  test('orphans children by nulling mere when personDel.sexe is F', () => {
    const vm = getVm(makeBasicFamily(), 3); // sexe: F, enfants: [4]

    vm.deleteYes();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].mere).toBeNull();
    expect(persons[4].pere).toBe(2);
  });

  test("filters the deleted person out of every spouse's mariages[]", () => {
    const vm = getVm(makeBasicFamily(), 2); // married to 3

    vm.deleteYes();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[3].mariages).not.toContainEqual(expect.objectContaining({ maryId: 2 }));
  });

  test("filters legacy string maryId entries out of the spouse's mariages[] (no phantom marriage)", () => {
    const family = makeBasicFamily();
    family[3].mariages = [{ maryId: '2', mariageDate: '1 juin 1975', divorceDate: null }];
    const vm = getVm(family, 2);

    vm.deleteYes();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[3].mariages).toEqual([]);
  });

  test('a marriage stored with a string maryId on the deleted side still cleans up the spouse', () => {
    const family = makeBasicFamily();
    family[2].mariages = [{ maryId: '3', mariageDate: '1 juin 1975', divorceDate: null }];
    const vm = getVm(family, 2);

    vm.deleteYes();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[3].mariages).toEqual([]);
  });

  test('deleting a person whose spouse is already a tombstone does not throw', () => {
    const family = makeBasicFamily();
    family[3] = { id: -1 }; // spouse of 2 already deleted, phantom marriage left on 2
    family[4].mere = null;
    const vm = getVm(family, 2);

    expect(() => vm.deleteYes()).not.toThrow();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[2]).toEqual({ id: -1 });
    expect(persons[3]).toEqual({ id: -1 });
    expect(persons[-1]).toBeUndefined();
  });

  test('soft-deletes: persons[id] becomes exactly {id: -1}, array length and other indices stable', () => {
    const vm = getVm(makeBasicFamily(), 2);

    vm.deleteYes();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons).toHaveLength(5);
    expect(persons[2]).toEqual({ id: -1 });
    expect(persons[0].id).toBe(0);
    expect(persons[4].id).toBe(4);
  });

  test('attempts to redirect after deleting', () => {
    const vm = getVm(makeBasicFamily(), 2);

    vm.deleteYes();

    // jsdom can't perform or record the real navigation, but it does log
    // a "not implemented" error for it, which we can use as a proxy signal
    // that deleteYes() reached its `location.href = '/'` redirect line.
    expect(nav.errorSpy).toHaveBeenCalled();
  });
});
