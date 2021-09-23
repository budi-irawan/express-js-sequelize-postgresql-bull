const express = require( 'express' );
const multer = require( 'multer' );

const {
	resolve
} = require( 'path' );

const {
	existsSync,
	unlink
} = require( 'fs' );

// const path = require( 'path' );
// const fs = require( 'fs' );

// const storage = multer.diskStorage( {
// 	destination: ( req, file, cb ) => {
// 		cb( null, './public/foto/' );
// 	},
// 	filename: ( req, file, cb ) => {
// 		// cb( null, file.originalname );
// 		// console.log( file );
// 		if ( fs.existsSync( './public/foto/', file.originalname ) ) {
// 			console.log( 'sudah ada' );
// 		} else {
// 			cb( null, file.originalname )
// 		}
// 	}
// } );

const storage = multer.diskStorage( {
	destination: ( req, file, done ) => {
		// console.log( process.cwd() );
		if ( !file ) return done( new Error( 'Upload file error' ), null );
		const fileExits = existsSync( resolve( process.cwd(), `public/foto/${file.originalname}` ) );
		console.log( fileExits );
		if ( !fileExits ) {
			console.log( 'belum ada' );
			return done( null, resolve( process.cwd(), 'public/foto' ) );
		}

		unlink( resolve( process.cwd(), `public/foto/${file.originalname}` ), ( error ) => {
			if ( error ) return done( error )
			return done( null, resolve( process.cwd(), 'public/foto' ) )
		} );
	},
	filename: ( req, file, done ) => {
		if ( file ) {
			const extFile = file.originalname.replace( '.', '' )
			const extPattern = /(jpg|jpeg|png|gif|svg)/gi.test( extFile )
			if ( !extPattern ) return done( new TypeError( 'File format is not valid' ), null )
			req.photo = file.originalname;
			return done( null, file.originalname )
		}
	}
} );

const upload = multer( {
	storage: storage
} );

module.exports = {
	upload,
	storage
};