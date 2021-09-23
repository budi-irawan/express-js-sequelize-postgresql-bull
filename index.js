const express = require( 'express' );
const path = require( 'path' );
const redis = require( 'redis' );

const indexRouter = require( './routes/index' );

const app = express();
const port = 3000;

app.use( express.json( {
	limit: 1024 * 1024 * 20
} ) );
app.use( express.urlencoded( {
	extended: false,
	limit: '50mb'
} ) );

app.use( '/', indexRouter );

app.use( ( req, res, next ) => {
	res.status( 404 ).send( {
		error: 'Not Found'
	} )
} );

app.use( '/public/produk', express.static( 'public/produk' ) );

app.listen( port, () => console.log( `http://localhost:3000` ) )

module.exports = app;