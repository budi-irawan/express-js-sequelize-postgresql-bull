const BarangMasukModel = require( '../models' ).BarangMasuk;
const BarangModel = require( '../models' ).Barang;
const UserModel = require( '../models' ).User;
const HelperJwt = require( '../helper/jwt' );
const Redis = require( '../config/redisConfig' );

class BarangMasuk {
	static create( req, res ) {
		HelperJwt.cekToken( req.headers.token, ( err, user ) => {
			if ( err ) {
				return res.status( 200 ).send( {
					pesan: 'token tidak valid'
				} )
			} else {
				// console.log( user );
				return BarangModel
					.findOne( {
						where: {
							nama_barang: req.body.nama_barang
						}
					} )
					.then( barang => {
						if ( !barang ) {
							return res.status( 200 ).send( {
								pesan: 'barang belum ada'
							} )
						}
						// console.log( barang );
						const qty = parseInt( barang.stok );
						const qty2 = parseInt( req.body.jumlah )
						return barang
							.update( {
								stok: qty + qty2
							} )
							.then( barang => {
								return BarangMasukModel
									.create( {
										id_barang: barang.id,
										jumlah_masuk: req.body.jumlah,
										id_user: user.id
									} )
									.then( barangmasuk => {
										return res.status( 201 ).send( barangmasuk )
									} )
									.catch( error => res.status( 500 ).send( error ) )
							} )
							.catch( error => res.status( 500 ).send( error ) )
					} )
					.catch( error => res.status( 500 ).send( error ) )
			}
		} )
	}

	static async read( req, res ) {
		const redis_key = "data_barang_masuk";
		const {
			reply
		} = await Redis.get( redis_key );

		if ( reply ) {
			console.log( "Ambil data dari cache" );
			res.status( 200 ).send( {
				status: "data dari cache",
				data: JSON.parse( reply )
			} );
		} else {
			console.log( "Ambil data dari database" );
			return BarangMasukModel
				.findAll( {
					include: [ {
						model: BarangModel,
						as: 'barang'
					} ]
				} )
				.then( barangmasuk => {
					// console.log( barangmasuk );
					if ( barangmasuk.rowCount == 0 ) {
						res.status( 200 ).send( {
							pesan: 'belum ada barang masuk'
						} )
					}
					Redis.set( redis_key, JSON.stringify( barangmasuk ) );
					res.status( 200 ).send( barangmasuk )
				} )
				.catch( error => res.status( 500 ).send( error ) )
		}
	}
}

module.exports = BarangMasuk;