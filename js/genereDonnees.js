window.onload = init;

function init() {
    genere();
}


function genere() {
    let personne1 = {
        "id": 1,
        "nom": "GRANGER",
        "prenom": "Alexis",
        "dateNaissance": "13/10/1999",
        "dateMort": "",
        "listEnfant": [{
            "id": 4
        }],
        "idPere": -1,
        "idMere": -1,
        "listMariage": [{
            "id": 2,
            "dateDebut": "12/04/2020",
            "dateFin": ""
        }]
    };
    let personne2 = {
        "id": 2,
        "nom": "GRANGER",
        "prenom": "Miguela",
        "dateNaissance": "13/12/1999",
        "dateMort": "",
        "listEnfant": [{
            "id": 4
        }],
        "idPere": 3,
        "idMere": -1,
        "listMariage": [{
            "id": 1,
            "dateDebut": "12/04/2020",
            "dateFin": ""
        }]
    };
    let personne3 = {
        "id": 3,
        "nom": "GRANGER",
        "prenom": "Grand père",
        "dateNaissance": "13/12/1959",
        "dateMort": "",
        "listEnfant": [{
                "id": 2
            },
            {
                "id": 5
            }
        ],
        "idPere": -1,
        "idMere": -1,
        "listMariage": []
    };
    let personne4 = {
        "id": 4,
        "nom": "GRANGER",
        "prenom": "Fils",
        "dateNaissance": "13/12/2009",
        "dateMort": "",
        "listEnfant": [],
        "idPere": 1,
        "idMere": 2,
        "listMariage": []
    };
    let personne5 = {
        "id": 5,
        "nom": "GRANGER",
        "prenom": "Frere",
        "dateNaissance": "13/10/1999",
        "dateMort": "",
        "listEnfant": [{
            "id": 6
        }],
        "idPere": 3,
        "idMere": -1,
        "listMariage": []
    };
    let personne6 = {
        "id": 6,
        "nom": "GRANGER",
        "prenom": "Fils Frere",
        "dateNaissance": "13/12/2009",
        "dateMort": "",
        "listEnfant": [],
        "idPere": 5,
        "idMere": -1,
        "listMariage": []
    };
    localStorage.setItem("personnes", JSON.stringify([personne1, personne2, personne3, personne4, personne5, personne6]));
}