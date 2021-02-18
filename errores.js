class ArtistaRepetidoException extends Error {
    constructor(nombreArtista) {
      super();
      this.message = `El artista ${nombreArtista} ya existe`;
    }
}

 class ArtistaNoExisteException extends Error {
    constructor(nombreArtista) {
      super();
      this.message = `El artista ${nombreArtista} no existe`;
    }
}

  

    module.exports =  ArtistaRepetidoException, ArtistaNoExisteException;
  