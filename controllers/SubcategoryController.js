const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Hashtag = require('../models/Hashtag');
const XLSX = require('xlsx');
const fs = require('fs');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const subcategory = await Subcategory.find()
                                  .populate('category_id') // this will populate the industry details
                                  .populate('hash_tags')
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('subcategory/index', { subcategory, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
       
        const subcategory = null;
        // Fetch all industries to populate the dropdown
        const category = await Category.find({ status: 'active' });
        // Render the create page with the industries
           const hashtag = await Hashtag.find({ status: 'active' });
        res.render('subcategory/create', { category,subcategory,hashtag, message: "" });
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
    const { id, category_id, name, description, status,hash_tags } = req.body;

    const slug = slugify(name);

    // Check if category already exists (excluding current one during update)
    let existingCategory;
    if (id) {
      existingCategory = await Subcategory.findOne({ slug: slug, _id: { $ne: id } });
    } else {
      existingCategory = await Subcategory.findOne({ slug: slug });
    }

    if (existingCategory) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Subcategory with this name already exists',
        },
      });
    }

     let subcategory_image = '';

        if (req.files && req.files.length > 0) {
            subcategory_image = req.files
                .map(file => {
                    // Extract relative path
                    const relativePath = file.filename;
                    return relativePath;
                })
                .join(','); // Join multiple file paths into a single string
        }

        console.log("subcategory_image", subcategory_image);
        console.log("category_image files", req.files);

    if (id) {
      // Update existing category
        const updateData = {
          category_id,
          name,
          slug,
          description,
          status,
          seo: req.body.seo,
          hash_tags: Array.isArray(hash_tags)
                    ? hash_tags
                    : typeof hash_tags === 'string' && hash_tags.trim() !== ''
                      ? [hash_tags]
                      : [],
        };

        // Only update image if new one uploaded
        if (subcategory_image !== '') {
          updateData.image = subcategory_image;
        }

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'Subcategory updated successfully',
        data: updatedSubcategory,
        redirect_url: '/subcategory',
      });
    } else {
      // Create new category
      const newSubcategory = new Subcategory({
        category_id,
        name,
        slug,
        image: subcategory_image, // Use the new image path
        description,
        status: status,
        seo: req.body.seo,
        hash_tags: Array.isArray(hash_tags)
                  ? hash_tags
                  : typeof hash_tags === 'string' && hash_tags.trim() !== ''
                    ? [hash_tags]
                    : [],
        // image: req.file?.filename || null // Optional if handling images
      });

      await newSubcategory.save();

      return res.status(201).json({
        status: true,
        message: 'Subcategory created successfully',
        data: newSubcategory,
        redirect_url: '/subcategory',
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
        const SubcategoryId = req.params.id;
        // Find the user by ID
        const subcategory = await Subcategory.findById(SubcategoryId);

        const category = await Category.find({ status: 'active' });

           const hashtag = await Hashtag.find({ status: 'active' });

        console.log(subcategory,"subcategory data");
        if (!subcategory) {
              return res.redirect('/subcategory');
        }
          res.render('subcategory/create', { category,subcategory,hashtag, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/subcategory');
    }
}

const Delete = async (req, res) => {
 try {
        const subcategoryId = req.params.id;
        // Find the user by ID
        const subcategory = await Subcategory.findById(subcategoryId);
        if (!subcategory) {
           return res.redirect('/subcategory');
        }

        // Delete the user
        await Subcategory.findByIdAndDelete(subcategoryId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Subcategory deleted successfully');
       return res.redirect('/subcategory');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/subcategory');
    }

}

const FilterSubcategoryGet = async (req, res) => {
  try {
    const { category_id } = req.query;

    // Fetch categories based on industry_id
    const subcategories = await Subcategory.find({ category_id: category_id });

    res.status(200).json({
      status: true,
      data: subcategories,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const SubcategoryExport = async (req, res) => {
  try {
    const subcategorys = await Subcategory.find()
      .populate('category_id')
      .populate('hash_tags')
      .lean();

    if (!subcategorys || subcategorys.length === 0) {
      return res.status(404).send('No Subcategory found to export.');
    }

    // Prepare export data
      const exportData = subcategorys.map((subcategory, index) => ({
      SNo: index + 1,
      Category: subcategory.category_id.name || '',
      Name: subcategory.name || '',
      Slug: subcategory.slug || '',
      Description: subcategory.description || '',
      Status: subcategory.status || 'inactive',
      Hashtags: (subcategory.hash_tags || []).map(ht => ht.name).join(', '),
      meta_title: subcategory.seo?.meta_title || '',
      meta_description: subcategory.seo?.meta_description || '',
      meta_keyword: subcategory.seo?.meta_keyword || '',
      Status: subcategory.status || 'inactive',
      CreatedAt: subcategory.created_at ? new Date(category.created_at).toLocaleString() : '',
    }));


    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SubCategory');

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send response
    res.setHeader('Content-Disposition', 'attachment; filename="subcategory.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);

  } catch (error) {
    console.error('Subcategory export error:', error);
    return res.status(500).send('Failed to export Subcategory.');
  }
};

const SubcategoryImport = async (req, res) => {
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
      const { category_id,name,description,status,image,meta_title,meta_description,meta_keyword,hashtags } = row;

      if (!name || !status || !category_id) {
        skipped.push({ name, reason: 'Missing name or status or category id' });
        continue;
      }

      const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

      // Check for duplicates
      const existingCategory = await Subcategory.findOne({ name: name.trim() });
      if (existingCategory) {
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


          // Download image from URL
          let savedImage = '';
          // let categoryUploadPath = path.join(__dirname, '../uploads/category');
          // console.log("category upload path",categoryUploadPath);
          // if (image && image.startsWith('http')) {
          //   try {
          //     savedImage = await downloadImageFromUrl(image, categoryUploadPath);
          //   } catch (err) {
          //     console.warn(`Image download failed for ${name}: ${err.message}`);
          //     skipped.push({ name, reason: 'Image download failed' });
          //     continue;
          //   }
          // }


      // Insert new Industry
      await Subcategory.create({
          category_id,
          name,
          slug,
          image: savedImage, // Use the new image path
          description,
          status: status,
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

module.exports = {List,Create,Store,Edit,Delete,FilterSubcategoryGet,SubcategoryImport,SubcategoryExport};