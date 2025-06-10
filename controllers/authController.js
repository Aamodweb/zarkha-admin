const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');

const login = async(req,res)=>{
    try{
        res.render('auth/login', { message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}

const LoginCheck = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Please fill all fields" });
    }

    const user = await AdminUser.findOne({ email: email.toLowerCase() });

  console.log(user,"User list");
  console.log(email.toLowerCase());

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    // Set token in httpOnly cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log(`User ${user.username} logged in (JWT token created)`);

    return res.json({ success: true, redirect: '/dashboard' });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const PasswordGenerator = async(password)=>{
    try{
          const saltRounds = 10; // how secure/hash complexity

            // To hash password (e.g. when creating user)
            const plainPassword = 'admin@123';

            bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
            if (err) {
                console.error(err);
            } else {
                // Save 'hash' in database instead of plain password
                console.log('Hashed password:', hash);
            }
            });
    }
    catch(error){
        console.log(error.message);
    }
}

module.exports = {login,LoginCheck,PasswordGenerator};
