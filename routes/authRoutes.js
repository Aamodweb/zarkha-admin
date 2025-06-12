const express = require('express');
const router = express.Router();
const multer = require('multer');
const { setupStorage } = require('../storage'); // Import the setupStorage function
const upload = multer(); // No storage needed if no files are uploaded


// Middleware
const authMiddleware = require('../middleware/authMiddleware');
const redirectIfAuthenticated = require('../middleware/redirectIfAuthenticated');

// Controllers
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/DashboardController');
const adminuserController = require('../controllers/AdminUserController');
const industryController = require('../controllers/IndustryController');
const categoryController = require('../controllers/CategoryController');
const subcategoryController = require('../controllers/SubcategoryController');
const brandsController = require('../controllers/BrandsController');
const unitsController = require('../controllers/UnitsController');
const productController = require('../controllers/ProductController');
const manufactureController = require('../controllers/ManufactureController');
const partnerController = require('../controllers/PartnerController');
const stateController = require('../controllers/StateController');
const cityController = require('../controllers/CityController');
const countryController = require('../controllers/CountriesController');
const HashtagController = require('../controllers/HashtagController');

// Routes
router.get('/',redirectIfAuthenticated, authController.login);
router.post('/login', authController.LoginCheck);
router.get('/password-generator', authController.PasswordGenerator);


//after login 
router.get('/dashboard', authMiddleware, dashboardController.index);

// admin user module create 
router.get('/admin_user', authMiddleware, adminuserController.List);
router.get('/admin_user/create', authMiddleware, adminuserController.Create);
router.post('/admin_user/store', authMiddleware,upload.none(),adminuserController.Store);
router.get('/admin_user/edit/:id', authMiddleware, adminuserController.Edit);
router.get('/admin_user/delete/:id', authMiddleware, adminuserController.Delete);


// Industry module create
router.get('/industry', industryController.List);
router.get('/industry/create',authMiddleware, industryController.Create);
router.post('/industry/store',authMiddleware,upload.none(), industryController.Store);
router.get('/industry/edit/:id',authMiddleware, industryController.Edit);
router.get('/industry/delete/:id',authMiddleware, industryController.Delete);


const categoryUploadPath = 'uploads/category/';
const categoryStorage = setupStorage(categoryUploadPath);
const categoryUpload = multer({ storage: categoryStorage });

// category module create
router.get('/category',authMiddleware, categoryController.List);
router.get('/category/create',authMiddleware, categoryController.Create);
router.post('/category/store',authMiddleware, categoryUpload.array('image'),categoryController.Store);
router.get('/category/edit/:id',authMiddleware, categoryController.Edit);
router.get('/category/delete/:id',authMiddleware, categoryController.Delete);
router.get('/filter-category-get',authMiddleware, categoryController.FilterCategoryGet);



//subcategory module create
const subcategoryUploadPath = 'uploads/subcategory/';
const  subcategoryStorage = setupStorage(subcategoryUploadPath);
const subcategoryUpload = multer({ storage: subcategoryStorage });


router.get('/subcategory',authMiddleware, subcategoryController.List);
router.get('/subcategory/create',authMiddleware, subcategoryController.Create);
router.post('/subcategory/store',authMiddleware, subcategoryUpload.array('image'),subcategoryController.Store);
router.get('/subcategory/edit/:id',authMiddleware, subcategoryController.Edit);
router.get('/subcategory/delete/:id',authMiddleware, subcategoryController.Delete);
router.get('/filter-subcategory-get',authMiddleware, subcategoryController.FilterSubcategoryGet);



// brands module
const brandsUploadPath = 'uploads/brands/';
const  brandsStorage = setupStorage(brandsUploadPath);
const brandsUpload = multer({ storage: brandsStorage });


router.get('/brands',authMiddleware, brandsController.List);
router.get('/brands/create',authMiddleware, brandsController.Create);
router.post('/brands/store',authMiddleware, brandsUpload.array('image'),brandsController.Store);
router.get('/brands/edit/:id',authMiddleware, brandsController.Edit);
router.get('/brands/delete/:id',authMiddleware, brandsController.Delete);
router.get('/filter-brand-get',authMiddleware, brandsController.FilterBrandGet);



// units schema
router.get('/units',authMiddleware, unitsController.List);
router.get('/units/create',authMiddleware, unitsController.Create);
router.post('/units/store',authMiddleware,upload.none(),unitsController.Store);
router.get('/units/edit/:id',authMiddleware, unitsController.Edit);
router.get('/units/delete/:id',authMiddleware, unitsController.Delete);


const productUploadPath = 'uploads/product-image/';
const productStorage = setupStorage(productUploadPath);
const productUpload = multer({ storage: productStorage });

// product schema 
router.get('/product',authMiddleware, productController.List);
router.get('/product/create',authMiddleware, productController.Create);
router.post('/product/store', authMiddleware, productUpload.any(), productController.Store);
router.get('/product/view/:id',authMiddleware, productController.View);
router.get('/product/edit/:id',authMiddleware, productController.Edit);
router.get('/product/delete/:id',authMiddleware, productController.Delete);
router.post('/product/image/delete/',authMiddleware,upload.none(), productController.ProductImageDelete);


const manufactureUploadPath = 'uploads/manufacture/';
const  manufactureStorage = setupStorage(manufactureUploadPath);
const manufactureUpload = multer({ storage: manufactureStorage });

// manufacture module
router.get('/manufacture',authMiddleware, manufactureController.List);
router.get('/manufacture/create',authMiddleware, manufactureController.Create);
router.post('/manufacture/store',authMiddleware,   manufactureUpload.fields([
    { name: 'image', maxCount: 1 },                    
    { name: 'business_registration_certificate', maxCount: 1 },
    { name: 'cancelled_cheque_passbook', maxCount: 1 }
  ]),manufactureController.Store);
router.get('/manufacture/edit/:id',authMiddleware, manufactureController.Edit);
router.get('/manufacture/view/:id',authMiddleware, manufactureController.View);
router.get('/manufacture/delete/:id',authMiddleware, manufactureController.Delete);


// partner module 
const partnerUploadPath = 'uploads/partner/';
const  partnerStorage = setupStorage(partnerUploadPath);
const partnerUpload = multer({ storage: partnerStorage });


router.get('/partner',authMiddleware, partnerController.List);
router.get('/partner/create',authMiddleware, partnerController.Create);
router.post('/partner/store', authMiddleware, partnerUpload.fields([
  { name: 'store_logo', maxCount: 1 },
  { name: 'registration_certificate', maxCount: 1 },
  { name: 'cheque_or_passbook', maxCount: 1 },
  { name: 'document_front_image', maxCount: 1 },
  { name: 'digital_signature', maxCount: 1 },
  { name: 'document_back_image', maxCount: 1 }
]), partnerController.Store);
router.get('/partner/edit/:id',authMiddleware, partnerController.Edit);
router.get('/partner/view/:id',authMiddleware, partnerController.View);
router.get('/partner/delete/:id',authMiddleware, partnerController.Delete);
router.get('/partner/get/:id',authMiddleware, partnerController.GetPartnerdetails);
router.post('/partner/update-credentials/',authMiddleware, partnerController.UpdatePartnerCreditional);


// country  module 
router.get('/country',authMiddleware, countryController.List);
router.get('/country/create',authMiddleware, countryController.Create);
router.post('/country/store',authMiddleware, upload.none(),countryController.Store);
router.get('/country/edit/:id',authMiddleware, countryController.Edit);
router.get('/country/delete/:id',authMiddleware, countryController.Delete);


// brands module
const csvUploadPath = 'uploads/';
const  csvStorage = setupStorage(csvUploadPath);
const csvUpload = multer({ storage: csvStorage });


// state  module 
router.get('/state',authMiddleware, stateController.List);
router.get('/state/create',authMiddleware, stateController.Create);
router.post('/state/store',authMiddleware, upload.none(),stateController.Store);
router.get('/state/edit/:id',authMiddleware, stateController.Edit);
router.get('/state/delete/:id',authMiddleware, stateController.Delete);
router.post('/state/import-xlsx',authMiddleware,csvUpload.single('csvFile'), stateController.ImportXLSX);

// city Module create
router.get('/city',authMiddleware, cityController.List);
router.get('/city/create',authMiddleware, cityController.Create);
router.post('/city/store',authMiddleware, upload.none(),cityController.Store);
router.get('/city/edit/:id',authMiddleware, cityController.Edit);
router.get('/city/delete/:id',authMiddleware, cityController.Delete);
router.get('/get-cities',authMiddleware, cityController.GetCity);
router.post('/city/import-xlsx',authMiddleware,csvUpload.single('csvFile'), cityController.ImportXLSX);


// hashtag module
router.get('/hashtag',authMiddleware, HashtagController.List);
router.get('/hashtag/create',authMiddleware, HashtagController.Create);
router.post('/hashtag/store',authMiddleware,upload.none(),HashtagController.Store);
router.get('/hashtag/edit/:id',authMiddleware, HashtagController.Edit);
router.get('/hashtag/delete/:id',authMiddleware, HashtagController.Delete);


router.get('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.redirect('/');
});

module.exports = router;
