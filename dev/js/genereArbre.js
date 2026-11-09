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
                // Frères et sœurs de la personne (elle comprise, à sa place), dans l'ordre des enfants de ses parents.
                // Si les deux parents sont connus, seuls les enfants communs aux deux sont retenus : un demi-frère
                // serait sinon dessiné comme l'enfant du couple.
                trouverFreresSoeurs(personne) {
                    var parents = [personne.pere, personne.mere]
                        .filter(id => this.estParentValide(id))
                        .map(id => this.findPersonne(id))
                        .filter(parent => parent && Array.isArray(parent.enfants));
                    var idPersonne = Number(personne.id);
                    if (!parents.length) {
                        return [idPersonne];
                    }
                    var ids = [];
                    parents[0].enfants.map(Number).forEach(id => {
                        var communAuxParents = parents.every(parent => parent.enfants.map(Number).includes(id));
                        if (communAuxParents && !ids.includes(id) && this.findPersonne(id)) {
                            ids.push(id);
                        }
                    });
                    // Données incohérentes : la personne absente des enfants de ses parents reste affichée.
                    if (!ids.includes(idPersonne)) {
                        ids.push(idPersonne);
                    }
                    return ids;
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
                // (dessinés avec les mêmes règles CSS, puis retournés verticalement), puis sous ses parents
                // la personne entourée de ses frères et sœurs, avec son conjoint et sa descendance.
                var parties = [];
                var ancetres = this.creerAncetres(selectedP, createElement);
                if (ancetres.length) {
                    parties.push(createElement("ul", { class: "arbre-ancetres" }, [createElement("li", ancetres)]));
                }
                var idSelected = Number(selectedP.id);
                var fratrie = this.trouverFreresSoeurs(selectedP).map(id => {
                    if (id === idSelected) {
                        return this.creerArbreDesc(id, createElement);
                    }
                    // Les frères et sœurs sont affichés seuls, sans conjoint ni descendance.
                    var frereSoeur = this.findPersonne(id);
                    return createElement("li", [createElement('Personne', {
                        props: {
                            nom: frereSoeur.nom,
                            prenom: frereSoeur.prenom,
                            id_p: frereSoeur.id
                        }
                    })]);
                });
                parties.push(createElement("ul", { class: "arbre-descendance" }, fratrie));
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