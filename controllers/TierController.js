const bcrypt = require('bcrypt');
const Tier = require('../models/Tier');
const XLSX = require('xlsx');
const fs = require('fs');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const tier_list = await Tier.find().sort({ created_at: -1 });
        res.render('tier/index', { tier_list, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const tier = null;
        
        // Render the create page with the industries
        res.render('tier/create', { tier, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Store = async (req, res) => {
  try {
    const { id,description} = req.body;

    // Check if state already exists (excluding current one during update)
      const name = (req.body.name || '').trim(); // Trim the name from request
      console.log("tier", name);

      let existingTier;
      if (id) {
        existingTier = await Tier.findOne({
          name: name,
          _id: { $ne: id }
        });
      } else {
        existingTier = await Tier.findOne({ name: name });
      }

    if (existingTier) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Tier with this name already exists',
        },
      });
    }

       let tier_image = '';

        if (req.files && req.files.length > 0) {
            tier_image = req.files
                .map(file => {
                    // Extract relative path
                    const relativePath = file.filename;
                    return relativePath;
                })
                .join(','); // Join multiple file paths into a single string
        }

        console.log("tier_image", tier_image);

    if (id) {
      // Update existing category
        const updateData = {
          name,
          description,
        };
       // Only update image if new one uploaded
        if (tier_image !== '') {
          updateData.image = tier_image;
        }
        console.log("update data",updateData)
        const updatedtier = await Tier.findByIdAndUpdate(id, updateData, {
          new: true,
        });
      return res.status(200).json({
        status: true,
        message: 'Tier updated successfully',
        data: updatedtier,
        redirect_url: '/tier',
      });
    } else {
      // Create new state
      const newtierSettings = new Tier({
        name,
        image: tier_image, // Use the new image path
        description,
      });

      await newtierSettings.save();

      return res.status(201).json({
        status: true,
        message: 'Tier created successfully',
        data: newtierSettings,
        redirect_url: '/tier',
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
        const tierId = req.params.id;
        // Find the user by ID
        const tier = await Tier.findById(tierId);

        console.log(tier, "Tier List");

        if (!tier) {
              return res.redirect('/tier');
        }
          res.render('tier/create', { tier, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/attribute-type');
    }
}

const Delete = async (req, res) => {
 try {
        const tierId = req.params.id;
        // Find the user by ID
        const tier = await Tier.findById(tierId);
        if (!tier) {
           return res.redirect('/tier');
        }

        // Delete the user
        await Tier.findByIdAndDelete(tierId);

        // Redirect to the admin user list with a success message
       return res.redirect('/tier');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/tier');
    }
}


module.exports = {List,Create,Store,Edit,Delete};