const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
require('dotenv').config();
const { Pool } = require('pg');
const swaggerSetup = require('./swagger');

const app = express();
const PORT = 3000; // You can change this to the desired port number

app.use(express.json()); // for parsing JSON payloads
app.use(express.urlencoded({ extended: true })); // for parsing form data

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ecommerce',
  password: 'none',
  port: 5432, // default PostgreSQL port
});

pool.query('SELECT * FROM users', (err, result) => {
  if (err) {
    console.error('Error executing query:', err);
  } else {
    console.log('Result:', result.rows);
  }
});

app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await findUserByUsername(username);

      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      if (password !== user.password) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    done(null, user);
  } catch (error) {
    done(error);
  }
});
// Add necessary middleware and configurations here
app.post('/register', (req, res) => {
  // Extract the necessary data from the request body
  const { name, password, email } = req.body;

  // Add your logic for handling the registration process
  // Here, you can perform validation, check if the user already exists, etc.

  // Assuming you have a database table named 'users', you can use the 'pg' library to insert a new user
  pool.query(
    'INSERT INTO users (name, password, email) VALUES ($1, $2, $3)',
    [name, password, email],
    (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Error registering user' });
      } else {
        console.log('User registered successfully');
        res.status(201).json({ message: 'User registered successfully' });
      }
    }
  );
});

const flash = require('connect-flash');
app.use(flash());

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  }),
  (req, res) => {
    // Access flash messages using req.flash()
    const errorMessages = req.flash('error');
    console.log(errorMessages); // Example: ['Invalid username or password']

    // Handle the flash messages as needed
    // ...
  }
);

// Create a new cart
app.post('/cart', (req, res) => {
  // Add logic to create a new cart
  res.send('Cart created');
});

// Add a product to a cart
app.post('/cart/:cartId', (req, res) => {
  const cartId = req.params.cartId;
  // Add logic to add a product to the specified cart
  res.send(`Product added to cart ${cartId}`);
});

// Get a cart by ID
app.get('/cart/:cartId', (req, res) => {
  const cartId = req.params.cartId;
  // Add logic to retrieve the specified cart
  res.send(`Cart ID: ${cartId}`);
});

// Retrieve Products by Category
app.get('/products', (req, res) => {
  const { category } = req.query;
  // Add logic to retrieve products by category
  if (category) {
    // Retrieve products by the specified category
    res.send(`Retrieve products by category: ${category}`);
  } else {
    // Retrieve all products
    res.send('Retrieve all products');
  }
});

// Retrieve a Single Product
app.get('/products/:productId', (req, res) => {
  const { productId } = req.params;
  // Add logic to retrieve the specified product
  res.send(`Retrieve product with ID: ${productId}`);
});

// Add logic for creating a new product
app.post('/products', (req, res) => {
  // Extract the necessary data from the request body
  const { name, price, description } = req.body;

  // Add your logic for creating a new product
  // Here, you can perform validation, generate an ID, etc.

  // Assuming you have a database table named 'products', you can use the 'pg' library to insert a new product
  pool.query(
    'INSERT INTO products (name, price, description) VALUES ($1, $2, $3)',
    [name, price, description],
    (err, result) => {
      if (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Error creating product' });
      } else {
        console.log('Product created successfully');
        res.status(201).json({ message: 'Product created successfully' });
      }
    }
  );
});

// Add logic for updating an existing product
app.put('/products/:productId', (req, res) => {
  const { productId } = req.params;
  // Extract the necessary data from the request body
  const { name, price, description } = req.body;

  // Add your logic for updating the existing product
  // Here, you can perform validation, check if the product exists, etc.

  // Assuming you have a database table named 'products', you can use the 'pg' library to update the product
  pool.query(
    'UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4',
    [name, price, description, productId],
    (err, result) => {
      if (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Error updating product' });
      } else {
        console.log('Product updated successfully');
        res.json({ message: 'Product updated successfully' });
      }
    }
  );
});

// Add logic for deleting a product
app.delete('/products/:productId', (req, res) => {
  const { productId } = req.params;
  // Add logic to delete the specified product
  res.send(`Delete product with ID: ${productId}`);
});

// Retrieve All Users
app.get('/users', (req, res) => {
  // Add logic to retrieve all users
  res.send('Retrieve all users');
});

// Retrieve a Single User
app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;
  // Add logic to retrieve the specified user
  res.send(`Retrieve user with ID: ${userId}`);
});

// Update a User
app.put('/users/:userId', (req, res) => {
  const { userId } = req.params;
  // Extract the necessary data from the request body
  const { name, email, password } = req.body;

  // Add your logic for updating the existing user
  // Here, you can perform validation, check if the user exists, etc.

  // Assuming you have a database table named 'users', you can use the 'pg' library to update the user
  pool.query(
    'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4',
    [name, email, password, userId],
    (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Error updating user' });
      } else {
        console.log('User updated successfully');
        res.json({ message: 'User updated successfully' });
      }
    }
  );
});

// Create a Cart
app.post('/cart', (req, res) => {
  // Add logic to create a new cart
  res.send('Create a new cart');
});

// Add a Product to Cart
app.post('/cart/:cartId', (req, res) => {
  const { cartId } = req.params;
  // Extract the necessary data from the request body
  const { productId, quantity } = req.body;

  // Add your logic for adding a product to the specified cart
  // Here, you can perform validation, check if the product and cart exist, etc.

  // Assuming you have a database table named 'carts', you can use the 'pg' library to add the product to the cart
  pool.query(
    'INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3)',
    [cartId, productId, quantity],
    (err, result) => {
      if (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).json({ error: 'Error adding product to cart' });
      } else {
        console.log('Product added to cart successfully');
        res.json({ message: 'Product added to cart successfully' });
      }
    }
  );
});

// Get Cart by ID
app.get('/cart/:cartId', (req, res) => {
  const { cartId } = req.params;
  // Add logic to retrieve the specified cart
  res.send(`Retrieve cart with ID: ${cartId}`);
});

// Checkout
app.post('/checkout', (req, res) => {
  // Add logic for the checkout process
  // Here, you can assume that all charges succeed

  // Extract the necessary data from the request body
  const { cartId } = req.body;

  // Add your logic for performing the checkout process
  // Here, you can update the status of the order or perform any other necessary actions

  // Assuming you have a database table named 'orders', you can use the 'pg' library to update the order status
  pool.query(
    'UPDATE orders SET status = $1 WHERE cart_id = $2',
    ['completed', cartId],
    (err, result) => {
      if (err) {
        console.error('Error performing checkout:', err);
        res.status(500).json({ error: 'Error performing checkout' });
      } else {
        console.log('Checkout completed successfully');
        res.json({ message: 'Checkout completed successfully' });
      }
    }
  );
});

// Retrieve All Orders
app.get('/orders', (req, res) => {
  // Add logic to retrieve all orders
  res.send('Retrieve all orders');
});

// Retrieve a Single Order
app.get('/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  // Add logic to retrieve the specified order
  res.send(`Retrieve order with ID: ${orderId}`);
});


app.use(passport.initialize());
app.use(passport.session());
swaggerSetup(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});