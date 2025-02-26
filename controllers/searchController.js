const { connection } = require('./database.js');

const renderSearch = (req, res) => {
    const query = `%${req.params.query}%`;
    const sql = `SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE prodName LIKE ? OR prodDesc LIKE ? `;
    var prevS = req.params.query;
    connection.query(sql, [query, query], (err, results) => {
        if (err) throw err;
        res.render('search', { products: results, user: req.session.user, prevS: prevS}); 
    });
};

const search = (req, res) => {
    const { query } = req.body;
    res.redirect('/search/' + query);
};

module.exports = {
    renderSearch,
    search,
};