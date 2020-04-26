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
    },
    components: {
        vuejsDatepicker
    },
    mounted() {
        if (localStorage.getItem('persons')) {
            try {
                this.persons = JSON.parse(localStorage.getItem('persons'));
                const urlParams = new URLSearchParams(window.location.search);
                this.id = urlParams.get('id');
                personDel = this.persons[this.id];
                if (personDel && personDel.nom) {
                    this.nom = personDel.nom;
                    this.prenom = personDel.prenom;
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
            if (personDel.pere !== null) {
                var position = this.persons[personDel.pere].enfants.indexOf(this.id);
                this.persons[personDel.pere].enfants.splice(position, 1);
            }
            if (personDel.mere !== null) {
                var position = this.persons[personDel.mere].enfants.indexOf(this.id);
                this.persons[personDel.mere].enfants.splice(position, 1);
            }
            personDel.enfants.forEach(enfantId => {
                if(personDel.sexe === 'H'){
                    this.persons[enfantId].pere = null;
                }
                else {
                    this.persons[enfantId].mere = null;
                }
            });

            // On parcourt tout les mariages de la personne pour supprimer les mariages concernés chez les mariés.
            personDel.mariages.forEach(mariage => {
                // On récupère la personne mariée avec la personne supprimée.
                var mary = this.persons[mariage.maryId];
                // On stocke la position des mariages à supprimer dans un Array
                var positionMariage = [];
                // On supprime tout les mariages qui ont été faits avec la personne supprimée.
                mary.mariages.forEach((mariageMary, index) => {
                    if(mariageMary.maryId === this.id){
                        positionMariage.push(index);
                    }
                });
                positionMariage.forEach(mariageToDel => {
                    mary.mariages.splice(mariageToDel, 1);
                })
            });
            // Quand un mariage est supprimé la position des mariages changent est-ce que le comportement de la fonction est donc bien correct ?


            personDel = {
                id: -1
            };

            this.persons[this.id] = personDel;

            const parsed = JSON.stringify(this.persons);
            localStorage.setItem("persons", parsed);
            this.done = true;
        },
        deleteNo: function () {
            document.location.href="/";
        }
    }
});


