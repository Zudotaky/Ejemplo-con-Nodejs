const fs = require('fs'); // necesitado para guardar/cargar unqfy
const notimod = require('./notify');
const rp = require('request-promise');
const nodemailer = require('nodemailer');


// Retorna una instancia de UNQfy. Si existe filename, recupera la instancia desde el archivo.
function getNotify(filename) {
    let notify = new notimod.Notify();
    if (fs.existsSync(filename)) {
        console.log();
        notify = notimod.Notify.load(filename);
    }
    return notify;
}

// Guarda el estado de UNQfy en filename
function saveNotify(notify, filename) {
    console.log();
    notify.save(filename);
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
let port = process.env.PORT || 5000; // set our port
let bodyParser = require('body-parser');


function conseguirIdArtista(artistaName){  
    const BASE_URL = 'http://api/artists';
    let options = {
      uri: BASE_URL + '?name=' + artistaName,
      json: true // Automatically parses the JSON string in the response
    };
    return rp.get(options).then((response) => {let header = response.message.header; let body = response.message.body;
      if (header.status_code !== 200){console.log('algo salio mal', response);return ;}
      let artistId = body[0].artist.id;
      return artistId;
    }).catch((error) => {console.log('algo salio mal', error);});
  }


function existeArtistaUnqFy(artistaId){  
  const BASE_URL = 'http://localhost:5001/api/artists/'+ artistaId;
  let options = {
    uri: BASE_URL ,
    json: true // Automatically parses the JSON string in the response
  };
  return rp.get(options).then(() => {return true;})
    .catch((response) => {
      if(response.error.status === 404 && response.error.errorCode === "RESOURCE_NOT_FOUND"){
        return false;
      }
      throw response.error;
    });
}



router.route('/subscriptions')
 .post(function (req, res) {
    const notify = getNotify('Notify_persistido');
    if(!req.body  || req.body.artistId === undefined){
        throwException(res, new BadRequest);
    }else{
      existeArtistaUnqFy(req.body.artistId).then(response => {
        try {
          if(!response){throwException(res,new ResourceNotFound);
          }else{
            let subscripciones = notify.listarSubscripciones(req.body.artistId);
            res.json(subscripciones);
        }}catch (error) {
          throwException(res, new InternalServerError);
        }
      });
    }
});  
 router.route('/subscribe')
 .post(function (req, res) {
     const notify = getNotify('Notify_persistido');
     if(!req.body  || !req.body.email || req.body.artistId === undefined){
        throwException(res, new BadRequest);
     }else{
    existeArtistaUnqFy(req.body.artistId).then(response => {
    try {
      if(!response){throwException(res,new ResourceNotFound);
    }else{
        notify.subscribirUsuarioAArtista(req.body.artistId, req.body.email);
        saveNotify(notify, 'Notify_persistido');
        res.json("200 ok");
      }
    }catch (error) {
        throwException(res, new InternalServerError);
    }
    });
 }});
 router.route('/notify')
 .post(function (req, res) {
     const notify = getNotify('Notify_persistido');
     if(!req.body || req.body.artistId === undefined || !req.body.subject || !req.body.message || !req.body.from){
        throwException(res, new BadRequest);
     }else{
         existeArtistaUnqFy(req.body.artistId).then(response => {
     try {
        if(!response){throwException(res,new ResourceNotFound);
        }else{
         mandarMail(req.body.from, notify.listarSubscripciones(req.body.artistId).usuariosSubscriptos,req.body.subject, req.body.message)
         .then(response => {           
              saveNotify(notify, 'Notify_persistido');
          return    res.json("200 ok");
         }).catch((error) => {
             
            throwException(res, new InternalServerError);}); 
        }
    }catch (error) {
         throwException(res, new InternalServerError); 
     }
    });
}});

 function mandarMail(from, to, subject, text){
     // create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // server para enviar mail desde gmail
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
    user: '', //mail
    pass: '', //contraseña de mail
    },
    });
    // setup email data with unicode symbols
    const mailOptions = {
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
   // html: '<b>Hello world?</b>' // html body
    };
    // enviando mail con promesas
   return transporter.sendMail(mailOptions) ;
 }
 
 router.route('/unsubscribe')
 .post(function (req, res) {
     const notify = getNotify('Notify_persistido');
     if(!req.body  || !req.body.email || req.body.artistId === undefined){
        throwException(res, new BadRequest);
     }else{
     existeArtistaUnqFy(req.body.artistId).then(response => {
    try {
        if (!response){throwException(res,new ResourceNotFound);
        }else{
            notify.desubscribirUsuarioAArtista(req.body.artistId, req.body.email);
            saveNotify(notify, 'Notify_persistido');
            res.json("200 ok");
        }
     } catch (error) {
         throwException(res, new InternalServerError); 
     }
    });}
 });

    
 router.route('/subscriptions')
 .delete(function (req, res) {
    const notify = getNotify('Notify_persistido');
    if(req.body.artistId === undefined){
      throwException(res, new BadRequest);
    }else{
    existeArtistaUnqFy(req.body.artistId).then(response => {
      try {
        if (!response){throwException(res,new ResourceNotFound);
        }else{
          notify.eliminarSubscripcionesArtista(req.body.artistId);
          saveNotify(notify, 'Notify_persistido');
          res.json("200 ok");
        }
      }catch (error) {
        throwException(res,new InternalServerError); 
      }
    });
    }
 });

router.use('/', (req, res) => {
throwException(res, new ResourceNotFound);   
});

app.use(bodyParser.json());
app.use('/api', router);
app.use(errorHandler);
app.listen(port);
    