const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const checkAuth = require('../middleware/check-auth')

router.get('/', (req, res, next) => {
    User.find()
        .select("fname lname email")
        .exec()
        .then(users => {
            const response = {
                count: users.length,
                products: users.map(user => {
                    return {
                        fname: user.fname,
                        lname: user.lname,
                        email: user.email,
                        _id: user._id,
                        request: {
                            type: 'GET',
                            url:'http://localhost:9000/user/' + user._id
                        }
                    };
                })
            }
            // if (docs.length >= 0) {
                res.status(200).json(response);
            // } else {
            //     res.status(404).json({ message: 'No entries found'})
            // }
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({ error: err });
        });
});

router.post('/signup', (req, res ,next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length >= 1) {
                return res.status(409).json({ 
                    message: 'User already exists'});
            } 
            else {
               console.log('This Works!!')
                bcrypt.hash(req.body.password, 8, (err, hash) => {
                    if (err) {
                        return res.json({ error: err});
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            fname: req.body.fname,
                            lname: req.body.lname,
                            email: req.body.email,
                            password: hash,
                            city: req.body.city,
                            state: req.body.state
                        });
                        if(req.body.confirmPassword !== req.body.password) {
                            return res.status(500).json({
                                 message: 'Please enter same password for confirmation'
                            })
                        }
                        else {
                            user.save()
                                .then(
                                    result => {
                                    console.log(result);
                                    res.status(201).json({ message: 'User created'});
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        error: err
                                    });
                                })
                        }
                    }
                });
            }
        });
     ;   
});

router.delete("/:userId", (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User Deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/:userId', (req, res, next) =>{
    const id = req.params.userId;
    User.findById(id)
           .select('fname lname email _id')
           .exec()
           .then(user => {
               console.log("From databse ", user);
               if(user) {
                     res.status(200).json({
                        info: user,
                        request: { 
                            type: 'GET',
                            url: 'http://localhost:9000/user/'
                        }
                     });
               } else { 
                   res.status(404).json('No valid User found');
               }
           })
           .catch(err => { 
               console.log(err);
               res.status(500).json({error: err });
            });
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if(user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if(err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if(result) {
                    const token = jwt.sign(
                    {
                        email: user[0].email,
                        user: user[0]._id
                    }, 
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    }
                    );
                    return res.status(200).json({
                        message: 'Auth Successful',
                        token: token
                    });
                }
                res.status(401).json({
                    message: 'Auth failed'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router; 