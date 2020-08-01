const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const consola = require('consola');
const User = require("../model/User").User;

const router = express.Router();

//When the user sends a post request to this route, passport authenticates the user based on the
//middleware created previously
router.post('/signup', (req, res, next) => {
    passport.authenticate('signup', (err, user, info) => {
        consola.info(info);
        if (err) {
            return next(err); // will generate a 500 error
        }
        if (!user) {
            return res.status(409).json(info);
        }

        res.json({
            message: 'Signup successful',
            user: user
        });
    })(req, res, next);
});

router.post('/login', async(req, res, next) => {
    passport.authenticate('login', async(err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error('An Error occurred')
                return next(error);
            }
            req.login(user, { session: false }, async(error) => {
                if (error) return next(error)
                    //We don't want to store the sensitive information such as the
                    //user password in the token so we pick only the email and id
                const body = { _id: user._id, email: user.email };
                //Sign the JWT token and populate the payload with the user email and id
                const token = jwt.sign({ user: body }, 'top_secret');
                //Send back the token to the user
                return res.json({ token });
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});

router.get(
    '/user',
    passport.authenticate('jwt', { session: false }),
    function(req, res, next) {
        const { userId } = req.user;
        User.findOne({ _id: userId }, (err, data) => {
            if (err) {
                res.status(500).send(err);
            } else if (data) {
                const userData = data;
                res.status(200).send(userData);
            } else {
                res.status(500).send('invalid token');
            }
        });
    }
);

module.exports = router;