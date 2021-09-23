const express = require( 'express' );
const router = express.Router();

const authentifikasi = require( '../../middleware/authentification' );
const authorisasi = require( '../../middleware/otorisasi' );
const {
	create,
	BarangKeluar
} = require( '../../controllers/barangKeluar' );

router.post( '/', authentifikasi.cekLogin, create );
router.get( '/', authentifikasi.cekLogin, authorisasi.isAdminGudang, BarangKeluar.read );

module.exports = router;