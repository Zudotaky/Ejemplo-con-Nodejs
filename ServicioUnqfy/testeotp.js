const rp = require('request-promise');

class ServicioSpotify {

    conseguirIdArtista(artistName) {
        const options = {
            url: 'https://api.spotify.com/v1/search?q=%20' + artistName + '&type=artist',
            headers: { Authorization: 'Bearer ' + '' /* apikey para spotify */ }, 
            json: true,
        };
        return rp.get(options).then((response) =>  {  return (response.artists.items[0].id); });
    }


    getAlbumesConId(id) {
        const options = {
            url: 'https://api.spotify.com/v1/artists/' + id + '/albums?include_groups=single&market=ES',
            headers: { Authorization: 'Bearer ' + '' /* apikey para spotify */ },  
            json: true,
        };
        return rp.get(options).then((response) => { return (response); });
    }


    populateAlbumsForArtist(artistName) {
        return this.conseguirIdArtista(artistName).then(response => this.getAlbumesConId(response)).then(response2 => {return(response2);});
          
    }

}

module.exports = ServicioSpotify;



