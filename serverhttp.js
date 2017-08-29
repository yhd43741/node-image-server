var express   	=   require( 'express' );
var multer    	=   require( 'multer' );
var sizeOf    	=   require( 'image-size' );
var exphbs    	=   require( 'express-handlebars' );
var https	  	=   require('https');
var fs		 	=	require('fs');
var bodyParser  =   require('body-parser');
var path 		= 	require('path');
var crypto		= 	require('crypto');
var mime		= 	require('mime');
require( 'string.prototype.startswith' );

var app = express();
app.use(express.static('uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
  	console.log("===="+req.body.acid);
  	if (!fs.existsSync('./uploads/'+req.body.acid)){
    	fs.mkdirSync('./uploads/'+req.body.acid);
	}
    cb(null, './uploads/'+req.body.acid+'/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});

//var upload    =   multer( { dest: 'uploads/' } );
var upload    =   multer( { storage: storage } );

app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'cache-control, Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

	next();
});




app.post( '/upload', upload.single( 'file' ), function( req, res, next ) {
	console.log( 'upload' );
	console.log(req.body.acguid);
	if ( !req.file.mimetype.startsWith( 'image/' ) ) {
		return res.status( 422 ).json( {
		  error : 'The uploaded file must be an image'
		} );
	}

	var dimensions = sizeOf( req.file.path );

	if ( ( dimensions.width < 10 ) || ( dimensions.height < 10 ) ) {
		return res.status( 422 ).json( {
		  error : 'The image must be at least 10 x 10px'
		} );
	}

	return res.status( 200 ).send( req.file );
});


app.get( '/delete', function( req, res) {
	console.log( 'delete' );
	console.log(req.query.filename);
	fs.unlinkSync("uploads/"+req.query.acid+"/"+req.query.filename);
	return res.status( 200 ).json({"result":"success"});
});



app.use('/',express.Router());

app.listen(48888);
console.log("Listening to PORT 48888");