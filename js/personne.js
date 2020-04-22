let arbre = new Vue({
    el: '#arbre',
    data: {
        personnes: {}
    },
    components: {
        'Arbre': {
            props: ['personnes'],
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
                creerArbre(idCurrent, idRoot, createElement) {
                    console.log('current : ', idCurrent);
                    var currentP = this.findPersonne(idCurrent);
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
                            personnesCrees.push(this.creerArbre(e.id, idRoot, createElement));
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
                findPersonne(needle) {
                    for (var i = 0; i < this.personnes.length; i++) {
                        if (this.personnes[i].id == needle) {
                            return this.personnes[i];
                        }
                    }
                }
            },
            render: function(createElement) {
                return createElement("ul", [this.creerArbre(this.personnes[2].id, this.personnes[2].id, createElement)]);
            }

        }
    },
    methods: {
        chargerPersonne() {
            this.personnes = JSON.parse(localStorage.getItem("personnes"));
            console.log(this.personnes);
        },
    },
    created: function() {
        this.chargerPersonne();
    },
});