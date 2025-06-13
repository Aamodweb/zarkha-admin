const bcrypt = require('bcrypt');
const Banner = require('../models/Banner');
const Hashtag = require('../models/Hashtag');


const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const banners = await Banner.find()
                                  .populate('hash_tags') // this will populate the industry details
                                  .sort({ createdAt: -1 }); // optional sorting
        res.render('banner/index', { banners, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const banner = null;
         const hashtag = await Hashtag.find({ status: 'active' });
        res.render('banner/create', { banner,hashtag, message: "" });
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
    const { id, title, subtitle, link,position,sort_order,status,hash_tags } = req.body;

    // Check if banner already exists (excluding current one during update)
     let banner_image = '';
    if (req.files?.image && req.files.image.length > 0) {
      banner_image = req.files.image[0].filename;
    }

        console.log("Banner Image", banner_image);

    if (id) {
      // Update existing banners
        const updateData = {
          title,
          subtitle,
          link,
          position,
          sort_order,
          status,
          seo: req.body.seo,
          hash_tags: Array.isArray(hash_tags)
                    ? hash_tags
                    : typeof hash_tags === 'string' && hash_tags.trim() !== ''
                      ? [hash_tags]
                      : [],
        };

        // Only update image if new one uploaded
        if (banner_image !== '') {
          updateData.image = banner_image;
        }

        const updatedbanner = await Banner.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'Banner updated successfully',
        data: updatedbanner,
        redirect_url: '/banner',
      });
    } else {
      // Create new category
      const newBanner = new Banner({
        title,
        subtitle,
        image:banner_image,
        link,
        position,
        sort_order,
        status,
        seo: req.body.seo,
        hash_tags: Array.isArray(hash_tags)
                    ? hash_tags
                    : typeof hash_tags === 'string' && hash_tags.trim() !== ''
                      ? [hash_tags]
                      : [],
      });

      await newBanner.save();

      return res.status(201).json({
        status: true,
        message: 'Banner created successfully',
        data: newBanner,
        redirect_url: '/banner',
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
        const BannerId = req.params.id;
        // Find the user by ID
        const banner = await Banner.findById(BannerId);
        const hashtag = await Hashtag.find({ status: 'active' });

        console.log(hashtag,"HashTag data");
        if (!banner) {
              return res.redirect('/banner');
        }
          res.render('banner/create', { banner,hashtag, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/banner');
    }
}

const Delete = async (req, res) => {
 try {
        const BannerId = req.params.id;
        // Find the user by ID
        const banner = await Banner.findById(BannerId);
        if (!banner) {
           return res.redirect('/banner');
        }

        // Delete the user
        await Banner.findByIdAndDelete(BannerId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Banner deleted successfully');
       return res.redirect('/banner');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/banner');
    }

}

module.exports = {List,Create,Store,Edit,Delete};