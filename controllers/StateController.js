const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const Country = require('../models/Country');
const State = require('../models/State');
const XLSX = require('xlsx');
const fs = require('fs');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const state_list = await State.find() // this will populate the industry details
                                    .populate('country_id')
                                  .sort({ createdAt: -1 }); // optional sorting
        res.render('state/index', { state_list, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const state = null;
          let country = await Country.find().catch(error => console.error("Error fetching data:", error));

        console.log(country, "country List");
        // Render the create page with the industries
        res.render('state/create', { state,country, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Store = async (req, res) => {
  try {
    const { id,country_id,name,code} = req.body;

    // Check if state already exists (excluding current one during update)
    let existingstate;
    if (id) {
      existingstate = await State.findOne({ name: name, _id: { $ne: id },country_id:country_id });
    } else {
      existingstate = await State.findOne({ name: name,country_id:country_id });
    }

    if (existingstate) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'State with this name already exists',
        },
      });
    }


    if (id) {
      // Update existing category
        const updateData = {
          country_id,
          name,
          code
        };

        console.log("update data",updateData)
        const updatedstate = await State.findByIdAndUpdate(id, updateData, {
          new: true,
        });
      return res.status(200).json({
        status: true,
        message: 'State updated successfully',
        data: updatedstate,
        redirect_url: '/state',
      });
    } else {
      // Create new state
      const newState = new State({
        country_id,
        name,
        code
      });

      await newState.save();

      return res.status(201).json({
        status: true,
        message: 'State created successfully',
        data: newState,
        redirect_url: '/state',
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
        const StateId = req.params.id;
        // Find the user by ID
        const state = await State.findById(StateId);

         let country = await Country.find().catch(error => console.error("Error fetching data:", error));

        console.log(country, "country List");

        console.log(state,"state data");
        if (!state) {
              return res.redirect('/state');
        }
          res.render('state/create', { state,country, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/state');
    }
}
const ImportXLSX = async (req, res) => {
        try {
              if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

              const filePath = req.file.path;

              // Read Excel/CSV file
              const workbook = XLSX.readFile(filePath);
              const sheetName = workbook.SheetNames[0];
              const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                console.log(filePath);
              // Clean up uploaded file
              fs.unlinkSync(filePath);

              const skipped = [];
              const inserted = [];

              for (const row of rows) {
                const { name, code, country_name } = row;

                if (!name || !code || !country_name) {
                  skipped.push({ name, reason: 'Missing data' });
                  continue;
                }

                const country = await Country.findOne({ name: country_name.trim() });
                if (!country) {
                  skipped.push({ name, reason: `Country not found: ${country_name}` });
                  continue;
                }

                // Check for duplicate (same state name + country)
                const existingState = await State.findOne({
                  name: name.trim(),
                  country_id: country._id
                });

                if (existingState) {
                  skipped.push({ name, reason: 'Already exists' });
                  continue;
                }

                // Insert new state
                await State.create({
                  name: name.trim(),
                  code: code.trim(),
                  country_id: country._id
                });

                inserted.push(name.trim());
              }

              return res.json({
                message: `Import completed: ${inserted.length} inserted, ${skipped.length} skipped`,
                inserted,
                skipped
              });
            } catch (err) {
              console.error(err);
              return res.status(500).json({ error: 'Import failed', details: err.message });
            }
}

const Delete = async (req, res) => {
 try {
        const stateId = req.params.id;
        // Find the user by ID
        const state = await State.findById(stateId);
        if (!state) {
           return res.redirect('/state');
        }

        // Delete the user
        await State.findByIdAndDelete(stateId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'State deleted successfully');
       return res.redirect('/state');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/state');
    }
}


module.exports = {List,Create,Store,Edit,Delete,ImportXLSX};