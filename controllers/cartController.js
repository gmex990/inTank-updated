const { connection } = require('./database.js');
page = 'cart';

let email;

const renderCart = (req, res) => {
    const sql = 'SELECT * FROM cart INNER JOIN image ON cart.prodId = image.prodId INNER JOIN product ON cart.prodId = product.prodId WHERE image.main = 1 AND cart.email = ?;';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            throw err;
        }
        email = req.session.user.email;
        res.render('cart', {cartItems: results, user: req.session.user, page});
    });
};

const addToCart = (req, res) => {
    const { prodId, quantity } = req.body;
    const checkItem = 'SELECT * FROM cart WHERE email = ? AND prodId = ?';
    connection.query(checkItem, [req.session.user.email, prodId], (err, results) => {
        if (err) {
            throw err;
        }
        if (results.length > 0) {
            const updateQty = 'UPDATE cart SET qty = qty + ? WHERE email = ? AND prodId = ?';
            connection.query(updateQty, [quantity, req.session.user.email, prodId], (err) => {
                if (err) {
                    throw err;
                }
                res.redirect('/cart');
            });
        } else {
            const sql = 'INSERT INTO cart (email, prodId, qty, prodType) VALUES (?, ?, ?, 0)';
            connection.query(sql, [req.session.user.email, prodId, quantity], (err) => {
                if (err) {
                    throw err;
                }
                res.redirect('/cart');
            });
        }
    });
};

const updateCart = (req, res) => {
    const { prodId, qty } = req.body;
    const sql = 'UPDATE cart SET qty = ? WHERE email = ? AND prodId = ?';
    connection.query(sql, [qty, req.session.user.email, prodId], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/cart');
    });
};

const deleteItem = (req, res) => {
    const { prodId } = req.body;
    const sql = 'DELETE FROM cart WHERE email = ? AND prodId = ?';
    connection.query(sql, [req.session.user.email, prodId], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/cart');
    });
};

const checkout = (req, res) => {
    const {paymentMethod, ordId, transactionId} = req.params;
    // SQL query to fetch cart items for the logged-in user
    const sql = `
        SELECT * FROM cart INNER JOIN image ON cart.prodId = image.prodId INNER JOIN product 
        ON cart.prodId = product.prodId WHERE image.main = 1 AND cart.email = ?;
    `;

    connection.query(sql, [email], (error, cartItems) => {
        if (error) {
            console.error('Error retrieving cart items:', error);
            return res.status(500).send('Error retrieving cart items');
        }

        

        if (cartItems.length > 0) {
            
                let totalAmount = 0;

                // Calculate total amount
                cartItems.forEach(item => {
                    totalAmount += item.qty * item.price;
                });

                // Insert cart items into 'order_items' table
                const orderItemsSql = `
                        INSERT INTO orders (ordId, prodId, qty, email, ordDate, stat, payment, transId)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                const ordDate = new Date();
                cartItems.forEach(orderItem => {
                    connection.query(orderItemsSql, [
                        null, orderItem.prodId, orderItem.qty, email, new Date(), "Pending", paymentMethod, transactionId
                    ]);
                });

                const deductStockSql = `UPDATE product SET stock = stock - ? WHERE prodId = ?`;
                cartItems.forEach(orderItem => {
                    connection.query(deductStockSql, [orderItem.qty, orderItem.prodId]);
                });

                // Clear the cart after transferring items
                const clearCartSql = `DELETE FROM cart WHERE email = ?`;
                connection.query(clearCartSql, [email], (clearCartError) => {
                    if (clearCartError) {
                        console.error('Error clearing cart:', clearCartError);
                        return res.status(500).send('Error clearing cart');
                    }

                    // Render the invoice page (or confirmation page)
                    res.render('invoice', {
                        cart_items: cartItems,
                        totalAmount: totalAmount.toFixed(2), // Format total amount to 2 decimal places
                        email: email,
                        ordDate: ordDate,
                        payment: paymentMethod,
                        ordId: ordId,
                        transId: transactionId
                    });
                });



            } else {
                // Handle empty cart
                res.redirect('/cart');
            }
        
    });
};


module.exports = {
    renderCart,
    addToCart,
    updateCart,
    deleteItem,
    checkout,
};