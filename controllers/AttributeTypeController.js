const bcrypt = require('bcrypt');
const AttributeType = require('../models/AttributeType');
const XLSX = require('xlsx');
const fs = require('fs');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const attribute_type_list = await AttributeType.find().sort({ created_at: -1 });
        res.render('attribute_type/index', { attribute_type_list, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const attribute_type = null;
        
        // Render the create page with the industries
        res.render('attribute_type/create', { attribute_type, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Store = async (req, res) => {
  try {
    const { id,status} = req.body;

    // Check if state already exists (excluding current one during update)
      const name = (req.body.name || '').trim(); // Trim the name from request
      console.log("attribute_type", name);

      let existingAttributeType;
      if (id) {
        existingAttributeType = await AttributeType.findOne({
          name: name,
          _id: { $ne: id }
        });
      } else {
        existingAttributeType = await AttributeType.findOne({ name: name });
      }

    if (existingAttributeType) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'AttributeType with this name already exists',
        },
      });
    }
    if (id) {
      // Update existing category
        const updateData = {
          name,
          status,
        };

        console.log("update data",updateData)
        const updatedattribute = await AttributeType.findByIdAndUpdate(id, updateData, {
          new: true,
        });
      return res.status(200).json({
        status: true,
        message: 'Attribute Type updated successfully',
        data: updatedattribute,
        redirect_url: '/attribute-type',
      });
    } else {
      // Create new state
      const newAtrribureSettings = new AttributeType({
        name,
        status,
      });

      await newAtrribureSettings.save();

      return res.status(201).json({
        status: true,
        message: 'Attribute Type created successfully',
        data: newAtrribureSettings,
        redirect_url: '/attribute-type',
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
        const CMSId = req.params.id;
        // Find the user by ID
        const attribute_type = await AttributeType.findById(CMSId);

        console.log(attribute_type, "Attribute Type List");

        if (!attribute_type) {
              return res.redirect('/attribute-type');
        }
          res.render('attribute_type/create', { attribute_type, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/attribute-type');
    }
}

const Delete = async (req, res) => {
 try {
        const AttributeId = req.params.id;
        // Find the user by ID
        const attribute_type = await AttributeType.findById(AttributeId);
        if (!attribute_type) {
           return res.redirect('/attribute-type');
        }

        // Delete the user
        await AttributeType.findByIdAndDelete(AttributeId);

        // Redirect to the admin user list with a success message
       return res.redirect('/attribute-type');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/attribute-type');
    }
}


module.exports = {List,Create,Store,Edit,Delete};