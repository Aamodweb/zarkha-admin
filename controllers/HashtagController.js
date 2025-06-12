const bcrypt = require('bcrypt');
const Hashtag = require('../models/Hashtag');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const hashtag = await Hashtag.find() // this will populate the industry details
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('hashtag/index', { hashtag, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const hashtag = null;
        // Render the create page with the industries
        res.render('hashtag/create', { hashtag, message: "" });
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
    console.log(req.body, "req.body");
    const { id, name, description, status } = req.body;

   const cleanedName = name.replace(/^#/, ''); // Remove leading '#' if present
   const slug = slugify(cleanedName);

     // Check for existing slug (excluding current ID if updating)
    const existing = await Hashtag.findOne(
      id
        ? { slug, _id: { $ne: id } } // For update, exclude current
        : { slug }                  // For create, just match
    );

    if (existing) {
      return res.status(200).json({
        status: false,
        errors: { name: 'Hashtag with this name already exists' }
      });
    }

    if (id) {
      // Update existing category
        const updateData = {
          name,
          slug,
          description,
          status,
        };

        const updatedhashtag = await Hashtag.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'HashTag updated successfully',
        data: updatedhashtag,
        redirect_url: '/hashtag',
      });
    } else {
      // Create new category
      const newhashtag = new Hashtag({
          name,
          slug,
          description,
          status,
      });

      await newhashtag.save();

      return res.status(201).json({
        status: true,
        message: 'HashTag created successfully',
        data: newhashtag,
        redirect_url: '/hashtag',
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
        const HashId = req.params.id;
        // Find the user by ID
        const hashtag = await Hashtag.findById(HashId);

        console.log(hashtag,"Hashtag data");
        if (!hashtag) {
              return res.redirect('/hashtag');
        }
          res.render('hashtag/create', { hashtag, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/units');
    }
}

const Delete = async (req, res) => {
 try {
        const hashtagId = req.params.id;
        // Find the user by ID
        const hashtag = await Hashtag.findById(hashtagId);
        if (!hashtag) {
           return res.redirect('/hashtag');
        }

        // Delete the user
        await Hashtag.findByIdAndDelete(hashtagId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Hashtag deleted successfully');
       return res.redirect('/hashtag');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/hashtag');
    }
}

module.exports = {List,Create,Store,Edit,Delete};