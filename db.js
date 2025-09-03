

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// Initialize database schema and dummy data
db.serialize(() => {
  // Drop tables if exist
  db.run(`DROP TABLE IF EXISTS addresses1`);
  db.run(`DROP TABLE IF EXISTS customers1`);

  // Create customers table
  db.run(`
    CREATE TABLE customers1 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone_number TEXT
    )
  `);

  // Create addresses table
  db.run(`
    CREATE TABLE addresses1 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      address_details TEXT,
      city TEXT,
      state TEXT,
      pin_code TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers1(id) ON DELETE CASCADE
    )
  `);

  console.log("✅ Tables created: customers1, addresses1");

  // Insert dummy customers
  const customers = [
    ["Satish", "Gouni", "9998887776"],
    ["John", "Doe", "9876543210"],
    ["Alice", "Smith", "9123456789"],
    ["Bob", "Johnson", "9988776655"],
    ["Carol", "Williams", "9112233445"],
    ["David", "Brown", "9001122334"],
    ["Eve", "Davis", "9012345678"],
    ["Frank", "Miller", "9023456789"],
    ["Grace", "Wilson", "9034567890"],
    ["Hannah", "Moore", "9045678901"]
  ];

  const insertCustomer = db.prepare(`INSERT INTO customers1 (first_name, last_name, phone_number) VALUES (?, ?, ?)`);
  customers.forEach(c => insertCustomer.run(c));
  insertCustomer.finalize();

  // Insert dummy addresses
  const addresses = [
    [1, "123 Main Street", "Hyderabad", "Telangana", "500001"],
    [1, "456 Park Lane", "Hyderabad", "Telangana", "500002"],
    [2, "789 Elm Street", "Mumbai", "Maharashtra", "400001"],
    [3, "321 Oak Avenue", "Chennai", "Tamil Nadu", "600001"],
    [4, "654 Pine Street", "Kolkata", "West Bengal", "700001"],
    [5, "987 Maple Road", "Bengaluru", "Karnataka", "560001"],
    [6, "246 Cedar Lane", "Pune", "Maharashtra", "411001"],
    [7, "135 Birch Street", "Ahmedabad", "Gujarat", "380001"],
    [8, "864 Walnut Street", "Hyderabad", "Telangana", "500003"],
    [9, "753 Cherry Lane", "Mumbai", "Maharashtra", "400002"],
    [10, "159 Spruce Road", "Chennai", "Tamil Nadu", "600002"]
  ];

  const insertAddress = db.prepare(`INSERT INTO addresses1 (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`);
  addresses.forEach(a => insertAddress.run(a));
  insertAddress.finalize();

  console.log("✅ Dummy data inserted successfully.");
});

module.exports = db;
