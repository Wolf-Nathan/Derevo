const { loadScript } = require('../helpers/loadScript');
const { insertMaryInputs } = require('../helpers/domInputs');
const { snapshotGlobals, cleanupNewGlobals } = require('../helpers/globalLeakGuard');
const { makeBasicFamily } = require('../fixtures/persons.basic');

describe('addPerson.js', () => {
  let globalsBefore;

  beforeEach(() => {
    globalsBefore = snapshotGlobals();
    localStorage.clear();
  });

  afterEach(() => {
    cleanupNewGlobals(globalsBefore);
  });

  function getVm() {
    return loadScript('addPerson.js', { fixtureId: 'form' });
  }

  test('assigns id = persons.length and appends the new person at that index', () => {
    localStorage.setItem('persons', JSON.stringify(makeBasicFamily()));
    const vm = getVm();

    vm.nom = 'Nouveau';
    vm.prenom = 'Individu';
    vm.sexe = 'H';
    vm.addPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons).toHaveLength(6);
    expect(persons[5]).toMatchObject({ id: 5, nom: 'Nouveau', prenom: 'Individu', sexe: 'H' });
    expect(vm.id).toBe(5);
    expect(vm.done).toBe(true);
  });

  test('starts a fresh persons array at id 0 when localStorage has none', () => {
    const vm = getVm();

    vm.nom = 'Premier';
    vm.prenom = 'Individu';
    vm.sexe = 'F';
    vm.addPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons).toHaveLength(1);
    expect(persons[0].id).toBe(0);
  });

  test('setting pere and mere patches both parents\' enfants[]', () => {
    localStorage.setItem('persons', JSON.stringify(makeBasicFamily()));
    const vm = getVm();

    vm.nom = 'Nouveau';
    vm.prenom = 'Individu';
    vm.sexe = 'F';
    vm.pere = 2;
    vm.mere = 3;
    vm.addPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[2].enfants).toContain(5);
    expect(persons[3].enfants).toContain(5);
  });

  test('pre-selected enfants get pere set (not mere) when sexe is H', () => {
    localStorage.setItem('persons', JSON.stringify(makeBasicFamily()));
    const vm = getVm();

    vm.nom = 'Nouveau';
    vm.prenom = 'Individu';
    vm.sexe = 'H';
    vm.enfants = [4];
    vm.addPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].pere).toBe(5);
    expect(persons[4].mere).toBe(3);
  });

  test('pre-selected enfants get mere set (not pere) when sexe is F', () => {
    localStorage.setItem('persons', JSON.stringify(makeBasicFamily()));
    const vm = getVm();

    vm.nom = 'Nouveau';
    vm.prenom = 'Individu';
    vm.sexe = 'F';
    vm.enfants = [4];
    vm.addPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].mere).toBe(5);
    expect(persons[4].pere).toBe(2);
  });

  test('a pending marriage pushes the bidirectional counterpart onto the spouse record', () => {
    localStorage.setItem('persons', JSON.stringify(makeBasicFamily()));
    const vm = getVm();

    vm.nom = 'Nouveau';
    vm.prenom = 'Individu';
    vm.sexe = 'F';
    vm.mariages = [{ maryId: 4, mariageDate: '1 juin 2000', divorceDate: null }];
    vm.addPerson();

    const persons = JSON.parse(localStorage.getItem('persons'));
    expect(persons[4].mariages).toContainEqual({ maryId: 5, mariageDate: '1 juin 2000', divorceDate: null });
  });

  test('validMary() pushes a marriage when the DOM inputs are valid', () => {
    localStorage.setItem('persons', JSON.stringify(makeBasicFamily()));
    const vm = getVm();
    insertMaryInputs({ mary: '2', mariageDate: '12 mars 2000', divorceDate: '' });

    vm.validMary();

    // divorceDate ?? null only replaces null/undefined, not '' — an empty
    // input therefore stays '' rather than becoming null.
    expect(vm.mariages).toContainEqual({ maryId: '2', mariageDate: '12 mars 2000', divorceDate: '' });
    expect(vm.addMariage).toBe(false);
  });

  test('validMary() alerts and does not push when mariageDate is missing', () => {
    localStorage.setItem('persons', JSON.stringify(makeBasicFamily()));
    const vm = getVm();
    insertMaryInputs({ mary: '2', mariageDate: '', divorceDate: '' });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    vm.validMary();

    expect(alertSpy).toHaveBeenCalled();
    expect(vm.mariages).toHaveLength(0);
    alertSpy.mockRestore();
  });
});
