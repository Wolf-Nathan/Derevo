AOS.init();

let maryFormModele = new Vue({
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
            this.addMariage = true;
        },
        cancelMary: function () {
            this.addMariage = false;
        },
        validMary: function () {
            var maryIdPerson = document.getElementById("mary").value;
            var mariageDate = document.getElementById("mariageDate").value;
            var divorceDate = document.getElementById("divorceDate").value;

            if (maryIdPerson && mariageDate) {
                this.addMariage = false;
                this.mariages.push({
                    "maryIdPerson": maryIdPerson,
                    "mariageDate": mariageDate,
                    "divorceDate": divorceDate
                });
            } else {
                alert("Merci d'indiquer une date de mariage !");
            }
        },
        addPerson: function () {
            // ICI, recuperer les valeurs des champs et instancier l'individu dans le LS.
            //Pour recuperer les date des datePicker: this.dateNaissance par exmple (v-model)
            //Verifie que les champs ne soient pas vide ;)
            if(this.prenom !== null && this.nom !== null) {
                var person = {
                    id: null,
                    prenom: this.prenom,
                    nom: this.nom,
                    sexe: this.sexe ?? null,
                    dateNaissance: this.dateNaissance ? this.dateNaissance.toLocaleDateString('fr', {day: 'numeric', month: 'long', year: 'numeric'}) : null,
                    dateMort: this.dateMort ? this.dateMort.toLocaleDateString('fr', {day: 'numeric', month: 'long', year: 'numeric'}) : null,
                    pere: this.pere ?? null,
                    mere: this.mere ?? null,
                    enfants: this.enfants ?? [],
                    mariage: null
                };
                if(this.persons){
                    /*var lastPerson = this.persons[this.persons.length - 1];
                    person.id = lastPerson.id + 1;*/
                    person.id = this.persons.length;

                /* fonctionne pas
                    // On récupère la dernière personne du tableau
                    var reversePersons = this.persons;
                    reversePersons.reverse();
                    var lastPerson = reversePersons.shift();
                    // Puis on incrémente l'id de cette personne pour déterminer l'id du nouvel individu
                    person.id = lastPerson.id + 1;
                    */
                }
                else {
                    person.id = 0;
                    this.persons = [];
                }
                this.persons[person.id] = person;

                if(this.pere) {
                    this.persons[this.pere].enfants.push(person.id);
                }
                if(this.mere) {
                    this.persons[this.mere].enfants.push(person.id);
                }
                if(this.enfants && this.sexe) {
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

                const parsed = JSON.stringify(this.persons);
                localStorage.setItem("persons", parsed);
                this.done = true;
            }
            else{
                alert("Merci de renseigner un nom et un prénom pour enregistrer l'individu !")
            }
            
            //this.done == true quand l'enregistrement a bein été fait :)
        }
    }
});