const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const Country = require('../models/Country');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const country_list = await Country.find() // this will populate the industry details
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('country/index', { country_list, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const country = null;
       
        // Render the create page with the industries
        res.render('country/create', { country, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Store = async (req, res) => {
  try {
    const { id,name, code,currencies} = req.body;

    // Check if country already exists (excluding current one during update)
    let existingcountry;
    if (id) {
      existingcountry = await Country.findOne({ name: name, _id: { $ne: id } });
    } else {
      existingcountry = await Country.findOne({ name: name });
    }

    if (existingcountry) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Country with this name already exists',
        },
      });
    }


    if (id) {
      // Update existing category
        const updateData = {
          name,
          code,
          currencies
        };

        const updatedcountry = await Country.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'Country updated successfully',
        data: updatedcountry,
        redirect_url: '/country',
      });
    } else {
      // Create new category
      const newCountries = new Country({
        name,
        code,
        currencies
      });

      await newCountries.save();

      return res.status(201).json({
        status: true,
        message: 'Country created successfully',
        data: newCountries,
        redirect_url: '/country',
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
        const CountryId = req.params.id;
        // Find the user by ID
        const country = await Country.findById(CountryId);

        console.log(country,"country data");
        if (!country) {
              return res.redirect('/country');
        }
          res.render('country/create', { country, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/country');
    }
}

const Delete = async (req, res) => {
 try {
        const countryId = req.params.id;
        // Find the user by ID
        const country = await Country.findById(countryId);
        if (!country) {
           return res.redirect('/country');
        }

        // Delete the user
        await Country.findByIdAndDelete(countryId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Country deleted successfully');
       return res.redirect('/country');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/country');
    }
}

module.exports = {List,Create,Store,Edit,Delete};