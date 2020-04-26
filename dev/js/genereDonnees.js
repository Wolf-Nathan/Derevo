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
        "enfants": [4],
        "idPere": -1,
        "idMere": -1,
        "mariages": [{
            "maryId": 2,
            "mariageDate": "12/04/2020",
            "divorceDate": ""
        }]
    };
    let personne2 = {
        "id": 2,
        "nom": "GRANGER",
        "prenom": "Miguela",
        "dateNaissance": "13/12/1999",
        "dateMort": "",
        "enfants": [4],
        "idPere": 3,
        "idMere": -1,
        "mariages": [{
            "maryId": 1,
            "mariageDate": "12/04/2020",
            "divorceDate": ""
        }]
    };
    let personne3 = {
        "id": 3,
        "nom": "GRANGER",
        "prenom": "Grand père",
        "dateNaissance": "13/12/1959",
        "dateMort": "",
        "enfants": [2, 5],
        "idPere": -1,
        "idMere": -1,
        "mariages": []
    };
    let personne4 = {
        "id": 4,
        "nom": "GRANGER",
        "prenom": "Fils",
        "dateNaissance": "13/12/2009",
        "dateMort": "",
        "enfants": [],
        "idPere": 1,
        "idMere": 2,
        "mariages": []
    };
    let personne5 = {
        "id": 5,
        "nom": "GRANGER",
        "prenom": "Frere",
        "dateNaissance": "13/10/1999",
        "dateMort": "",
        "enfants": [6],
        "idPere": 3,
        "idMere": -1,
        "mariages": []
    };
    let personne6 = {
        "id": 6,
        "nom": "GRANGER",
        "prenom": "Fils Frere",
        "dateNaissance": "13/12/2009",
        "dateMort": "",
        "enfants": [],
        "idPere": 5,
        "idMere": -1,
        "mariages": []
    };
    localStorage.setItem("persons", JSON.stringify([personne1, personne2, personne3, personne4, personne5, personne6]));
}