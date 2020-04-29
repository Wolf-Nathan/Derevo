AOS.init();

let formModele = new Vue({
    el: "#form",
    data: {
        fr: vdp_translation_fr.js,
        done: false,
        addMariage: false,
        mariages: [],
        nom: null,
        prenom: null,
        sexe: null,
        dateNaissance: null,
        dateMort: null,
        pere: null,
        mere: null,
        enfants: [],
        persons: null,
        id: null
    },
    components: {
        vuejsDatepicker
    },
    mounted() {
        if (localStorage.getItem('persons')) {
            try {
                this.persons = JSON.parse(localStorage.getItem('persons'));
            } catch(e) {
                localStorage.removeItem('persons');
            }
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
            } else {
                alert("Merci d'indiquer une date de mariage !");
            }
        },
        removeSelectChilds: function () {
            this.enfants = [];
        },
        addPerson: function () {
            if(this.prenom !== null && this.nom !== null && this.sexe !== null) {
                var person = {
                    id: null,
                    prenom: this.prenom,
                    nom: this.nom,
                    sexe: this.sexe,
                    dateNaissance: this.dateNaissance ? this.dateNaissance.toLocaleDateString('fr', {day: 'numeric', month: 'long', year: 'numeric'}) : null,
                    dateMort: this.dateMort ? this.dateMort.toLocaleDateString('fr', {day: 'numeric', month: 'long', year: 'numeric'}) : null,
                    pere: this.pere ?? null,
                    mere: this.mere ?? null,
                    enfants: this.enfants ?? [],
                    mariages: this.mariages ?? null
                };
                if(this.persons){
                    person.id = this.persons.length;
                }
                else {
                    person.id = 0;
                    this.persons = [];
                }
                this.persons[person.id] = person;

                if(this.pere || this.pere === 0) {
                    this.persons[this.pere].enfants.push(person.id);
                }
                if(this.mere || this.mere === 0) {
                    this.persons[this.mere].enfants.push(person.id);
                }
                if(this.enfants) {
                    if(this.sexe === 'H') {
                        this.enfants.forEach(enfant => {
                            this.persons[enfant].pere = person.id;
                        });
                    }
                    else {
                        this.enfants.forEach(enfant => {
                            this.persons[enfant].mere = person.id;
                        });
                    }
                }
                if(this.mariages) {
                    this.mariages.forEach(mariage => {
                        this.persons[mariage.maryId].mariages.push({
                            "maryId": person.id,
                            "mariageDate": mariage.mariageDate,
                            "divorceDate": mariage.divorceDate ?? null
                        });
                    })
                }

                const parsed = JSON.stringify(this.persons);
                localStorage.setItem("persons", parsed);
                this.done = true;
                this.id = person.id;
            }
            else{
                alert("Merci de renseigner un nom, un prénom et un sexe pour enregistrer l'individu !")
            }
        },
        goToTree: function () {
            document.location.href="/infos?id=" + this.id;
        },
        newAdd: function () {
            document.location.href="/add";
        }
    }
});