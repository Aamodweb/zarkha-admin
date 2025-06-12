const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Brands = require('../models/Brands');
const Units = require('../models/Units');
const Product = require('../models/Product'); // Your Product model
const Variant = require('../models/Variant');
const ColorImage = require('../models/ColorImage');
const Hashtag = require('../models/Hashtag');
const path = require('path');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const products = await Product.find()
                                   .populate('industry_id')
                                   .populate('category_id')
                                   .populate('subcategory_id')
                                   .populate('brand_id')
                                   .populate('product_tags')
                                  .sort({ createdAt: -1 }); // optional sorting

        res.render('product/index', { products, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
        try{
            const product = null;
            // Fetch all industries to populate the dropdown
            const industries = await Industry.find({ status: 'active' });

            const categorys = await Category.find({ status: 'active' });

            const subcategory = await Subcategory.find({ status: 'active' });
            
            const brands = await Brands.find({ status: 'active' });

            const units = await Units.find({ status: 'active' });

            const hashtag = await Hashtag.find({ status: 'active' });

            // Render the create page with the industries
            res.render('product/create', { product,categorys,industries,subcategory,brands,units,hashtag, message: "" });
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
  try {
    const {
      id,
      industry_id,
      category_id,
      subcategory_id,
      brand_id,
      product_name,
      description,
      image_type,
      color_name,
      image_group_ids,
      has_variants,
      variant_types,
      attribute_value,
      variant_skus,
      variant_prices,
      variant_discount_prices,
      variant_stocks,
      return_allowed,
      return_notes,
      seo_title,
      seo_description,
      product_tags,
      status
    } = req.body;

    // ----------- BASIC VALIDATION ------------
    let errors = {};

    if (!industry_id) errors.industry_id = 'Industry is required';
    if (!category_id) errors.category_id = 'Category is required';
    if (!subcategory_id) errors.subcategory_id = 'Subcategory is required';
    if (!description) errors.description = 'Description is required';
    if (!product_name || product_name.trim() === '') errors.product_name = 'Product name is required';
    if (!image_type || !['color', 'general'].includes(image_type)) errors.image_type = 'Invalid image type';
    if (has_variants === 'yes') {
      if (!variant_types || !attribute_value || !variant_prices || !variant_discount_prices || !variant_skus) {
        errors.variants = 'Variant fields are incomplete';
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        status: false,
        message: 'Validation failed',
        errors
      });
    }

    const slug = slugify(product_name);

    // Check if product name already exists
    let existingProduct = await Product.findOne({ slug });
    if (existingProduct && (!id || existingProduct._id.toString() !== id)) {
      return res.status(400).json({
        status: false,
        errors: { product_name: 'Product with this name already exists' },
      });
    }

    const allFiles = req.files || [];

    // ----------- COLOR IMAGES HANDLING ------------
    let color_images = [];

    console.log('request files:', req.files);
    if (image_type === 'color') {
       const groupIds = Array.isArray(image_group_ids) ? image_group_ids : [image_group_ids];
        const colorNames = Array.isArray(color_name) ? color_name : [color_name];

        groupIds.forEach((groupId, index) => {
          const color = colorNames[index] || null;
          const fieldKey = `product_images_${groupId}[]`; // Important fix here
          const images = allFiles
            .filter(f => f.fieldname === fieldKey)
            .map(f => f.filename);

          if (images.length > 0) {
            color_images.push({ color, images });
          }
        });
    } else if (image_type === 'general') {
      const images = allFiles
        .filter(f => f.fieldname === 'product_images')
        .map(f => f.filename);

      console.log("general images", images);
      console.log("general images Files data", allFiles);

      if (images.length > 0) {
        color_images.push({ color: null, images });
      }
    }
    

    // ----------- VARIANTS PROCESSING ------------
    let variants = [];
    if (has_variants === 'yes') {
      const types = Array.isArray(variant_types) ? variant_types : [variant_types];
      const values = Array.isArray(attribute_value) ? attribute_value : [attribute_value];
      const skus = Array.isArray(variant_skus) ? variant_skus : [variant_skus];
      const prices = Array.isArray(variant_prices) ? variant_prices : [variant_prices];
      const discounts = Array.isArray(variant_discount_prices) ? variant_discount_prices : [variant_discount_prices];
      const stocks = Array.isArray(variant_stocks) ? variant_stocks : [variant_stocks];

      for (let i = 0; i < values.length; i++) {
        if (!types[i] || !values[i]) continue;
        variants.push({
          attribute_name: types[i],
          attribute_value: values[i],
          product_sku: skus[i] || '',
          product_price: parseFloat(prices[i] || 0),
          discount_price: parseFloat(discounts[i] || 0),
          stock: parseInt(stocks[i] || 0),
        });
      }
    }else{
        const types = Array.isArray(variant_types) ? variant_types : [variant_types];
        const values = Array.isArray(attribute_value) ? attribute_value : [attribute_value];
        const skus = Array.isArray(variant_skus) ? variant_skus : [variant_skus];
        const prices = Array.isArray(variant_prices) ? variant_prices : [variant_prices];
        const discounts = Array.isArray(variant_discount_prices) ? variant_discount_prices : [variant_discount_prices];
        const stocks = Array.isArray(variant_stocks) ? variant_stocks : [variant_stocks];

        for (let i = 0; i < values.length; i++) {
          
          variants.push({
            attribute_name: types[i] || '',
            attribute_value: values[i] || '',
            product_sku: skus[i] || '',
            product_price: parseFloat(prices[i] || 0),
            discount_price: parseFloat(discounts[i] || 0),
            stock: parseInt(stocks[i] || 0),
          });
        }
    }

    console.log('color_images:', color_images);
    console.log('has_variants:', has_variants);
    // ----------- PRODUCT DATA ASSEMBLY ------------
    const productData = {
      industry_id,
      category_id,
      subcategory_id,
      brand_id,
      name: product_name,
      slug,
      description,
      image_type,
      has_variants,
      color_images,
      variants,
      return_allowed,
      return_notes,
      seo_title,
      seo_description,
      product_tags: Array.isArray(product_tags)
                    ? product_tags
                    : typeof product_tags === 'string' && product_tags.trim() !== ''
                      ? [product_tags]
                      : [],
      status,
      updated_at: new Date()
    };

    let savedProduct;
    if (id) {
      savedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
    } else {
      productData.created_at = new Date();
      const newProduct = new Product(productData);
      savedProduct = await newProduct.save();
    }

    return res.status(id ? 200 : 201).json({
      status: true,
      message: id ? 'Product updated successfully' : 'Product created successfully',
      data: savedProduct,
      redirect_url: '/product',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

const Edit = async (req, res) => {
    try {
        const ProductId = req.params.id;
        // Find the user by ID
        const product = await Product.findById(ProductId);

         const industries = await Industry.find({ status: 'active' });

            const categorys = await Category.find({ status: 'active' });

            const subcategory = await Subcategory.find({ status: 'active' });
            
            const brands = await Brands.find({ status: 'active' });

            const units = await Units.find({ status: 'active' });
             const hashtag = await Hashtag.find({ status: 'active' });

        // console.log(product,"product data");
        if (!product) {
              return res.redirect('/product');
        }
          res.render('product/create', { product,categorys,subcategory,brands,units,industries,hashtag, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/product');
    }
}

const View = async (req, res) => {
    try {
        const ProductId = req.params.id;

        console.log(ProductId,"product id");
        // Find the user by ID
        const product = await Product.findById(ProductId)
                                   .populate('industry_id')
                                   .populate('category_id')
                                   .populate('subcategory_id')
                                   .populate('product_tags')
                                   .populate('brand_id');
        if (!product) {
              return res.redirect('/product');
        }

        console.log(product,"product data");
          res.render('product/view', { product, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/product');
    }
}


const ProductImageDelete = async (req, res) => {
  try {
    const { productId, colorIndex, imageIndex, image } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ success: false, message: 'Product not found' });
    }

    // Remove image from array
    if (
      product.color_images[colorIndex] &&
      product.color_images[colorIndex].images[imageIndex] === image
    ) {
      product.color_images[colorIndex].images.splice(imageIndex, 1);

      // Save product after image removal
      await product.save();

      // Delete file from filesystem
      const imagePath = path.join(__dirname, 'uploads/product-image/', image);
      console.log("image path", imagePath);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      return res.json({ success: true, message: 'Image deleted' });
    }

    return res.json({ success: false, message: 'Image not found in list' });

  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: 'Something went wrong' });
  }
}

const Delete = async (req, res) => {
 try {
        const productId = req.params.id;
        // Find the user by ID
        const productidd = await Product.findById(productId);
        if (!productidd) {
           return res.redirect('/product');
        }

        // Delete the user
        await Product.findByIdAndDelete(productidd);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Product deleted successfully');
       return res.redirect('/product');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/product');
    }

}

module.exports = {List,Create,Store,Edit,View,Delete,ProductImageDelete};