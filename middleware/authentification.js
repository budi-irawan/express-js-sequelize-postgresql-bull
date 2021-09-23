const helperJwt = require( '../helper/jwt' );

class Authentification {
	static cekLogin( req, res, next ) {
		if ( req.headers.token ) {
			helperJwt.cekToken( req.headers.token, ( err, hasil ) => {
				if ( err ) {
					res.status( 200 ).send( {
						message: 'Token tidak valid'
					} )
				} else {
					req.user = hasil;
					console.log( hasil );
					next();
				}
			} )
		} else {
			res.status( 200 ).send( {
				message: 'Tidak ada token'
			} )
		}
	}
}

module.exports = Authentification;