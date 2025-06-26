const bcrypt = require('bcrypt');
const Industry = require('../models/Industry');
const Category = require('../models/Category');
const Hashtag = require('../models/Hashtag');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mime = require('mime-types'); // Add at top of file
const { v4: uuidv4 } = require('uuid');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const categories = await Category.find()
                                  .populate('industry_id') // this will populate the industry details
                                  .populate('hash_tags') // this will populate the industry details
                                  .sort({ createdAt: -1 }); // optional sorting


        res.render('category/index', { categories, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const category = null;
        // Fetch all industries to populate the dropdown
        const industries = await Industry.find({ status: 'active' });

         const hashtag = await Hashtag.find({ status: 'active' });

        // Render the create page with the industries
        res.render('category/create', { category,industries,hashtag, message: "" });
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

// const downloadImageFromUrl = async (url, folderPath) => {
//   const response = await axios({
//     url,
//     method: 'GET',
//     responseType: 'stream'
//   });

//   // Get correct extension from Content-Type
//   const contentType = response.headers['content-type'];
//   const ext = mime.extension(contentType) || 'jpg'; // fallback to jpg

//   const fileName = `${uuidv4()}.${ext}`;
//   const filePath = path.join(folderPath, fileName);

//   const writer = fs.createWriteStream(filePath);
//   response.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on('finish', () => resolve(fileName));
//     writer.on('error', reject);
//   });
// };


const Store = async (req, res) => {
  try {
    const { id, industry_id, name, description, status,hash_tags } = req.body;

    const slug = slugify(name);

    // Check if category already exists (excluding current one during update)
    let existingCategory;
    if (id) {
      existingCategory = await Category.findOne({ slug: slug, _id: { $ne: id } });
    } else {
      existingCategory = await Category.findOne({ slug: slug });
    }

    if (existingCategory) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Category with this name already exists',
        },
      });
    }

     let category_image = '';

        if (req.files && req.files.length > 0) {
            category_image = req.files
                .map(file => {
                    // Extract relative path
                    const relativePath = file.filename;
                    return relativePath;
                })
                .join(','); // Join multiple file paths into a single string
        }

        console.log("category_image", category_image);
        console.log("category_image files", req.files);

    if (id) {
      // Update existing category
        const updateData = {
          industry_id,
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
        if (category_image !== '') {
          updateData.image = category_image;
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'Category updated successfully',
        data: updatedCategory,
        redirect_url: '/category',
      });
    } else {
      // Create new category
      const newCategory = new Category({
        industry_id,
        name,
        slug,
        image: category_image, // Use the new image path
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

      await newCategory.save();

      return res.status(201).json({
        status: true,
        message: 'Category created successfully',
        data: newCategory,
        redirect_url: '/category',
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
        const CategoryId = req.params.id;
        // Find the user by ID
        const category = await Category.findById(CategoryId);

        const industries = await Industry.find({ status: 'active' });
         const hashtag = await Hashtag.find({ status: 'active' });

        console.log(category,"category data");
        if (!category) {
              return res.redirect('/category');
        }
          res.render('category/create', { category,industries,hashtag, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/category');
    }
}

const Delete = async (req, res) => {
 try {
        const categoryId = req.params.id;
        // Find the user by ID
        const category = await Category.findById(categoryId);
        if (!category) {
           return res.redirect('/category');
        }

        // Delete the user
        await Category.findByIdAndDelete(categoryId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Category deleted successfully');
       return res.redirect('/category');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/category');
    }

}

const FilterCategoryGet = async (req, res) => {
  try {
    const { industry_id } = req.query;

    // Fetch categories based on industry_id
    const categories = await Category.find({ industry_id: industry_id })
      .populate('industry_id') // Populate the industry details
      .sort({ createdAt: -1 }); // Optional sorting

    res.status(200).json({
      status: true,
      data: categories,
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

const CategoryExport = async (req, res) => {
  try {
    const categorys = await Category.find()
      .populate('industry_id')
      .lean();

    if (!categorys || categorys.length === 0) {
      return res.status(404).send('No Category found to export.');
    }

    // Prepare export data
      const exportData = categorys.map((category, index) => ({
      SNo: index + 1,
      Industry: category.industry_id.name || '',
      Name: category.name || '',
      Slug: category.slug || '',
      Description: category.description || '',
      Status: category.status || 'inactive',
      Hashtags: (category.hash_tags || []).map(ht => ht.name).join(', '),
      meta_title: category.seo?.meta_title || '',
      meta_description: category.seo?.meta_description || '',
      meta_keyword: category.seo?.meta_keyword || '',
      Status: category.status || 'inactive',
      CreatedAt: category.created_at ? new Date(category.created_at).toLocaleString() : '',
    }));


    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Industries');

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send response
    res.setHeader('Content-Disposition', 'attachment; filename="category_export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);

  } catch (error) {
    console.error('Category export error:', error);
    return res.status(500).send('Failed to export Category.');
  }
};

const CategoryImport = async (req, res) => {
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
      const { industry_id,name,description,status,image,meta_title,meta_description,meta_keyword,hashtags } = row;

      if (!name || !status || !industry_id) {
        skipped.push({ name, reason: 'Missing name or status or industry id' });
        continue;
      }

      const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

      // Check for duplicates
      const existingCategory = await Category.findOne({ name: name.trim() });
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
      await Category.create({
         industry_id,
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

module.exports = {List,Create,Store,Edit,Delete,FilterCategoryGet,CategoryExport,CategoryImport};