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
    cb(null, './uploads/'+req.body.acid+'/');
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});


var upload    =   multer( { storage: storage } );
var uploadForEditor    =   multer( { dest: 'uploads/editorImages/' } );

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

app.post( '/uploadForEditor', uploadForEditor.single( 'upload' ), function( req, res, next ) {
	console.log( 'upload' );
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

	return res.status( 200 ).send( '<script>window.parent.CKEDITOR.tools.callFunction("1", "http://apitest.u815.co.kr:48888/editorImages/'+req.file.filename+'", "이미지가 업로드 되었습니다.")</script>');
});

app.get( '/delete', function( req, res) {
	console.log( 'delete' );
	console.log(req.query.filename);
	fs.unlinkSync("uploads/"+req.query.acid+"/"+req.query.filename);
	return res.status( 200 ).json({"result":"success"});
});



var options = {
	cert: fs.readFileSync('certs/STAR.iuicrm.com.pfx.crt'),
	key: fs.readFileSync('certs/STAR.iuicrm.com.pfx.key')
};

https.createServer(options, app).listen(28888, function(){
	console.log("Express Https server listening on port " + 28888);
});
