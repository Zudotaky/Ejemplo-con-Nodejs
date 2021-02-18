//55cfe972c4aa0776d9d46382ee6e7122

const rp = require('request-promise');

class ServicioMusixMatch {
conseguirIdTrack( trackName){  
  const BASE_URL = 'http://api.musixmatch.com/ws/1.1';
  let options = {
    uri: BASE_URL + '/track.search',
    qs: {
      apikey: '55cfe972c4aa0776d9d46382ee6e7122',
      q_track: trackName,
    },
    json: true // Automatically parses the JSON string in the response
  };
  return rp.get(options).then((response) => {let header = response.message.header; let body = response.message.body;
    if (header.status_code !== 200){console.log('algo salio mal', response);return ;}
    let trackId = body.track_list[0].track.track_id;
    return trackId;
  }).catch((error) => {console.log('algo salio mal', error);});
}




 conseguirLetraDeTrack(idTrack){
  const BASE_URL = 'http://api.musixmatch.com/ws/1.1';
  let options = {
    uri: BASE_URL + '/track.lyrics.get',
    qs: {
      apikey: '' /* apikey para musixmatch */,
      track_id: idTrack,
    },
    json: true // Automatically parses the JSON string in the response
  };
  return rp.get(options).then((response) => {let header = response.message.header; let body = response.message.body;
    if (header.status_code !== 200){console.log('algo salio mal v', response);return ;}
    let trackLyric = body.lyrics.lyrics_body;
    return(trackLyric);
  }).catch((error) => {console.log('algo salio mal', error);});
}


 getLyrics( trackName){
    return this.conseguirIdTrack(trackName).then(response => this.conseguirLetraDeTrack(response)).then(response2 => {return(response2);});
}
}

module.exports = ServicioMusixMatch;

