//Modules

const mysql = require('mysql2');

// Database connection
const connection = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_athery',
    password: '&7Xk$K%286%Z9kZ',
    database: 'freedb_intank',
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});
const express = require('express');
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
app.use(express.json());


// Cookies and session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000*60*60*24*7 }
}));



const { 
    validateRegistration, 
    checkAuthenticated, 
    checkAdmin, 
    checkCust 
} = require('./controllers/checkAuthController'); 

const {
    renderLogin,
    handleLogin,
    handleLogout,
    renderRegister,
    handleRegister,
} = require('./controllers/logRegController'); 

const {
    renderIndex,
    renderProductPage,
    renderTanks,
    renderScapes,
    renderEquipment,
    renderFood,
} = require('./controllers/productsController');

const {
    renderAdminIndex,
    renderAdminTanks,
    renderAdminScapes,
    renderAdminEquipments,
    renderAdminFoods,
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
} = require('./controllers/adminStuffController');

const{ 
    renderCart, 
    addToCart, 
    updateCart, 
    deleteItem,
    checkout,
} = require('./controllers/cartController');

const{
    renderProfile,
    editUsername,
    editPassword,
    editPI,
} = require('./controllers/profileController');

const{
    renderSearch,
    search,
} = require('./controllers/searchController');

const{
    renderOrders,
    renderPending,
    renderAccepted,
    renderShipped,
    renderDelivered,
    renderCompleted,
} = require('./controllers/orderController');

const paypalController = require('./controllers/paypalController');

const { 
    renderReport,
    renderReportRevenue,
    generateExcelReport,
    generateExcelReportRevenue,
    generateExcelReportByCategory,
    generateExcelReportByCategoryRevenue,
} = require('./controllers/reportController');

app.get('/search/:query', renderSearch);

app.post('/search', search)

// Login and Register Routes
app.get('/login', renderLogin);
app.post('/login', handleLogin);
app.get('/logout', handleLogout);
app.get('/register', renderRegister);
app.post('/register', validateRegistration, handleRegister);



//product pages
app.get('/', checkCust, renderIndex);
app.get('/product/:prodId', checkCust, renderProductPage);
app.get('/tanks', checkCust, renderTanks);
app.get('/scapes', checkCust,  renderScapes);
app.get('/equipments', checkCust, renderEquipment);
app.get('/foods', checkCust, renderFood);



//admin stuff
app.get('/adminIndex', checkAdmin, renderAdminIndex)
app.get('/adminTanks', checkAdmin, renderAdminTanks);
app.get('/adminScapes', checkAdmin, renderAdminScapes);
app.get('/adminEquipments', checkAdmin, renderAdminEquipments);
app.get('/adminFoods', checkAdmin, renderAdminFoods);

app.get('/editProduct/:prodId', checkAdmin, renderEditProduct);
app.post('/editProduct/:prodId', checkAdmin, handleEditProduct);
app.post('/editProduct/:prodId/addImage', checkAdmin, upload.single('image'), handleAddImage);
app.post('/editProduct/:prodId/deleteImage', checkAdmin, handleDeleteImage);
app.post('/editProduct/:prodId/setMain', checkAdmin, handleSetMainImage);
app.post('/editProduct/:prodId/delete', checkAdmin, handleDeleteProduct);

app.get('/addProduct', checkAdmin, renderAddProduct);
app.post('/addProduct', checkAdmin, upload.single('image'), handleAddProduct);

//user cart n stuff

app.get('/cart',checkAuthenticated, checkCust, renderCart);
app.post('/cart/add', checkAuthenticated, checkCust, addToCart);
app.post('/cart/update', checkAuthenticated, checkCust, updateCart);
app.post('/cart/deleteItem', checkAuthenticated, checkCust, deleteItem);

//order stuff
app.get('/orders', checkAuthenticated, checkCust, renderOrders);
app.get('/orders/pending', checkAuthenticated, checkCust, renderPending);
app.get('/orders/accepted', checkAuthenticated, checkCust, renderAccepted);
app.get('/orders/shipped', checkAuthenticated, checkCust, renderShipped);
app.get('/orders/toReceive', checkAuthenticated, checkCust, renderDelivered);
app.get('/orders/completed', checkAuthenticated, checkCust, renderCompleted);


//profile stuff
app.get('/profile', checkAuthenticated, renderProfile);
app.post('/profile/edit-username', checkAuthenticated, editUsername);
app.post('/profile/edit-password', checkAuthenticated, editPassword);
app.post('/profile/edit-picture', checkAuthenticated, upload.single('profilePicture'), editPI);




//paypal stuff
app.use(express.json());
app.post("/api/orders", paypalController.createOrderHandler);
app.post("/api/orders/:orderID/capture", paypalController.captureOrderHandler);
app.get("/checkout/:paymentMethod/:orderId/:transactionId", checkout);

//admin dashboard
app.get('/adminDashboard',checkAuthenticated, checkAdmin, renderDashboard);
app.get('/adminDashboard/pendingCustAction',checkAuthenticated, checkAdmin, renderPendingAct);
app.get('/adminDashboard/completedOrders',checkAuthenticated, checkAdmin, renderCompletedOrd);
app.post('/adminDashboard/:transId/accept',checkAuthenticated, checkAdmin, acceptOrder);
app.post('/adminDashboard/:transId/ship',checkAuthenticated, checkAdmin, shipItem);
app.post('/adminDashboard/:transId/delivered',checkAuthenticated, checkAdmin, markDelivered);
app.post('/orders/:transId/received',checkAuthenticated, checkCust, markReceived);

//report
app.get('/reports/quantity', checkAuthenticated, checkAdmin, renderReport);
app.get('/reports/revenue', checkAuthenticated, checkAdmin, renderReportRevenue);
app.get('/report/export/excel/type=product/quantity', checkAuthenticated, checkAdmin, generateExcelReport);
app.get('/report/export/excel/type=product/revenue', checkAuthenticated, checkAdmin, generateExcelReportRevenue);
app.get('/report/export/excel/type=category/quantity', checkAuthenticated, checkAdmin, generateExcelReportByCategory);
app.get('/report/export/excel/type=category/revenue', checkAuthenticated, checkAdmin, generateExcelReportByCategoryRevenue);

// Start server
const PORT = process.env.PORT || 1998;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`)); 
