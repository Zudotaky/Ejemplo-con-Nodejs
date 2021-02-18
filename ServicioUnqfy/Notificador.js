const rp = require('request-promise');

class Notificator {
    constructor() {
    }

    update(subject, data) {
        if (subject === 'agregarAlbum') {
            const BASE_URL = 'http://localhost:5000/api/notify';
            let options = {
                uri: BASE_URL,
                method: "POST",
                body: {
                    "artistId": data.artista.id,
                    "subject": "Nuevo Album para " + data.artista.name,
                    "message": "Se ha agregado un nuevo  album  al artista " + data.artista.name + " !!",
                    "from": ""// Agregar un mail con el cual mandar mensaje
                },
                json: true // Automatically parses the JSON string in the response
            };
            return rp(options).then((response) => {
             return   console.log("Mail mandado con exito") ;})
            .catch((error) => { console.log('algo salio mal', error); });
        }
        if (subject === 'deleteArtista') {
            const BASE_URL = 'http://localhost:5000/api/subscriptions';
            let options = {
                uri: BASE_URL,
                method: "DELETE",
                body: {
                    "artistId": data.artista.id,
                },
                json: true // Automatically parses the JSON string in the response
            };
            return rp(options).then((response) => {
             return   console.log("Se elimino el artista y sus subscriptores con exito") ;})
            .catch((error) => { console.log('algo salio mal', error); });
        }


    }
}

module.exports = Notificator;

