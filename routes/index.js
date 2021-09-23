const express = require( 'express' );
const router = express.Router();

const roleRoute = require( './role/roleRoute' );
const userRoute = require( './user/userRoute' );
const barangRoute = require( './barang/barangRoute' );
const pemasokRoute = require( './pemasok/pemasokRoute' );
const barangmasukRoute = require( './barangmasuk/barangmasukRoute' );
const barangkeluarRoute = require( './barangkeluar/barangkeluarRoute' );
const customerRoute = require( './customer/customerRoute' );

router.use( '/inventory/api/role', roleRoute );
router.use( '/inventory/api/user', userRoute );
router.use( '/inventory/api/barang', barangRoute );
router.use( '/inventory/api/pemasok', pemasokRoute );
router.use( '/inventory/api/barangmasuk', barangmasukRoute );
router.use( '/inventory/api/barang-keluar', barangkeluarRoute );
router.use( '/inventory/api/customer', customerRoute );

module.exports = router;