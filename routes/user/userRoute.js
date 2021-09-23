const express = require( 'express' );
const router = express.Router();

const authentifikasi = require( '../../middleware/authentification' );
const authorisasi = require( '../../middleware/otorisasi' );
const userController = require( '../../controllers/user' );

router.post( '/register', userController.register );
router.post( '/login', userController.login );
router.get( '/profil', authentifikasi.cekLogin, userController.getProfil );
router.post( '/lupa-password', userController.lupaPassword );
router.put( '/ubah-password/:token', userController.ubahPassword );
router.put( '/aktivasi/:confirmation_code', userController.aktivasi );
router.get( '/list-user', authentifikasi.cekLogin, authorisasi.isManager, userController.read );
router.delete( '/:id', authentifikasi.cekLogin, authorisasi.isManager, userController.delete );

module.exports = router;