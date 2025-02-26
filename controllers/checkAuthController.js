


const validateRegistration = (req, res, next) => {
    const { username, email, password, rePass } = req.body;
    let countLower = 0;
    let countUpper = 0;
    let countNumber = 0;

    if (!username || !email || !password || !rePass) {
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
        } else if (isNaN(Number(password[i]))) {
            if (password[i] === password[i].toLowerCase()) {
                countLower++;
            } else if (password[i] === password[i].toUpperCase()) {
                countUpper++;
            }
        } else if (!isNaN(Number(password[i]))) {
            countNumber++;
        }
    }
    if (countLower > 0 && countUpper > 0 && countNumber > 0) {
        next();
    } else {
        req.flash('error', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
};



const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'Please log in to view this page');
        res.redirect('/login');
    }
};

const checkAdmin = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Please log in to view this page');
        return res.redirect('/login');
    }else if (req.session.user.role === 1) {
        return next();
    } else {
        req.flash('error', 'Access denied');
        res.redirect('/');
    }
};

const checkCust = (req, res, next) => {
    if (!req.session.user) {
        return next();
    }else if (req.session.user.role === 0) {
        return next();
    } else {
        req.flash('error', 'Access denied');
        res.redirect('/adminIndex');
    }
}



module.exports = {
    validateRegistration,
    checkAuthenticated,
    checkAdmin,
    checkCust,
};
