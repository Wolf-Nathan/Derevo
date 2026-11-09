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
      family[1] = { id: -1 };
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
      ['an empty maryId', (f) => { f[2].mariages[0].maryId = ''; return f; }]
    ])('rejects %s', (_label, alter) => {
      const vm = getVm();

      expect(vm.validerArbre(alter(makeBasicFamily()))).toEqual(expect.any(String));
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
