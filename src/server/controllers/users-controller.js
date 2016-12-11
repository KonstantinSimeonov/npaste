'use strict';

const usersServices = require('../data/users-services'),
    themeServices = require('../data/themes');

module.exports = {
    getRegistrationForm(req, res) {
        res.status(200).render('sign-up', {
            formLegend: 'npaste - Sign up',
            formAction: '/sign-up',
            submitBtnMsg: 'Sign up'
        });
    },
    register(req, res) {
        usersServices.createUser(req.body).then(function (dbRes) {
            res.status(201).json({ success: true });
        })
            .catch(function (err) {
                console.log(err);
                res.json(err);
            });
    },
    signIn(req, res) {
        res.status(200).render('sign-up', {
            formLegend: 'npaste - Sign in',
            formAction: '/sign-in',
            submitBtnMsg: 'Sign in'
        });
    },
    getProfile(req, res) {
        if (req.user) {
            const themes = themeServices.getDropdownThemes();

            if(!req.user.settings) {
                req.user.settings = { theme: 'solarizedlight' };
            } else if(!req.user.settings.theme) {
                req.user.settings.theme = 'solarizedlight';
            }

            req.user.settings.theme = req.user.settings.theme[0].toUpperCase() + req.user.settings.theme.slice(1);
            return res.status(200).render('profile', { user: req.user, themes });
        }

        res.status(403).render('error');
    },
    updateSettings(req, res) {
        const settings = req.body.settings;

        settings.theme = settings.theme.toLowerCase();

        usersServices.updateUserSettings(req.user._id, settings).then(result => res.status(200).json(settings));
    }
}