AOS.init();

let formModele = new Vue({
    el: "#form",
    data: {
        fr: vdp_translation_fr.js,
        done: false,
        goodId : true,
        persons: null,
        personModif: { nom: "Nom" },
        nom: null,
        prenom: null,
        sexe: null,
        dateNaissance: null,
        dateMort: null,
        pere: null,
        mere: null,
        enfants: [],
        mariages: [],
        addMariage: false,
        id : 0
    },
    components: {
        vuejsDatepicker
    },
    mounted() {
        if (localStorage.getItem('persons')) {
            try {
                this.persons = JSON.parse(localStorage.getItem('persons'));
                const urlParams = new URLSearchParams(window.location.search);
                personModif = this.persons[urlParams.get('id')];
                if (personModif && personModif.id >= 0) {
                    this.id = personModif.id;
                    this.nom = personModif.nom;
                    this.prenom = personModif.prenom;
                    this.sexe = personModif.sexe;
                    this.dateNaissance = personModif.dateNaissance ?? null;
                    this.dateMort = personModif.dateMort ?? null;
                    this.pere = personModif.pere ?? null;
                    this.mere = personModif.mere ?? null;
                    this.enfants = personModif.enfants ?? [];
                    this.mariages = personModif.mariages;
                }
                else {
                    this.goodId = false;
                }
            } catch(e) {
                localStorage.removeItem('persons');
            }
        }
        else {
            this.goodId = false;
        }
    },
    methods: {
        show: function() {
            this.mary = null;
            this.dateMariage = null;
            this.dateDivorce = null;
            this.addMariage = true;
        },
        cancelMary: function() {
            this.addMariage = false;
        },
        validMary: function() {
            this.mariageNumber++;
            var maryValue = document.getElementById("mary").value;
            var mariageDate = document.getElementById("mariageDate").value;
            var divorceDate = document.getElementById("divorceDate").value;

            if (maryValue && mariageDate) {
                // La valeur d'un <select> est une chaîne : on stocke l'id sous forme numérique.
                var maryId = Number(maryValue);
                this.addMariage = false;
                this.mariages.push({
                    "maryId": maryId,
                    "mariageDate": mariageDate,
                    "divorceDate": divorceDate ?? null
                });
                // On ajoute également le mariage au second individu
                this.persons[maryId].mariages.push({
                    "maryId": personModif.id,
                    "mariageDate": mariageDate,
                    "divorceDate": divorceDate ?? null
                });
            } else {
                alert("Merci d'indiquer une date de mariage !");
            }
        },
        removeSelectChilds : function () {
            this.enfants = [];
        },
        // Renvoie true si les parents/enfants sélectionnés créent un cycle de parenté :
        // un parent qui serait aussi un descendant d'un des enfants choisis
        // (ou un enfant qui serait un ancêtre d'un des parents choisis).
        creeUnCycle: function (selfId, pere, mere, enfants) {
            var parents = [pere, mere].filter(p => p !== null && p !== undefined);
            if (selfId !== null && parents.indexOf(selfId) !== -1) {
                return true;
            }
            // Parcours itératif des descendants des enfants sélectionnés, avec ensemble de visités.
            var visites = new Set();
            var aVisiter = (enfants || []).slice();
            while (aVisiter.length > 0) {
                var id = aVisiter.pop();
                if (visites.has(id)) {
                    continue;
                }
                visites.add(id);
                if (id === selfId || parents.indexOf(id) !== -1) {
                    return true;
                }
                var p = this.persons ? this.persons[id] : null;
                if (p && Array.isArray(p.enfants)) {
                    aVisiter.push(...p.enfants);
                }
            }
            return false;
        },
        editPerson: function () {
            if (this.creeUnCycle(personModif.id, this.pere, this.mere, this.enfants)) {
                alert("Impossible d'enregistrer : un individu ne peut pas être son propre parent, ni à la fois l'ancêtre et le descendant d'un autre. Vérifiez le père, la mère et les enfants sélectionnés.");
                return;
            }
            // Le sexe détermine si la personne est le `pere` ou la `mere` de ses enfants.
            // On calcule les deux rôles avant toute modification de personModif.sexe.
            const ancienChamp = personModif.sexe === 'H' ? 'pere' : 'mere';
            const nouveauChamp = (this.sexe ?? personModif.sexe) === 'H' ? 'pere' : 'mere';
            // En cas de changement de sexe, un enfant conservé qui a déjà un autre parent
            // dans le nouveau rôle aurait deux pères ou deux mères : on refuse.
            if (ancienChamp !== nouveauChamp) {
                const enfantEnConflit = this.enfants.find(enfantId => {
                    if (personModif.enfants.indexOf(enfantId) === -1) {
                        return false;
                    }
                    const autreParent = this.persons[enfantId][nouveauChamp];
                    return Number.isInteger(autreParent) && autreParent >= 0 && autreParent !== personModif.id;
                });
                if (enfantEnConflit !== undefined) {
                    const enfant = this.persons[enfantEnConflit];
                    alert("Impossible de changer le sexe : " + enfant.prenom + " " + enfant.nom + " a déjà " + (nouveauChamp === 'pere' ? "un père" : "une mère") + " renseigné(e).");
                    return;
                }
            }
            if (this.nom !== null && this.nom !== personModif.nom) {
                personModif.nom = this.nom;
            }
            if (this.prenom !== null && this.prenom !== personModif.prenom) {
                personModif.prenom = this.prenom;
            }
            if (this.sexe !== null && this.sexe !== personModif.sexe) {
                personModif.sexe = this.sexe;
            }
            if (this.dateNaissance !== null && this.dateNaissance !== personModif.dateNaissance) {
                personModif.dateNaissance = this.dateNaissance.toLocaleDateString('fr', { day: 'numeric', month: 'long', year: 'numeric' });
            }
            if (this.dateMort !== null && this.dateMort !== personModif.dateMort) {
                personModif.dateMort = this.dateMort.toLocaleDateString('fr', { day: 'numeric', month: 'long', year: 'numeric' })
            }
            if (this.pere !== personModif.pere) {
                // On enlève la personne modifiée des enfants de l'ancien père renseigné, si il existe.
                if (personModif.pere !== null) {
                    var position = this.persons[personModif.pere].enfants.indexOf(personModif.id);
                    this.persons[personModif.pere].enfants.splice(position, 1);
                }
                // Puis on ajoute la personne modifée aux enfants du nouveau père renseigné.
                this.persons[this.pere].enfants.push(personModif.id);
                // Enfin on ajoute le père à la personne modifiée.
                personModif.pere = this.pere;
            }
            if (this.mere !== personModif.mere) {
                // On applique le même traitement que pour le père
                if (personModif.mere !== null) {
                    var position = this.persons[personModif.mere].enfants.indexOf(personModif.id);
                    this.persons[personModif.mere].enfants.splice(position, 1);
                }
                this.persons[this.mere].enfants.push(personModif.id);
                personModif.mere = this.mere;
            }

            // On boucle sur tout les enfants du tableau de base de la personne modifiée,
            // on regarde pour chaque enfant si il est dans le tableau this.enfants, si il n'y est
            // pas c'est qu'il a été enlevé et donc ensuite on enlève son père ou sa mère selon le sexe.
            // Puis on boucle sur this.enfants et on regarde pour chaque enfant si il y est dans person.modif
            // si il y est pas c'est que l'enfant vient d'être ajouté et donc on lui rajoute en tant que pere ou
            // mere la personne modifiée.

            // On enlève la personModif des parents dont on lui a enlevé la filiation
            personModif.enfants.forEach(enfantId => {
                if (this.enfants.indexOf(enfantId) === -1) {
                    var enfant = this.persons[enfantId];
                    // On efface l'ancien rôle, et seulement s'il désigne bien la personne modifiée.
                    if (enfant[ancienChamp] === personModif.id) {
                        enfant[ancienChamp] = null;
                    }
                    this.persons[enfantId] = enfant;
                }
                // Si le sexe a changé, l'enfant conservé passe de l'ancien rôle au nouveau.
                else if (ancienChamp !== nouveauChamp) {
                    var enfant = this.persons[enfantId];
                    if (enfant[ancienChamp] === personModif.id) {
                        enfant[ancienChamp] = null;
                    }
                    enfant[nouveauChamp] = personModif.id;
                    this.persons[enfantId] = enfant;
                }
            });

            // On ajoute la personModif des parents dont on lui a ajouté la filiation
            this.enfants.forEach(enfantId => {
                if (personModif.enfants.indexOf(enfantId) === -1) {
                    var enfant = this.persons[enfantId];
                    const champ = nouveauChamp;
                    // On retire l'enfant des enfants de son ancien parent (même rôle), s'il en avait un.
                    const ancien = enfant[champ];
                    if (ancien !== null && ancien !== undefined && ancien !== personModif.id
                        && this.persons[ancien] && Array.isArray(this.persons[ancien].enfants)) {
                        const i = this.persons[ancien].enfants.indexOf(enfantId);
                        if (i !== -1) {
                            this.persons[ancien].enfants.splice(i, 1);
                        }
                    }
                    enfant[champ] = personModif.id;
                    this.persons[enfantId] = enfant;
                }
            });

            // Puis on ajoute les enfants modifiées à la personne modifiée.
            personModif.enfants = this.enfants;

            personModif.mariages = this.mariages;

            this.persons[personModif.id] = personModif;

            const parsed = JSON.stringify(this.persons);
            localStorage.setItem("persons", parsed);
            this.done = true;
        },
        goToTree: function () {
            document.location.href="/infos?id=" + this.id;
        },
    }
});