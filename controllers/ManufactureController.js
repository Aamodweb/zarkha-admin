const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const Manufacture = require('../models/Manufacture');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const manufacture_list = await Manufacture.find()
                                  .populate('industry_id') // this will populate the industry details
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('manufacture/index', { manufacture_list, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const manufacture = null;
        // Fetch all industries to populate the dropdown
        const industries = await Industry.find({ status: 'active' });
        // Render the create page with the industries
        res.render('manufacture/create', { manufacture,industries, message: "" });
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
    const { id, industry_id, name, address,contact_email,mobile, status } = req.body;

    const slug = slugify(name);

    // Check if manufacture already exists (excluding current one during update)
    let existingmanufacture;
    if (id) {
      existingmanufacture = await Manufacture.findOne({ slug: slug, _id: { $ne: id } });
    } else {
      existingmanufacture = await Manufacture.findOne({ slug: slug });
    }

    if (existingmanufacture) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Manufacture with this name already exists',
        },
      });
    }

     let manufacture_image = '';

        if (req.files && req.files.length > 0) {
            manufacture_image = req.files
                .map(file => {
                    // Extract relative path
                    const relativePath = file.filename;
                    return relativePath;
                })
                .join(','); // Join multiple file paths into a single string
        }

        console.log("manufacture_image", manufacture_image);
        console.log("manufacture_image files", req.files);

    if (id) {
      // Update existing category
        const updateData = {
          industry_id,
          name,
          address,
          contact_email,
          mobile,
          status,
        };

        // Only update image if new one uploaded
        if (manufacture_image !== '') {
          updateData.image = manufacture_image;
        }

        const updatedmanufacture = await Manufacture.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'Manufacture updated successfully',
        data: updatedmanufacture,
        redirect_url: '/manufacture',
      });
    } else {
      // Create new category
      const newManufacture = new Manufacture({
        industry_id,
        name,
        address,
        image: manufacture_image, // Use the new image path
        contact_email,
        mobile,
        status: status,
        // image: req.file?.filename || null // Optional if handling images
      });

      await newManufacture.save();

      return res.status(201).json({
        status: true,
        message: 'Manufacture created successfully',
        data: newManufacture,
        redirect_url: '/manufacture',
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
        const manufacture = await Manufacture.findById(CategoryId);

        const industries = await Industry.find({ status: 'active' });

        console.log(manufacture,"manufacture data");
        if (!manufacture) {
              return res.redirect('/manufacture');
        }
          res.render('manufacture/create', { manufacture,industries, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/manufacture');
    }
}

const Delete = async (req, res) => {
 try {
        const ManufactureId = req.params.id;
        // Find the user by ID
        const manufacture = await Manufacture.findById(ManufactureId);
        if (!manufacture) {
           return res.redirect('/manufacture');
        }

        // Delete the user
        await Manufacture.findByIdAndDelete(ManufactureId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Manufacture deleted successfully');
       return res.redirect('/manufacture');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/manufacture');
    }

}


module.exports = {List,Create,Store,Edit,Delete};