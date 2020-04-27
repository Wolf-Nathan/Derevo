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
                        '{{nom}}' +
                        '<br/>{{prenom}}' +
                        '</a>'
                }
            },
            methods: {
                creerArbreAsc(idCurrent, createElement) {
                    var currentP = this.findPersonne(idCurrent);
                    if ((currentP.pere < 0 && currentP.mere < 0) || (currentP.pere == null && currentP.mere == null)) {
                        return this.creerArbreDesc(idCurrent, createElement);
                    } else {
                        if (currentP.pere >= 0 || currentP.pere != null) {
                            return this.creerArbreAsc(currentP.pere, createElement);
                        } else {
                            return this.creerArbreAsc(currentP.mere, createElement);
                        }
                    }
                },
                creerArbreDesc(idCurrent, createElement) {
                    console.log('current : ', idCurrent);
                    var currentP = this.findPersonne(idCurrent);
                    var mariage = this.creerMariage(currentP, createElement);

                    if (currentP.enfants.length === 0) {
                        console.log("pas d'enfants");
                        return createElement("li", [createElement('Personne', {
                            props: {
                                nom: currentP.nom,
                                prenom: currentP.prenom,
                                id_p: currentP.id
                            }
                        }), mariage]);
                    } else {
                        console.log("enfants");
                        var personnesCrees = [];
                        for (e of currentP.enfants) {
                            console.log('enfant : ', e);
                            personnesCrees.push(this.creerArbreDesc(e, createElement));
                        }
                        console.log(currentP);

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
                            console.log(currentP.mariages);
                            fiance = this.findPersonne(f.maryId);
                            mariage.push(createElement('Personne', {
                                props: {
                                    nom: fiance.nom,
                                    prenom: fiance.prenom,
                                    id_p: fiance.id
                                }
                            }));
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
                console.log(this.personnes);

                return createElement("ul", [this.creerArbreAsc(this.selected, createElement)]);
            }

        }
    },
    methods: {
        chargerPersonne() {
            this.personnes = JSON.parse(localStorage.getItem("persons"));
            //console.log(this.personnes);
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