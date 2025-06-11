const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const Manufacture = require('../models/Manufacture');
const Country = require('../models/Country');
const State = require('../models/State');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const manufacture_list = await Manufacture.find()
                                  .populate('industry_id') // this will populate the industry details
                                  .populate('state_id') // this will populate the industry details
                                  .populate('city_id') // this will populate the industry details
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

          // Fetch only India from countries collection
        const country = await Country.findOne({ name: "India" });
        // Fetch only states belonging to India
        const states = await State.find({ country_id: country._id });

        res.render('manufacture/create', { manufacture,industries,states, message: "" });
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
    const {
      id,
      name,
      owner_proprietor_name,
      business_type,
      business_name,
      mobile,
      whatsapp_mobile,
      contact_email,
      website,
      gst_number,
      pan_number,
      msme_regisration,
      state_id,
      city_id,
      pincode,
      address,
      account_holder_name,
      bank_account_number,
      bank_ifsc_code,
      bank_name,
      upi_id,
      industry_id, // must be array
      status
    } = req.body;

    const slug = slugify(name);
    let existingManufacture;

    if (id) {
      existingManufacture = await Manufacture.findOne({ slug, _id: { $ne: id } });
    } else {
      existingManufacture = await Manufacture.findOne({ slug });
    }

    if (existingManufacture) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Manufacturer with this name already exists',
        },
      });
    }

    // Handle uploaded images (if any)
    let manufacture_image = '';
    if (req.files?.image && req.files.image.length > 0) {
      manufacture_image = req.files.image[0].filename;
    }
    
let business_reg_cert = '';
if (req.files?.business_registration_certificate && req.files.business_registration_certificate.length > 0) {
  business_reg_cert = req.files.business_registration_certificate[0].filename;
}
let cancelled_cheque_passbook = '';
if (req.files?.cancelled_cheque_passbook && req.files.cancelled_cheque_passbook.length > 0) {
  cancelled_cheque_passbook = req.files.cancelled_cheque_passbook[0].filename;
}

    const manufactureData = {
      name,
      owner_proprietor_name,
      business_type,
      business_name,
      mobile,
      whatsapp_mobile,
      contact_email,
      website,
      gst_number,
      pan_number,
      msme_regisration,
      state_id,
      city_id,
      pincode,
      address,
      account_holder_name,
      bank_account_number,
      bank_ifsc_code,
      bank_name,
      upi_id,
      industry_id: Array.isArray(industry_id) ? industry_id : [industry_id],
      status
    };

    // Only add image if uploaded
    if (manufacture_image) {
      manufactureData.image = manufacture_image;
    }
    if (business_reg_cert) {
      manufactureData.business_registration_certificate = business_reg_cert;
    }
    if (cancelled_cheque_passbook) {
      manufactureData.cancelled_cheque_passbook = cancelled_cheque_passbook;
    }

    let result;
    if (id) {
      result = await Manufacture.findByIdAndUpdate(id, manufactureData, { new: true });
    } else {
      const newManufacture = new Manufacture(manufactureData);
      result = await newManufacture.save();
    }

    return res.status(200).json({
      status: true,
      message: `Manufacturer ${id ? 'updated' : 'created'} successfully`,
      data: result,
      redirect_url: '/manufacture',
    });
  } catch (error) {
    console.error('Error in Store:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};


const Edit = async (req, res) => {
    try {
        const ManufactureId = req.params.id;
        // Find the user by ID
        const manufacture = await Manufacture.findById(ManufactureId);

        const industries = await Industry.find({ status: 'active' });
         // Fetch only India from countries collection
        const country = await Country.findOne({ name: "India" });
        // Fetch only states belonging to India
        const states = await State.find({ country_id: country._id });

        console.log(manufacture,"manufacture data");
        if (!manufacture) {
              return res.redirect('/manufacture');
        }
          res.render('manufacture/create', { manufacture,industries,country,states, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/manufacture');
    }
}

const View = async (req, res) => {
    try {
        const ManufactureId = req.params.id;
        // Find the user by ID
        const manufacture = await Manufacture.findById(ManufactureId)
                                  .populate('industry_id') // this will populate the industry details
                                  .populate('state_id') // this will populate the industry details
                                  .populate('city_id'); // this will populate the industry details

        console.log(manufacture,"manufacture data");
        if (!manufacture) {
              return res.redirect('/manufacture');
        }
          res.render('manufacture/view', { manufacture, message: "" });

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


module.exports = {List,Create,Store,Edit,Delete,View};