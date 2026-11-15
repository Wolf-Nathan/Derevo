const { loadScript } = require('../helpers/loadScript');
const { suppressNavigation } = require('../helpers/locationStub');
const { snapshotGlobals, cleanupNewGlobals } = require('../helpers/globalLeakGuard');
const { makeBasicFamily } = require('../fixtures/persons.basic');

describe('importExport.js', () => {
  let globalsBefore;
  let nav;
  let alertSpy;
  let confirmSpy;

  beforeEach(() => {
    globalsBefore = snapshotGlobals();
    localStorage.clear();
    // importerTexte() se termine par `location.href = '/'` : jsdom ne navigue pas et logue une erreur.
    nav = suppressNavigation();
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    alertSpy.mockRestore();
    confirmSpy.mockRestore();
    nav.restore();
    cleanupNewGlobals(globalsBefore);
  });

  function getVm(family) {
    if (family) {
      localStorage.setItem('persons', JSON.stringify(family));
    }
    return loadScript('importExport.js', { fixtureId: 'navbar' });
  }

  const stored = () => JSON.parse(localStorage.getItem('persons'));

  // jsdom n'implémente pas Blob.text().
  const lireBlob = (blob) => new Promise((resolve) => {
    const lecteur = new FileReader();
    lecteur.onload = () => resolve(lecteur.result);
    lecteur.readAsText(blob);
  });

  describe('exporter()', () => {
    let createObjectURL;
    let revokeObjectURL;
    let clickSpy;
    let blobs;
    let downloads;

    beforeEach(() => {
      blobs = [];
      downloads = [];
      // jsdom n'implémente pas URL.createObjectURL.
      createObjectURL = URL.createObjectURL;
      revokeObjectURL = URL.revokeObjectURL;
      URL.createObjectURL = jest.fn((blob) => {
        blobs.push(blob);
        return 'blob:derevo';
      });
      URL.revokeObjectURL = jest.fn();
      clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
        downloads.push({ href: this.href, download: this.download });
      });
    });

    afterEach(() => {
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;
      clickSpy.mockRestore();
    });

    test('downloads the stored tree as a dated JSON file', async () => {
      const vm = getVm(makeBasicFamily());

      vm.exporter();

      expect(downloads).toHaveLength(1);
      expect(downloads[0].download).toMatch(/^derevo-arbre-\d{4}-\d{2}-\d{2}\.json$/);
      expect(blobs[0].type).toBe('application/json');
      expect(JSON.parse(await lireBlob(blobs[0]))).toEqual(makeBasicFamily());
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:derevo');
    });

    test('alerts and downloads nothing when there is no tree', () => {
      const vm = getVm();

      vm.exporter();

      expect(alertSpy).toHaveBeenCalled();
      expect(downloads).toHaveLength(0);
    });

    test('nomFichierExport pads month and day', () => {
      const vm = getVm();

      expect(vm.nomFichierExport(new Date(2026, 0, 5))).toBe('derevo-arbre-2026-01-05.json');
    });
  });

  describe('validerArbre()', () => {
    test('accepts a consistent tree', () => {
      const vm = getVm();

      expect(vm.validerArbre(makeBasicFamily())).toBeNull();
    });

    test('accepts an empty tree, deleted persons (tombstones) and the -1 "no parent" value', () => {
      const vm = getVm();
      const family = makeBasicFamily();
      // Comme après une vraie suppression : la tombe n'est plus référencée par personne.
      family[1] = { id: -1 };
      family[2].mere = null;
      family[0].pere = -1;

      expect(vm.validerArbre([])).toBeNull();
      expect(vm.validerArbre(family)).toBeNull();
    });

    test.each([
      ['not a list', () => ({ persons: [] })],
      ['an entry that is not an object', () => [null]],
      ['an id different from its position', (f) => { f[2].id = 7; return f; }],
      ['a missing nom', (f) => { delete f[0].nom; return f; }],
      ['an invalid sexe', (f) => { f[0].sexe = 'X'; return f; }],
      ['a pere out of range', (f) => { f[4].pere = 42; return f; }],
      ['a mere that is not an integer', (f) => { f[4].mere = '3'; return f; }],
      ['enfants that is not a list', (f) => { f[0].enfants = 2; return f; }],
      ['an enfant out of range', (f) => { f[0].enfants.push(99); return f; }],
      ['mariages that is not a list', (f) => { f[2].mariages = null; return f; }],
      ['a maryId out of range', (f) => { f[2].mariages[0].maryId = 99; return f; }],
      ['an empty maryId', (f) => { f[2].mariages[0].maryId = ''; return f; }],
      // Liens vers une personne supprimée (tombe {id: -1}) : l'index existe mais ne désigne plus personne.
      ['a pere pointing at a tombstone', (f) => { f[0] = { id: -1 }; return f; }],
      ['a mere pointing at a tombstone', (f) => { f[1] = { id: -1 }; return f; }],
      ['an enfant pointing at a tombstone', (f) => { f[4] = { id: -1 }; f[3].enfants = []; return f; }],
      ['a maryId pointing at a tombstone', (f) => { f[3] = { id: -1 }; f[4].mere = null; return f; }],
      // Dates inconvertibles : byYear.js fait .split(" ")[2] dessus.
      ['a numeric dateNaissance', (f) => { f[0].dateNaissance = 1950; return f; }],
      ['a slash-formatted dateMort', (f) => { f[0].dateMort = '03/02/1990'; return f; }],
      ['an impossible ISO dateNaissance', (f) => { f[0].dateNaissance = '1950-02-31'; return f; }],
      ['an unreadable mariageDate', (f) => { f[2].mariages[0].mariageDate = 'été 1975'; return f; }],
      ['a divorceDate that is not a string', (f) => { f[2].mariages[0].divorceDate = { annee: 1980 }; return f; }]
    ])('rejects %s', (_label, alter) => {
      const vm = getVm();

      expect(vm.validerArbre(alter(makeBasicFamily()))).toEqual(expect.any(String));
    });

    test('accepts ISO dates and missing dates', () => {
      const vm = getVm();
      const family = makeBasicFamily();
      family[0].dateNaissance = '1920-01-01';
      family[0].dateMort = '1990-01-01T12:00:00.000Z';
      delete family[1].dateNaissance;
      family[2].mariages[0].divorceDate = '';

      expect(vm.validerArbre(family)).toBeNull();
    });
  });

  describe('normaliserDate()', () => {
    test.each([
      ['a missing date', undefined, null],
      ['a null date', null, null],
      ['an empty date', '', null],
      ['a date already in the app format', '1 janvier 1950', '1 janvier 1950'],
      ['a zero-padded datepicker date', '01 juin 1975', '01 juin 1975'],
      ['an ISO date', '1950-03-02', '2 mars 1950'],
      // Minuit UTC tomberait la veille à l'ouest de Greenwich : les composantes sont lues telles quelles.
      ['an ISO date on the 1st of the month', '1950-03-01', '1 mars 1950'],
      // Horodatage construit en heure locale : le test ne dépend pas du fuseau de la machine.
      ['an ISO timestamp', new Date(1950, 2, 2).toISOString(), '2 mars 1950']
    ])('converts %s', (_label, valeur, attendu) => {
      const vm = getVm();

      expect(vm.normaliserDate(valeur)).toBe(attendu);
    });

    test.each([
      ['a number', 1950],
      ['a slash-formatted date', '03/02/1950'],
      ['an impossible date', '1950-02-31'],
      ['an invalid timestamp', '1950-13-45Tnope'],
      ['free text', 'vers 1950'],
      ['an object', { annee: 1950 }]
    ])('refuses %s', (_label, valeur) => {
      const vm = getVm();

      expect(vm.normaliserDate(valeur)).toBeUndefined();
    });
  });

  describe('importerTexte()', () => {
    test('invalid JSON: alerts and leaves the stored tree untouched', () => {
      const vm = getVm(makeBasicFamily());

      expect(vm.importerTexte('{ pas du json')).toBe(false);

      expect(alertSpy).toHaveBeenCalled();
      expect(stored()).toEqual(makeBasicFamily());
    });

    test('invalid tree: alerts with the reason and leaves the stored tree untouched', () => {
      const vm = getVm(makeBasicFamily());

      expect(vm.importerTexte(JSON.stringify([{ id: 3, nom: 'A', prenom: 'B', sexe: 'H', enfants: [], mariages: [] }]))).toBe(false);

      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('position'));
      expect(stored()).toEqual(makeBasicFamily());
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    test('replaces the stored tree after confirmation', () => {
      const vm = getVm(makeBasicFamily());
      const nouvelArbre = makeBasicFamily().slice(0, 2);
      nouvelArbre[0].enfants = [];
      nouvelArbre[1].enfants = [];

      expect(vm.importerTexte(JSON.stringify(nouvelArbre))).toBe(true);

      expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('5 personne(s)'));
      expect(stored()).toEqual(nouvelArbre);
    });

    test('keeps the stored tree when the user cancels', () => {
      confirmSpy.mockImplementation(() => false);
      const vm = getVm(makeBasicFamily());

      expect(vm.importerTexte('[]')).toBe(false);

      expect(stored()).toEqual(makeBasicFamily());
    });

    test('does not ask for confirmation when there is no existing tree', () => {
      const vm = getVm();

      expect(vm.importerTexte(JSON.stringify(makeBasicFamily()))).toBe(true);

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(stored()).toEqual(makeBasicFamily());
    });

    test('converts legacy string maryId values to numbers', () => {
      const vm = getVm();
      const family = makeBasicFamily();
      family[2].mariages[0].maryId = '3';
      family[3].mariages[0].maryId = '2';

      vm.importerTexte(JSON.stringify(family));

      expect(stored()[2].mariages[0].maryId).toBe(3);
      expect(stored()[3].mariages[0].maryId).toBe(2);
    });

    test('stores a missing or -1 pere/mere as null and keeps real parents', () => {
      const vm = getVm();
      const family = makeBasicFamily();
      family[0].pere = -1;
      delete family[0].mere;
      delete family[1].pere;
      family[1].mere = -1;

      expect(vm.importerTexte(JSON.stringify(family))).toBe(true);

      expect(stored()[0].pere).toBeNull();
      expect(stored()[0].mere).toBeNull();
      expect(stored()[1].pere).toBeNull();
      expect(stored()[1].mere).toBeNull();
      expect(stored()[2].pere).toBe(0);
      expect(stored()[2].mere).toBe(1);
    });

    test('rewrites imported dates to the app format', () => {
      const vm = getVm();
      const family = makeBasicFamily();
      family[0].dateNaissance = '1920-01-01';
      // Horodatage construit en heure locale : le test ne dépend pas du fuseau de la machine.
      family[0].dateMort = new Date(1990, 0, 1).toISOString();
      delete family[1].dateMort;
      family[2].mariages[0].mariageDate = '1975-06-01';
      family[2].mariages[0].divorceDate = '';

      expect(vm.importerTexte(JSON.stringify(family))).toBe(true);

      expect(stored()[0].dateNaissance).toBe('1 janvier 1920');
      expect(stored()[0].dateMort).toBe('1 janvier 1990');
      expect(stored()[1].dateMort).toBeNull();
      expect(stored()[2].mariages[0]).toEqual({ maryId: 3, mariageDate: '1 juin 1975', divorceDate: null });
      // Les dates déjà au bon format ne bougent pas.
      expect(stored()[4].dateNaissance).toBe('1 janvier 1978');
    });

    test('imports a tree containing a tombstone without touching it', () => {
      const vm = getVm();
      const family = makeBasicFamily();
      family[4] = { id: -1 };
      family[2].enfants = [];
      family[3].enfants = [];

      expect(vm.importerTexte(JSON.stringify(family))).toBe(true);

      expect(stored()[4]).toEqual({ id: -1 });
    });

    test('unreadable date: alerts and leaves the stored tree untouched', () => {
      const vm = getVm(makeBasicFamily());
      const family = makeBasicFamily();
      family[0].dateNaissance = 1920;

      expect(vm.importerTexte(JSON.stringify(family))).toBe(false);

      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('date'));
      expect(stored()).toEqual(makeBasicFamily());
    });
  });

  test('lireFichier() imports the chosen file and resets the input', async () => {
    const vm = getVm();
    const input = document.createElement('input');
    input.type = 'file';
    const fichier = new File([JSON.stringify(makeBasicFamily())], 'arbre.json', { type: 'application/json' });
    Object.defineProperty(input, 'files', { value: [fichier] });

    await vm.lireFichier({ target: input });

    expect(stored()).toEqual(makeBasicFamily());
    expect(input.value).toBe('');
  });
});
