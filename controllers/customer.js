const Bcrypt = require( '../helper/bcrypt' );
const Jwt = require( '../helper/jwt' );
const Customer = require( '../models' ).Customer;
const BarangKeluar = require( '../models' ).BarangKeluar;
const Barang = require( '../models' ).Barang;
const kirimEmail = require( '../helper/kirimEmail' );
const randomBytes = require( 'randombytes' );
const {
	isEmailValid
} = require( '../helper/validEmail' );
const Sequelize = require( 'sequelize' );
const Op = Sequelize.Op;

class CustomerController {
	static register( req, res ) {
		return Customer
			.findAll()
			.then( customer => {
				for ( let i = 0; i < customer.length; i++ ) {
					if ( customer[ i ].email == req.body.email ) {
						return res.status( 200 ).send( {
							pesan: 'Email sudah terdaftar'
						} );
					}
				}
				const {
					nama,
					alamat,
					email,
					password
				} = req.body;
				console.log( isEmailValid( email ) );
				if ( !nama || !alamat || !email || !password ) {
					return res.status( 200 ).send( {
						pesan: 'field tidak boleh kosong'
					} )
				} else if ( isEmailValid( email ) == false ) {
					return res.status( 200 ).send( {
						pesan: 'email tidak valid'
					} )
				} else if ( password.length < 4 ) {
					return res.status( 200 ).send( {
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
						return Customer
							.create( {
								nama: req.body.nama,
								alamat: req.body.alamat,
								email: req.body.email,
								password: password,
								status: false,
								confirmation_code: token,
								reset_token: null,
								expire_token: null
							} )
							.then( customer => {
								if ( customer ) {
									res.status( 201 ).send( {
										pesan: 'Registrasi berhasil, silahkan cek email anda untuk verifikasi pendaftaran'
									} );
									kirimEmail.sendEmail( customer.email, customer.confirmation_code )
								}
							} )
							.catch( error => res.status( 500 ).send( error ) )
					} )
				}
			} )
			.catch( error => res.status( 500 ).send( error ) )
	}

	static login( req, res ) {
		// console.log( req.body );
		const {
			email,
			password
		} = req.body;
		if ( !email || !password ) {
			return res.status( 200 ).send( {
				pesan: 'field tidak boleh kosong'
			} )
		} else {
			return Customer
				.findOne( {
					where: {
						email: req.body.email
					}
				} )
				.then( customer => {
					if ( customer ) {
						if ( customer.status == false ) {
							return res.status( 200 ).send( {
								pesan: 'Anda belum verifikasi email'
							} )
						} else {
							Bcrypt.bandingkanPassword( req.body.password, customer.password, ( err, hasil ) => {
								if ( hasil ) {
									let token = {};
									token.id = customer.id;
									token.email = customer.email;

									Jwt.buatToken( token, ( hasil ) => {
										res.status( 200 ).send( {
											status: 'Login berhasil',
											token: hasil
										} )
									} )
								} else {
									res.status( 200 ).send( {
										pesan: 'password salah'
									} )
								}
							} )
						}
					} else {
						res.status( 200 ).send( {
							pesan: 'email belum terdaftar'
						} )
					}
				} )
				.catch( error => res.status( 500 ).send( error ) )
		}
	}

	static getProfil( req, res ) {
		Jwt.cekToken( req.headers.token, ( err, decoded ) => {
			if ( err ) {
				return res.status( 200 ).send( {
					pesan: 'token tidak ada'
				} )
			} else {
				return Customer
					.findOne( {
						where: {
							email: decoded.email
						}
					} )
					.then( customer => {
						return res.status( 200 ).send( customer )
					} )
					.catch( error => res.status( 500 ).send( error ) )
			}
		} )
	}

	static aktivasi( req, res ) {
		return Customer
			.findOne( {
				where: {
					confirmation_code: req.params.confirmation_code
				}
			} )
			.then( customer => {
				if ( !customer ) {
					return res.status( 200 ).send( {
						pesan: 'Kode tidak valid'
					} )
				}
				return customer
					.update( {
						status: 1
					} )
					.then( customer => res.status( 201 ).send( {
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

			return Customer
				.findOne( {
					where: {
						email: req.body.email
					}
				} )
				.then( customer => {
					if ( !customer ) {
						return res.status( 422 ).send( {
							pesan: 'Email tidak valid'
						} )
					}
					return customer
						.update( {
							reset_token: tokenReset,
							expire_token: Date.now() + 3600000
						} )
						.then( customer => {
							return res.status( 201 ).send( {
								pesan: 'Cek email anda untuk melakukan pengaturan ulang password'
							} );
							kirimEmail.ubahPassword( customer.email, customer.reset_token );
						} )
						.catch( error => res.status( 500 ).send( error ) )
				} )
				.catch( error => res.status( 500 ).send( error ) )
		} )
	}

	static ubahPassword( req, res ) {
		return Customer
			.findOne( {
				where: {
					reset_token: req.params.token
				}
			} )
			.then( customer => {
				if ( customer ) {
					Bcrypt.buatPassword( req.body.password, ( err, passwordHash ) => {
						return customer
							.update( {
								password: passwordHash,
								reset_token: null,
								expire_token: null
							} )
							.then( customer => {
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

	static loginGoogle( req, res ) {
		let token;
		let inputToken = {};
		inputToken.email = req.user.email;
		Jwt.buatToken( inputToken, ( hasilToken ) => {
			token = hasilToken
		} );

		return res.status( 200 ).json( {
			status: 'Login berhasil',
			token: token
		} );
	}

	static read( req, res ) {
		return Customer
			.findAll()
			.then( customer => {
				console.log( customer );
				if ( !customer ) {
					return res.status( 200 ).send( {
						pesan: 'belum ada customer'
					} )
				}
				return res.status( 200 ).send( customer )
			} )
			.catch( error => res.status( 500 ).send( error ) )
	}

	static delete( req, res ) {
		return Customer
			.findByPk( req.params.id )
			.then( customer => {
				if ( !customer ) {
					return res.status( 200 ).send( {
						pesan: 'customer tidak ada'
					} )
				}
				return customer
					.destroy()
					.then( customer => {
						return res.status( 200 ).send( {
							pesan: 'customer berhasil dihapus'
						} )
					} )
					.catch( error => res.status( 500 ).send( error ) )
			} )
			.catch( error => res.status( 500 ).send( error ) )
	}

	static search( req, res ) {
		const {
			nama
		} = req.query;
		if ( !nama ) {
			return res.status( 200 ).send( {
				pesan: 'masukkan nama customer'
			} )
		} else {
			return Customer
				.findAll( {
					where: {
						nama: {
							[ Op.like ]: '%' + nama + '%'
						}
					}
				} )
				.then( customer => {
					console.log( customer.length );
					if ( customer.length == 0 ) {
						return res.status( 200 ).send( {
							pesan: 'customer tidak ditemukan'
						} )
					}
					return res.status( 200 ).send( {
						status: 'success',
						jumlah: customer.length,
						data: customer
					} );
				} )
				.catch( error => res.status( 500 ).send( error ) )
		}
	}

	static riwayatTransaksi( req, res ) {
		Jwt.cekToken( req.headers.token, ( err, decoded ) => {
			if ( err ) {
				return res.status( 200 ).send( {
					pesan: 'token tidak ada'
				} )
			} else {
				return Customer
					.findOne( {
						where: {
							email: decoded.email
						}
					} )
					.then( customer => {
						return BarangKeluar
							.findAll( {
								where: {
									id_customer: customer.id
								},
								include: [ {
									model: Barang,
									as: 'barang'
								} ]
							} )
							.then( barangkeluar => {
								if ( barangkeluar.length == 0 ) {
									return res.status( 200 ).send( {
										pesan: 'belum ada catatan transaksi'
									} );
								}
								return res.status( 200 ).send( barangkeluar );
							} )
							.catch( error => res.status( 500 ).send( error ) )
					} )
					.catch( error => res.status( 500 ).send( error ) )
			}
		} )
	}
}

module.exports = CustomerController;