# Derevo
Arbre généalogique utilisant Vue.js & Node.js

![illus](https://raw.githubusercontent.com/Wolf-Nathan/VueJS_Project/master/assets/images/home.jpg)

## Installation & démarrage

### Étape 1 : Installation
``` 
❯ git clone https://github.com/Wolf-Nathan/Derevo.git
```
### Étape 2 : démarrage
``` 
❯ npm start
```
ou
``` 
❯ node server.js
```
### Derevo est prêt a être utilisé !
Rendez-vous sur http://localhost:8080/ pour commencer a utilisé Derevo.

## Utilisation

### Accueil
http://localhost:8080/

Ici, vous retrouverez l'intégralité de vos individus. Une section recherche permet de retrouver dynamiquement un ou plusieur(s) utilisateur(s).

Cette page est accessible depuis n'importe quelle page depuis la barre de navigation en cliquant sur "Derevo".

### Ajout d'un individu
http://localhost:8080/add

Cette page vous permet de créer un utilisateur et de lui définir l'intégralité de ses paramètres (Identité, sexe, date de naissance & mort, enfant(s), parent(s) et mariage(s).

Cette page est accessible depuis n'importe quelle page depuis la barre de navigation.

### Consultation d'un individu
http://localhost:8080/infos?id=0 ( ``` id ``` correspond a l'id de l'individu)

Cette page permet de consulter les informations d'un individu ainsi que son arbre généalogique.

Cette page est accessible depuis la page d'accueil en appuyant sur "<img src="https://s2.qwant.com/thumbr/0x380/5/4/d0a4c2489712695fc6c16abb9bb5fb96daf05e996081c1ef22d3933e50f211/logo_oeil_ouvert.png?u=http%3A%2F%2Fwww.tnba.org%2Fsites%2Fdefault%2Ffiles%2Fimages%2Flogo_oeil_ouvert.png&q=0&b=1&p=0&a=1" width="20" height="20">".

### Edition d'un individu
http://localhost:8080/edit?id=0 ( ``` id ``` correspond a l'id de l'individu)

Cette page permet de modifier l'intégralité des informations d'un individu.

Cette page est accessible depuis la page d'accueil en appuyant sur "<img src="https://s2.qwant.com/thumbr/0x380/4/3/72b940eb38dda9449ab1fd7adba656e7ef1322a4b4bf742f2a66e79e106730/1024px-Simpleicons_Business_pencil.svg.png?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fa%2Fa2%2FSimpleicons_Business_pencil.svg%2F1024px-Simpleicons_Business_pencil.svg.png&q=0&b=1&p=0&a=1" width="20" height="20">".

### Suppression d'un individu
http://localhost:8080/delete?id=0 ( ``` id ``` correspond a l'id de l'individu)

Cette page permet de supprimer un individu.

Cette page est accessible depuis la page d'accueil en appuyant sur "<img src="https://s1.qwant.com/thumbr/0x0/0/8/a042edced9092eee077c67d7199c59edb24100ebfee7d198e2b61c89f6c17e/70757.svg.jpg?u=https%3A%2F%2Fimage.flaticon.com%2Ficons%2Fsvg%2F70%2F70757.svg&q=0&b=1&p=0&a=1" width="20" height="20">".

### Recherche par année
http://localhost:8080/year

Cette page permet de retrouver les individus étant nés une certaine année.

Cette page est accessible depuis la page d'accueil en appuyant sur "Recherche par année".

### A propos de l'équipe...
http://localhost:8080/about

Cette page vous permet de connaître l'équipe Derevo.

Cette page est accessible depuis n'importe quelle page depuis la barre de navigation.
