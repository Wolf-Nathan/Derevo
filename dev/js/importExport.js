// Export / import de l'arbre généalogique (clé "persons" du localStorage) au format JSON.
// Inclus sur toutes les pages : l'instance est montée sur le <nav> du header.
let importExportModele = new Vue({
    el: "#navbar",
    methods: {
        exporter: function () {
            const contenu = localStorage.getItem('persons');
            if (!contenu) {
                alert("Aucun arbre à exporter.");
                return;
            }
            let donnees;
            try {
                donnees = JSON.parse(contenu);
            } catch (e) {
                alert("L'arbre enregistré est illisible, impossible de l'exporter.");
                return;
            }
            const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const lien = document.createElement('a');
            lien.href = url;
            lien.download = this.nomFichierExport(new Date());
            document.body.appendChild(lien);
            lien.click();
            document.body.removeChild(lien);
            URL.revokeObjectURL(url);
        },
        // derevo-arbre-AAAA-MM-JJ.json
        nomFichierExport: function (date) {
            const deuxChiffres = n => String(n).padStart(2, '0');
            return "derevo-arbre-" + date.getFullYear() + "-" + deuxChiffres(date.getMonth() + 1) + "-" + deuxChiffres(date.getDate()) + ".json";
        },
        choisirFichier: function () {
            this.$refs.fichier.click();
        },
        lireFichier: function (event) {
            const input = event.target;
            const fichier = input.files && input.files[0];
            if (!fichier) {
                return;
            }
            return new Promise((resolve, reject) => {
                const lecteur = new FileReader();
                lecteur.onload = () => resolve(lecteur.result);
                lecteur.onerror = () => reject(lecteur.error);
                lecteur.readAsText(fichier);
            }).then(texte => {
                this.importerTexte(texte);
            }, () => {
                alert("Import impossible : le fichier n'a pas pu être lu.");
            }).finally(() => {
                // Permet de réimporter le même fichier (sinon l'événement change ne se redéclenche pas).
                input.value = '';
            });
        },
        // Renvoie true si l'arbre a été importé.
        importerTexte: function (texte) {
            let donnees;
            try {
                donnees = JSON.parse(texte);
            } catch (e) {
                alert("Import impossible : le fichier n'est pas un JSON valide.");
                return false;
            }
            const erreur = this.validerArbre(donnees);
            if (erreur) {
                alert("Import impossible : " + erreur);
                return false;
            }
            const nbActuel = this.nombrePersonnesActuel();
            if (nbActuel > 0 && !confirm("L'import va remplacer votre arbre actuel (" + nbActuel + " personne(s)). Continuer ?")) {
                return false;
            }
            // Number() : tolère les anciens maryId stockés sous forme de chaîne.
            donnees.forEach(personne => {
                if (Array.isArray(personne.mariages)) {
                    personne.mariages.forEach(mariage => {
                        mariage.maryId = Number(mariage.maryId);
                    });
                }
            });
            localStorage.setItem('persons', JSON.stringify(donnees));
            // La page courante peut désigner une personne absente du nouvel arbre : retour à l'accueil.
            location.href = '/';
            return true;
        },
        nombrePersonnesActuel: function () {
            try {
                const persons = JSON.parse(localStorage.getItem('persons'));
                return Array.isArray(persons) ? persons.filter(p => p && p.id >= 0).length : 0;
            } catch (e) {
                return 0;
            }
        },
        // Vérifie les invariants du modèle de données (voir CLAUDE.md). Renvoie null si l'arbre est valide,
        // sinon un message d'erreur. La cohérence bidirectionnelle des relations n'est pas exigée :
        // d'anciens exports peuvent en contenir, et l'application les tolère.
        validerArbre: function (donnees) {
            if (!Array.isArray(donnees)) {
                return "le fichier doit contenir une liste de personnes.";
            }
            const estIndexValide = id => Number.isInteger(id) && id >= 0 && id < donnees.length;
            // Lien optionnel : absent, null ou -1 (ancienne valeur « aucun parent »), sinon un index existant.
            const estLienValide = id => id === undefined || id === null || id === -1 || estIndexValide(id);
            for (let index = 0; index < donnees.length; index++) {
                const personne = donnees[index];
                const position = "personne n°" + index;
                if (!personne || typeof personne !== 'object' || Array.isArray(personne)) {
                    return position + " : ce n'est pas un objet.";
                }
                // Personne supprimée : on ne garde qu'une tombe {id: -1}.
                if (personne.id === -1) {
                    continue;
                }
                if (personne.id !== index) {
                    return position + " : l'id doit être égal à sa position dans la liste (" + index + ").";
                }
                if (typeof personne.nom !== 'string' || typeof personne.prenom !== 'string') {
                    return position + " : nom et prénom sont obligatoires.";
                }
                if (personne.sexe !== 'H' && personne.sexe !== 'F') {
                    return position + " : le sexe doit valoir 'H' ou 'F'.";
                }
                if (!estLienValide(personne.pere) || !estLienValide(personne.mere)) {
                    return position + " : père ou mère inconnu.";
                }
                if (!Array.isArray(personne.enfants) || !personne.enfants.every(estIndexValide)) {
                    return position + " : liste d'enfants invalide.";
                }
                if (!Array.isArray(personne.mariages)) {
                    return position + " : liste de mariages invalide.";
                }
                const mariagesValides = personne.mariages.every(mariage =>
                    mariage && typeof mariage === 'object' && mariage.maryId !== null && mariage.maryId !== ''
                    && estIndexValide(Number(mariage.maryId))
                );
                if (!mariagesValides) {
                    return position + " : un mariage désigne une personne inconnue.";
                }
            }
            return null;
        }
    }
});
