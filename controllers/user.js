const Bcrypt = require( '../helper/bcrypt' );
const Jwt = require( '../helper/jwt' );
const RoleModel = require( '../models' ).Role;
const UserModel = require( '../models' ).User;
const kirimEmail = require( '../helper/kirimEmail' );
const randomBytes = require( 'randombytes' );

class UserController {
	static register( req, res ) {
		const {
			nama,
			email,
			password,
			nama_role
		} = req.body;
		if ( !nama || !email || !password || !nama_role ) {
			res.status( 200 ).send( {
				pesan: 'field tidak boleh kosong'
			} )
		} else if ( password.length < 4 ) {
			res.status( 200 ).send( {
				pesan: 'password minimal 4 karakter'
			} )
		} else {
			let token;
			let inputToken = {};
			inputToken.email = req.body.email;
			Jwt.buatToken( inputToken, ( hasilToken ) => {
				token = hasilToken
			} );

			Bcrypt.buatPassword( req.body.password, ( err, password ) => {
				RoleModel
					.findOne( {
						where: {
							nama_role: req.body.nama_role
						}
					} )
					.then( role => {
						if ( role ) {
							UserModel
								.create( {
									nama: req.body.nama,
									email: req.body.email,
									password: password,
									status: false,
									id_role: role.id,
									confirmation_code: token,
									reset_token: null,
									expire_token: null
								} )
								.then( user => {
									if ( user ) {
										res.status( 201 ).send( {
											pesan: 'Registrasi berhasil, silahkan cek email anda untuk verifikasi pendaftaran'
										} );
										kirimEmail.sendEmailUser( user.email, user.confirmation_code )
									}
								} )
								.catch( error => res.status( 500 ).send( error ) )
						}
					} )
					.catch( error => res.status( 500 ).send( error ) )
			} )
		}
	}

	static login( req, res ) {
		const {
			email,
			password
		} = req.body;
		if ( !email || !password ) {
			res.status( 200 ).send( {
				pesan: 'field tidak boleh kosong'
			} )
		} else {
			UserModel
				.findOne( {
					where: {
						email: req.body.email
					}
				} )
				.then( user => {
					if ( user ) {
						if ( user.status == false ) {
							res.status( 200 ).send( {
								pesan: 'Anda belum verifikasi email'
							} )
						} else {
							Bcrypt.bandingkanPassword( req.body.password, user.password, ( err, hasil ) => {
								if ( hasil ) {
									let token = {};
									token.id = user.id;
									token.email = user.email;

									Jwt.buatToken( token, ( hasil ) => {
										res.status( 200 ).send( {
											status: 'Login berhasil',
											token: hasil
										} )
									} )
								} else {
									res.status( 200 ).send( {
										pesan: 'Password salah'
									} )
								}
							} )
						}
					} else {
						res.status( 200 ).send( {
							pesan: 'Email belum terdaftar'
						} )
					}
				} )
				.catch( error => res.status( 500 ).send( error ) )
		}
	}

	static getProfil( req, res ) {
		Jwt.cekToken( req.headers.token, ( err, decoded ) => {
			if ( err ) {
				res.status( 200 ).send( {
					pesan: 'Token tidak ada'
				} )
			} else {
				return UserModel
					.findOne( {
						where: {
							email: decoded.email
						}
					} )
					.then( customer => {
						res.status( 200 ).send( customer );
					} )
					.catch( error => res.status( 500 ).send( error ) )
			}
		} )
	}

	static aktivasi( req, res ) {
		return UserModel
			.findOne( {
				where: {
					confirmation_code: req.params.confirmation_code
				}
			} )
			.then( user => {
				if ( !user ) {
					return res.status( 200 ).send( {
						pesan: 'Kode tidak valid'
					} )
				}
				return user
					.update( {
						status: 1
					} )
					.then( user => res.status( 201 ).send( {
						pesan: 'Anda sudah aktivasi , silahkan login'
					} ) )
			} )
			.catch( error => res.status( 500 ).send( error ) )
	}

	static lupaPassword( req, res ) {
		randomBytes( 16, ( err, hasil ) => {
			if ( err ) {
				console.log( err );
			}
			const tokenReset = hasil.toString( "hex" );

			return UserModel
				.findOne( {
					where: {
						email: req.body.email
					}
				} )
				.then( user => {
					if ( !user ) {
						return res.status( 422 ).send( {
							pesan: 'Email tidak valid'
						} )
					}
					return user
						.update( {
							reset_token: tokenReset,
							expire_token: Date.now() + 3600000
						} )
						.then( user => {
							res.status( 201 ).send( {
								pesan: 'Cek email anda untuk melakukan pengaturan ulang password'
							} );
							kirimEmail.ubahPasswordUser( user.email, user.reset_token );
						} )
						.catch( error => res.status( 500 ).send( error ) )
				} )
				.catch( error => res.status( 500 ).send( error ) )
		} )
	}

	static ubahPassword( req, res ) {
		return UserModel
			.findOne( {
				where: {
					reset_token: req.params.token
				}
			} )
			.then( user => {
				if ( user ) {
					Bcrypt.buatPassword( req.body.password, ( err, passwordHash ) => {
						return user
							.update( {
								password: passwordHash,
								reset_token: null,
								expire_token: null
							} )
							.then( user => {
								res.status( 201 ).send( {
									pesan: 'Password berhasil diubah'
								} )
							} )
							.catch( error => res.status( 500 ).send( error ) )
					} )
				}
			} )
			.catch( error => res.status( 500 ).send( error ) )
	}

	static read( req, res ) {
		return UserModel
			.findAll()
			.then( user => {
				if ( !user ) {
					return res.status( 200 ).send( {
						pesan: 'belum ada user'
					} )
				}
				return res.status( 200 ).send( user );
			} )
			.catch( error => res.status( 500 ).send( error ) )
	}

	static delete( req, res ) {
		return UserModel
			.findByPk( req.params.id )
			.then( ( user ) => {
				if ( !user ) {
					return res.status( 200 ).send( {
						pesan: 'user tidak ada'
					} )
				}
				return user
					.destroy()
					.then( user => {
						return res.status( 200 ).send( {
							pesan: 'user berhasil dihapus'
						} )
					} )
					.catch( error => res.status( 500 ).send( error ) )
			} )
			.catch( error => res.status( 500 ).send( error ) )
	}
}

module.exports = UserController;