AOS.init();

let formModele = new Vue({
    el: "#form",
    data: {
        fr: vdp_translation_fr.js,
        done: false,
        goodId : true,
        persons: null,
        personModif: {nom: "Nom"},
        nom: null,
        prenom: null,
        sexe: null,
        dateNaissance: null,
        dateMort: null,
        pere: null,
        mere: null,
        enfants: [],
        mariages: [],
        addMariage: false
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
                    this.nom = personModif.nom;
                    this.prenom = personModif.prenom;
                    this.sexe = personModif.sexe ?? null;
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
        show: function () {
            this.mary = null;
            this.dateMariage = null;
            this.dateDivorce = null;
            this.addMariage = true;
        },
        cancelMary: function () {
            this.addMariage = false;
        },
        validMary: function () {
            this.mariageNumber++ ;
            var maryId = document.getElementById("mary").value;
            var mariageDate = document.getElementById("mariageDate").value;
            var divorceDate = document.getElementById("divorceDate").value;

            if (maryId && mariageDate) {
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
        editPerson: function () {
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
                personModif.dateNaissance = this.dateNaissance.toLocaleDateString('fr', {day: 'numeric', month: 'long', year: 'numeric'});
            }
            if (this.dateMort !== null && this.dateMort !== personModif.dateMort) {
                personModif.dateMort = this.dateMort.toLocaleDateString('fr', {day: 'numeric', month: 'long', year: 'numeric'})
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
            // Comment gérer la modification des enfants ?
            // Car pour chaque changement il faudra gérer l'ajout/ la suppression du parent pour l'individu.
            //personModif.enfants = this.enfants;
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
                    if (personModif.sexe === 'H'){
                        enfant.pere = null;
                    }
                    else {
                        enfant.mere = null;
                    }
                    this.persons[enfantId] = enfant;
                }
            });

            // On ajoute la personModif des parents dont on lui a ajouté la filiation
            this.enfants.forEach(enfantId => {
                if (personModif.enfants.indexOf(enfantId) === -1) {
                    var enfant = this.persons[enfantId];
                    if(personModif.sexe === 'H'){
                        enfant.pere = personModif.id;
                    }
                    else {
                        enfant.mere = personModif.id;
                    }
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
        }
    }
});