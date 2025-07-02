const bcrypt = require('bcrypt');
const AttributeType = require('../models/AttributeType');
const AttributeValue = require('../models/AttributeValue');
const XLSX = require('xlsx');
const fs = require('fs');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const attribute_value_list = await AttributeValue.find().populate('type_id').sort({ created_at: -1 });
        res.render('attribute_value/index', { attribute_value_list, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const attribute_value = null;
        let attribute_type_list = await AttributeType.find({ status: 'active' });
        
        // Render the create page with the industries
        res.render('attribute_value/create', { attribute_value,attribute_type_list, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Store = async (req, res) => {
  try {
    const { id,type_id,status} = req.body;

    // Check if state already exists (excluding current one during update)
      const value = (req.body.value || '').trim(); // Trim the name from request
      console.log("attribute_value", value);

      let existingAttributeValue;
      if (id) {
        existingAttributeValue = await AttributeValue.findOne({
          type_id: type_id,
          value: value,
          _id: { $ne: id }
        });
      } else {
        existingAttributeValue = await AttributeValue.findOne({ value: value, type_id: type_id });
      }

    if (existingAttributeValue) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Attribute Value with this name already exists',
        },
      });
    }
    if (id) {
      // Update existing
        const updateData = {
          type_id: type_id,
          value,
          status,
        };

        console.log("update data",updateData)
        const updatedattribute = await AttributeValue.findByIdAndUpdate(id, updateData, {
          new: true,
        });
      return res.status(200).json({
        status: true,
        message: 'Attribute Value updated successfully',
        data: updatedattribute,
        redirect_url: '/attribute-value',
      });
    } else {
      // Create new state
      const newAtrribureSettings = new AttributeValue({
        type_id: type_id,
        value,
        status,
      });

      await newAtrribureSettings.save();

      return res.status(201).json({
        status: true,
        message: 'Attribute Value created successfully',
        data: newAtrribureSettings,
        redirect_url: '/attribute-value',
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
        const AttributeValueId = req.params.id;
        // Find the user by ID
        const attribute_value = await AttributeValue.findById(AttributeValueId).populate('type_id');
          let attribute_type_list = await AttributeType.find({ status: 'active' });
        

        console.log(attribute_value, "Attribute Value List");

        if (!attribute_value) {
              return res.redirect('/attribute-value');
        }
          res.render('attribute_value/create', { attribute_value,attribute_type_list, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/attribute-value');
    }
}

const Delete = async (req, res) => {
 try {
        const AttributeId = req.params.id;
        // Find the user by ID
        const attribute_value = await AttributeValue.findById(AttributeId);
        if (!attribute_value) {
           return res.redirect('/attribute-value');
        }

        // Delete the user
        await AttributeValue.findByIdAndDelete(AttributeId);

        // Redirect to the admin user list with a success message
       return res.redirect('/attribute-value');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/attribute-value');
    }
}


module.exports = {List,Create,Store,Edit,Delete};