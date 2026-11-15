const { loadScript } = require('../helpers/loadScript');
const { snapshotGlobals, cleanupNewGlobals } = require('../helpers/globalLeakGuard');

function personne(id, nom, prenom, dateNaissance) {
  return { id, nom, prenom, sexe: 'H', dateNaissance, dateMort: null, pere: null, mere: null, enfants: [], mariages: [] };
}

// Ordre d'origine volontairement mélangé ; l'index 2 est une personne supprimée.
function makeListe() {
  return [
    personne(0, 'Martin', 'Zoé', '2 mars 1950'),
    personne(1, 'dupont', 'Émile', '10 janvier 1950'),
    { id: -1 },
    personne(3, 'Bernard', 'alice', null),
    personne(4, 'Écolier', 'Fabien', '1 janvier 1978'),
    personne(5, 'Dupont', 'Eric', '15 décembre 1949')
  ];
}

describe('listPersons.js', () => {
  let globalsBefore;

  beforeEach(() => {
    globalsBefore = snapshotGlobals();
    localStorage.clear();
  });

  afterEach(() => {
    delete global.FilterkeyWord_all_table;
    cleanupNewGlobals(globalsBefore);
  });

  function getVm(liste = makeListe()) {
    localStorage.setItem('persons', JSON.stringify(liste));
    return loadScript('listPersons.js', { fixtureId: 'table-id' });
  }

  const ids = (vm) => vm.personsAffichees.map((p) => p.id);

  describe('trier()', () => {
    test('cycles ascending, descending, then back to the initial state', () => {
      const vm = getVm();
      expect([vm.triPropriete, vm.triSens]).toEqual([null, null]);

      vm.trier('nom');
      expect([vm.triPropriete, vm.triSens]).toEqual(['nom', 'asc']);

      vm.trier('nom');
      expect([vm.triPropriete, vm.triSens]).toEqual(['nom', 'desc']);

      vm.trier('nom');
      expect([vm.triPropriete, vm.triSens]).toEqual([null, null]);
    });

    test('clicking another column restarts ascending on that column only', () => {
      const vm = getVm();
      vm.trier('nom');
      vm.trier('nom'); // nom desc

      vm.trier('prenom');

      expect([vm.triPropriete, vm.triSens]).toEqual(['prenom', 'asc']);
      expect(vm.ariaTri('prenom')).toBe('ascending');
      expect(vm.ariaTri('nom')).toBe('none');
    });

    test('ariaTri reflects the direction of the active column', () => {
      const vm = getVm();
      expect(vm.ariaTri('dateNaissance')).toBe('none');

      vm.trier('dateNaissance');
      expect(vm.ariaTri('dateNaissance')).toBe('ascending');

      vm.trier('dateNaissance');
      expect(vm.ariaTri('dateNaissance')).toBe('descending');
    });
  });

  describe('personsAffichees', () => {
    test('without sorting: original order, deleted persons (tombstones) excluded', () => {
      const vm = getVm();

      expect(ids(vm)).toEqual([0, 1, 3, 4, 5]);
    });

    test('is empty when nothing is stored', () => {
      const vm = loadScript('listPersons.js', { fixtureId: 'table-id' });

      expect(vm.persons).toBeNull();
      expect(vm.personsAffichees).toEqual([]);
    });

    test('sorts by nom ignoring case and accents, ties keep the original order', () => {
      const vm = getVm();

      vm.trier('nom');
      // Bernard, dupont (1), Dupont (5), Écolier, Martin
      expect(ids(vm)).toEqual([3, 1, 5, 4, 0]);

      vm.trier('nom');
      // Martin, Écolier, dupont (1), Dupont (5), Bernard : les ex æquo gardent l'ordre d'origine.
      expect(ids(vm)).toEqual([0, 4, 1, 5, 3]);
    });

    test('sorts by prenom ignoring case and accents', () => {
      const vm = getVm();

      vm.trier('prenom');
      // alice, Émile, Eric, Fabien, Zoé
      expect(ids(vm)).toEqual([3, 1, 5, 4, 0]);

      vm.trier('prenom');
      expect(ids(vm)).toEqual([0, 4, 5, 1, 3]);
    });

    test('sorts by dateNaissance chronologically, not alphabetically', () => {
      const vm = getVm();

      vm.trier('dateNaissance');

      // 15 déc. 1949, 10 janv. 1950, 2 mars 1950, 1 janv. 1978, puis sans date.
      expect(ids(vm)).toEqual([5, 1, 0, 4, 3]);
    });

    test('keeps persons without a birth date last in both directions', () => {
      const vm = getVm();

      vm.trier('dateNaissance');
      expect(ids(vm).pop()).toBe(3);

      vm.trier('dateNaissance');
      expect(ids(vm)).toEqual([4, 0, 1, 5, 3]);
    });

    test('third click restores the original order', () => {
      const vm = getVm();

      vm.trier('nom');
      vm.trier('nom');
      vm.trier('nom');

      expect(ids(vm)).toEqual([0, 1, 3, 4, 5]);
    });

    test('sorting never changes persons nor localStorage', () => {
      const vm = getVm();
      const avant = localStorage.getItem('persons');

      vm.trier('nom');
      vm.personsAffichees;
      vm.trier('nom');
      vm.personsAffichees;

      expect(vm.persons.map((p) => p.id)).toEqual([0, 1, -1, 3, 4, 5]);
      expect(localStorage.getItem('persons')).toBe(avant);
    });
  });

  describe('cleDate()', () => {
    test.each([
      ['2 mars 1950', 19500302],
      ['10 janvier 1950', 19500110],
      ['01 juin 1975', 19750601],
      ['1er août 2001', 20010801],
      ['31 Décembre 1999', 19991231],
      // Mois non reconnu : la date reste classée par année.
      ['2 blabla 1950', 19500002]
    ])('%s -> %i', (texte, attendu) => {
      const vm = getVm();

      expect(vm.cleDate(texte)).toBe(attendu);
    });

    test.each([
      ['a missing date', undefined],
      ['a null date', null],
      ['an empty date', ''],
      ['an ISO date', '1950-03-02'],
      ['free text', 'vers mars 1950 environ'],
      ['a number', 1950]
    ])('returns null for %s', (_label, valeur) => {
      const vm = getVm();

      expect(vm.cleDate(valeur)).toBeNull();
    });
  });

  describe('rafraichirPagination()', () => {
    test('re-applies the pagination once mounted and after each sort', async () => {
      global.FilterkeyWord_all_table = jest.fn();
      const vm = getVm();

      await vm.$nextTick();
      expect(global.FilterkeyWord_all_table).toHaveBeenCalledTimes(1);

      vm.trier('nom');
      await vm.$nextTick();
      expect(global.FilterkeyWord_all_table).toHaveBeenCalledTimes(2);
    });

    test('does nothing when pagination.js is not loaded', async () => {
      const vm = getVm();

      vm.trier('nom');
      await vm.$nextTick();

      expect(() => vm.rafraichirPagination()).not.toThrow();
    });
  });
});
