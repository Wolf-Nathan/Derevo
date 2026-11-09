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
                // Attention : `null >= 0` vaut true en JS, d'où le test explicite sur un entier.
                estParentValide(parent) {
                    return Number.isInteger(parent) && parent >= 0;
                },
                // Ancêtres de currentP, branches paternelle (à gauche) et maternelle (à droite) :
                // ses parents, puis les parents de chacun, etc. Renvoie [] si aucun parent connu, sinon un <ul>.
                // `chemin` : personnes de la branche en cours, garde-fou contre les cycles de parenté.
                creerAncetres(currentP, createElement, chemin = new Set()) {
                    var parents = [];
                    chemin.add(Number(currentP.id));
                    for (var idParent of [currentP.pere, currentP.mere]) {
                        if (!this.estParentValide(idParent) || chemin.has(idParent)) {
                            continue;
                        }
                        var parent = this.findPersonne(idParent);
                        if (!parent) {
                            continue;
                        }
                        parents.push(createElement("li", [
                            createElement('Personne', {
                                props: {
                                    nom: parent.nom,
                                    prenom: parent.prenom,
                                    id_p: parent.id
                                }
                            })
                        ].concat(this.creerAncetres(parent, createElement, chemin))));
                    }
                    chemin.delete(Number(currentP.id));
                    return parents.length ? [createElement("ul", parents)] : [];
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
                var selectedP = this.findPersonne(this.selected);
                if (!selectedP) {
                    return createElement("div");
                }
                // Un seul arbre centré sur la personne : ses ancêtres des deux côtés au-dessus
                // (dessinés avec les mêmes règles CSS, puis retournés verticalement), sa descendance en dessous.
                var parties = [];
                var ancetres = this.creerAncetres(selectedP, createElement);
                if (ancetres.length) {
                    parties.push(createElement("ul", { class: "arbre-ancetres" }, [createElement("li", ancetres)]));
                }
                parties.push(createElement("ul", { class: "arbre-descendance" }, [
                    this.creerArbreDesc(this.selected, createElement)
                ]));
                return createElement("div", { class: "arbre-commun" }, parties);
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