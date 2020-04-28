AOS.init();

let yearFormModele = new Vue({
    el: "#yearForm",
    data: {
        persons: null,
        year: null,
        activeSearch : false,
        alivePersons: []
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
        // On se base sur une espérance de vie de 100 ans si on ne connait qu'une seule des dates de naissance et de mort.
        searchByYear: function () {
            this.activeSearch = true;
            this.alivePersons = [];
            this.persons.forEach(person => {
                if ((person.dateNaissance !== null && person.dateNaissance !== "") || (person.dateMort !== null && person.dateMort !== "")){
                    if (person.dateNaissance === null || person.dateNaissance === "") {
                        var mortAnnee = person.dateMort.split(" ")[2];
                        // Comme on ne connait pas la date de naissance de l'individu on recherche si il est mort dans les 100 années après l'année de recherche.
                        if (mortAnnee >= this.year && mortAnnee < this.year + 100) {
                            this.alivePersons.push({nom: person.nom, prenom: person.prenom, link: "/infos?id=" + person.id});
                        }
                    }
                    if (person.dateMort === null || person.dateMort === "") {
                        var naissanceAnnee = person.dateNaissance.split(" ")[2];
                        // Comme on ne connait pas la date de mort de l'individu on recherche si il est né dans les 100 années avant la date de recherche.
                        if (naissanceAnnee <= this.year && naissanceAnnee > this.year - 100) {
                            this.alivePersons.push({nom: person.nom, prenom: person.prenom, link: "/infos?id=" + person.id});
                        }
                    }
                    else {
                        var mortAnnee = person.dateMort.split(" ")[2];
                        var naissanceAnnee = person.dateNaissance.split(" ")[2];
                        // On regarde si l'année de recherce est incluse entre la date de naissance et de mort de l'individu.
                        if (naissanceAnnee <= this.year && mortAnnee >= this.year) {
                            this.alivePersons.push({nom: person.nom, prenom: person.prenom, link: "/infos?id=" + person.id});
                        }
                    }
                }
            })
        }
    }
});