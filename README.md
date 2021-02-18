# Este es un trabajo echo para la facultad de la UNQ para la materia Taller Servicios Web
este trabajo esta echo por mi Julian Rybczuk y mi compañero Federico Schvemler


LISTA DE COMANDOS DISPONIBLES

Comando para agregar un artista: node main.js addArtist "Gorillaz" "UK"

Comando para agregar un album: node main.js addAlbum "Gorillaz" "Plastic Beach" "2010"

Comando para agregar un track: node main.js addTrack "Plastic Beach" "On Melancholy Hill" "228" "Rock Alternativo"

Comando para buscar artista por nombre: node main.js getArtistByName "Gorillaz" 

Comando para buscar album por nombre de album: node main.js getAlbumByName "Plastic Beach" 

Comando para buscar track por nombre de track: node main.js getTrackByName "On Melancholy Hill"

Comando para ver los tracks de un artista: node main.js getTracksMatchingArtist "Gorillaz" 

Comando para ver los tracks de un determinado genero: node main.js getTracksMatchingGenres "Rock Alternativo"

Comando para crear una playlist con ese nombre, con tracks de ese género y con esa duración:                                              node main.js addPlaylist "PlayListGorillaz" "Rock Alternativo" "1400"

Comando para buscar Playlist por nombre de Playlist: node main.js getPlaylistByName "PlayListGorillaz" 

Comando para listar tracks de una PlayList a partir de su nombre : node main.js getTracksPlaylist "PlayListGorillaz" 

<a href="https://i.imgur.com/J2aAP4S.png"><img src="https://i.imgur.com/J2aAP4S.png" /></a>



SETUP PREVIO PARA PROBAR COMANDOS:

  node main.js addArtist "Gorillaz" "UK"
  
  node main.js addArtist "Metallica" "USA"
  
  node main.js addArtist "PearlJam" "USA"
  
  node main.js addAlbum "Gorillaz" "Plastic Beach" "2010"
  
  node main.js addAlbum "Metallica" "Ride the Lightning" "1984"
  
  node main.js addAlbum "PearlJam" "Ten" "1991"
  
  node main.js addTrack "Plastic Beach" "On Melancholy Hill" "228" "Rock Alternativo"
  
  node main.js addTrack "Ride the Lightning" "Fade To Black" "415" "Thrash Metal"
  
  node main.js addTrack "Ten" "Jeremy" "319" "Grunge"
