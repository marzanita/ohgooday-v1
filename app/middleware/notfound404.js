// Middleware for 404 page
module.exports = function show404(req, res, next) {
    res.status(404).render('./404');
}