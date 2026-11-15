// Liste des personnes de la page d'accueil, triable par nom, prénom ou date de naissance.
let listPersonsModele = new Vue({
    el: "#table-id",
    data: {
        persons: null,
        // Colonne de tri active ('nom', 'prenom' ou 'dateNaissance') et sens ('asc' ou 'desc') ; null = ordre d'origine.
        triPropriete: null,
        triSens: null
    },
    computed: {
        // Personnes non supprimées, dans l'ordre demandé. Ne modifie jamais `persons`.
        personsAffichees: function () {
            const vivantes = (this.persons || []).filter(person => person && person.id != -1);
            if (!this.triPropriete) {
                return vivantes;
            }
            const propriete = this.triPropriete;
            const sens = this.triSens === 'desc' ? -1 : 1;
            // Array.prototype.sort est stable : à égalité, l'ordre d'origine est conservé.
            return vivantes.slice().sort((a, b) => {
                if (propriete === 'dateNaissance') {
                    const cleA = this.cleDate(a.dateNaissance);
                    const cleB = this.cleDate(b.dateNaissance);
                    // Dates inconnues toujours en fin de liste, quel que soit le sens.
                    if (cleA === null || cleB === null) {
                        return (cleA === null) - (cleB === null);
                    }
                    return sens * (cleA - cleB);
                }
                // sensitivity 'base' : ni la casse ni les accents ne comptent (« Émile » avec les E).
                return sens * String(a[propriete] ?? '').localeCompare(String(b[propriete] ?? ''), 'fr', { sensitivity: 'base' });
            });
        }
    },
    mounted() {
        if (localStorage.getItem('persons')) {
            try {
                this.persons = JSON.parse(localStorage.getItem('persons'));
            } catch (e) {
                localStorage.removeItem('persons');
            }
        }
        // pagination.js s'exécute avant le rendu de la table : on applique la pagination une fois les lignes en place.
        this.$nextTick(this.rafraichirPagination);
    },
    methods: {
        // 1er clic : croissant ; 2e : décroissant ; 3e : retour à l'ordre d'origine. Une seule colonne à la fois.
        trier: function (propriete) {
            if (this.triPropriete !== propriete) {
                this.triPropriete = propriete;
                this.triSens = 'asc';
            } else if (this.triSens === 'asc') {
                this.triSens = 'desc';
            } else {
                this.triPropriete = null;
                this.triSens = null;
            }
            this.$nextTick(this.rafraichirPagination);
        },
        // Valeur de l'attribut aria-sort d'un en-tête.
        ariaTri: function (propriete) {
            if (this.triPropriete !== propriete) {
                return 'none';
            }
            return this.triSens === 'asc' ? 'ascending' : 'descending';
        },
        // Clé numérique comparable (AAAAMMJJ) d'une date « 2 mars 1950 » ; null si absente ou illisible.
        // Un mois non reconnu compte pour 0 : la date reste classée par année.
        cleDate: function (texte) {
            if (typeof texte !== 'string') {
                return null;
            }
            const mots = texte.trim().split(/\s+/);
            if (mots.length !== 3) {
                return null;
            }
            const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            // parseInt : accepte « 1er » et « 01 ».
            const jour = parseInt(mots[0], 10);
            const annee = parseInt(mots[2], 10);
            if (Number.isNaN(jour) || Number.isNaN(annee)) {
                return null;
            }
            return annee * 10000 + (mois.indexOf(mots[1].toLowerCase()) + 1) * 100 + jour;
        },
        // pagination.js masque les lignes selon leur position : à réappliquer quand les lignes changent.
        // FilterkeyWord_all_table() réapplique la recherche en cours, ou à défaut la pagination.
        rafraichirPagination: function () {
            if (typeof FilterkeyWord_all_table === 'function') {
                FilterkeyWord_all_table();
            }
        }
    }
});
