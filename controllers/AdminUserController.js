const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');

const List = async(req,res)=>{
    try{
        // Fetch all admin users from the collection
         const users = await AdminUser.find();

        res.render('adminuser/index', { users, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Create = async(req,res)=>{
    try{
        const user = null;
        res.render('adminuser/create', { user, message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const Store = async (req, res) => {
  try {
    const { id, name, email, password, role, status } = req.body;

    // Check if email already exists (excluding current user if updating)
    let existingUser;
    if (id) {
      existingUser = await AdminUser.findOne({ email: email, _id: { $ne: id } });
    } else {
      existingUser = await AdminUser.findOne({ email: email });
    }

    if (existingUser) {
      return res.status(200).json({
        status: false,
        errors: {
          email: 'Email is already in use',
        },
      });
    }

    if (id) {
      // Update existing user
      const updateData = {
        username: name,
        email,
        role,
        status: status,
      };

      // If password provided, hash and update
      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await AdminUser.findByIdAndUpdate(id, updateData, { new: true });

      return res.status(200).json({
        status: true,
        message: 'User updated successfully',
        data: updatedUser,
        redirect_url: '/admin_user',
      });
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new AdminUser({
        username: name,
        email,
        password: hashedPassword,
        role,
        status: status,
      });

      await newUser.save();

      return res.status(201).json({
        status: true,
        message: 'User created successfully',
        data: newUser,
        redirect_url: '/admin_user',
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

        const userId = req.params.id;
        // Find the user by ID
        const user = await AdminUser.findById(userId);
        if (!user) {
              return res.redirect('back');
        }

        console.log(user,"User data");
          res.render('adminuser/create', { user });

    }
    catch (error) {
        console.error(error.message);
        return res.redirect('back');
    }
}

const Delete = async (req, res) => {
 try {
        const userId = req.params.id;
        // Find the user by ID
        const user = await AdminUser.findById(userId);
        if (!user) {
           return res.redirect('/admin_user');
        }

        // Delete the user
        await AdminUser.findByIdAndDelete(userId);

        // Redirect to the admin user list with a success message
        req.flash('success', 'User deleted successfully');
       return res.redirect('/admin_user');


    }
    catch (error) {
        console.error(error.message);
        return res.redirect('/admin_user');
    }

}

module.exports = {List,Create,Store,Edit,Delete};