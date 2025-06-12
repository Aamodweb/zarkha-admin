const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Hashtag = require('../models/Hashtag');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const subcategory = await Subcategory.find()
                                  .populate('category_id') // this will populate the industry details
                                  .populate('hash_tags')
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('subcategory/index', { subcategory, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
       
        const subcategory = null;
        // Fetch all industries to populate the dropdown
        const category = await Category.find({ status: 'active' });
        // Render the create page with the industries
           const hashtag = await Hashtag.find({ status: 'active' });
        res.render('subcategory/create', { category,subcategory,hashtag, message: "" });
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
    const { id, category_id, name, description, status,hash_tags } = req.body;

    const slug = slugify(name);

    // Check if category already exists (excluding current one during update)
    let existingCategory;
    if (id) {
      existingCategory = await Subcategory.findOne({ slug: slug, _id: { $ne: id } });
    } else {
      existingCategory = await Subcategory.findOne({ slug: slug });
    }

    if (existingCategory) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Subcategory with this name already exists',
        },
      });
    }

     let subcategory_image = '';

        if (req.files && req.files.length > 0) {
            subcategory_image = req.files
                .map(file => {
                    // Extract relative path
                    const relativePath = file.filename;
                    return relativePath;
                })
                .join(','); // Join multiple file paths into a single string
        }

        console.log("subcategory_image", subcategory_image);
        console.log("category_image files", req.files);

    if (id) {
      // Update existing category
        const updateData = {
          category_id,
          name,
          slug,
          description,
          status,
          seo: req.body.seo,
          hash_tags: Array.isArray(hash_tags)
                    ? hash_tags
                    : typeof hash_tags === 'string' && hash_tags.trim() !== ''
                      ? [hash_tags]
                      : [],
        };

        // Only update image if new one uploaded
        if (subcategory_image !== '') {
          updateData.image = subcategory_image;
        }

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'Subcategory updated successfully',
        data: updatedSubcategory,
        redirect_url: '/subcategory',
      });
    } else {
      // Create new category
      const newSubcategory = new Subcategory({
        category_id,
        name,
        slug,
        image: subcategory_image, // Use the new image path
        description,
        status: status,
        seo: req.body.seo,
        hash_tags: Array.isArray(hash_tags)
                  ? hash_tags
                  : typeof hash_tags === 'string' && hash_tags.trim() !== ''
                    ? [hash_tags]
                    : [],
        // image: req.file?.filename || null // Optional if handling images
      });

      await newSubcategory.save();

      return res.status(201).json({
        status: true,
        message: 'Subcategory created successfully',
        data: newSubcategory,
        redirect_url: '/subcategory',
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
        const SubcategoryId = req.params.id;
        // Find the user by ID
        const subcategory = await Subcategory.findById(SubcategoryId);

        const category = await Category.find({ status: 'active' });

           const hashtag = await Hashtag.find({ status: 'active' });

        console.log(subcategory,"subcategory data");
        if (!subcategory) {
              return res.redirect('/subcategory');
        }
          res.render('subcategory/create', { category,subcategory,hashtag, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/subcategory');
    }
}

const Delete = async (req, res) => {
 try {
        const subcategoryId = req.params.id;
        // Find the user by ID
        const subcategory = await Subcategory.findById(subcategoryId);
        if (!subcategory) {
           return res.redirect('/subcategory');
        }

        // Delete the user
        await Subcategory.findByIdAndDelete(subcategoryId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Subcategory deleted successfully');
       return res.redirect('/subcategory');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/subcategory');
    }

}

const FilterSubcategoryGet = async (req, res) => {
  try {
    const { category_id } = req.query;

    // Fetch categories based on industry_id
    const subcategories = await Subcategory.find({ category_id: category_id });

    res.status(200).json({
      status: true,
      data: subcategories,
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

module.exports = {List,Create,Store,Edit,Delete,FilterSubcategoryGet};