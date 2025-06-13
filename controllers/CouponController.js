const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Industry = require('../models/Industry');
const Category = require('../models/Category');
const Hashtag = require('../models/Hashtag');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const Partner = require('../models/Partner');


const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const coupons = await Coupon.find() // this will populate the Vendor details
                                  .populate('created_by') // this will populate the Created By details
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('coupon/index', { coupons, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const coupon = null;

        // Render the create page with the industries
        res.render('coupon/create', { coupon, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');   // Trim - from start and end
};

const Store = async (req, res) => {
   console.log("Request cookies",req.cookies.access_token);
  const decoded = jwt.verify(req.cookies.access_token, process.env.JWT_SECRET || 'your_secret_key');
  try {
    const {
      id,
      code,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_cart_value,
      total_uses,
      max_uses,
      max_uses_per_user,
      apply_scope,               // 'all' or 'specific'
      applicable_to,             // ['product', 'category']
      applicable_ids,            // { product: [], category: [], ... }
      start_date,
      end_date,
      status
    } = req.body;

    // Normalize code
    const couponCode = code.toUpperCase().trim();

    // Check for uniqueness of coupon code
    const existingCoupon = await Coupon.findOne({
      code: couponCode,
      ...(id && { _id: { $ne: id } })
    });

    if (existingCoupon) {
      return res.status(400).json({
        status: false,
        errors: { code: 'Coupon code already exists' }
      });
    }
      // Handle uploaded images (if any)
    let coupon_image = '';
    if (req.files?.image && req.files.image.length > 0) {
      coupon_image = req.files.image[0].filename;
    }
    

    // Construct applicable_ids safely
    const parsedApplicableIds = {
      product: [],
      category: [],
      vendor: [],
      brand: []
    };

    if (apply_scope === 'specific' && Array.isArray(applicable_to)) {
      applicable_to.forEach(type => {
        if (applicable_ids[type]) {
          parsedApplicableIds[type] = Array.isArray(applicable_ids[type])
            ? applicable_ids[type]
            : [applicable_ids[type]]; // Ensure it's an array
        }
      });
    }

    const couponData = {
      code: couponCode,
      description,
      discount_type,
      discount_value,
      max_discount_amount: max_discount_amount || null,
      min_cart_value,
      total_uses,
      max_uses,
      max_uses_per_user,
      apply_scope,
      applicable_to: apply_scope === 'specific' ? applicable_to : [],
      applicable_ids: parsedApplicableIds,
      start_date,
      end_date,
      status,
      created_by: decoded.userId, // assumes logged-in admin/vendor
      updated_at: new Date()
    };

    // Only add image if uploaded
      if (coupon_image) {
        couponData.image = coupon_image;
      }

    let result;
    if (id) {
      result = await Coupon.findByIdAndUpdate(id, couponData, { new: true });
    } else {
      result = new Coupon(couponData);
      await result.save();
    }

    return res.status(200).json({
      status: true,
      message: id ? 'Coupon updated successfully' : 'Coupon created successfully',
      data: result,
      redirect_url: '/coupon'
    });
  } catch (error) {
    console.error('Coupon Error:', error.message);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};


const Edit = async (req, res) => {
    try {
        const CouponId = req.params.id;
        // Find the user by ID
        const coupon = await Coupon.findById(CouponId);
        console.log(coupon,"coupon data");
        if (!coupon) {
              return res.redirect('/coupon');
        }
          res.render('coupon/create', { coupon, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/category');
    }
}

const Delete = async (req, res) => {
 try {
        const couponId = req.params.id;
        // Find the user by ID
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
           return res.redirect('/coupon');
        }

        // Delete the user
        await Coupon.findByIdAndDelete(couponId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Coupon deleted successfully');
       return res.redirect('/coupon');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/coupon');
    }

}


const GetApplicables = async (req, res) => {

 try {
    const { type } = req.params;
    let data = [];

    switch (type) {
      case 'product':
        data = await Product.find({status:'active'}, '_id name');
        break;
      case 'category':
        data = await Category.find({status:'active'}, '_id name');
        break;
      case 'boutique':
        data = await Partner.find({ role: 'boutique' }, '_id name');
        break;
    }

    return res.json({ status: true, data });
  } catch (err) {
    return res.json({ status: false, message: 'Server error' });
  }

};

const View = async (req, res) => {
  try {
    const couponId = req.params.id;

    // Find coupon by id and populate applicable_ids fields
    const coupon = await Coupon.findById(couponId)
      .populate('applicable_ids.product', 'name')  // populate product names
      .populate('applicable_ids.category', 'name') // populate category names
      .populate('applicable_ids.brand', 'name') // populate brand names
      .lean();

      console.log(coupon,"Coupon");
      if (!coupon) {
        req.flash('error', 'Coupon not found');
        return res.redirect('/coupon');
      }

    res.render('coupon/view', {
      coupon,
      message: ''
    });
  } catch (error) {
    console.error(error.message);
    return res.redirect('/coupon');
  }
};

module.exports = {List,Create,Store,Edit,Delete,GetApplicables,View};