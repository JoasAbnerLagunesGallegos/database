const {request, response} = require ('express');
const usersModel = require('../models/users');
const pool = require ('../db');
const bcrypt = require('bcrypt');

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
        });

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

    if(!username || !email || !password || !name || ! lastname || !role_id || !is_active){
        res.status(400).json({msg: 'Missing information'});
        return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = [
        username,
        email,
        passwordHash,
        name,
        lastname,
        phone_number,
        role_id,
        is_active];

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

const patchUser = async (req,res)=>{
    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_number,
        role_id,
        is_active
    } = req.body;

    let passwordHash;

    if(password){
        const saltRounds = 10;
        passwordHash = await bcrypt.hash(password, saltRounds);
    }

    let newUserData = [
        username,
        email,
        passwordHash,
        name,
        lastname,
        phone_number,
        role_id,
        is_active
    ];

    let conn;
    const{id} = req.params;

    if(isNaN(id)){
        res.status(400).json({msg:'Invalid ID'});
        return;
    }

    try {
        conn = await pool.getConnection();
        const [userExists] = await conn.query(usersModel.getByID,[id], (err)=>{
            if(err){
                throw new Error(err);
            }
        });

        if(!userExists || userExists.is_active === 0){
            res.status(404).json({msg: 'User not found'});
            return;
        }

        if(username){

        const [usernameUser] = await conn.query(usersModel.getByUsername,[username], (err)=>{
            if (err) throw err;
        });
        if (usernameUser){
            res.status(409).json({msg:`User with username ${username} already exists`});
            return;
        }
        }

        if(email){
        const [emailUser] = await conn.query(usersModel.getByEmail,[email], (err)=>{
            if (err) throw err;
        });
        if (emailUser){
            res.status(409).json({msg:`User with email ${email} already exists`});
            return;
        }
        }

        const oldUserData=[
        userExists.username,
        userExists.email,
        userExists.password,
        userExists.name,
        userExists.lastname,
        userExists.phone_number,
        userExists.role_id,
        userExists.is_active
        ];

        newUserData.forEach((userData, index) =>{
            if(!userData){
                newUserData[index] = oldUserData[index];
            }
        });

        const userUpdated = await conn.query(usersModel.updateRow,[...newUserData, id],(err)=>{
            if(err) throw err;
        })

        if(userUpdated.affectedRows === 0) throw new error({msg:'Failed to update user'});

        res.json({msg: 'User updated succesfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if(conn) conn.end();
    }
}

const deleteUser = async (req = request, res = response)=>{
    let conn;

    try {
    conn = await pool.getConnection();
    const {id} = req.params

    const [userExist] = await conn.query(usersModel.getByID,[id],(err)=>{
    if(err) throw err;
    });

    if (!userExist || userExist.is_active === 0){
        res.status(404).json({msg:'User not found'});
        return;
    }

    const userDeleted = await conn.query(usersModel.deleteRow,[id],(err)=>{
        if(err) throw err;
    });

    if(userDeleted.affectedRows === 0){
        throw new Error ({msg:'Failed to delete user'});
    };
    res.json({msg:'User deleted succesfully'});


    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if(conn) conn.end();
    }
}

module.exports = {usersList, listUserByID, addUser, patchUser, deleteUser};