const picklejs = require('picklejs');


class Notify{
    constructor(){
        this.listaArtistas= [];
        this.listaArtistas.push(new Artista(1));
    }

    subscribirUsuarioAArtista(idArtista, email){
        let artistaASubscribir = this.listaArtistas.find(artista => artista.id ==  idArtista);
        if (artistaASubscribir){
            artistaASubscribir.suscribirUsuariosSubscriptos(email);
        }
        else{
            this.listaArtistas.push(new Artista(idArtista));
            this.listaArtistas.find(artista => artista.id ==  idArtista).usuariosSubscriptos.push(email);
        }
    }

    desubscribirUsuarioAArtista(idArtista, email){
        let artista = this.listaArtistas.find(artista => artista.id ==  idArtista);
        artista.usuariosSubscriptos.splice(artista.usuariosSubscriptos.findIndex(mail => mail == email),1);
    }

    listarSubscripciones(idArtista){
        return  this.listaArtistas.find(artista => artista.id ==  idArtista);
    }

    eliminarSubscripcionesArtista(idArtista){
        this.listaArtistas.find(artista => artista.id ==  idArtista).usuariosSubscriptos = [];
    }

    notificarUsuariosSubscriptosAArtista(idArtista,mailFrom,subjet,text){

    }

    save(filename = 'Notify_persistido') {
        new picklejs.FileSerializer().serialize(filename, this);
      }
    
      static load(filename = 'Notify_persistido') {
        const fs = new picklejs.FileSerializer();
        // TODO: Agregar a la lista todas las clases que necesitan ser instanciadas
        const classes = [Notify, Artista, Usuario];
        fs.registerClasses(...classes);
        return fs.load(filename);
      }
    }


class Usuario {
    constructor(_email){
      this.mail = _email;
    }
}



class Artista{
    constructor(_id){
        this.id = _id;
        this.usuariosSubscriptos = [];
    }
    suscribirUsuariosSubscriptos(newSubcripto){
        if(!this.usuariosSubscriptos.find(subcriptos => subcriptos = newSubcripto)){
            this.usuariosSubscriptos.push(newSubcripto);
        }
    }

    
}

module.exports = {
    Notify,
  };