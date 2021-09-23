const nodemailer = require( 'nodemailer' );
require( "dotenv" ).config();

const transporter = nodemailer.createTransport( {
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	requireTLS: true,
	auth: {
		user: process.env.MAIL,
		pass: process.env.PASS,
	}
} )

const sendEmail = ( email, confirmationCode ) => {
	const options = {
		from: "'Inventory-Server' <no-reply@gmail.com>",
		to: email,
		subject: "Verifikasi Pendaftaran",
		text: "oke",
		html: `<h3>Selamat datang</h3><br/>
		Aktivasi akun anda di sini <a href=http://localhost:3000/inventory/api/customer/aktivasi/${confirmationCode}> aktivasi</a>`,
	};

	transporter.sendMail( options, ( err, info ) => {
		if ( err ) {
			console.log( err );
		}
		console.log( `Email terkirim ke ${email}` );
	} )
}

const sendEmailUser = ( email, confirmationCode ) => {
	const options = {
		from: "'Inventory-Server' <no-reply@gmail.com>",
		to: email,
		subject: "Verifikasi Pendaftaran",
		text: "oke",
		html: `<h3>Selamat datang</h3><br/>
		Aktivasi akun anda di sini <a href=http://localhost:3000/inventory/api/user/aktivasi/${confirmationCode}> aktivasi</a>`,
	};

	transporter.sendMail( options, ( err, info ) => {
		if ( err ) {
			console.log( err );
		}
		console.log( `Email terkirim ke ${email}` );
	} )
}

const ubahPassword = ( email, reset_token ) => {
	const options = {
		from: "'Inventory-Server' <no-reply@gmail.com>",
		to: email,
		subject: "Password Reset",
		text: "oke",
		html: `<h3>Panduan ubah password</h3><br/>
		Klik tautan ini untuk pengaturan ulang password <a href=http://localhost:3000/inventory/api/customer/ubah-password/${reset_token}> reset password</a>`,
	};

	transporter.sendMail( options, ( err, info ) => {
		if ( err ) {
			console.log( err );
		}
		console.log( `Email reset password terkirim ke ${email}` );
	} )
}

const ubahPasswordUser = ( email, reset_token ) => {
	const options = {
		from: "'Inventory-Server' <no-reply@gmail.com>",
		to: email,
		subject: "Password Reset",
		text: "oke",
		html: `<h3>Panduan ubah password</h3><br/>
		Klik tautan ini untuk pengaturan ulang password <a href=http://localhost:3000/inventory/api/user/ubah-password/${reset_token}> reset password</a>`,
	};

	transporter.sendMail( options, ( err, info ) => {
		if ( err ) {
			console.log( err );
		}
		console.log( `Email reset password terkirim ke ${email}` );
	} )
}

// sendEmail( email, confirmationCode );
module.exports = {
	sendEmail,
	sendEmailUser,
	ubahPassword,
	ubahPasswordUser,
	transporter
};