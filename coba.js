const express = require( 'express' );
const path = require( 'path' );
const axios = require( 'axios' );
const redis = require( 'redis' );
const Sequelize = require( 'sequelize' );
const Op = Sequelize.Op;

const app = express();
const port = 3000;

app.use( express.json( {
	limit: 1024 * 1024 * 20
} ) );
app.use( express.urlencoded( {
	extended: false,
	limit: '50mb'
} ) );

const Barang = require( './models' ).Barang;
const redisPort = 6379;
const client = redis.createClient( redisPort );
client.on( "error", ( err ) => {
	console.log( err );
} );
app.get( "/jobs", ( req, res ) => {
	const {
		searchTerm
	} = req.query;
	console.log( searchTerm );
	try {
		client.get( searchTerm, async ( err, jobs ) => {
			if ( err ) throw err;
			if ( jobs ) {
				res.status( 200 ).send( {
					jobs: JSON.parse( jobs ),
					msg: 'from cache'
				} )
			} else {
				const jobs = await Barang.findAll( {
					where: {
						nama_barang: {
							[ Op.like ]: '%' + searchTerm + '%'
						}
					}
				} )
				client.setex( searchTerm, 600, JSON.stringify( jobs ) );
				res.status( 200 ).send( {
					jobs: jobs,
					msg: 'cache miss'
				} )
			}
		} )
	} catch ( e ) {
		res.status( 500 ).send( {
			msg: e.message
		} )
	}
} )
app.listen( port, () => console.log( `http://localhost:3000` ) )

module.exports = app;