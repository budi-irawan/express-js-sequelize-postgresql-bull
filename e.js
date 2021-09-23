const express = require( 'express' );
const multer = require( 'multer' );

const {
	resolve
} = require( 'path' );

const {
	existsSync,
	unlink
} = require( 'fs' );

const app = express();
const port = 3000;

app.use( express.json( {
	limit: 1024 * 1024 * 20
} ) );
app.use( express.urlencoded( {
	extended: false,
	limit: '50mb'
} ) );

app.use( ( req, res, next ) => {
	res.status( 404 ).send( {
		error: 'Not Found'
	} )
} );

const diskStorage = multer.diskStorage( {
	destination: ( req, file, done ) => {
		console.log( process.cwd() );
		if ( !file ) return done( new Error( 'Upload file error' ), null )
		const fileExits = existsSync( resolve( process.cwd(), `public/foto/${file.originalname}` ) )
		if ( !fileExits ) return done( null, resolve( process.cwd(), 'public/foto' ) )
		unlink( resolve( process.cwd(), `public/foto/${file.originalname}` ), ( error ) => {
			if ( error ) return done( error )
			return done( null, resolve( process.cwd(), 'public/foto' ) )
		} )
	},
	filename: ( req, file, done ) => {
		if ( file ) {
			const extFile = file.originalname.replace( '.', '' )
			const extPattern = /(jpg|jpeg|png|gif|svg)/gi.test( extFile )
			if ( !extPattern ) return done( new TypeError( 'File format is not valid' ), null )
			req.photo = file.originalname
			return done( null, file.originalname )
		}
	}
} );

const fileUpload = multer( {
	storage: diskStorage,
	limits: 1000000
} )

app.get( '/coba-upload', ( req, res ) => {
	res.status( 200 ).send( {
		msg: 'ok'
	} )
} )

app.use( '/public/produk', express.static( 'public/produk' ) );

app.listen( port, () => console.log( `http://localhost:3000` ) )

module.exports = app;