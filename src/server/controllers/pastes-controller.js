'use strict';

const pastesServices = require('../data/pastes-services'),
    langServices = require('../data/languages');

function getNthIndex(n, symbol, str) {
    let index = 0,
        count = 0;

    while(count < n && index < str.length) {
        index = str.indexOf(symbol, index + 1);
        count += 1;
    }
    console.log(index);
    return index;
}

module.exports = {
    byId(req, res) {
        const paste = req.paste;
        paste.dateCreated = new Date(paste.dateCreated).toLocaleString('en');

        const mostRecentPastes = req.mostRecent;

        mostRecentPastes.forEach(p => p.dateCreated = new Date(p.dateCreated).toLocaleString('en'));

        res.status(200).render('paste-details', {
            user: req.user,
            paste: paste,
            mostRecentPastes: mostRecentPastes
        });
    },
    getCreate(req, res) {
        const languageNames = langServices.getLanguageNamesForDropdown();

        res.status(200).render('create-paste', {
            user: req.user,
            langNames: languageNames,
            mostRecentPastes: req.mostRecent
        });
    },
    create(req, res) {
        // TODO: validation

        const paste = req.body;

        if (!paste.pswd) {
            delete paste.pswd;
        }

        if (req.user) {
            paste.user_id = req.user._id;
        }

        pastesServices
            .createPaste(req.body)
            .then(function (dbRes) {
                const paste = dbRes.ops.pop();

                res.redirect(`/pastes/${paste._id}/details`);
            })
            .catch(d => { 
                console.log(d); 
                res.json(d)
            })
    },
    byUser(req, res) {
        const user_id = req.user._id;

        pastesServices
            .pastesByUser(user_id)
            .then(pastes => {
                const shortenedPastes = pastes.map(p => {
                    p.content = p.content.slice(0, getNthIndex(5, '\n', p.content));
                    const ago = new Date(new Date().getTime() - p.dateCreated);
                    

                    p.dateCreated = '';
                    const daysAgo = ago.getTime() / 1000 / 60 / 60 / 24 | 0;

                    if(daysAgo > 0) {
                        p.dateCreated += daysAgo + ' days'
                    } 

                    if(ago.getHours() > 0) {
                        if(daysAgo > 0) {
                            p.dateCreated += ', '
                        }

                        p.dateCreated += ago.getHours() + ' hours';
                    }

                    if(ago.getMinutes() > 0) {
                        if(p.dateCreated !== '') {
                            p.dateCreated += ' and ';
                        }

                        p.dateCreated += ago.getMinutes() + ' minutes';
                    }

                    return p;
                });

                if(!req.user.settings) {
                    req.user.settings = { theme: 'solarizedlight' };
                } else if(!req.user.settings.theme) {
                    res.user.settings.theme = 'solatizedlight';
                }

                res.status(200).render('list-pastes', { user: req.user, pastes });
            })
            .catch(error => {
                console.log(error);
                res.redirect(500, '/error');
            });
    }
}