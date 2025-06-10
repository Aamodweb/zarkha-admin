const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const Category = require('../models/Category');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const categories = await Category.find()
                                  .populate('industry_id') // this will populate the industry details
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('category/index', { categories, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const category = null;
        // Fetch all industries to populate the dropdown
        const industries = await Industry.find({ status: 'active' });
        // Render the create page with the industries
        res.render('category/create', { category,industries, message: "" });
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
    const { id, industry_id, name, description, status } = req.body;

    const slug = slugify(name);

    // Check if category already exists (excluding current one during update)
    let existingCategory;
    if (id) {
      existingCategory = await Category.findOne({ slug: slug, _id: { $ne: id } });
    } else {
      existingCategory = await Category.findOne({ slug: slug });
    }

    if (existingCategory) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Category with this name already exists',
        },
      });
    }

     let category_image = '';

        if (req.files && req.files.length > 0) {
            category_image = req.files
                .map(file => {
                    // Extract relative path
                    const relativePath = file.filename;
                    return relativePath;
                })
                .join(','); // Join multiple file paths into a single string
        }

        console.log("category_image", category_image);
        console.log("category_image files", req.files);

    if (id) {
      // Update existing category
        const updateData = {
          industry_id,
          name,
          slug,
          description,
          status,
        };

        // Only update image if new one uploaded
        if (category_image !== '') {
          updateData.image = category_image;
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'Category updated successfully',
        data: updatedCategory,
        redirect_url: '/category',
      });
    } else {
      // Create new category
      const newCategory = new Category({
        industry_id,
        name,
        slug,
        image: category_image, // Use the new image path
        description,
        status: status,
        // image: req.file?.filename || null // Optional if handling images
      });

      await newCategory.save();

      return res.status(201).json({
        status: true,
        message: 'Category created successfully',
        data: newCategory,
        redirect_url: '/category',
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
        const CategoryId = req.params.id;
        // Find the user by ID
        const category = await Category.findById(CategoryId);

        const industries = await Industry.find({ status: 'active' });

        console.log(category,"category data");
        if (!category) {
              return res.redirect('/category');
        }
          res.render('category/create', { category,industries, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/category');
    }
}

const Delete = async (req, res) => {
 try {
        const categoryId = req.params.id;
        // Find the user by ID
        const category = await Category.findById(categoryId);
        if (!category) {
           return res.redirect('/category');
        }

        // Delete the user
        await Category.findByIdAndDelete(categoryId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Category deleted successfully');
       return res.redirect('/category');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/category');
    }

}

const FilterCategoryGet = async (req, res) => {
  try {
    const { industry_id } = req.query;

    // Fetch categories based on industry_id
    const categories = await Category.find({ industry_id: industry_id })
      .populate('industry_id') // Populate the industry details
      .sort({ createdAt: -1 }); // Optional sorting

    res.status(200).json({
      status: true,
      data: categories,
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

module.exports = {List,Create,Store,Edit,Delete,FilterCategoryGet};