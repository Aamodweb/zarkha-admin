const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Brands = require('../models/Brands');
const Units = require('../models/Units');
const Product = require('../models/Product'); // Your Product model
const Variant = require('../models/Variant');
const ColorImage = require('../models/ColorImage');
const ProductImage = require('../models/ProductImage');
const Hashtag = require('../models/Hashtag');
const AttributeValue = require('../models/AttributeValue');
const AttributeType = require('../models/AttributeType');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');


const List = async (req, res) => {
  try {
    const { industry, category, status, page = 1, limit = 10, search = '' } = req.query;

    const filter = {};

    if (industry) filter.industry_id = industry;
    if (category) filter.category_id = category;
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };  // case-insensitive search on name

    const skip = (page - 1) * limit;

    // Count total filtered documents
    const totalCount = await Product.countDocuments(filter);

    // Fetch paginated filtered data
    const productsWithCount = await Product.find(filter)
      .populate('industry_id')
      .populate('category_id')
      .populate('subcategory_id')
      .populate('brand_id')
      .populate('product_tags')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

      // For each product fetch variant count (not recommended for large lists)
      const products = await Promise.all(productsWithCount.map(async (product) => {
        const variantCount = await Variant.countDocuments({ product_id: product._id });
        return { ...product.toObject(), total_variants: variantCount };
      }));

     

    const totalPages = Math.ceil(totalCount / limit);

    // Fetch industries and categories for filters
    const industries = await Industry.find({ status: 'active' }).sort({ name: 1 });
    const categories = await Category.find({ status: 'active' }).sort({ name: 1 });

    res.render('product/index', {
      products,
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      filters: { industry, category, status, search },
      industries,
      categories,
      message: "",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};


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

            const attributetype = await AttributeType.find({ status: 'active' });

            // Render the create page with the industries
            res.render('product/create', { product,categorys,industries,subcategory,brands,units,hashtag,attributetype, message: "" });
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
      variant_json,
      return_allowed,
      return_notes,
      seo_title,
      seo_description,
      product_tags,
      status
    } = req.body;

    // ----------- VALIDATION ------------
    const errors = {};
    if (!industry_id) errors.industry_id = 'Industry is required';
    if (!category_id) errors.category_id = 'Category is required';
    if (!subcategory_id) errors.subcategory_id = 'Subcategory is required';
    if (!product_name?.trim()) errors.product_name = 'Product name is required';
    if (!description) errors.description = 'Description is required';
        if (!id) {
    if (!variant_json) errors.variant_json = 'Variant data is required';
        }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ status: false, message: 'Validation failed', errors });
    }

    const slug = slugify(product_name);
    const existingProduct = await Product.findOne({ slug });

    if (existingProduct && (!id || existingProduct._id.toString() !== id)) {
      return res.status(400).json({
        status: false,
        errors: { product_name: 'Product with this name already exists' },
      });
    }

    // ----------- PRODUCT SAVE / UPDATE ------------
    const productData = {
      industry_id,
      category_id,
      subcategory_id,
      brand_id,
      name: product_name,
      slug,
      description,
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

    // ----------- VARIANTS PARSING + SAVE ------------
    let variantsToSave = [];
    
    try {
       if(variant_json){
          const parsedVariants = JSON.parse(variant_json);
          for (const v of parsedVariants) {
            variantsToSave.push({
              product_id: savedProduct._id,
              attribute_name: v.type,
              attribute_value: v.value,  // Save the whole comma-separated string as is
              product_sku: v.sku || '',
              product_price: parseFloat(v.price || 0),
              discount_price: parseFloat(v.discount || 0),
              product_stock: parseInt(v.stock || 0),
              color_code: v.color || '',
              image_ids: Array.isArray(v.images) ? v.images : [],
            });
          }
       }
    } catch (err) {
      return res.status(400).json({
        status: false,
        message: 'Invalid JSON format for variants',
      });
    }

    if (variantsToSave.length > 0) {
      await Variant.insertMany(variantsToSave);
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
    // Find the product by ID and populate references if needed
    const product = await Product.findById(ProductId);

    if (!product) {
      return res.redirect('/product');
    }

    // Fetch all variants linked to this product
    const variants = await Variant.find({ product_id: ProductId });

    // Fetch other related data
    const industries = await Industry.find({ status: 'active' });
    const categorys = await Category.find({ status: 'active' });
    const subcategory = await Subcategory.find({ status: 'active' });
    const brands = await Brands.find({ status: 'active' });
    const units = await Units.find({ status: 'active' });
    const hashtag = await Hashtag.find({ status: 'active' });
    const attributetype = await AttributeType.find({ status: 'active' });

    res.render('product/edit', { 
      product,
      categorys,
      subcategory,
      brands,
      units,
      industries,
      hashtag,
      attributetype,
      variants,   // pass variants here
      message: "" 
    });

  } catch (error) {
    console.error(error.message);
    return res.redirect('/product');
  }
}

const View = async (req, res) => {
  try {
    const ProductId = req.params.id;

    const product = await Product.findById(ProductId)
      .populate('industry_id')
      .populate('category_id')
      .populate('subcategory_id')
      .populate('product_tags')
      .populate('brand_id');

    if (!product) {
      return res.redirect('/product');
    }

    // fetch variants associated with this product
    const variants = await Variant.find({ product_id: ProductId }).populate('image_ids');

    res.render('product/view', { product, variants, message: "" });

  } catch (error) {
    console.error(error.message);
    return res.redirect('/product');
  }
};


const ProductImageDelete = async (req, res) => {
   try {
    const imageId = req.params.id;
    const image = await ProductImage.findById(imageId);
    if (!image) return res.status(404).send("Image not found");

    const filePath = path.join(__dirname, '../public/uploads/product-image/', image.image_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await ProductImage.findByIdAndDelete(imageId);
    res.redirect('/product-images');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting image");
  }
}

const Delete = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/product');
    }

    // Delete the product
    await Product.findByIdAndDelete(productId);

    // Delete related variants
    await Variant.deleteMany({ product_id: productId });


    return res.redirect('/product');

  } catch (error) {
    console.error(error.message);
    req.flash('error', 'Something went wrong');
    return res.redirect('/product');
  }
};

const ProductBulkImport = async(req, res) => {

       res.render('product/bulk-import', {message: "" });
}

const ProductBulkImportData = async (req, res) => {
 
}

const GetattributeValue = async (req, res) => {
  try {
    const { type } = req.query;
    if (!type) {
      return res.status(400).json({ status: false, message: "Attribute type is required" });
    }

    // Find type_id by name (e.g., 'Size')
    const attributeType = await AttributeType.findOne({ name: type });

    if (!attributeType) {
      return res.status(404).json({ status: false, message: "Attribute type not found" });
    }

    // Fetch values matching the type_id
    const values = await AttributeValue.find({ type_id: attributeType._id }).select('value _id');
    if (!values || values.length === 0) {
      return res.status(404).json({ status: false, message: "No attribute values found for this type" });
    }

    return res.json({ status: true, data:values  });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
};

const GetProductImages = async (req, res) => {
  try {
  

    const productImages = await  ProductImage.find().sort({ uploaded_at: -1 });
    if (!productImages || productImages.length === 0) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    return res.json({ status: true, data: productImages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
};



const UploadProductImages = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ status: false, message: 'No images uploaded' });
    }

    const uploadedImages = [];

    for (const file of files) {
      const imagePath = `/uploads/product-image/${file.filename}`;

      const imageDoc = new ProductImage({
        image_path: imagePath,
        uploaded_by: req.user ? req.user._id : null // if using authMiddleware
      });

      await imageDoc.save();
      uploadedImages.push(imageDoc);
    }

    return res.status(200).json({
      status: true,
      message: 'Images uploaded successfully',
      data: uploadedImages
    });

  } catch (err) {
    console.error('UploadProductImages error:', err);
    return res.status(500).json({
      status: false,
      message: 'Server error while uploading images'
    });
  }
};

const ProductImagesList = async (req, res) => {
  try {
    const productImages = await ProductImage.find().sort({ uploaded_at: -1 });
    if (!productImages || productImages.length === 0) {
      return res.status(404).json({ status: false, message: "No product images found" });
    }

    return res.render('product/product-images', { productImages, message: "" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
};

const ProductImagesExport = async (req, res) => {
      try {
          const product_images = await ProductImage.find();
      
          if (!product_images || product_images.length === 0) {
            return res.status(404).send('No Product images found to export.');
          }
      
          // Prepare export data
            const exportData = product_images.map((productimg, index) => ({
              SNo: index + 1,
              ImageId: productimg.id || 'N/A',
              path: productimg.image_path || 'N/A'
            }));
      
      
          // Convert to worksheet
          const worksheet = XLSX.utils.json_to_sheet(exportData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'ProductImages');
      
          // Write to buffer
          const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
          // Send response
          res.setHeader('Content-Disposition', 'attachment; filename="productimages_export.xlsx"');
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          return res.send(buffer);
      
        } catch (error) {
          console.error('Product Images export error:', error);
          return res.status(500).send('Failed to export Product Images.');
        }
};

const DeleteVariant = async (req, res) => {
  try {
    const variantId = req.params.id;

    // Find the variant by ID
    const variant = await Variant .findById(variantId);
    if (!variant) { 
      return res.status(404).json({ status: false, message: 'Variant not found' });
    }
    // Delete the variant
    await Variant.findByIdAndDelete(variantId); 
    return res.status(200).json({ status: true, message: 'Variant deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Server error' });
  } 
}

module.exports = {List,Create,Store,Edit,View,Delete,ProductImageDelete,ProductBulkImport,GetattributeValue,GetProductImages,UploadProductImages,ProductImagesList,DeleteVariant,ProductImagesExport,ProductBulkImportData};