const { connection } = require('./database.js');
page = 'order';

const renderOrders = (req, res) => {
    const sql = 'SELECT * FROM orders INNER JOIN image ON orders.prodId = image.prodId INNER JOIN product ON orders.prodId = product.prodId WHERE image.main = 1 AND orders.email = ?;';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            throw err;
        }
        res.render('orders', {orderItems: results, user: req.session.user, curPage: 'all'});
    });
};

const renderPending = (req, res) => {
    const sql = 'SELECT * FROM orders INNER JOIN image ON orders.prodId = image.prodId INNER JOIN product ON orders.prodId = product.prodId WHERE image.main = 1 AND orders.email = ? AND orders.stat = "Pending";';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            throw err;
        }
        res.render('orders', {orderItems: results, user: req.session.user, curPage: 'pending'});
    });
}

const renderAccepted = (req, res) => {
    const sql = 'SELECT * FROM orders INNER JOIN image ON orders.prodId = image.prodId INNER JOIN product ON orders.prodId = product.prodId WHERE image.main = 1 AND orders.email = ? AND orders.stat = "Accepted";';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            throw err;
        }
        res.render('orders', {orderItems: results, user: req.session.user, curPage: 'accepted'});
    });
}

const renderShipped = (req, res) => {
    const sql = 'SELECT * FROM orders INNER JOIN image ON orders.prodId = image.prodId INNER JOIN product ON orders.prodId = product.prodId WHERE image.main = 1 AND orders.email = ? AND orders.stat = "Shipped";';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            throw err;
        }
        res.render('orders', {orderItems: results, user: req.session.user, curPage: 'shipped'});
    });
}

const renderDelivered = (req, res) => {
    const sql = 'SELECT * FROM orders INNER JOIN image ON orders.prodId = image.prodId INNER JOIN product ON orders.prodId = product.prodId WHERE image.main = 1 AND orders.email = ? AND orders.stat = "Delivered";';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            throw err;
        }
        res.render('orders', {orderItems: results, user: req.session.user, curPage: 'delivered'});
    });
}

const renderCompleted = (req, res) => {
    const sql = 'SELECT * FROM orders INNER JOIN image ON orders.prodId = image.prodId INNER JOIN product ON orders.prodId = product.prodId WHERE image.main = 1 AND orders.email = ? AND orders.stat = "Completed";';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            throw err;
        }
        res.render('orders', {orderItems: results, user: req.session.user, curPage: 'completed'});
    });
}


module.exports = {
    renderOrders,
    renderPending,
    renderAccepted,
    renderShipped,
    renderDelivered,
    renderCompleted
};