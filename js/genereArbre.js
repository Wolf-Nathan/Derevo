let arbre = new Vue({
    el: '#arbre',
    data: {
        personnes: {}
    },
    components: {
        'Arbre': {
            props: ['personnes', 'selected'],
            components: {
                'Personne': {
                    props: ["nom", "prenom", "id_p"],
                    template: '<a v-bind:href="\'#\' + id_p">' +
                        '{{nom}}' +
                        '<br/>{{prenom}}' +
                        '</a>'
                }
            },
            methods: {
                creerArbreAsc(idCurrent, createElement) {
                    console.log('current Asc : ', idCurrent);
                    var currentP = this.findPersonne(idCurrent);

                    if (currentP.idPere < 0 && currentP.idMere < 0) {
                        return this.creerArbreDesc(idCurrent, createElement);
                    } else {
                        if (currentP.idPere >= 0) {
                            return this.creerArbreAsc(currentP.idPere, createElement);
                        } else {
                            return this.creerArbreAsc(currentP.idMere, createElement);
                        }
                    }
                },
                creerArbreDesc(idCurrent, createElement) {
                    console.log('current : ', idCurrent);
                    var currentP = this.findPersonne(idCurrent);
                    var mariage = this.creerMariage(currentP, createElement);

                    if (currentP.listEnfant.length == 0) {
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
                        for (e of currentP.listEnfant) {
                            console.log('enfant : ', e.id);
                            personnesCrees.push(this.creerArbreDesc(e.id, createElement));
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
                    if (currentP.listMariage.length > 0) {
                        for (f of currentP.listMariage) {
                            fiance = this.findPersonne(f.id);
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
                        if (this.personnes[i].id == needle) {
                            return this.personnes[i];
                        }
                    }
                }
            },
            render: function(createElement) {
                return createElement("ul", [this.creerArbreAsc(this.personnes[this.selected].id, createElement)]);
            }

        }
    },
    methods: {
        chargerPersonne() {
            this.personnes = JSON.parse(localStorage.getItem("personnes"));
            //console.log(this.personnes);
        },
    },
    created: function() {
        this.chargerPersonne();
    },
});