const { render } = require('ejs');
const { connection } = require('./database.js');
// Render the admin index page
const renderAdminIndex = (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1';
    connection.query(sql, (err, results) => {
        if (err) throw err;
        res.render('adminIndex', { products: results, user: req.session.user, page: 'index' });
    });
};

// Render admin products by type
const renderAdminProductsByType = (type) => (req, res) => {
    const sql = `SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1 AND type = ?`;
    connection.query(sql, [type], (err, results) => {
        if (err) throw err;
        res.render('adminPages', { products: results, user: req.session.user, page: type });
    });
};

// Render the edit product page
const renderEditProduct = (req, res) => {
    const prodId = req.params.prodId;

    const productQuery = 'SELECT * FROM product WHERE prodId = ?;';
    const imagesQuery = 'SELECT * FROM image WHERE prodId = ?;';

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

            res.render('editProduct', {
                messages: req.flash('success'),
                formData: req.flash('formData'),
                product: productResults[0],
                images: imageResults,
                user: req.session.user,
                page: 'editProduct',
            });
        });
    });
};

// Handle editing a product
const handleEditProduct = (req, res) => {
    const { prodName, prodDesc, price, stock, type } = req.body;
    const prodId = req.params.prodId;

    const sql = `UPDATE product SET prodName = ?, prodDesc = ?, price = ?, stock = ?, type = ? WHERE prodId = ?`;
    connection.query(sql, [prodName, prodDesc, price, stock, type, prodId], (err) => {
        if (err) throw err;
        req.flash('success', 'Changes saved');
        req.flash('formData', req.body);
        res.redirect(`/editProduct/${prodId}`);
    });
};

// Handle adding an image to a product
const handleAddImage = (req, res) => {
    const prodId = req.params.prodId;
    const imgName = req.file.filename;

    const sql = `INSERT INTO image (prodId, imgName, main) VALUES (?, ?, 0)`;
    connection.query(sql, [prodId, imgName], (err) => {
        if (err) throw err;
        req.flash('success', 'Image added');
        req.flash('formData', req.body);
        res.redirect(`/editProduct/${prodId}`);
    });
};

// Handle deleting an image from a product
const handleDeleteImage = (req, res) => {
    const prodId = req.params.prodId;
    const { imgName } = req.body;

    const query = 'DELETE FROM image WHERE prodId = ? AND imgName = ?';
    connection.query(query, [prodId, imgName], (err) => {
        if (err) {
            console.error('Error deleting image:', err);
            return res.status(500).send('Error deleting image');
        }
        req.flash('success', 'Image deleted');
        req.flash('formData', req.body);
        res.redirect(`/editProduct/${prodId}`);
    });
};

// Handle setting an image as the main image
const handleSetMainImage = (req, res) => {
    const prodId = req.params.prodId;
    const { imgName } = req.body;

    const setMainOff = 'UPDATE image SET main = 0 WHERE prodId = ? AND main = 1';
    connection.query(setMainOff, [prodId], (err) => {
        if (err) {
            console.error('Error resetting main image:', err);
            return res.status(500).send('Error resetting main image');
        }
    });

    const setMainOn = 'UPDATE image SET main = 1 WHERE prodId = ? AND imgName = ?';
    connection.query(setMainOn, [prodId, imgName], (err) => {
        if (err) {
            console.error('Error setting main image:', err);
            return res.status(500).send('Error setting main image');
        }
        req.flash('success', 'Image set as main');
        req.flash('formData', req.body);
        res.redirect(`/editProduct/${prodId}`);
    });
};

//Delet product
const handleDeleteProduct = (req, res) => {
    const prodId = req.params.prodId;
    const query = 'DELETE FROM product WHERE prodId = ?';
    connection.query(query, [prodId], (err) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).send('Error deleting product');
        }
        req.flash('success', 'Product deleted');
        res.redirect('/adminIndex');
    });
};

// Render the add product page
const renderAddProduct = (req, res) => {
    res.render('addProduct', {messages: req.flash('error'), formData: req.flash('formData'), user: req.session.user, page: 'addProd'});
};

// Handle adding a new product
const handleAddProduct = (req, res) => {
    const { prodName, prodDesc, price, stock, type } = req.body;
    const imgName = req.file.filename;

    const sql = 'INSERT INTO product (prodName, prodDesc, price, stock, type) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [prodName, prodDesc, price, stock, type], (err, result) => {
        if (err) throw err;

        const prodId = result.insertId;
        const imageSql = 'INSERT INTO image (prodId, imgName, main) VALUES (?, ?, 1)';
        connection.query(imageSql, [prodId, imgName], (err) => {
            if (err) throw err;
            req.flash('success', 'Product added');
            req.flash('formData', req.body);
            res.redirect('/adminIndex');
        });
    });
};

const renderDashboard = (req, res) => {
    const sql = 'SELECT * FROM orders INNER JOIN image ON orders.prodId = image.prodId INNER JOIN product ON orders.prodId = product.prodId WHERE image.main = 1 ';
    connection.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('adminDashboard', {user: req.session.user, orderItems: results, curPage: 'all', page: 'dashboard'});
    });
}

const renderPendingAct = (req, res) => {
    const sql = 'SELECT * FROM orders INNER JOIN image ON orders.prodId = image.prodId INNER JOIN product ON orders.prodId = product.prodId WHERE image.main = 1 AND (orders.stat != "Completed");';
    connection.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('adminDashboard', {user: req.session.user, orderItems: results, curPage: 'pending', page: 'dashboard'});
    });
}

const renderCompletedOrd = (req, res) => {
    const sql = 'SELECT * FROM orders INNER JOIN image ON orders.prodId = image.prodId INNER JOIN product ON orders.prodId = product.prodId WHERE image.main = 1 AND orders.stat = "Completed";';
    connection.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('adminDashboard', {user: req.session.user, orderItems: results, curPage: 'completedOrd', page: 'dashboard'});
    });
}

const acceptOrder = (req, res) => {
    const sql = 'UPDATE orders SET stat = "Accepted" WHERE transId = ?';
    connection.query(sql, [req.params.transId], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/adminDashboard/pendingCustAction');
    });
}

const shipItem = (req, res) => {
    const sql = 'UPDATE orders SET stat = "Shipped" WHERE transId = ?';
    connection.query(sql, [req.params.transId], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/adminDashboard/pendingCustAction');
    });
}

const markDelivered = (req, res) => {
    const sql = 'UPDATE orders SET stat = "Delivered" Where transId = ?';
    connection.query(sql, [req.params.transId], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/adminDashboard/pendingCustAction');
    });
}

const markReceived = (req, res) => {
    const sql = 'UPDATE orders SET stat = "Completed" Where transId = ?';
    connection.query(sql, [req.params.transId], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/orders');
    });
}


module.exports = {
    renderAdminIndex,
    renderAdminTanks: renderAdminProductsByType('tank'),
    renderAdminScapes: renderAdminProductsByType('scape'),
    renderAdminEquipments: renderAdminProductsByType('equipment'),
    renderAdminFoods: renderAdminProductsByType('food'),
    renderEditProduct,
    handleEditProduct,
    handleAddImage,
    handleDeleteImage,
    handleSetMainImage,
    handleDeleteProduct,
    renderAddProduct,
    handleAddProduct,
    renderDashboard,
    renderPendingAct,
    renderCompletedOrd,
    acceptOrder,
    shipItem,
    markDelivered,
    markReceived,

};
