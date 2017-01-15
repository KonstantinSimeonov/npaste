'use strict';

module.exports = function (server, middlewares, controllers) {
    server.get('*', (req, res) => res.status(404).render('not-found', { msg: "Whatever you're searching for, you won't find it here" }));
}