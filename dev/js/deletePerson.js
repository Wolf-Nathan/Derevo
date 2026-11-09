AOS.init();

let deleteModele = new Vue({
    el: "#deleteDiv",
    data: {
        fr: vdp_translation_fr.js,
        done: false,
        goodId: true,
        id: null,
        nom: null,
        prenom: null,
        persons: null,
        personDel: null,
    },
    components: {
        vuejsDatepicker
    },
    mounted() {
        if (localStorage.getItem('persons')) {
            try {
                this.persons = JSON.parse(localStorage.getItem('persons'));
                const urlParams = new URLSearchParams(window.location.search);
                this.id = Number(urlParams.get('id'));
                this.personDel = this.persons[this.id];
                if (this.personDel?.nom) {
                    this.nom = this.personDel.nom;
                    this.prenom = this.personDel.prenom;
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
        deleteYes: function () {
            var position = null;
            if (this.personDel.pere !== null) {
                position = this.persons[this.personDel.pere].enfants.indexOf(this.id);
                // indexOf renvoie -1 si les données sont incohérentes : splice(-1, 1) supprimerait le dernier enfant.
                if (position !== -1) {
                    this.persons[this.personDel.pere].enfants.splice(position, 1);
                }
            }
            if (this.personDel.mere !== null) {
                position = this.persons[this.personDel.mere].enfants.indexOf(this.id);
                if (position !== -1) {
                    this.persons[this.personDel.mere].enfants.splice(position, 1);
                }
            }
            // Chez chaque enfant, on efface le champ (pere et/ou mere) qui désigne réellement la personne
            // supprimée, sans se fier à son sexe : d'anciennes données peuvent avoir un rôle incohérent.
            this.personDel.enfants.forEach(enfantId => {
                const enfant = this.persons[enfantId];
                // L'enfant peut avoir déjà été supprimé (tombe {id: -1}) : rien à nettoyer.
                if (!enfant || enfant.id < 0) {
                    return;
                }
                if (enfant.pere === this.id) {
                    enfant.pere = null;
                }
                if (enfant.mere === this.id) {
                    enfant.mere = null;
                }
            });

            // On parcourt tout les mariages de la personne pour supprimer les mariages concernés chez les mariés.
            this.personDel.mariages.forEach(mariage => {
                // On récupère la personne mariée avec la personne supprimée.
                // Number() : tolère les anciens maryId stockés sous forme de chaîne.
                const mary = this.persons[Number(mariage.maryId)];
                // Le conjoint peut avoir déjà été supprimé (tombe {id: -1}) : rien à nettoyer.
                if (!mary || !Array.isArray(mary.mariages)) {
                    return;
                }
                // On supprime tout les mariages qui ont été faits avec la personne supprimée.
                mary.mariages = mary.mariages.filter(mariageMary => Number(mariageMary.maryId) !== this.id);
            });

            this.personDel = {
                id: -1
            };

            this.persons[this.id] = this.personDel;

            const parsed = JSON.stringify(this.persons);
            localStorage.setItem("persons", parsed);
            this.done = true;

            //Redirecting to home page
            location.href='/';
        },
        deleteNo: function () {
            document.location.href="/";
        }
    }
});


