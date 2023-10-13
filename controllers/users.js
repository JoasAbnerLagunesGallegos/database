const {request, response} = require ('express');
const usersModel = require('../models/users');
const pool = require ('../db');

const usersList = async (req = request, res = response)=>{
    
    let conn;
    try {
        conn = await pool.getConnection();
        const users = await conn.query(usersModel.getAll, (err)=>{
            if(err){
                throw new Error(err);
            }
        })
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
       if(conn) conn.end();
    }
}

const listUserByID = async (req = request, res = response)=>{
    const{id} = req.params;
    let conn;

    if(isNaN(id)){
        res.status(400).json({msg:'Invalid ID'});
        return;
    }

    try {
        conn = await pool.getConnection();
        const [users] = await conn.query(usersModel.getByID,[id], (err)=>{
            if(err){
                throw new Error(err);
            }
        })

        if(!users){
            res.status(404).json({msg: 'User not found'});
            return;
        }

        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
       if(conn) conn.end();
    }
}

const addUser = async (req= request,res=response)=>{
    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_number = '',
        role_id,
        is_active = 1
    } = req.body;

    if(!username || !email || !password || !name || ! lastname || !role_id){
        res.status(400).json({msg: 'Missing information'});
        return;
    }

    const user = [username,email,password,name,lastname,phone_number,role_id,is_active];

    let conn;
    try {
        conn= await pool.getConnection();

        const [usernameUser] = await conn.query(usersModel.getByUsername,[username], (err)=>{
            if (err) throw err;
        });
        if (usernameUser){
            res.status(409).json({msg:`User with username ${username} already exists`});
            return;
        }

        const [emailUser] = await conn.query(usersModel.getByEmail,[email], (err)=>{
            if (err) throw err;
        });
        if (emailUser){
            res.status(409).json({msg:`User with email ${email} already exists`});
            return;
        }

        const userAdded = await conn.query(usersModel.addRow,[...user],(err)=>{
            if(err) throw err;
        })

        if(userAdded.affectedRows === 0) throw new error({msg:'Failed to add user'});

        res.json({msg: 'User added succesfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if(conn) conn.end();
    }
}

module.exports = {usersList, listUserByID, addUser};