const fs = require('fs'); // necesitado para guardar/cargar unqfy
const unqmod = require('./unqfy');
const noti = require('./Notificador');


// Retorna una instancia de UNQfy. Si existe filename, recupera la instancia desde el archivo.
function getUNQfy(filename) {
    let unqfy = new unqmod.UNQfy();
    if (fs.existsSync(filename)) {
        console.log();
        unqfy = unqmod.UNQfy.load(filename);
    }
    unqfy.addListeners('agregarAlbum',new noti());
    unqfy.addListeners('deleteArtista',new noti());
    return unqfy;
}

// Guarda el estado de UNQfy en filename
function saveUNQfy(unqfy, filename) {
    console.log();
    unqfy.save(filename);
}


function throwException(res, e) {
    res.status(e.status).send(e);
  }
  class ApiException extends Error {
    constructor(name, statusCode, errorCode, message = null) {
    super(message || name);
    this.status = statusCode;
    this.errorCode = errorCode;
    }
 }

class ResourceAlreadyExist extends ApiException {
    constructor() {
        super('ResourceAlreadyExist',409, 'RESOURCE_ALREADY_EXISTS');
    }
}

class RelatedResourceNotFound extends ApiException {
    constructor() {
        super('RelatedResourceNotFound', 404, 'RELATED_RESOURCE_NOT_FOUND');
    }
}

class ResourceNotFound extends ApiException {
    constructor() {
        super('ResourceNotFound', 404, 'RESOURCE_NOT_FOUND');
    }
}

class BadRequest extends ApiException {
    constructor() {
        super('BadRequest', 400, 'BAD_REQUEST');
    }
}

class InternalServerError extends ApiException {
    constructor() {
        super('InternalServerError', 500, 'INTERNAL_SERVER_ERROR');
    }
}

function errorHandler(err, req, res, next) {
    console.error(err.name); // imprimimos el error en consola
    // Chequeamos que tipo de error es y actuamos en consecuencia
    if (err instanceof ApiException){
      res.status(err.status);
      res.json({status: err.status, errorCode: err.errorCode});
    } else if (err.type === 'entity.parse.failed'){
    // body-parser error para JSON invalido
      res.status(err.status);
      res.json({status: err.status, errorCode: 'BAD_REQUEST'});
    } else {
    // continua con el manejador de errores por defecto
      next(err);
      }
    }

let express = require('express'); // call express
let app = express(); // define our app using express
let router = express.Router();
let port = process.env.PORT || 5001; // set our port
let bodyParser = require('body-parser');

router.route('/artists')
    .get(function (req, res) {
        const unqfy = getUNQfy('UNQfy_persistido');
         if (req.query.name) {
           let artistas = unqfy.getArtistsByName(req.query.name);
           res.json(artistas);
        }
        let artistas = unqfy.listaDeArtistas;
        res.json(artistas);
    });
router.route('/artists/:id')
    .get(function (req, res) {
        const unqfy = getUNQfy('UNQfy_persistido');
        try {
            let artista = unqfy.getArtistById(req.params.id);
            res.json(artista);
        } catch (ArtistaNoExisteException) {
          throwException(res, new ResourceNotFound);
        }
 });
 router.route('/artists')
 .post(function (req, res) {
     const unqfy = getUNQfy('UNQfy_persistido');
     if(!req.body || !req.body.name || !req.body.country || req.body.name === undefined){
        throwException(res, new BadRequest);
     }else{
     try {
         unqfy.addArtist(req.body);
         saveUNQfy(unqfy, 'UNQfy_persistido');
     } catch (ArtistaRepetidoException) {
         throwException(res, new ResourceAlreadyExist); 
     }
    }
     res.json(unqfy.getArtistByName(req.body.name));
 });
router.route('/artists/:id')
    .delete(function (req, res) {
        const unqfy = getUNQfy('UNQfy_persistido');
        try {
            let artista = unqfy.getArtistById(req.params.id);
            unqfy.deleteArtist(req.params.id);
            saveUNQfy(unqfy, 'UNQfy_persistido');
        } catch (error) {
            
            throwException(res, new ResourceNotFound);   
        }
        res.json();
    });

router.route('/albums/')
    .post(function (req, res) {
        const unqfy = getUNQfy('UNQfy_persistido');
        if(req.body.artistId == undefined || !req.body.name || !req.body.year){
            throwException(res, new BadRequest);
        }else{
        try {
            unqfy.getArtistById(req.body.artistId);
            try{
                unqfy.agregarAlbum(req.body.artistId, { name: req.body.name, year: req.body.year });
                saveUNQfy(unqfy, 'UNQfy_persistido');
            }catch (AlbumYaExisteException){
                throwException(res, new ResourceAlreadyExist);
            }
        } catch (ArtistaNoExisteException) {
          throwException(res, new RelatedResourceNotFound);
        }
    }
        res.json(unqfy.getAlbumByName(req.body.name)); 
    });

router.route('/albums/:id')
    .get(function (req, res) {
        const unqfy = getUNQfy('UNQfy_persistido');
        try{
            let album = unqfy.getAlbumById(req.params.id);
            res.json(album);
        }catch (error) {
            throwException(res, new ResourceNotFound);
        }

    });

router.route('/albums/:id')
.delete(function (req, res) {
    const unqfy = getUNQfy('UNQfy_persistido');
    try{
        let album = unqfy.deleteAlbum(req.params.id);
        saveUNQfy(unqfy, 'UNQfy_persistido');
    }catch(err){
        throwException(res, new ResourceNotFound);
    }
    

    res.json();
});

router.route('/albums/')
    .get(function (req, res) {
        const unqfy = getUNQfy('UNQfy_persistido');
        let albums ;
        if(req.query.name){
            albums = unqfy.getAbumBypartName(req.query.name);
        }else{
            albums = unqfy.listadealbumes();
        }
        res.json(albums);
    });
router.use('/', (req, res) => {
throwException(res, new ResourceNotFound);   
});

app.use(bodyParser.json());
app.use('/api', router);
app.use(errorHandler);
app.listen(port);
    