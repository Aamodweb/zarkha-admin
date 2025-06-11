
const State = require('../models/State');
const City = require('../models/City');
const XLSX = require('xlsx');
const fs = require('fs');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const city_list = await City.find() // this will populate the industry details
                                  .populate({
                                      path: "state_id",
                                      populate: { path: "country_id" } // Populate country_id from state
                                  })
                                  .sort({ createdAt: -1 }); // optional sorting
        res.render('city/index', { city_list, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const city = null;
        let state = await State.find().catch(error => console.error("Error fetching data:", error));
        console.log(state, "state List");
        // Render the create page with the industries
        res.render('city/create', { state,city, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Store = async (req, res) => {
  try {
    const { id,state_id,name,code} = req.body;

    // Check if city already exists (excluding current one during update)
    let existingcity;
    if (id) {
      existingcity = await City.findOne({ name: name, _id: { $ne: id },state_id:state_id });
    } else {
      existingcity = await City.findOne({ name: name,state_id:state_id });
    }

    if (existingcity) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'City with this name already exists',
        },
      });
    }


    if (id) {
      // Update existing category
        const updateData = {
          state_id,
          name,
          code
        };

        const updatedcity = await City.findByIdAndUpdate(id, updateData, {
          new: true,
        });
      return res.status(200).json({
        status: true,
        message: 'City updated successfully',
        data: updatedcity,
        redirect_url: '/city',
      });
    } else {
      // Create new state
      const newCity = new City({
        state_id,
        name,
        code
      });

      await newCity.save();

      return res.status(201).json({
        status: true,
        message: 'City created successfully',
        data: newCity,
        redirect_url: '/city',
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
        const CityId = req.params.id;
        // Find the user by ID
        const city = await City.findById(CityId);

        let state = await State.find().catch(error => console.error("Error fetching data:", error));


        console.log(state,"state data");
        if (!state) {
              return res.redirect('/city');
        }
          res.render('city/create', { state,city, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/city');
    }
}

const Delete = async (req, res) => {
 try {
        const cityId = req.params.id;
        // Find the user by ID
        const city = await City.findById(cityId);
        if (!city) {
           return res.redirect('/city');
        }

        // Delete the user
        await City.findByIdAndDelete(cityId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'City deleted successfully');
       return res.redirect('/city');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/city');
    }
}

const GetCity = async (req,res) => {
   try {
        let stateId = req.query.state_id;
        if (!stateId) return res.status(400).json({ error: "State ID is required" });

        let cities = await City.find({ state_id: stateId }); // Fetch cities based on state
        res.json(cities);
    } catch (error) {
        console.error("Error fetching cities:", error);
        res.status(500).json({ error: "Server error" });
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
                const { name, city_code, state_name } = row;

                if (!name || !city_code || !state_name) {
                  skipped.push({ name, reason: 'Missing data' });
                  continue;
                }

                const state = await State.findOne({ name: state_name.trim() });
                if (!state) {
                  skipped.push({ name, reason: `State not found: ${state_name}` });
                  continue;
                }

                // Check for duplicate (same state name + country)
                const existingCity = await City.findOne({
                  name: name.trim(),
                  state_id: state._id
                });

                if (existingCity) {
                  skipped.push({ name, reason: 'Already exists' });
                  continue;
                }

                // Insert new state
                await City.create({
                  name: name.trim(),
                  code: city_code.trim(),
                  state_id: state._id
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

module.exports = {List,Create,Store,Edit,Delete,GetCity,ImportXLSX};