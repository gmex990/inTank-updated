const { connection } = require('./database.js');
const ExcelJS = require('exceljs');

const getReportData = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT product.prodName, SUM(orders.qty) AS totalQuantitySold, 
      SUM(orders.qty * product.price) AS revenueGained, image.imgName,
      product.type FROM orders
      INNER JOIN product ON orders.prodId = product.prodId
      INNER JOIN image ON product.prodId = image.prodId AND image.main = 1
      GROUP BY product.prodId
      ORDER BY totalQuantitySold DESC;
    `;
    connection.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getReportDataRevenue = () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT product.prodName, SUM(orders.qty) AS totalQuantitySold, 
        SUM(orders.qty * product.price) AS revenueGained, image.imgName,
        product.type FROM orders
        INNER JOIN product ON orders.prodId = product.prodId
        INNER JOIN image ON product.prodId = image.prodId AND image.main = 1
        GROUP BY product.prodId
        ORDER BY revenueGained DESC;
      `;
      connection.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
};

const getReportCategory = () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT product.type, SUM(orders.qty) AS totalQuantitySold, 
        SUM(orders.qty * product.price) AS revenueGained
        FROM orders
        INNER JOIN product ON orders.prodId = product.prodId
        GROUP BY product.type
        ORDER BY totalQuantitySold DESC;
      `;
      connection.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
};

const getReportCategoryRevenue = () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT product.type, SUM(orders.qty) AS totalQuantitySold, 
        SUM(orders.qty * product.price) AS revenueGained
        FROM orders
        INNER JOIN product ON orders.prodId = product.prodId
        GROUP BY product.type
        ORDER BY revenueGained DESC;
      `;
      connection.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
};

const renderReport = async (req, res) => {
    const see = 'quantity';
    try {
      const reportData = await getReportData();
      res.render('reports', { reportData, user: req.session.user, see });
    } catch (error) {
      console.error('Error rendering report page:', error);
      res.status(500).send('Failed to load report page');
    }
};

const renderReportRevenue = async (req, res) => {
    const see = 'revenue';
    try {
      const reportData = await getReportDataRevenue();
      res.render('reports', { reportData, user: req.session.user, see });
    } catch (error) {
      console.error('Error rendering report page:', error);
      res.status(500).send('Failed to load report page');
    }
};

// Export as Excel
const generateExcelReport = async (req, res) => {
  try {
    const reportData = await getReportData();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Define worksheet columns
    worksheet.columns = [
      { header: 'Product Name', key: 'prodName', width: 30 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Quantity Sold', key: 'totalQuantitySold', width: 15 },
      { header: 'Revenue Gained ($)', key: 'revenueGained', width: 20}
    ];

    // Add rows to the worksheet
    reportData.forEach(product => {
      worksheet.addRow(product);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=SalesReport(Product|Quantity)${new Date}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).send('Failed to generate Excel report');
  }
};

const generateExcelReportRevenue = async (req, res) => {
    try {
      const reportData = await getReportDataRevenue();
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');
  
      // Define worksheet columns
      worksheet.columns = [
        { header: 'Product Name', key: 'prodName', width: 30 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Quantity Sold', key: 'totalQuantitySold', width: 15 },
        { header: 'Revenue Gained ($)', key: 'revenueGained', width: 20}
      ];
  
      // Add rows to the worksheet
      reportData.forEach(product => {
        worksheet.addRow(product);
      });
  
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=SalesReport(Product|Revenue)${new Date}.xlsx`);
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating Excel report:', error);
      res.status(500).send('Failed to generate Excel report');
    }
};

//export by category
const generateExcelReportByCategory = async (req, res) => {
    try {
      const reportData = await getReportCategory();
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report by Category');
  
      worksheet.columns = [
        { header: 'Product Category', key: 'type', width: 30 },
        { header: 'Total Quantity Sold', key: 'totalQuantitySold', width: 20 },
        { header: 'Total Revenue Gained ($)', key: 'revenueGained', width: 25 }
      ];
  
      reportData.forEach(category => {
        worksheet.addRow(category);
      });
  
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=SalesReport(Category|Quantity)${new Date}.xlsx`);
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating Excel report by category:', error);
      res.status(500).send('Failed to generate Excel report by category');
    }
};
const generateExcelReportByCategoryRevenue = async (req, res) => {
    try {
      const reportData = await getReportCategoryRevenue();
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report by Category');
  
      worksheet.columns = [
        { header: 'Product Category', key: 'type', width: 30 },
        { header: 'Total Quantity Sold', key: 'totalQuantitySold', width: 20 },
        { header: 'Total Revenue Gained ($)', key: 'revenueGained', width: 25 }
      ];
  
      reportData.forEach(category => {
        worksheet.addRow(category);
      });
  
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=SalesReport(Category|Revenue)${new Date}.xlsx`);
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating Excel report by category:', error);
      res.status(500).send('Failed to generate Excel report by category');
    }
};

module.exports = {
    renderReport,
    generateExcelReport,
    generateExcelReportRevenue,
    renderReportRevenue,
    generateExcelReportByCategory,
    generateExcelReportByCategoryRevenue
};
