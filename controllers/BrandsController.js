const bcrypt = require('bcrypt');
const Brands = require('../models/Brands');
const Category = require('../models/Category');
const Industry = require('../models/Industry');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const brands = await Brands.find()
                                  .populate('industry_id') // this will populate the industry details
                                  .populate('category_id') // this will populate the industry details
                                  .sort({ createdAt: -1 }); // optional sorting
                                  
          console.log(brands,"brands data");
        res.render('brands/index', { brands, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const brands = null;
        // Render the create page with the industries

          const industries = await Industry.find({ status: 'active' });
        const categorys = await Category.find({ status: 'active' });

        res.render('brands/create', { brands,industries,categorys, message: "" });
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
    const { id, name,industry_id,category_id, description, status } = req.body;

    const slug = slugify(name);

    // Check if category already exists (excluding current one during update)
    let existingBrands;
    if (id) {
      existingBrands = await Brands.findOne({ slug: slug, _id: { $ne: id } });
    } else {
      existingBrands = await Brands.findOne({ slug: slug });
    }

    if (existingBrands) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Brands with this name already exists',
        },
      });
    }

     let brands_image = '';

        if (req.files && req.files.length > 0) {
            brands_image = req.files
                .map(file => {
                    // Extract relative path
                    const relativePath = file.filename;
                    return relativePath;
                })
                .join(','); // Join multiple file paths into a single string
        }

        console.log("brands_image", brands_image);
        console.log("brands_image files", req.files);

    if (id) {
      // Update existing category
        const updateData = {
          name,
          industry_id,
          category_id,
          slug,
          description,
          status,
        };

        // Only update image if new one uploaded
        if (brands_image !== '') {
          updateData.image = brands_image;
        }

        const updatedBrands = await Brands.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'Brands updated successfully',
        data: updatedBrands,
        redirect_url: '/brands',
      });
    } else {
      // Create new category
      const newBrands = new Brands({
        name,
        industry_id,
        category_id,
        slug,
        image: brands_image, // Use the new image path
        description,
        status: status,
        // image: req.file?.filename || null // Optional if handling images
      });

      await newBrands.save();

      return res.status(201).json({
        status: true,
        message: 'Brands created successfully',
        data: newBrands,
        redirect_url: '/brands',
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};


const Edit = async (req, res) => {
    try {
        const BrandsId = req.params.id;
        // Find the user by ID
        const brands = await Brands.findById(BrandsId);

           const industries = await Industry.find({ status: 'active' });

        console.log(brands,"brands data");
        if (!brands) {
              return res.redirect('/brands');
        }
          res.render('brands/create', { brands,industries, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/brands');
    }
}

const Delete = async (req, res) => {
 try {
        const brandsId = req.params.id;
        // Find the user by ID
        const brands = await Brands.findById(brandsId);
        if (!brands) {
           return res.redirect('/brands');
        }

        // Delete the user
        await Brands.findByIdAndDelete(brandsId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Brands deleted successfully');
       return res.redirect('/brands');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/brands');
    }

}


const FilterBrandGet = async (req, res) => {
  try {
    const { category_id } = req.query;

    // Fetch categories based on industry_id
    const brands = await Brands.find({ category_id: category_id });

    res.status(200).json({
      status: true,
      data: brands,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

module.exports = {List,Create,Store,Edit,Delete,FilterBrandGet};