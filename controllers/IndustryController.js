const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const jwt = require('jsonwebtoken');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const industries = await Industry.find();

        res.render('industry/index', { industries, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const industry = null;
        res.render('industry/create', { industry, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}
const Store = async (req, res) => {
  try {
    const { id, name, description, status } = req.body;

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

    // Check if industry already exists (excluding current industry if updating)
    let existingIndustry;
    if (id) {
      existingIndustry = await Industry.findOne({ slug: slug, _id: { $ne: id } });
    } else {
      existingIndustry = await Industry.findOne({ slug: slug });
    }

    if (existingIndustry) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Industry with this name already exists',
        },
      });
    }

    if (id) {
      // Update existing industry
      const updatedIndustry = await Industry.findByIdAndUpdate(
        id,
        {
          name,
          slug,
          description,
          status: status,
        },
        { new: true }
      );

      return res.status(200).json({
        status: true,
        message: 'Industry updated successfully',
        data: updatedIndustry,
        redirect_url: '/industry',
      });
    } else {
      // Create new industry
      const newIndustry = new Industry({
        name,
        slug,
        description,
        status: status,
      });

      await newIndustry.save();

      return res.status(201).json({
        status: true,
        message: 'Industry created successfully',
        data: newIndustry,
        redirect_url: '/industry',
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

        const IndustryId = req.params.id;
        // Find the user by ID
        const industry = await Industry.findById(IndustryId);
        console.log(industry,"industry data");
        if (!industry) {
              return res.redirect('/industry');
        }
          res.render('industry/create', { industry });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/industry');
    }
}

const Delete = async (req, res) => {
 try {
        const industryId = req.params.id;
        // Find the user by ID
        const industry = await Industry.findById(industryId);
        if (!industry) {
           return res.redirect('/industry');
        }

        // Delete the user
        await Industry.findByIdAndDelete(industryId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Industry deleted successfully');
       return res.redirect('/industry');


    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/industry');
    }

}

module.exports = {List,Create,Store,Edit,Delete};