const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( '../../helper/passportAuthentication' );

const authentifikasi = require( '../../middleware/authentification' );
const authorisasi = require( '../../middleware/otorisasi' );
const customerController = require( '../../controllers/customer' );

router.post( '/register', customerController.register );
router.post( '/login', customerController.login );
router.get( '/profil', authentifikasi.cekLogin, customerController.getProfil );
router.post( '/lupa-password', customerController.lupaPassword );
router.put( '/ubah-password/:token', customerController.ubahPassword );
router.put( '/aktivasi/:confirmation_code', customerController.aktivasi );
router.get( '/list-customer', customerController.read );
router.get( '/cari', authentifikasi.cekLogin, authorisasi.isAdminPenjualan, customerController.search );
router.delete( '/:id', customerController.delete );
router.get( '/riwayat-transaksi', authentifikasi.cekLogin, customerController.riwayatTransaksi );
router.get( '/google', passport.authenticate( 'google', {
	scope: [ "profile", "email" ]
} ) );
router.get( '/google/callback', passport.authenticate( 'google', {
	session: false,
	failureRedirect: '/google'
} ), customerController.loginGoogle );

module.exports = router;