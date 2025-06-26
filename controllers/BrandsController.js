const bcrypt = require('bcrypt');
const Brands = require('../models/Brands');
const Category = require('../models/Category');
const Industry = require('../models/Industry');
const Hashtag = require('../models/Hashtag');
const XLSX = require('xlsx');
const fs = require('fs');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const brands = await Brands.find()
                                  .populate('industry_id') // this will populate the industry details
                                  .populate('category_id') // this will populate the industry details
                                   .populate('hash_tags')
                                  .sort({ createdAt: -1 }); // optional sorting
                                  
          console.log(brands,"brands data");
        res.render('brands/index', { brands, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const brands = null;
        // Render the create page with the industries

          const industries = await Industry.find({ status: 'active' });
        const categorys = await Category.find({ status: 'active' });
         const hashtag = await Hashtag.find({ status: 'active' });

        res.render('brands/create', { brands,industries,categorys,hashtag, message: "" });
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
    const { id, name,industry_id,category_id, description, status,hash_tags } = req.body;

    const slug = slugify(name);

    // Check if category already exists (excluding current one during update)
    let existingBrands;
    if (id) {
      existingBrands = await Brands.findOne({ slug: slug, _id: { $ne: id } });
    } else {
      existingBrands = await Brands.findOne({ slug: slug });
    }

    if (existingBrands) {
      return res.status(200).json({
        status: false,
        errors: {
          name: 'Brands with this name already exists',
        },
      });
    }

     let brands_image = '';

        if (req.files && req.files.length > 0) {
            brands_image = req.files
                .map(file => {
                    // Extract relative path
                    const relativePath = file.filename;
                    return relativePath;
                })
                .join(','); // Join multiple file paths into a single string
        }

        console.log("brands_image", brands_image);
        console.log("brands_image files", req.files);

    if (id) {
      // Update existing category
        const updateData = {
          name,
          industry_id,
          category_id,
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
        if (brands_image !== '') {
          updateData.image = brands_image;
        }

        const updatedBrands = await Brands.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      return res.status(200).json({
        status: true,
        message: 'Brands updated successfully',
        data: updatedBrands,
        redirect_url: '/brands',
      });
    } else {
      // Create new category
      const newBrands = new Brands({
        name,
        industry_id,
        category_id,
        slug,
        image: brands_image, // Use the new image path
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

      await newBrands.save();

      return res.status(201).json({
        status: true,
        message: 'Brands created successfully',
        data: newBrands,
        redirect_url: '/brands',
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
        const BrandsId = req.params.id;
        // Find the user by ID
        const brands = await Brands.findById(BrandsId);

           const industries = await Industry.find({ status: 'active' });
          const hashtag = await Hashtag.find({ status: 'active' });
        console.log(brands,"brands data");
        if (!brands) {
              return res.redirect('/brands');
        }
          res.render('brands/create', { brands,industries,hashtag, message: "" });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/brands');
    }
}

const Delete = async (req, res) => {
 try {
        const brandsId = req.params.id;
        // Find the user by ID
        const brands = await Brands.findById(brandsId);
        if (!brands) {
           return res.redirect('/brands');
        }

        // Delete the user
        await Brands.findByIdAndDelete(brandsId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'Brands deleted successfully');
       return res.redirect('/brands');

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/brands');
    }

}


const FilterBrandGet = async (req, res) => {
  try {
    const { category_id } = req.query;

    // Fetch categories based on industry_id
    const brands = await Brands.find({ category_id: category_id });

    res.status(200).json({
      status: true,
      data: brands,
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


const BrandsExport = async (req, res) => {
  try {
    const brands = await Brands.find()
      .populate('industry_id')
      .populate('category_id')
      .populate('hash_tags')
      .lean();

    if (!brands || brands.length === 0) {
      return res.status(404).send('No Brands found to export.');
    }

    // Prepare export data
      const exportData = brands.map((brand, index) => ({
      SNo: index + 1,
      Industry: brand.industry_id.name || '',
      Category: brand.category_id.name || '',
      Name: brand.name || '',
      Slug: brand.slug || '',
      Description: brand.description || '',
      Status: brand.status || 'inactive',
      Hashtags: (brand.hash_tags || []).map(ht => ht.name).join(', '),
      meta_title: brand.seo?.meta_title || '',
      meta_description: brand.seo?.meta_description || '',
      meta_keyword: brand.seo?.meta_keyword || '',
      Status: brand.status || 'inactive',
      CreatedAt: brand.created_at ? new Date(brand.created_at).toLocaleString() : '',
    }));


    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Brands');

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send response
    res.setHeader('Content-Disposition', 'attachment; filename="brands.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);

  } catch (error) {
    console.error('Brands export error:', error);
    return res.status(500).send('Failed to export Brands.');
  }
};

const BrandsImport = async (req, res) => {
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
      const { industry_id,category_id,name,description,status,meta_title,meta_description,meta_keyword,hashtags } = row;

      if (!name || !status || !category_id || !industry_id) {
        skipped.push({ name, reason: 'Missing name or status or category id or industry id' });
        continue;
      }

      const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

      // Check for duplicates
      const existingbrands = await Brands.findOne({ name: name.trim() });
      if (existingbrands) {
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
      await Brands.create({
          industry_id,
          category_id,
          name,
          slug,
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

module.exports = {List,Create,Store,Edit,Delete,FilterBrandGet,BrandsImport,BrandsExport};