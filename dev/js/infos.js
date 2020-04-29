AOS.init();

let infosModele = new Vue({
   el: "#infos",
   data: {
       goodId: true,
       nom: null,
       prenom: null,
       sexe: null,
       titre: null,
       dateNaissance: null,
       dateMort: null,
       pere: null,
       mere: null,
       enfants: [],
       mariages: [],
       ancetres: [],
       descendants: [],
       persons: null
   },
   mounted(){
       if (localStorage.getItem('persons')) {
           try {
               this.persons = JSON.parse(localStorage.getItem('persons'));

           } catch(e) {
               localStorage.removeItem('persons');
           }
           const urlParams = new URLSearchParams(window.location.search);
           personInfo = this.persons[urlParams.get('id')];
           if (personInfo && personInfo.id >= 0) {
               this.nom = personInfo.nom;
               this.prenom = personInfo.prenom;
               this.sexe = personInfo.sexe;
               this.titre = this.sexe === 'H' ? 'M.' : 'Mme';
               this.dateNaissance = personInfo.dateNaissance ?? null;
               this.dateMort = personInfo.dateMort ?? null;
               if (personInfo.pere !== null && personInfo.pere >=0){
                   this.pere = this.persons[personInfo.pere].nom + " " + this.persons[personInfo.pere].prenom;
               }
               if (personInfo.mere !== null && personInfo.mere >=0) {
                   this.mere = this.persons[personInfo.mere].nom + " " + this.persons[personInfo.mere].prenom;
               }
               if(personInfo.enfants.length > 0){
                    personInfo.enfants.forEach(enfantId => {
                        var enfant = this.persons[enfantId];
                        this.enfants.push(enfant.nom + " " + enfant.prenom);
                    })
               }
               else {
                   this.enfants = [];
               }
               if (personInfo.mariages.length > 0) {
                    personInfo.mariages.forEach(mariage => {
                        var mary = this.persons[mariage.maryId];
                        if(mariage.divorceDate !== null && mariage.divorceDate !== ""){
                            this.mariages.unshift("Divorcé(e) de " + mary.nom + " " + mary.prenom + " depuis le " + mariage.divorceDate);
                        }
                        else {
                            this.mariages.unshift("Marié(e) avec " + mary.nom + " " + mary.prenom + " depuis le " + mariage.mariageDate);
                        }
                    })
               }
               else {
                   this.mariages = [];
               }
               this.findAncestors(personInfo);
               this.findDescendants(personInfo);
           }
           else {
               this.goodId = false;
           }

       }
       else {
           this.goodId = false;
       }
   },
   methods: {
       findAncestors : function(person) {
            if(person.pere >= 0) {
                var pere = this.persons[person.pere];
                if(pere) {
                    this.ancetres.push({nom: pere.nom, prenom: pere.prenom, link: "/infos?id=" + pere.id});
                    this.findAncestors(pere);
                }
            }
            if (person.mere >= 0) {
                var mere = this.persons[person.mere];
                if (mere) {
                    this.ancetres.push({nom: mere.nom, prenom: mere.prenom, link: "/infos?id=" + mere.id});
                    this.findAncestors(mere);
                }
            }
       },
       findDescendants : function(person) {
           if(person.enfants.length > 0) {
               person.enfants.forEach(enfantId => {
                   enfant = this.persons[enfantId];
                   if(enfant) {
                       this.descendants.push({nom: enfant.nom, prenom: enfant.prenom, link: "/infos?id=" + enfant.id});
                       if (enfant.enfants.length > 0 ) {
                           this.findDescendants(enfant);
                       }
                   }
               })
           }
       }
   }
});