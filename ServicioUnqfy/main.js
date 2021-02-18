

const fs = require('fs'); // necesitado para guardar/cargar unqfy
const unqmod = require('./unqfy');

// Retorna una instancia de UNQfy. Si existe filename, recupera la instancia desde el archivo.
function getUNQfy(filename) {
  let unqfy = new unqmod.UNQfy();
  if (fs.existsSync(filename)) {
    console.log();
    unqfy = unqmod.UNQfy.load(filename);
  }
  return unqfy;
}

// Guarda el estado de UNQfy en filename
function saveUNQfy(unqfy, filename) {
  console.log();
  unqfy.save(filename);
}

function main() {
  console.log('arguments: ');
  const a =  process.argv.slice(2);
  a.forEach(argument => console.log(argument));

  const unqfy = getUNQfy('UNQfy_persistido');

  switch(process.argv[2]){
  case 'addArtist':  
    unqfy.addArtist({name: process.argv[3], country: process.argv[4] });
    console.log('Artista creado exitosamente');
    break;

  case 'addAlbum': 
    unqfy.addAlbum(process.argv[3], {name: process.argv[4], year: process.argv[5]});
    console.log('Album creado exitosamente');
    break;
    
  case 'addTrack':
    unqfy.addTrack(process.argv[3], {name: process.argv[4], duration: process.argv[5], genre: process.argv[6]});
      console.log('Track creado exitosamente');
      break;

  case 'getArtistByName':
    unqfy.getArtistByName(process.argv[3]) === undefined ? console.log('Ese artista no existe en Unqfy') :
      console.log(unqfy.getArtistByName(process.argv[3]));
    break;

  case 'getAlbumByName':
    unqfy.getAlbumByName(process.argv[3]) === undefined ? console.log('Ese album no existe en Unqfy') :
      console.log(unqfy.getAlbumByName(process.argv[3]));
    break;

  case 'getTrackByName':
    unqfy.getTrackByName(process.argv[3]) === undefined ? console.log('Ese Track no existe en Unqfy') :
      console.log(unqfy.getTrackByName(process.argv[3]));
    break;

  case 'getTracksMatchingArtist':
    unqfy.getArtistByName(process.argv[3]) === undefined ? console.log('Ese artista no existe en Unqfy') :
      console.log(unqfy.getTracksMatchingArtist(process.argv[3]));
    break;  
  
  case 'getTracksMatchingGenres':
    unqfy.getTracksMatchingGenres([process.argv[3]]) === undefined ? console.log('No existen tracks con ese genero') :
      console.log(unqfy.getTracksMatchingGenres([process.argv[3]]));
    break;

  case 'addPlaylist':
    unqfy.addPlaylist(process.argv[3],[process.argv[4]],process.argv[5]);
    console.log('PlayList creada exitosamente');
    break; 
    
  case 'getPlaylistByName':
    console.log(unqfy.getPlaylistByName(process.argv[3]));
    break;  
  
  case 'getArtistsByName':
    console.log(unqfy.getArtistsByName(process.argv[3]));
    break;
  case 'getTracksPlaylist':
    unqfy.getPlaylistByName(process.argv[3]) === undefined ? console.log('No existe esa PlayList') :
      console.log(unqfy.getTracksPlaylist(process.argv[3]));
    break;

    case 'getAlbumsForArtist':
    console.log(unqfy.getAlbumsForArtist(process.argv[3]));
    break;

    case 'getArtistById':
    console.log(unqfy.getArtistById(process.argv[3]));
    break;

    case 'deleteAlbum':
    console.log(unqfy.deleteAlbum(process.argv[3]));
    break;

    case 'getAlbumById':
    console.log(unqfy.getAlbumById(process.argv[3]));
    break;

    case 'populateAlbumsForArtist':
    unqfy.populateAlbumsForArtist((process.argv[3]));
    break;

    case 'getLyricsForTrack':
    unqfy.getLyricsForTrack((process.argv[3]));
    break;



    default:
    console.log('Ese comando no existe');
    break;
  }
  
  saveUNQfy(unqfy, 'UNQfy_persistido');
}

main();


