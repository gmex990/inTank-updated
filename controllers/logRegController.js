// logRegController.js

const { connection } = require('./database');

const renderLogin = (req, res) => {
    res.render('login', { messages: req.flash('error'), user: req.session.user});
};


const handleLogin = (req, res) => {
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
            } else if (userRole == 0) {
                res.redirect('/');
            }
        } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/login');
        }
    });
};

const handleLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

const renderRegister = (req, res) => {
    res.render('register', {
        messages: req.flash('error'),
        formData: req.flash('formData'),
        user: req.session.user,
        page: '',
    });
};

const handleRegister = (req, res) => {
    const { username, email, password } = req.body;
    const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, SHA1(?), 0)';
    connection.query(sql, [username, email, password], (err) => {
        if (err) {
            if(err.code === 'ER_DUP_ENTRY') {
                req.flash('error', 'Email already in use');
                req.flash('formData', req.body);
                return res.redirect('/register');
            }
        }
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
};

module.exports = {
    renderLogin,
    handleLogin,
    handleLogout,
    renderRegister,
    handleRegister,
};
