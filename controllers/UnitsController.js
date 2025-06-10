const bcrypt = require('bcrypt');
const Units = require('../models/Units');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const units = await Units.find() // this will populate the industry details
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('units/index', { units, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const units = null;
        // Render the create page with the industries
        res.render('units/create', { units, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}


const Store = async (req, res) => {
  try {
    console.log(req.body, "req.body");
    const { id, name, short_name, status } = req.body;

    if (id) {
      // Update existing category
        const updateData = {
          name,
          short_name,
          status,
        };

        const updatedunits = await Units.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'Units updated successfully',
        data: updatedunits,
        redirect_url: '/units',
      });
    } else {
      // Create new category
      const newunits = new Units({
        name,
        short_name,
        status: status,
        // image: req.file?.filename || null // Optional if handling images
      });

      await newunits.save();

      return res.status(201).json({
        status: true,
        message: 'Units created successfully',
        data: newunits,
        redirect_url: '/units',
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
        const UnitsId = req.params.id;
        // Find the user by ID
        const units = await Units.findById(UnitsId);

        console.log(units,"Units data");
        if (!units) {
              return res.redirect('/units');
        }
          res.render('units/create', { units, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/units');
    }
}

const Delete = async (req, res) => {
 try {
        const unitsId = req.params.id;
        // Find the user by ID
        const units = await Units.findById(unitsId);
        if (!units) {
           return res.redirect('/units');
        }

        // Delete the user
        await Units.findByIdAndDelete(unitsId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Units deleted successfully');
       return res.redirect('/units');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/units');
    }
}

module.exports = {List,Create,Store,Edit,Delete};