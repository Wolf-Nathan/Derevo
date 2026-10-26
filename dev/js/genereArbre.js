let arbre = new Vue({
    el: '#arbre',
    data: {
        personnes: {},
        selected: -1
    },
    components: {
        'Arbre': {
            props: ['personnes', 'selected'],
            components: {
                'Personne': {
                    props: ["nom", "prenom", "id_p"],
                    template: '<a v-bind:href="\'infos?id=\' + id_p">' +
                        '{{nom}} ' +
                        '{{prenom}}' +
                        '</a>'
                }
            },
            methods: {
                // `visites` : garde-fou contre les cycles de parenté (récursion infinie).
                creerArbreAsc(idCurrent, createElement, visites = new Set()) {
                    var currentP = this.findPersonne(idCurrent);
                    visites.add(Number(currentP.id));
                    // Attention : `null >= 0` vaut true en JS, d'où le test explicite sur un entier.
                    var aPere = Number.isInteger(currentP.pere) && currentP.pere >= 0;
                    var aMere = Number.isInteger(currentP.mere) && currentP.mere >= 0;
                    var suivant = aPere ? currentP.pere : currentP.mere;
                    if ((!aPere && !aMere) || visites.has(Number(suivant))) {
                        return this.creerArbreDesc(idCurrent, createElement);
                    }
                    return this.creerArbreAsc(suivant, createElement, visites);
                },
                // `chemin` : personnes de la branche en cours, garde-fou contre les cycles de parenté.
                creerArbreDesc(idCurrent, createElement, chemin = new Set()) {
                    var currentP = this.findPersonne(idCurrent);
                    var mariage = this.creerMariage(currentP, createElement);

                    if (currentP.enfants.length === 0) {
                        return createElement("li", [createElement('Personne', {
                            props: {
                                nom: currentP.nom,
                                prenom: currentP.prenom,
                                id_p: currentP.id
                            }
                        }), mariage]);
                    } else {
                        var personnesCrees = [];
                        chemin.add(Number(currentP.id));
                        for (e of currentP.enfants) {
                            if (chemin.has(Number(e))) {
                                continue;
                            }
                            personnesCrees.push(this.creerArbreDesc(e, createElement, chemin));
                        }
                        chemin.delete(Number(currentP.id));

                        return createElement("li", [createElement('Personne', {
                            props: {
                                nom: currentP.nom,
                                prenom: currentP.prenom,
                                id_p: currentP.id
                            }
                        }), mariage, createElement("ul", personnesCrees)]);
                    }
                },
                creerMariage(currentP, createElement) {
                    var mariage = [];
                    if (currentP.mariages.length > 0) {
                        for (f of currentP.mariages) {
                            fiance = this.findPersonne(f.maryId);
                            if (fiance) {
                                mariage.push(createElement('Personne', {
                                    props: {
                                        nom: fiance.nom,
                                        prenom: fiance.prenom,
                                        id_p: fiance.id
                                    }
                                }));
                            }
                        }
                    }
                    return mariage;
                },
                findPersonne(needle) {
                    for (var i = 0; i < this.personnes.length; i++) {
                        if (this.personnes[i].id != null && this.personnes[i].id == needle) {
                            return this.personnes[i];
                        }
                    }
                },
                redirect(id) {
                    document.location.href = "/infos?id=" + id;
                }
            },
            render: function(createElement) {
                return createElement("ul", [this.creerArbreAsc(this.selected, createElement)]);
            }

        }
    },
    methods: {
        chargerPersonne() {
            this.personnes = JSON.parse(localStorage.getItem("persons"));
        },
        findSelected() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('id')) {
                this.selected = Number(urlParams.get('id'));
            }
        }
    },
    created: function() {
        this.chargerPersonne();
        this.findSelected();
    },
});