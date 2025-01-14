addEventListener("DOMContentLoaded", init);



const weatherinterpretation = {
    0: "Ciel clair",
    1: "Principalement clair",
    2: "Partiellement nuageux",
    3: "Nuageux",
    45: "Brouillard",
    48: "Brouillard givrant",
    51: "Pluie légère",
    53: "Pluie modérée",
    55: "Pluie dense",
    61: "Averses légères",
    63: "Averses modérées",
    65: "Averses intenses",
    80: "Averses isolées",
    81: "Averses fréquentes",
    82: "Averses très intenses",
    95: "Orages légers à modérés",
    96: "Orages avec grêle légère",
    99: "Orages avec grêle forte",
};

function init() {
    const btn = document.createElement("button");
    const zonet = document.getElementById("ecris");
    btn.setAttribute("id", "btnid");
    const divchange = document.getElementById("change");
    btn.innerHTML = "Changer de ville";
    divchange.appendChild(btn);
    coordonne("Lannion"); // Chargement initial pour Lannion

    btn.addEventListener(
        "click",
        function () {
            coordonne(zonet.value);
        }
    );
}
//affiche le texte 
function affiche(donne, lieu) {
    const met = document.getElementById("meteo");
    if (met.lastChild) {
        met.removeChild(met.lastChild);
    }
    const weathercode = donne.current_weather.weathercode;
    const newel = document.createElement("P");
    newel.innerText = "La météo de " + lieu + " est " + donne.current_weather.temperature + "°C et le weatherCode est " + weathercode + "\n signifiant " + weatherinterpretation[weathercode];
    met.appendChild(newel);
}

function appliquecoor(coor, lieu) {
    const lien = "https://api.open-meteo.com/v1/forecast?latitude=" + coor[1] + "&longitude=" + coor[0] + "&current_weather=true&hourly=temperature_2m";

    fetch(lien)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur HTTP : " + response.status);
            }
            return response.json();
        })
        .then((data) => {
            affiche(data, lieu); 
            generecsv(data); 
        })
        .catch((error) => {
            console.error("Erreur :", error.message);
        });
}
//récupère les coordoonées 
function coordonne(lieu) {
    const adresse = "https://api-adresse.data.gouv.fr/search/?q=" + encodeURIComponent(lieu);

    fetch(adresse)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur HTTP : " + response.status);
            }
            return response.json();
        })
        .then((data) => {
            if (data.features.length === 0) {
                throw new Error("Aucune donnée trouvée pour le lieu : " + lieu);
            }
            appliquecoor(data.features[0].geometry.coordinates, lieu);
        })
        .catch((error) => {
            console.error("Erreur :", error.message);
        });
}
//génèrelecsv 
function generecsv(data) {
    const colonne = [["Time", "Temperature (°C)"]];

    for (let i = 0; i < data.hourly.time.length; i++) {
        colonne.push([data.hourly.time[i], data.hourly.temperature_2m[i]]);
    }

    const fichiercsv = colonne.map(function (row) {
        return row.join(",");
    }).join("\n");

    return tracegraphe(fichiercsv); // utilise du CSV pour tracer le graphique
}

function tracegraphe(csv) {
    const lignes = csv.split("\n");
    const donnees = lignes.slice(1); 
    const nom = [];
    const valeurs = [];

    donnees.forEach(function (ligne) {
        if (ligne.trim() === "") return;
        const parts = ligne.split(",");
        const time = parts[0];
        const temperature = parts[1];
        nom.push(new Date(time).toLocaleString());
        valeurs.push(parseFloat(temperature));
    });

    const graph = document.getElementById("graph");
    if (graph.lastChild) {
        graph.removeChild(graph.lastChild); 
    }

    const canvas = document.createElement("canvas");
    graph.appendChild(canvas); 
    const ctx = canvas.getContext("2d");

    canvas.style.backgroundColor = "white";

    new Chart(ctx, {
        type: "line",
        data: {
            labels: nom,
            datasets: [{
                label: "Températures horaires",
                data: valeurs,
                borderColor: "rgb(0, 0, 0)",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Température (°C)"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Temps"
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: "black"
                    }
                }
            }
        }
    });
}




