const rp = require('request-promise');
const Notificador = require('./Notificador');

const picklejs = require('picklejs');
const servicioSpotify = require('./testeotp');
const servicioMusixMatch = require('./testeoMusixMatchAPI');
const noti = require('./Notificador');


class Observable{
  constructor(){
    this.listeners= [];
  }
  change(subject, data){ 
    const listeners = this.listeners[subject] || [];
    listeners.forEach(listener => listener.update(subject, data));
  }
    
  addListeners(subject, listener){
    if (!(subject in this.listeners)){
      this.listeners[subject] = [];
    }
    this.listeners[subject].push(listener);
  } 
    
}

class Artista {
  constructor(_name, _country, id){
    this.name = _name;
    this.country = _country;
    this.listaDeAlbumesArtista= [];
    this.id = id;
  }
  
  agregarAlbum(album){
    this.listaDeAlbumesArtista.push(album);
  }
  getListaDeAlbumesPropia(){
    return this.listaDeAlbumesArtista;
  }
  buscarAlbum(albumName){
    return this.listaDeAlbumesArtista.find(album => album.name == albumName);
  }
  buscarAlbumId(albumId){
    return this.listaDeAlbumesArtista.find(album => album.id == albumId);
  }
  
  albumIdTePertenece(albumId){
    if(this.buscarAlbumId(albumId)){
      return this;
    } 
    return false;
  }

  buscarTrack(trackName){
    return this.listaDeAlbumesArtista.find(album => album.contieneTrack(trackName));
  }
  
  eliminarAlbum(id){
    this.listaDeAlbumesArtista.splice(this.listaDeAlbumesArtista.findIndex(album => album.id == id), 1);
  }
  

  toJSON(){
    return { id: this.id,
      name: this.name,
      albums: this.listaDeAlbumesArtista,
      country: this.country,
    };
  }

}

class Album{
  constructor( _nameAlbum, _yearAlbum, id_){
    // if () Que no explote si llegan parametros vacios
    this.name= _nameAlbum;
    this.year = _yearAlbum;
    this.listaDeTracks = [];   
    this.id = id_;
  }
  agregarTrack(track){
    this.listaDeTracks.push(track);
  }
  getListaDeTracksPropia(){
    return this.listaDeTracks;
  }
  contieneTrack(trackName){
    return this.listaDeTracks.find(track => track.name == trackName);
  }

  toJSON(){
    return { id: this.id,
      name: this.name,
      year: this.year,
      tracks: this.listaDeTracks,
    };
  }

}

class Track{
  constructor(_nameTrack, _duration, _genre){
    this.name = _nameTrack;
    this.duration = _duration;
    this.genre = _genre;
    this.lyric = null;
  }
  esDeEstosGeneros(_generos){
    let a = false;
    _generos.forEach(genero =>
      a = a || this.genre===genero
    );
    return a;
  }
  getDuracion(){
    return this.duration;
  }
  getLyrics(){
      return this.lyric;
  }
  addLyric(lyric_){
    if(!this.lyric){
      this.lyric = lyric_;
    }
  }


}

class Playlist{
  constructor( _namePlaylist,_maxDuration){
    this.name = _namePlaylist;
    this.listaTracks = [];
    this.maximaDuration = _maxDuration;
  }
  addTracks(_tracks){
    _tracks.forEach(_track =>
      this.addATrack(_track)
    );
  }
  addATrack(_track){
    //if(this.maximaDuration >= _track.getDuracion() + this.duration()){
    this.listaTracks.push(_track);//}
  }
  /* duration(){
    let a = 0;
    if(this.listaTracks.length !== 0){
      this.listaTracks.forEach(track => {
        a = a + track.getDuracion(); 
      });
    }
    return a;
  }*/
  duration() {
    return this.listaTracks.map(track => track.getDuracion())
      .reduce((duration1, duration2) => duration1 + duration2, 0);
  }

  hasTrack(_track){
    return this.listaTracks.includes(_track);
  }
  generarPlaylist(listaDeTemasPosibles , maxDuration){
    let listaTemas = listaDeTemasPosibles;
    while (listaTemas.lenght > 0 && this.duration()  < maxDuration){
      let numeroTrackRandom = this.numeroAleatorio(0,(listaTemas.lenght)-1);
      let trackRandom = listaTemas[numeroTrackRandom];
      this.addATrack(trackRandom);
      listaTemas= listaTemas.filter(track => track.name !== trackRandom.name);
    }
  }
  /*generarPlaylist(listaDeTemasPosibles, maxDuration) {
    listaDeTemasPosibles.forEach(track => {
      if ((this.duration() + track.duration) <= maxDuration) {
        this.addATrack(track);
      }
    });

  }*/
  

  numeroAleatorio(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }
}

class UNQfy extends Observable{

  constructor(){
    super();
    this.listaDeArtistas = [];
    this.listaDePlayList = [];
  }

  getTracksMatchingGenres(genres) {
    // Debe retornar todos los tracks que contengan alguno de los generos en el parametro genres
    const _tracks = [];
    this.listaDeArtistas.forEach(artista => artista.getListaDeAlbumesPropia().forEach(track => {
      if(track.esDeEstosGeneros(genres)){
        _tracks.push(track);
      }
    }));
    return _tracks;
  }
  getTracksMatchingArtist(artistName) {
    const tracks = [];
    const a = artistName.getListaDeAlbumesPropia();
    a.forEach(album => {
      album.getListaDeTracksPropia().forEach(track => tracks.push(track));
    });
    return tracks;
  }
  


  /* Debe soportar al menos:
     params.name (string)
     params.country (string)
  */
  addArtist(params) {
    // El objeto artista creado debe soportar (al menos) las propiedades name (string) y country (string)
    if (this.getArtistByName(params.name)){
      throw new ArtistaRepetidoException(params.name); 
    }
    let idArtista = (this.listaDeArtistas.length);
    const a = new Artista(params.name, params.country, idArtista );
    this.listaDeArtistas.push(a);
    this.change('addArtist', {unqfy: this, artista: a  });
  }


  /* Debe soportar al menos:
      params.name (string)
      params.year (number)
  */
  addAlbum(artistName, params) {
    // El objeto album creado debe tener (al menos) las propiedades name (string) y year
    if (this.getArtistByName(artistName) === null){
      throw new ArtistaNoExisteException(artistName); // throw new Error('Artista no existe')
    }
    else if((this.getArtistByName(artistName)).buscarAlbum(params.name)){
      throw new AlbumYaExisteException(params.name);
    }
    else {
      let idAlbum = 0;
      this.listaDeArtistas.forEach(artista => idAlbum = idAlbum + artista.listaDeAlbumesArtista.length);
      const b = new Album(params.name, params.year, idAlbum);
      console.log(b);
      let artista = this.getArtistByName(artistName);
      artista.agregarAlbum(b);
      this.change('addAlbum', {unqfy: this, artista: artista  });
    }
}

  agregarAlbum(artistid, params) {
  // El objeto album creado debe tener (al menos) las propiedades name (string) y year
  //  if (this.getArtistById(artistid) === null){
   //   throw new ArtistaNoExisteException(this.getArtistById(artistid).name); // throw new Error('Artista no existe')
   // }
    if((this.getArtistById(artistid)).buscarAlbum(params.name)){
      throw new AlbumYaExisteException(params.name);
    }  
      let idAlbum = 0;
      this.listaDeArtistas.forEach(artista => idAlbum = idAlbum + artista.listaDeAlbumesArtista.length);
      const b = new Album(params.name, params.year, idAlbum);
      let artista = this.getArtistById(artistid);
      artista.agregarAlbum(b);
      this.change('agregarAlbum', {unqfy: this, artista: artista  });
}



  /* Debe soportar (al menos):
       params.name (string)
       params.duration (number)
       params.genres (lista de strings)
  */
  addTrack(albumName, params) {
    /* El objeto track creado debe soportar (al menos) las propiedades:
         name (string),
         duration (number),
         genres (lista de strings)
    */
    if (this.getAlbumByName(albumName) === null){
      throw 'El Album no existe.';
    }
    else{
      const c = new Track(params.name, params.duration, params.genre);
      this.getAlbumByName(albumName).agregarTrack(c);
    }
  }
  

  getArtistByName(name) {
    return this.listaDeArtistas.find(artista => artista.name === name);
  }

  getAlbumByName(_name) {
    let artistaDeAlbum = this.listaDeArtistas.find(artista => artista.buscarAlbum(_name));
    return artistaDeAlbum.buscarAlbum(_name);
  }

  getTrackByName(name) {
    let albumes = this.listadealbumes();
    let albumTieneTrack = albumes.find(album => album.contieneTrack(name));
    return(albumTieneTrack.contieneTrack(name));
  }

  getPlaylistByName(name) {
    return this.listaDePlayList.find(playlist => playlist.name === name);
  }
  
  addPlaylist(name, genresToInclude, maxDuration) {
    /* El objeto playlist creado debe soportar (al menos):
      * una propiedad name (string)
      * un metodo duration() que retorne la duración de la playlist.
      * un metodo hasTrack(aTrack) que retorna true si aTrack se encuentra en la playlist
    */
    const playList = new Playlist(name, maxDuration);
    playList.generarPlaylist((this.getTracksMatchingGenres(genresToInclude)) , maxDuration);
    this.listaDePlayList.push(playList);
  }

  getTracksPlaylist(name){
    return this.getPlaylistByName(name).listaTracks.forEach(track => console.log(track));
  }



  getAlbumsForArtist(artistName) {
    let artista = this.listaDeArtistas.find(artist => artist.name === artistName);
    return artista.getListaDeAlbumesPropia();
  }
  
  populateAlbumsForArtist(artistName){
    let spotify = new servicioSpotify();
    spotify.populateAlbumsForArtist(artistName).then(response => {
      response.items.forEach(album => { this.addAlbum(artistName, { name: album.name, year: album.release_date });});
    }).then(response => this.save());
  }

  getLyricsForTrack(trackName){
    let track = this.getTrackByName(trackName);
    let servicioMusic = new servicioMusixMatch();
    servicioMusic.getLyrics(trackName).then(response => {
        track.addLyric(response) ;}).then(response => this.save('UNQfy_persistido'));
    console.log(track.getLyrics());
    //return track.getLyrics();
  }

  getArtistById(_id){
    let artista = this.listaDeArtistas.find(artista => artista.id == _id);
    if (artista){
      return artista; 
    }
    else {   
      throw  new ArtistaNoExisteException();
    }

  }
  deleteArtist(id){
    let artistaAEliminar= this.getArtistById(id);
    this.listaDeArtistas.splice(this.listaDeArtistas.findIndex(artista => artista.id == id), 1);
    this.change('deleteArtista', {unqfy: this, artista: artistaAEliminar  });
  }

  getAlbumById(id){
    if(! this.listaDeArtistas.find(artista => artista.buscarAlbumId(id))){
      throw  new AlbumConIdNoExisteException(id);
    }
    let artista = this.listaDeArtistas.find(artista => artista.buscarAlbumId(id));
    return artista.buscarAlbumId(id);
  }

  deleteAlbum(id){
    if(!this.listaDeArtistas.find(artista => artista.buscarAlbumId(id))){
      throw  new AlbumConIdNoExisteException(id);
    }
    let nombreBanda = this.listaDeArtistas.find(artista => artista.albumIdTePertenece(id)).name;
    (this.getArtistByName(nombreBanda)).eliminarAlbum(id);
  }
  listadealbumes(){
    let listaDeAlbunes = [];
    this.listaDeArtistas.forEach(artista => artista.getListaDeAlbumesPropia().forEach(album => listaDeAlbunes.push(album)));
    return listaDeAlbunes;
  }
  getArtistsByName(name){
    let artistasCumplen = [];
    this.listaDeArtistas.forEach(artista => this.contienePalabra(artista,name,artistasCumplen));
    return artistasCumplen;
  }

  getAbumBypartName(name){
    let albumCumplen = [];
    this.listadealbumes().forEach(album => this.contienePalabra(album,name,albumCumplen));
    return albumCumplen;
  }


  contienePalabra(artista, palabra, variableADevolver){
  if(artista.name == palabra || artista.name.toLowerCase().includes(palabra)){
      variableADevolver.push(artista);
    }
  }
  save(filename = 'UNQfy_persistido') {
    let backUp = this.listeners;
    this.listeners = [];
    new picklejs.FileSerializer().serialize(filename, this);
    this.listeners = backUp;
  }

  static load(filename = 'UNQfy_persistido') {
    const fs = new picklejs.FileSerializer();
    // TODO: Agregar a la lista todas las clases que necesitan ser instanciadas
    const classes = [UNQfy, Artista, Album, Track, Playlist];
    fs.registerClasses(...classes);
    return fs.load(filename);
  }
}

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

class AlbumYaExisteException  extends Error {
  constructor(nombreAlbum) {
    super();
    this.message = `El album ${nombreAlbum} ya existe`;
  }
}

class AlbumConIdNoExisteException  extends Error {
  constructor(idAlbum) {
    super();
    this.message = `El album con id ${idAlbum} no existe`;
  }
}



// TODO: exportar todas las clases que necesiten ser utilizadas desde un modulo cliente
module.exports = {
  UNQfy,
};

  
