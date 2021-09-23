const express = require( 'express' );
const router = express.Router();

const authentifikasi = require( '../../middleware/authentification' );
const otorisasi = require( '../../middleware/otorisasi' );
const barangmasukController = require( '../../controllers/barangmasuk' );

router.post( '/', authentifikasi.cekLogin, otorisasi.isAdminGudang, barangmasukController.create );
router.get( '/', authentifikasi.cekLogin, otorisasi.isAdminGudang, barangmasukController.read );

module.exports = router;