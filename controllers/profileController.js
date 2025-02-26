const { connection } = require('./database');

const renderProfile = (req, res) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            throw err;
        }
        res.render('profile', { user: results[0], messages: req.flash('error'), page: page });
    });
};

const editUsername = (req, res) => {
    const email = req.session.user.email;
    const { username } = req.body;

    // Prepare the SQL query to update user information
    const query = `UPDATE users SET username = ? WHERE email = ?`;
    
    connection.query(query, [username, email], (err, result) => {
        if (err) {
            console.error('Error updating user data in database:', err);
            return res.status(500).send('Error updating profile');
        }
        req.session.user.username = username;
        req.flash('error', 'Password has been successfully changed!');
        res.redirect('/profile');
        
    });
};

const editPassword = (req, res) => {
    const email = req.session.user.email;
    const { password, confirmPassword, currentPassword } = req.body;
    var countLower = 0;
    var countUpper = 0;
    var countNumber = 0;
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
                    const query = 'UPDATE users SET password = SHA1(?) WHERE email = ?';
    
                    connection.query(query, [password, email], (err) => {
                        if (err) {
                            console.error('Error updating user data in database:', err);
                            return res.status(500).send('Error updating profile');
                        }
                        req.flash('success', 'Password has been successfully changed!');
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
};

const editPI = (req, res) => {
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
};

module.exports = {
    renderProfile,
    editUsername,
    editPassword,
    editPI,
};