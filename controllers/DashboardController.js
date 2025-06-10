const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');

const index = async(req,res)=>{
    try{
        res.render('dashboard', { message: "" });
    }
    catch(error){
        console.log(error.message);
    }
}


module.exports = {index};