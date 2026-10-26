const { loadScript } = require('../helpers/loadScript');
const { insertMaryInputs } = require('../helpers/domInputs');
const { snapshotGlobals, cleanupNewGlobals } = require('../helpers/globalLeakGuard');
const { makeBasicFamily } = require('../fixtures/persons.basic');
const { makeSentinelFamily } = require('../fixtures/persons.sentinel');

describe('editPerson.js', () => {
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
    return loadScript('editPerson.js', { fixtureId: 'form', url: `/edit?id=${id}` });
  }

  test("moving to a new pere removes id from the old pere's enfants[] and adds it to the new one", () => {
    const vm = getVm(makeBasicFamily(), 4); // pere: 2, mere: 3

    vm.pere = 0;
    vm.editPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[2].enfants).not.toContain(4);
    expect(persons[0].enfants).toContain(4);
    expect(persons[4].pere).toBe(0);
  });

  test("moving to a new mere removes id from the old mere's enfants[] and adds it to the new one", () => {
    const vm = getVm(makeBasicFamily(), 4); // pere: 2, mere: 3

    vm.mere = 1;
    vm.editPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[3].enfants).not.toContain(4);
    expect(persons[1].enfants).toContain(4);
    expect(persons[4].mere).toBe(1);
  });

  test('a child removed from the new enfants set gets pere nulled on its own record (sexe H)', () => {
    const vm = getVm(makeBasicFamily(), 2); // sexe: H, enfants: [4]

    vm.enfants = [];
    vm.editPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].pere).toBeNull();
  });

  test('a newly added child gets mere set to personModif.id (sexe F)', () => {
    const vm = getVm(makeBasicFamily(), 3); // sexe: F, enfants: [4]

    vm.enfants = [4, 0];
    vm.editPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[0].mere).toBe(3);
  });

  test("adding a child who already had a pere removes it from the old pere's enfants[]", () => {
    const vm = getVm(makeBasicFamily(), 0); // sexe: H, enfants: [2]; 4 has pere 2

    vm.enfants = [2, 4];
    vm.editPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].pere).toBe(0);
    expect(persons[0].enfants).toEqual([2, 4]);
    expect(persons[2].enfants).not.toContain(4);
    expect(persons[3].enfants).toContain(4);
  });

  test("adding a child who already had a mere removes it from the old mere's enfants[]", () => {
    const vm = getVm(makeBasicFamily(), 1); // sexe: F, enfants: [2]; 4 has mere 3

    vm.enfants = [2, 4];
    vm.editPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].mere).toBe(1);
    expect(persons[3].enfants).not.toContain(4);
    expect(persons[2].enfants).toContain(4);
  });

  test('changing the sexe of a person who has children is refused and nothing is saved', () => {
    const vm = getVm(makeBasicFamily(), 2); // sexe: H, enfants: [4]
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    vm.sexe = 'F';
    vm.nom = 'Renamed';
    vm.editPerson();

    expect(alertSpy).toHaveBeenCalled();
    expect(vm.done).toBe(false);
    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[2].sexe).toBe('H');
    expect(persons[2].nom).toBe('Dupont');
    expect(persons[4].pere).toBe(2);
    expect(persons[4].mere).toBe(3);
    alertSpy.mockRestore();
  });

  test('changing the sexe while also removing every child is still refused (children must be removed first)', () => {
    const vm = getVm(makeBasicFamily(), 2); // sexe: H, enfants: [4]
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    vm.sexe = 'F';
    vm.enfants = [];
    vm.editPerson();

    expect(alertSpy).toHaveBeenCalled();
    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].pere).toBe(2);
    expect(persons[4].mere).toBe(3);
    alertSpy.mockRestore();
  });

  test('changing the sexe of a childless person is allowed', () => {
    const vm = getVm(makeBasicFamily(), 4); // sexe: H, enfants: []
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    vm.sexe = 'F';
    vm.editPerson();

    expect(alertSpy).not.toHaveBeenCalled();
    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].sexe).toBe('F');
    alertSpy.mockRestore();
  });

  describe('parenthood cycles are refused', () => {
    let alertSpy;
    beforeEach(() => {
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    });
    afterEach(() => {
      alertSpy.mockRestore();
    });

    test('choosing oneself as pere is refused', () => {
      const vm = getVm(makeBasicFamily(), 2);

      vm.pere = 2;
      vm.editPerson();

      expect(alertSpy).toHaveBeenCalled();
      expect(vm.done).toBe(false);
      expect(JSON.parse(localStorage.getItem('persons'))).toEqual(makeBasicFamily());
    });

    test('choosing oneself as enfant is refused', () => {
      const vm = getVm(makeBasicFamily(), 2);

      vm.enfants = [4, 2];
      vm.editPerson();

      expect(alertSpy).toHaveBeenCalled();
      expect(JSON.parse(localStorage.getItem('persons'))).toEqual(makeBasicFamily());
    });

    test('choosing a descendant as pere is refused', () => {
      const vm = getVm(makeBasicFamily(), 0); // 4 is a grandchild of 0

      vm.pere = 4;
      vm.editPerson();

      expect(alertSpy).toHaveBeenCalled();
      expect(JSON.parse(localStorage.getItem('persons'))).toEqual(makeBasicFamily());
    });

    test('choosing an ancestor as enfant is refused', () => {
      const vm = getVm(makeBasicFamily(), 4); // 0 is a grandparent of 4

      vm.enfants = [0];
      vm.editPerson();

      expect(alertSpy).toHaveBeenCalled();
      expect(JSON.parse(localStorage.getItem('persons'))).toEqual(makeBasicFamily());
    });

    test('a non-cyclic edit is still accepted', () => {
      const vm = getVm(makeBasicFamily(), 3); // F, enfants: [4]

      vm.enfants = [4, 0];
      vm.editPerson();

      expect(alertSpy).not.toHaveBeenCalled();
      expect(vm.done).toBe(true);
    });
  });

  test('mutates the leaked global personModif (regression guard for the "personDel not set as global value" bug class)', () => {
    const vm = getVm(makeBasicFamily(), 2);

    expect(global.personModif).toBeDefined();
    expect(global.personModif.id).toBe(2);

    vm.nom = 'Renamed';
    vm.editPerson();

    expect(global.personModif.nom).toBe('Renamed');
    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[2].nom).toBe('Renamed');
  });

  test('validMary() bidirectional push updates both this.mariages and the spouse record', () => {
    const vm = getVm(makeBasicFamily(), 4);
    insertMaryInputs({ mary: '0', mariageDate: '5 mai 2005', divorceDate: '' });

    vm.validMary();

    expect(vm.mariages).toContainEqual({ maryId: 0, mariageDate: '5 mai 2005', divorceDate: '' });
    expect(vm.persons[0].mariages).toContainEqual({ maryId: 4, mariageDate: '5 mai 2005', divorceDate: '' });
  });

  test('validMary() + editPerson() persists maryId as a number on both sides', () => {
    const vm = getVm(makeBasicFamily(), 4);
    insertMaryInputs({ mary: '0', mariageDate: '5 mai 2005', divorceDate: '' });

    vm.validMary();
    vm.editPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].mariages[0].maryId).toBe(0);
    expect(persons[0].mariages[0].maryId).toBe(4);
  });

  test('validMary() alerts and does not push when mariageDate is missing', () => {
    const vm = getVm(makeBasicFamily(), 4);
    insertMaryInputs({ mary: '0', mariageDate: '', divorceDate: '' });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    vm.validMary();

    expect(alertSpy).toHaveBeenCalled();
    expect(vm.mariages).toHaveLength(0);
    alertSpy.mockRestore();
  });

  // Documents actual (broken) behavior rather than fixing it: editPerson()'s
  // old-parent removal only guards with `!== null`, so a `pere === -1`
  // (the sentinel used elsewhere for "no parent") reaches
  // `this.persons[-1].enfants` and throws. In practice this looks
  // unreachable via the real UI — addPerson.js/editPerson.js/deletePerson.js
  // only ever write `null` for pere/mere, never `-1` (that sentinel is only
  // ever used for `personDel`'s own tombstoned `id`) — but it's flagged
  // here since other files (infos.js, genereArbre.js) do guard with `>= 0`,
  // implying `-1` was expected to be a live possibility at some point.
  test('editing a person whose old pere is -1 throws (sentinel-inconsistency edge case, not fixed here)', () => {
    const vm = getVm(makeSentinelFamily(), 1); // pere: -1, mere: -1

    vm.pere = 0;

    expect(() => vm.editPerson()).toThrow();
  });
});
