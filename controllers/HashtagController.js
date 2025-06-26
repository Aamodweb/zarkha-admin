const bcrypt = require('bcrypt');
const Hashtag = require('../models/Hashtag');
const XLSX = require('xlsx');
const fs = require('fs');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const hashtag = await Hashtag.find() // this will populate the industry details
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('hashtag/index', { hashtag, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const hashtag = null;
        // Render the create page with the industries
        res.render('hashtag/create', { hashtag, message: "" });
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
    console.log(req.body, "req.body");
    const { id, name, description, status } = req.body;

   const cleanedName = name.replace(/^#/, ''); // Remove leading '#' if present
   const slug = slugify(cleanedName);

     // Check for existing slug (excluding current ID if updating)
    const existing = await Hashtag.findOne(
      id
        ? { slug, _id: { $ne: id } } // For update, exclude current
        : { slug }                  // For create, just match
    );

    if (existing) {
      return res.status(200).json({
        status: false,
        errors: { name: 'Hashtag with this name already exists' }
      });
    }

    if (id) {
      // Update existing category
        const updateData = {
          name,
          slug,
          description,
          status,
        };

        const updatedhashtag = await Hashtag.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'HashTag updated successfully',
        data: updatedhashtag,
        redirect_url: '/hashtag',
      });
    } else {
      // Create new category
      const newhashtag = new Hashtag({
          name,
          slug,
          description,
          status,
      });

      await newhashtag.save();

      return res.status(201).json({
        status: true,
        message: 'HashTag created successfully',
        data: newhashtag,
        redirect_url: '/hashtag',
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
        const HashId = req.params.id;
        // Find the user by ID
        const hashtag = await Hashtag.findById(HashId);

        console.log(hashtag,"Hashtag data");
        if (!hashtag) {
              return res.redirect('/hashtag');
        }
          res.render('hashtag/create', { hashtag, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/units');
    }
}

const Delete = async (req, res) => {
 try {
        const hashtagId = req.params.id;
        // Find the user by ID
        const hashtag = await Hashtag.findById(hashtagId);
        if (!hashtag) {
           return res.redirect('/hashtag');
        }

        // Delete the user
        await Hashtag.findByIdAndDelete(hashtagId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Hashtag deleted successfully');
       return res.redirect('/hashtag');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/hashtag');
    }
}

const HashtagExport = async (req, res) => {
  try {
    const hashtags = await Hashtag.find()
      .lean();

    if (!hashtags || hashtags.length === 0) {
      return res.status(404).send('No hashtags found to export.');
    }

    // Prepare export data
      const exportData = hashtags.map((hashtag, index) => ({
      SNo: index + 1,
      Name: hashtag.name || '',
      Slug: hashtag.slug || '',
      Description: hashtag.description || '',
      Status: hashtag.status || 'inactive',
      CreatedAt: hashtag.created_at ? new Date(hashtag.created_at).toLocaleString() : '',
    }));


    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Industries');

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send response
    res.setHeader('Content-Disposition', 'attachment; filename="hashtag_export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);

  } catch (error) {
    console.error('Hashtag export error:', error);
    return res.status(500).send('Failed to export Hashtag.');
  }
};

const HashTagImport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;

    // Read Excel/CSV file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log('File uploaded:', filePath);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);

    const inserted = [];
    const skipped = [];

    for (const row of rows) {
       console.log("row",row);
      const { name, status,description } = row;

      if (!name || !status) {
        skipped.push({ name, reason: 'Missing name or status' });
        continue;
      }

      const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

      // Check for duplicates
      const existingHashtag = await Hashtag.findOne({ name: name.trim() });
      if (existingHashtag) {
        skipped.push({ name, reason: 'Already exists' });
        continue;
      }

      // Insert new Industry
      await Hashtag.create({
        name: name.trim(),
        description: description,
        slug,
        status,
      });

      inserted.push(name.trim());
    }

    return res.json({
      message: `Import completed: ${inserted.length} inserted, ${skipped.length} skipped`,
      inserted,
      skipped
    });

  } catch (err) {
    console.error('Import error:', err);
    return res.status(500).json({ error: 'Import failed', details: err.message });
  }
};

module.exports = {List,Create,Store,Edit,Delete,HashtagExport,HashTagImport};