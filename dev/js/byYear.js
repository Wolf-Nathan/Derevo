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
            // L'année saisie peut être une chaîne : sans conversion, `year + 100` concatène.
            var year = parseInt(this.year, 10);
            if (Number.isNaN(year)) {
                return;
            }
            this.persons.forEach(person => {
                // On ignore les personnes supprimées (tombe {id: -1}, sans nom ni dates).
                if (!person || person.id < 0 || !person.nom) {
                    return;
                }
                if (person.dateNaissance || person.dateMort) {
                    if (!person.dateNaissance) {
                        var mortAnnee = parseInt(person.dateMort.split(" ")[2], 10);
                        // Comme on ne connait pas la date de naissance de l'individu on recherche si il est mort dans les 100 années après l'année de recherche.
                        if (mortAnnee >= year && mortAnnee < year + 100) {
                            this.alivePersons.push({nom: person.nom, prenom: person.prenom, link: "/infos?id=" + person.id});
                        }
                    }
                    else if (!person.dateMort) {
                        var naissanceAnnee = parseInt(person.dateNaissance.split(" ")[2], 10);
                        // Comme on ne connait pas la date de mort de l'individu on recherche si il est né dans les 100 années avant la date de recherche.
                        if (naissanceAnnee <= year && naissanceAnnee > year - 100) {
                            this.alivePersons.push({nom: person.nom, prenom: person.prenom, link: "/infos?id=" + person.id});
                        }
                    }
                    else {
                        var mortAnnee = parseInt(person.dateMort.split(" ")[2], 10);
                        var naissanceAnnee = parseInt(person.dateNaissance.split(" ")[2], 10);
                        // On regarde si l'année de recherce est incluse entre la date de naissance et de mort de l'individu.
                        if (naissanceAnnee <= year && mortAnnee >= year) {
                            this.alivePersons.push({nom: person.nom, prenom: person.prenom, link: "/infos?id=" + person.id});
                        }
                    }
                }
            })
        }
    }
});