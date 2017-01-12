'use strict';

const Prism = require('prismjs');

const { PasteViewModel, UserPasteViewModel } = require('../viewmodels');

module.exports = (dataServices) => {
    const { pastes, languages } = dataServices;

    return {
        byId(req, res) {
            const paste = new PasteViewModel(req.paste, '-visibility-dateCreated'),
                mostRecentPastes = req.mostRecent.map(p => new PasteViewModel(p, '-visibility-dateCreated'));

            if (paste.lang) {
                paste.lang = paste.lang.toLowerCase();
            }

            res.status(200).render('paste-details', {
                user: req.user,
                paste: paste,
                mostRecentPastes: mostRecentPastes,
                isUsers: req.user && (req.user.username === paste.author)
            });
        },
        editContent(req, res) {
            const id = req.params.pasteId,
                newContent = req.body.content,
                author = req.user ? req.user.username : null;

            if(author === null) {
                return res.status(403).render('unauthorized');
            }

            pastes
                .editContent(id, author, newContent)
                .then(success => {
                    console.log(success);
                    res.redirect(req.headers.referer);
                })
                .catch(err => {
                    console.log(err);
                    res.redirect(req.headers.referer);
                })
        },
        embeded(req, res) {
            const paste = req.paste;

            if(paste.lang) {
                paste.lang = paste.lang.toLowerCase();
            }
            paste.content = Prism.highlight(paste.content, Prism.languages.java);
            console.log(paste.content);

            res.status(200).send(`<link rel="stylesheet" href="/public/bower_components/prism/themes/prism-solarizedlight.css"></link><pre class="line-numbers language-${paste.lang}"><code>${paste.content}</code>
            </pre>`)
        },
        getCreate(req, res) {
            const languageNames = languages.getLanguageNamesForDropdown(),
                pastes = req.mostRecent.map(p => new PasteViewModel(p, '-visibility-dateCreated'));

            res.status(200).render('create-paste', {
                user: req.user,
                langNames: languageNames,
                mostRecentPastes: pastes
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
                paste.author = req.user.username;
            }

            pastes
                .createPaste(paste)
                .then(function (dbRes) {
                    const paste = dbRes.ops.pop();

                    res.redirect(`/pastes/${paste._id}/details`);
                })
                .catch(d => {
                    console.log(d);
                    res.json(d)
                });
        },
        byUser(req, res) {
            const user_id = req.user._id;

            pastes
                .pastesByUser(user_id)
                .then(userPastes => {
                    const shortenedPastes = userPastes.map(p => new UserPasteViewModel(p, '-visibility-dateCreated-content'));

                    res.status(200).render('list-pastes', { user: req.user, pastes: shortenedPastes });
                })
                .catch(error => {
                    console.log(error);
                    res.redirect(500, '/error');
                });
        },
        getSearch(req, res) {
            pastes
                .count({ visibility: 'public' })
                .then(count => {
                    res.status(200).render('search', {
                        user: req.user,
                        pager: [1, 2, 3, 4, 5],
                        left: -1,
                        right: 6,
                        pageNumber: 0,
                        pagesCount: Math.ceil(count / 10)
                    });
                })
        },
        paged(req, res) {
            const pageSize = +req.query.pageSize,
                pageNumber = +req.query.page,
                contains = req.query.contains,
                author = req.query.author;

            const pager = [];

            for (let leftmost = Math.max(pageNumber + 2, 5), i = leftmost; i >= 1 && leftmost - 5 <= i; i -= 1) {
                pager.unshift(i - 1);
            }

            pastes.paged({ pageSize, pageNumber, contains, author })
                .then(pagedPastes => {
                    res.status(200).render('paste-table-rows', {
                        user: req.user,
                        pagedPastes: pagedPastes.map(p => new PasteViewModel(p, '-visibility-dateCreated'))
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ success: 'fail' });
                });
        }
    }
}