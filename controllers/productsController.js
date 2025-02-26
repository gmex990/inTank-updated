const { connection } = require('./database');

const renderIndex = (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1';
    const page = 'index';

    connection.query(sql, (err, results) => {
        if (err) throw err;
        res.render('index', { products: results, user: req.session.user, page });
    });
};

const renderProductPage = (req, res) => {
    const prodId = req.params.prodId;

    const productQuery = 'SELECT * FROM product WHERE prodId = ?;';
    const imagesQuery = 'SELECT imgName FROM image WHERE prodId = ?;';

    connection.query(productQuery, [prodId], (err, productResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving product details');
        }

        if (productResults.length === 0) {
            return res.status(404).send('Product not found');
        }

        connection.query(imagesQuery, [prodId], (err, imageResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error retrieving product images');
            }

            res.render('product', { product: productResults[0], images: imageResults, user: req.session.user, page: 'product',});
        });
    });
};

const renderProductsByType = (type) => (req, res) => {
    const sql = `SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1 AND type = ?`;

    connection.query(sql, [type], (err, results) => {
        if (err) throw err;
        res.render('products', { products: results, user: req.session.user, page: type });
    });
};

module.exports = {
    renderIndex,
    renderProductPage,
    renderTanks: renderProductsByType('tank'),
    renderScapes: renderProductsByType('scape'),
    renderEquipment: renderProductsByType('equipment'),
    renderFood: renderProductsByType('food'),
};
