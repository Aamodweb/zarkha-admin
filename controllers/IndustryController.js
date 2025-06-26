const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const fs = require('fs');
const Hashtag = require('../models/Hashtag');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const industries = await Industry.find()
                                 .populate('hash_tags');

        res.render('industry/index', { industries, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const industry = null;
          const hashtag = await Hashtag.find({ status: 'active' });
        res.render('industry/create', { industry,hashtag, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}
const Store = async (req, res) => {
  try {
    const { id, name, description, status,hash_tags } = req.body;

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
          seo: req.body.seo,
          hash_tags: Array.isArray(hash_tags)
                    ? hash_tags
                    : typeof hash_tags === 'string' && hash_tags.trim() !== ''
                      ? [hash_tags]
                      : [],
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
        seo: req.body.seo,
        hash_tags: Array.isArray(hash_tags)
                  ? hash_tags
                  : typeof hash_tags === 'string' && hash_tags.trim() !== ''
                    ? [hash_tags]
                    : [],
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
         const hashtag = await Hashtag.find({ status: 'active' });
        console.log(industry,"industry data");
        if (!industry) {
              return res.redirect('/industry');
        }
          res.render('industry/create', { industry,hashtag });

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

const IndustryExport = async (req, res) => {
  try {
    const industries = await Industry.find()
      .populate('hash_tags') // if hashtags are stored as ObjectIds
      .lean();

    if (!industries || industries.length === 0) {
      return res.status(404).send('No industries found to export.');
    }

    // Prepare export data
      const exportData = industries.map((industry, index) => ({
      SNo: index + 1,
      Name: industry.name || '',
      Description: industry.description || '',
      Slug: industry.slug || '',
      Status: industry.status || 'inactive',
      Hashtags: (industry.hash_tags || []).map(ht => ht.name).join(', '),
      meta_title: industry.seo?.meta_title || '',
      meta_description: industry.seo?.meta_description || '',
      meta_keyword: industry.seo?.meta_keyword || '',
      canonical_url: industry.seo?.canonical_url || '',
      CreatedAt: industry.created_at ? new Date(industry.created_at).toLocaleString() : '',
    }));


    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Industries');

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send response
    res.setHeader('Content-Disposition', 'attachment; filename="industry_export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);

  } catch (error) {
    console.error('Industry export error:', error);
    return res.status(500).send('Failed to export industries.');
  }
};

const IndustryImport = async (req, res) => {
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
      const { name, status, hashtags,description, meta_title, meta_description, meta_keyword } = row;

      if (!name || !status) {
        skipped.push({ name, reason: 'Missing name or status' });
        continue;
      }

      const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

      // Check for duplicates
      const existingIndustry = await Industry.findOne({ name: name.trim() });
      if (existingIndustry) {
        skipped.push({ name, reason: 'Already exists' });
        continue;
      }

      // Parse comma-separated hashtag IDs and fetch active ones
      let hashTagIds = [];

      if (hashtags && String(hashtags).trim() !== '') {
            const ids = String(hashtags)
              .split(',')
              .map(id => id.trim())
              .filter(id => id);

               console.log("after filter hashids",ids);

            // Fetch only active hashtags
            const validHashtags = await Hashtag.find({
              _id: { $in: ids },
              status: 'active' // or true if your schema uses boolean
            }).select('_id');

            console.log("valid hashtag ids",validHashtags);

            hashTagIds = validHashtags.map(tag => tag._id);
         }

      // Insert new Industry
      await Industry.create({
        name: name.trim(),
        description: description,
        slug,
        status,
        seo: {
          meta_title: meta_title || '',
          meta_description: meta_description || '',
          meta_keywords: meta_keyword || ''
        },
        hash_tags: hashTagIds
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

module.exports = {List,Create,Store,Edit,Delete,IndustryExport,IndustryImport};

