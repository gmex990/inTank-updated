//Modules
const express = require('express');
const { connection } = require('./controllers/database');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');

const upload = require('./controllers/multerController');
//Setting up view engine
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.static('public'));
app.use(express.urlencoded({
    extended: false
}));


// Cookies and session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000*60*60*24*7 }
}));



// Registration validation middleware
const validateRegistration = (req, res, next) => {
    const { username, email, password, rePass, role } = req.body;
    var countLower = 0;
    var countUpper = 0;
    var countNumber = 0;

    if (!username || !email || !password || !rePass || !role) {
        return res.status(400).send('All fields are required.');
    }
    if (password.length < 8) {
        req.flash('error', 'Password should be at least 8 or more characters long');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    if (password !== rePass) {
        req.flash('error', 'Passwords do not match');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    for (let i = 0; i < password.length; i++) {
        if (password[i] === ' ') {
            req.flash('error', 'Username cannot contain spaces');
            req.flash('formData', req.body);
            return res.redirect('/register');
        }else if (isNaN(Number(password[i]))){
            if (password[i] === password[i].toLowerCase()) {
                countLower++;
            }else if (password[i] === password[i].toUpperCase()) {
                countUpper++;
            } 
        }else if (!isNaN(Number(password[i]))){
          countNumber++;
        }
    }
    if (countLower > 0 && countUpper > 0 && countNumber > 0){
        next();
    }else{
        req.flash('error', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
        req.flash('formData', req.body);

        return res.redirect('/register');
    }
};

// Check user login middleware
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'Please log in to view this page');
        res.redirect('/login');
    }
};

// Check if user is admin middleware
const checkAdmin = (req, res, next) => {
    if (req.session.user.role === 1) {
        return next();
    } else {
        req.flash('error', 'Access denied');
        res.redirect('/');
    }
};

var page = '';

//Home Page
app.get('/', (req, res) => {
    // Query to get all products with their main image
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1';

    page = "index";
    connection.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('index', { products: results, user: req.session.user, page: page });
    });
});



app.get('/search/:query', (req, res) => {
    res.render('search', {user: req.session.user, page: page} );
});

app.post('/search', (req, res) => {
    const { query } = req.body;
    res.redirect('/search/' + query);
})

app.get('/login', (req, res) => {
    res.render('login', {messages: req.flash('error'), user: req.session.user, page: page});
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/login');
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND password = SHA1(?)';
    connection.query(sql, [email, password], (err, result) => {
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            req.session.user = result[0];
            const userRole = req.session.user.role;
            if (userRole == 1) {
                res.redirect('/adminIndex');
            }else if(userRole == 0){
                res.redirect('/');
            }
            
        } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/login');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

//register

app.get('/register', (req, res) => {
    res.render('register', {messages: req.flash('error'), formData: req.flash('formData'), user: req.session.user, page: page});
});

app.post('/register', validateRegistration, (req, res) => {
    const { username, email, password, role } = req.body;
    const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, SHA1(?), ?)';
    connection.query(sql, [username, email, password, role], (err, result) => {
        if (err) {
            throw err;
        }
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
});


//product page
app.get('/product/:prodId', (req, res) => {
    const prodId = req.params.prodId;
    // Query to fetch product details
    const productQuery = 'SELECT * FROM product WHERE prodId = ?;';
  
    // Query to fetch all images for the product
    const imagesQuery = 'SELECT imgName FROM image WHERE prodId = ?;';
  
    // Fetch product details and images
    connection.query(productQuery, [prodId], (err, productResults) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error retrieving product details');
      } else if (productResults.length === 0) {
        res.status(404).send('Product not found');
      } else {
        connection.query(imagesQuery, [prodId], (err, imageResults) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error retrieving product images');
          } else {
            res.render('product', { product: productResults[0], images: imageResults, user: req.session.user, page: page });
          }
        });
      }
    });
});
  
app.get('/tanks', (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1 AND type = "tank"'; 
    const prodId = req.query.prodId || 1;
    page = "tank";
    connection.query(sql, [prodId], (err, results) => {
        if (err) {throw err}
        res.render('tanks', { products: results, user: req.session.user, page: page });
        
    });
});

app.get('/scapes', (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1 AND type = "scape"';  
    const prodId = req.query.prodId || 1;
    page = "scapes";
    connection.query(sql, [prodId], (err, results) => {
        if (err) {throw err}
        res.render('scapes', { products: results, user: req.session.user, page: page });
        
    });
});

app.get('/equipments', (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1 AND type = "equipment"'; 
    const prodId = req.query.prodId || 1;
    page = "equipments";
    connection.query(sql, [prodId], (err, results) => {
        if (err) {throw err}
        res.render('equipments', { products: results, user: req.session.user, page: page });
        
    });
});

app.get('/foods', (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1 AND type = "food"'; 
    const prodId = req.query.prodId || 1;
    page = "foods";
    connection.query(sql, [prodId], (err, results) => {
        if (err) {throw err}
        res.render('foods', { products: results, user: req.session.user, page: page });
        
    });
});



//admin stuff
app.get('/adminIndex', checkAuthenticated, checkAdmin, (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1';
    connection.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('adminIndex', { products: results, user: req.session.user });
    });
});

app.get('/adminTanks', checkAuthenticated, checkAdmin, (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1 AND type = "tank"';
    connection.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('adminTanks', { products: results, user: req.session.user });
    });
});

app.get('/adminScapes', checkAuthenticated, checkAdmin, (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1 AND type = "scape"'; ;
    connection.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('adminScapes', { products: results, user: req.session.user });
    });
});

app.get('/adminEquipments', checkAuthenticated, checkAdmin, (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1 AND type = "equipment"';
    connection.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('adminEquipments', { products: results, user: req.session.user });
    });
});

app.get('/adminFoods', checkAuthenticated, checkAdmin, (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1 AND type = "food"';
    connection.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('adminFoods', { products: results, user: req.session.user });
    });
});

app.get('/adminIndex', checkAuthenticated, checkAdmin, (req, res) => {
    const sql = 'SELECT * FROM product INNER JOIN image ON product.prodId = image.prodId WHERE image.main = 1';
    connection.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('adminIndex', { products: results, user: req.session.user });
    });
});

//edit product
app.get('/editProduct/:prodId', checkAuthenticated, checkAdmin, (req, res) => {
    const prodId = req.params.prodId;
    // Query to fetch product details
    const productQuery = 'SELECT * FROM product WHERE prodId = ?;';
  
    // Query to fetch all images for the product
    const imagesQuery = 'SELECT * FROM image WHERE prodId = ?;';
  
    // Fetch product details and images
    connection.query(productQuery, [prodId], (err, productResults) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error retrieving product details');
      } else if (productResults.length === 0) {
        res.status(404).send('Product not found');
      } else {
        connection.query(imagesQuery, [prodId], (err, imageResults) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error retrieving product images');
          } else {
            res.render('editProduct', {messages: req.flash('success'), formData: req.flash('formData'), product: productResults[0], images: imageResults, user: req.session.user, page: page });
          }
        });
      }
    });
});
app.post('/editProduct/:prodId', (req, res) => {
    const { prodName, prodDesc, price, stock, type } = req.body;
    const prodId = req.params.prodId;

    const sql = `UPDATE product 
                 SET prodName = ?, prodDesc = ?, price = ?, stock = ?, type = ? 
                 WHERE prodId = ?`;
    connection.query(sql, [prodName, prodDesc, price, stock, type, prodId], (err) => {
        if (err) throw err;
        req.flash('success', 'Changes Saved');
        req.flash('formData', req.body);
        res.redirect(`/editProduct/${prodId}`);
    });
});

app.post('/editProduct/:prodId/addImage', upload.single('image'), checkAdmin, checkAuthenticated, (req, res) => {
    const prodId = req.params.prodId;
    const imgName = req.file.filename;
    const sql = `INSERT INTO image (prodId, imgName, main) VALUES (?, ?, 0)`;
    connection.query(sql, [prodId, imgName], (err) => {
        if (err) throw err;
        req.flash('success', 'Image added');
        req.flash('formData', req.body);
        res.redirect(`/editProduct/${prodId}`);
    });
});

app.post('/editProduct/:prodId/deleteImage', checkAuthenticated, checkAdmin, (req, res) => {
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
});

app.post('/editProduct/:prodId/setMain', checkAuthenticated, checkAdmin, (req, res) => {
    const prodId = req.params.prodId;
    const { imgName } = req.body;
    const setGal = 'UPDATE image SET main = 0 WHERE prodId = ? AND main = 1';
    connection.query(setGal, [prodId], (err) => {
        if (err) {
            console.error('Error resetting main image:', err);
            return res.status(500).send('Error resetting main image');
        }
    });
    const query = 'UPDATE image SET main = 1 WHERE prodId = ? AND imgName = ?';
    connection.query(query, [prodId, imgName], (err) => {
        if (err) {
            console.error('Error setting main image:', err);
            return res.status(500).send('Error setting main image');
        }
        req.flash('success', 'Image set as main');
        req.flash('formData', req.body);
        res.redirect(`/editProduct/${prodId}`);
    });
});

app.get('/addProduct', checkAuthenticated, checkAdmin, (req, res) => {
    res.render('addProduct', {messages: req.flash('error'), formData: req.flash('formData'), user: req.session.user});
});

app.post('/addProduct', upload.single('image'), checkAuthenticated, checkAdmin, (req, res) => {
    const { prodName, prodDesc, price, stock, type } = req.body;
    const imgName = req.file.filename;
    const sql = 'INSERT INTO product (prodName, prodDesc, price, stock, type) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [prodName, prodDesc, price, stock, type], (err, result) => {
        if (err) {
            throw err;
        }
        const prodId = result.insertId;
        const sql = 'INSERT INTO image (prodId, imgName, main) VALUES (?, ?, 1)';
        connection.query(sql, [prodId, imgName], (err) => {
            if (err) {
                throw err;
            }
            req.flash('success', 'Product added');
            req.flash('formData', req.body);
            res.redirect('/adminIndex');
        });
    });
});

app.post('/editProduct/deleteProduct/:id', checkAuthenticated, checkAdmin, (req, res) => {
    const { prodId } = req.body;
    console.log(prodId);
    const query = 'DELETE FROM product WHERE prodId = ?';
    connection.query(query, [prodId], (err) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).send('Error deleting product');
        }
        const query = 'DELETE FROM image WHERE prodId = ?';
        connection.query(query, [prodId], (err) => {
            if (err) {
                console.error('Error deleting product images:', err);
                return res.status(500).send('Error deleting product images');
            }
            res.redirect('/adminIndex');
        });
       
    });
});

//user cart n stuff

app.get('/cart',checkAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM cart INNER JOIN image ON cart.prodId = image.prodId INNER JOIN product ON cart.prodId = product.prodId WHERE image.main = 1 AND cart.email = ?;';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            throw err;
        }
        res.render('cart', {cartItems: results, user: req.session.user, page: page});
    });
});

app.post('/cart/add', checkAuthenticated, (req, res) => {
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
            const sql = 'INSERT INTO cart (email, prodId, qty, type) VALUES (?, ?, ?, 0)';
            connection.query(sql, [req.session.user.email, prodId, quantity], (err) => {
                if (err) {
                    throw err;
                }
                res.redirect('/cart');
            });
        }
    });
});

app.post('/cart/update', checkAuthenticated, (req, res) => {
    const { prodId, qty } = req.body;
    const sql = 'UPDATE cart SET qty = ? WHERE email = ? AND prodId = ?';
    connection.query(sql, [qty, req.session.user.email, prodId], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/cart');
    });
});

app.post('/cart/deleteItem', checkAuthenticated, (req, res) => {
    const { prodId } = req.body;
    const sql = 'DELETE FROM cart WHERE email = ? AND prodId = ?';
    connection.query(sql, [req.session.user.email, prodId], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/cart');
    });
});

//profile
app.get('/profile', checkAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            throw err;
        }
        res.render('profile', { user: results[0], messages: req.flash('error'), page: page });
    });
});

app.post('/profile/edit-username', (req, res) => {
    const email = req.session.user.email;
    const { username } = req.body;

    // Prepare the SQL query to update user information
    const query = `UPDATE users SET username = ? WHERE email = ?`;
    
    connection.query(query, [username, email], (err, result) => {
        if (err) {
            console.error('Error updating user data in database:', err);
            return res.status(500).send('Error updating profile');
        }

        // Redirect to profile page after successful update
        req.session.user.username = username;
        res.redirect('/profile');
    });
});

// Handle Profile Update (username, email, password, role)
app.post('/profile/edit-password', (req, res) => {
    const email = req.session.user.email;
    const { password, confirmPassword, currentPassword } = req.body;
    var countLower = 0;
    var countUpper = 0;
    var countNumber = 0;
    // Hash password (if changing password)
    if (password) {
        if (password.length < 8) {
            req.flash('error', 'Password should be at least 8 or more characters long');
            req.flash('formData', req.body);
            return res.redirect('/register');
        }
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            req.flash('formData', req.body);
            return res.redirect('/register');
        }
        for (let i = 0; i < password.length; i++) {
            if (password[i] === ' ') {
                req.flash('error', 'Username cannot contain spaces');
                req.flash('formData', req.body);
                return res.redirect('/register');
            }else if (isNaN(Number(password[i]))){
                if (password[i] === password[i].toLowerCase()) {
                    countLower++;
                }else if (password[i] === password[i].toUpperCase()) {
                    countUpper++;
                } 
            }else if (!isNaN(Number(password[i]))){
              countNumber++;
            }
        }
        if (countLower > 0 && countUpper > 0 && countNumber > 0){
            const passQL = `SELECT * FROM users WHERE email = ? AND password = SHA1(?)`;
            connection.query(passQL, [email, currentPassword], (err, result) => {
                if (err){
                    throw err;
                }
                if (result.length == 0){
                    req.flash('error', 'Current Password is incorrect');
                    return res.redirect('/profile');
                }else{
                     // Prepare the SQL query to update user information
                    const query = `
                    UPDATE users
                    SET password = SHA1(?)
                    WHERE email = ?`;
    
                connection.query(query, [password, email], (err, result) => {
                    if (err) {
                        console.error('Error updating user data in database:', err);
                        return res.status(500).send('Error updating profile');
                    }
    
                    // Redirect to profile page after successful update
                    req.flash('error', 'Password has been successfully changed!');
                    res.redirect('/profile');
                });
                }
            });
        }else{
            req.flash('error', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
            req.flash('formData', req.body);
    
            return res.redirect('/register');
        }
       
    }

   
});

// Handle Profile Picture Update
app.post('/profile/edit-picture', upload.single('profilePicture'), (req, res) => {
    if (req.file) {
        // Extract the uploaded image's filename
        const imageFilename = req.file.filename;

        const email = req.session.user.email;

        const query = 'UPDATE users SET pImg = ? WHERE email = ?';
        connection.query(query, [imageFilename, email], (err, result) => {
            if (err) {
                console.error('Error updating image in database:', err);
                return res.status(500).send('Error saving image to the database');
            }

            // Redirect back to the profile page after updating the image
            req.session.user.pImg = imageFilename;
            res.redirect('/profile');
        });
    } else {
        res.status(400).send('No file uploaded');
    }
});

// Start server
const PORT = process.env.PORT || 1998;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`)); 