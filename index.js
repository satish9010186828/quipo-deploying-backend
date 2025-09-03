

const express = require("express");
const cors = require("cors");
const db = require("./db"); // SQLite connection

const app = express();
const PORT = 5001;

app.use(express.json());
app.use(cors());

// ----------------------
// CUSTOMER ROUTES
// ----------------------

// Create new customer
app.post("/api/customers1", (req, res) => {
  const { first_name, last_name, phone_number } = req.body;

  db.run(
    `INSERT INTO customers1 (first_name, last_name, phone_number) VALUES (?, ?, ?)`,
    [first_name, last_name, phone_number],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID, first_name, last_name, phone_number });
    }
  );
});

// Update existing customer
app.put("/api/customers1/:id", (req, res) => {
  const { first_name, last_name, phone_number } = req.body;
   console.log("::::updating")
  db.run(
    `UPDATE customers1 SET first_name=?, last_name=?, phone_number=? WHERE id=?`,
    [first_name, last_name, phone_number, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// // Get all customers with search, city, sort, pagination
// app.get("/api/customers1", (req, res) => {
//   const { search = "", city = "", sortBy = "first_name", order = "ASC", page = 1, limit = 10 } = req.query;
//   const offset = (page - 1) * limit;

//   let params = [];
//   let whereClauses = ["1=1"];

//   if (search) {
//     whereClauses.push("(c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone_number LIKE ?)");
//     params.push(`%${search}%`, `%${search}%`, `%${search}%`);
//   }

//   if (city) {
//     whereClauses.push("(a.city LIKE ?)");
//     params.push(`%${city}%`);
//   }

//   const whereSQL = whereClauses.join(" AND ");

//   // Total count
//   const countQuery = `SELECT COUNT(DISTINCT c.id) AS total 
//     FROM customers1 c 
//     LEFT JOIN addresses1 a ON c.id = a.customer_id
//     WHERE ${whereSQL}`;

//   db.get(countQuery, params, (err, countRow) => {
//     if (err) return res.status(400).json({ error: err.message });

//     const totalItems = countRow.total;
//     const totalPages = Math.ceil(totalItems / limit);

//     // Main query
//     const mainQuery = `
//       SELECT c.*, a.city AS city
//       FROM customers1 c
//       LEFT JOIN addresses1 a ON c.id = a.customer_id
//       WHERE ${whereSQL}
//       GROUP BY c.id
//       ORDER BY ${sortBy} ${order}
//       LIMIT ? OFFSET ?`;
    
//     db.all(mainQuery, [...params, parseInt(limit), parseInt(offset)], (err, rows) => {
//       if (err) return res.status(400).json({ error: err.message });
//       res.json({ customers: rows, totalPages });
//     });
//   });
// });

app.get("/api/customers1", (req, res) => {
  const {
    search = "",
    city = "",
    sortBy = "first_name",
    order = "ASC",
    page = 1,
    limit = 10,
  } = req.query;

  const offset = (page - 1) * limit;

  let params = [];
  let whereClauses = ["1=1"];

  if (search) {
    whereClauses.push(
      "(c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone_number LIKE ?)"
    );
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (city) {
    // Filter customers who have at least one address in that city
    whereClauses.push(
      "EXISTS (SELECT 1 FROM addresses1 a WHERE a.customer_id = c.id AND a.city LIKE ?)"
    );
    params.push(`%${city}%`);
  }

  const whereSQL = whereClauses.join(" AND ");

  // Total count
  const countQuery = `SELECT COUNT(*) AS total FROM customers1 c WHERE ${whereSQL}`;

  db.get(countQuery, params, (err, countRow) => {
    if (err) return res.status(400).json({ error: err.message });

    const totalItems = countRow.total;
    const totalPages = Math.ceil(totalItems / limit);

    // Main query: get one city per customer (optional: first city)
    const mainQuery = `
      SELECT c.*, (SELECT a.city FROM addresses1 a WHERE a.customer_id = c.id LIMIT 1) AS city
      FROM customers1 c
      WHERE ${whereSQL}
      ORDER BY ${sortBy} ${order}
      LIMIT ? OFFSET ?
    `;

    db.all(mainQuery, [...params, parseInt(limit), parseInt(offset)], (err, rows) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ customers: rows, totalPages });
    });
  });
});


// Get single customer
app.get("/api/customers1/:id", (req, res) => {
  db.get(`SELECT * FROM customers1 WHERE id=?`, [req.params.id], (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(row);
  });
});

// Delete customer
app.delete("/api/customers1/:id", (req, res) => {
  db.run(`DELETE FROM customers1 WHERE id=?`, [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// ----------------------
// ADDRESS ROUTES
// ----------------------

// Add address
app.post("/api/customers1/:id/addresses1", (req, res) => {
  const { address_details, city, state, pin_code } = req.body;

  db.run(
    `INSERT INTO addresses1 (customer_id,address_details,city,state,pin_code) VALUES (?,?,?,?,?)`,
    [req.params.id, address_details, city, state, pin_code],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID, customer_id: req.params.id, address_details, city, state, pin_code });
    }
  );
});

// Update address
app.put("/api/addresses1/:addressId", (req, res) => {
  const { address_details, city, state, pin_code } = req.body;

  db.run(
    `UPDATE addresses1 SET address_details=?,city=?,state=?,pin_code=? WHERE id=?`,
    [address_details, city, state, pin_code, req.params.addressId],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Get addresses for customer
app.get("/api/customers1/:id/addresses1", (req, res) => {
  db.all(`SELECT * FROM addresses1 WHERE customer_id=?`, [req.params.id], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

// Delete address
app.delete("/api/addresses1/:addressId", (req, res) => {
  db.run(`DELETE FROM addresses1 WHERE id=?`, [req.params.addressId], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
