const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const Industry = require('../models/Industry');
const Partner = require('../models/Partner');
const Country = require('../models/Country');
const State = require('../models/State');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const partner_list = await Partner.find()
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('partner/index', { partner_list, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{

 
    try{
        const partner = null;
        // Fetch all industries to populate the dropdown
        const industries = await Industry.find({ status: 'active' });
        // Render the create page with the industries

          // Fetch only India from countries collection
        const country = await Country.findOne({ name: "India" });
        // Fetch only states belonging to India
        const states = await State.find({ country_id: country._id });

        res.render('partner/create', { partner,industries,states, message: "" });
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
  console.log("Request cookies",req.cookies);

  try {
    const { role = 'boutique' } = req.body;

    if (role === 'boutique') {
      return await storeBoutique(req, res);
    }

    // Add more role checks here in future
    return res.status(400).json({
      status: false,
      message: 'Unsupported partner role'
    });
  } catch (error) {
    console.error('Error in Store:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};



const storeBoutique = async (req, res) => {
   console.log("Request cookies",req.cookies.access_token);
  const decoded = jwt.verify(req.cookies.access_token, process.env.JWT_SECRET || 'your_secret_key');
  try {
    

    console.log(req.body,"request Body");
    const slug = slugify(req.body.name);
   
     // Build query only for boutique type
      let query = {
        dashboard_email: req.body.dashboard_email
      };

      // If this is an update, exclude current ID
      if (req.body.id) {
        query._id = { $ne: req.body.id };
      }

      const existing = await Partner.findOne(query);

      if (existing) {
        // Delete uploaded files as dashboard_email already exists
        if (req.files) {
          for (const key in req.files) {
            req.files[key].forEach(file => {
              const filePath = path.join(__dirname, '..', 'uploads', 'partner', file.filename);
              fs.unlink(filePath, err => {
                if (err) console.error('Error deleting file:', filePath, err);
              });
            });
          }
        }

        return res.status(200).json({
          status: false,
          errors: { dashboard_email: 'Partner with this dashboard email already exists' },
        });
      }

    // Files
    const document_front_image = req.files?.document_front_image?.[0]?.filename || '';
    const document_back_image = req.files?.document_back_image?.[0]?.filename || '';
    const registration_certificate = req.files?.registration_certificate?.[0]?.filename || '';
    const cheque_or_passbook = req.files?.cheque_or_passbook?.[0]?.filename || '';
    const digital_signature = req.files?.digital_signature?.[0]?.filename || '';
    const store_logo = req.files?.store_logo?.[0]?.filename || '';

    
    const partnerData = {
      role: 'boutique',
      name:req.body.name,
      email:req.body.email,
      mobile:req.body.mobile,
      whatsapp:req.body.whatsapp,
      dashboard_email:req.body.dashboard_email,

      // Common fields
      store_name:req.body.store_name,
      pickup_address_1:req.body.pickup_address_1,
      pickup_address_2:req.body.pickup_address_2,
      pincode:req.body.pincode,
      city_id:req.body.city_id,
      state_id:req.body.state_id,
      pickup_contact_person:req.body.pickup_contact_person,
      pickup_phone:req.body.pickup_phone,

      bank_account_holder:req.body.bank_account_holder,
      bank_account_number:req.body.bank_account_number,
      ifsc_code:req.body.ifsc_code,
      bank_name:req.body.bank_name,
      upi_id:req.body.upi_id,
      // Boutique nested fields
      boutique: {
        business_name: req.body.business_name,
        proprietor_name: req.body.proprietor_name,
        business_type: req.body.business_type,
        gst_number: req.body.gst_number,
        pan_number: req.body.pan_number,
        document_type: req.body.document_type,

        has_inventory: req.body.has_inventory,
        source_from_zarkha: req.body.source_from_zarkha,
        margin_percent: req.body.margin_percent,
        self_pricing_enabled: req.body.self_pricing_enabled,
        return_policy:  req.body.return_policy,
        delivery_partner_preference: req.body.delivery_partner_preference,
        operating_days: req.body.operating_days ? req.body.operating_days: [],
        working_hours: {
          start:req.body.working_hours_start,
          end: req.body.working_hours_end
        },
        custom_branding_enabled: req.body.custom_branding_enabled,
        agreement_accepted: req.body.agreement_accepted,
        social_links: {
          instagram: req.body.instagram,
          facebook:  req.body.facebook
        }
      },
      created_by:decoded.userId,
      status:req.body.status
    };

    if(req.body.temp_password) {
       let password = await bcrypt.hash(req.body.temp_password, 10)
       partnerData.temp_password = password;
    }

    console.log("partner data",partnerData);

    if(document_front_image){
      partnerData.boutique.document_front = document_front_image;
    }
    if(document_back_image){
      partnerData.boutique.document_back = document_back_image;
    }
    if(registration_certificate){
        partnerData.boutique.registration_certificate = registration_certificate;
    }
    if(cheque_or_passbook){
         partnerData.cheque_or_passbook = cheque_or_passbook;
    }

    if(digital_signature){
         partnerData.boutique.digital_signature = digital_signature;
    }

    if(store_logo){
        partnerData.boutique.store_logo = store_logo;
    }

    const result = req.body.id
      ? await Partner.findByIdAndUpdate(req.body.id, partnerData, { new: true })
      : await new Partner(partnerData).save();

    return res.status(200).json({
      status: true,
      message: `Boutique Partner ${req.body.id ? 'updated' : 'created'} successfully`,
      data: result,
      redirect_url: '/partner'
    });
  } catch (error) {
    console.error('Error in Boutique Store:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};


const Edit = async (req, res) => {
    try {
        const PartnerId = req.params.id;
        // Find the user by ID
        const partner = await Partner.findById(PartnerId);

         // Fetch only India from countries collection
        const country = await Country.findOne({ name: "India" });
        // Fetch only states belonging to India
        const states = await State.find({ country_id: country._id });

        console.log(partner,"partner data");
        if (!partner) {
              return res.redirect('/partner');
        }
          res.render('partner/create', { partner,country,states, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/partner');
    }
}

const View = async (req, res) => {
    try {
        const PartnerId = req.params.id;
        // Find the user by ID
        const partner = await Partner.findById(PartnerId)
                                  .populate('state_id') // this will populate the industry details
                                  .populate('city_id'); // this will populate the industry details

        console.log(partner,"partners data");
        if (!partner) {
              return res.redirect('/partner');
        }
          res.render('partner/view', { partner, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/manufacture');
    }
}

const Delete = async (req, res) => {
 try {
        const PartnerId = req.params.id;
        // Find the user by ID
        const partner = await Partner.findById(PartnerId);
        if (!partner) {
           return res.redirect('/partner');
        }

        // Delete the user
        await Partner.findByIdAndDelete(PartnerId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Partner deleted successfully');
       return res.redirect('/partner');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/partner');
    }

}

const GetPartnerdetails = async (req, res) => {
  try {
     const PartnerId = req.params.id;
        // Find the user by ID
        const partner = await Partner.findById(PartnerId);
       res.json(partner);
       } catch (error) {
        console.error("Error fetching partners:", error);
        res.status(500).json({ error: "Server error" });
    }
}

const UpdatePartnerCreditional = async (req,res) => {
   try {
    const { partner_id, dashboard_email, dashboard_password } = req.body;

    const existingEmail = await Partner.findOne({
      _id: { $ne: partner_id },
      dashboard_email: dashboard_email
    });

    if (existingEmail) {
      return res.json({ status: false, message: 'This email is already in use.' });
    }

    const updateData = { dashboard_email };
    if (dashboard_password) {
      updateData.dashboard_password = await bcrypt.hash(dashboard_password, 10); // Replace with your hashing logic
    }
    
    await Partner.findByIdAndUpdate(partner_id, updateData);

    return res.json({ status: true, message: 'Credentials updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }   
}


module.exports = {List,Create,Store,Edit,Delete,View,storeBoutique,GetPartnerdetails,UpdatePartnerCreditional};