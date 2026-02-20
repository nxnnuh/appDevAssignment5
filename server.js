// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();

const PORT = 3000;

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Custom middleware to log incoming requests
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  // Log request body data for POST and PUT requests
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }

  // Pass control to the next middleware
  next();
};

// Apply the logging middleware to all incoming requests
app.use(requestLogger);

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here
// Variable to track the next available menu item ID
let nextId = 7;

// Validation rules for creating and updating menu items
const menuValidation = [
  body('name')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),

  body('description')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),

  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0'),

  body('category')
    .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
    .withMessage('Category must be appetizer, entree, dessert, or beverage'),

  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients must be an array with at least one item'),

  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be true or false')
];
//Validation rules for just put because it was not allowing me to update in postman
const menuValidationPUT = [
  body('name').optional().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
  body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('category').optional().isIn(['appetizer','entree','dessert','beverage']).withMessage('Category must be appetizer, entree, dessert, or beverage'),
  body('ingredients').optional().isArray({ min: 1 }).withMessage('Ingredients must be an array with at least one item'),
  body('available').optional().isBoolean().withMessage('Available must be true or false')
];

// Middleware to handle validation errors from express-validator
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  // If validation errors exist, return a 400 Bad Request response
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      messages: errors.array().map(err => err.msg)
    });
  }

 

  // Continue to the route handler if validation passes
  next();
};

// Retrieve all menu items
app.get('/api/menu', (req, res) => {
  res.status(200).json(menuItems);
});

// Retrieve a single menu item by ID
app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = menuItems.find(m => m.id === id);

  // Return 404 if the menu item does not exist
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  res.status(200).json(item);
});

// Create a new menu item
app.post('/api/menu', menuValidation, handleValidationErrors, (req, res) => {
  const newItem = {
    id: nextId++,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    ingredients: req.body.ingredients,
    available: req.body.available
  };

  menuItems.push(newItem);

  // Return 201 Created with the new menu item
  res.status(201).json(newItem);
});

// Update an existing menu item
app.put('/api/menu/:id', menuValidationPUT, handleValidationErrors, (req, res) => {
  const id = parseInt(req.params.id);
  const item = menuItems.find(m => m.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  // Merge only the fields sent in the request
  Object.assign(item, req.body);

  res.status(200).json(item);
});

// Delete a menu item by ID
app.delete('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = menuItems.findIndex(m => m.id === id);

  // Return 404 if the menu item does not exist
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  const deletedItem = menuItems.splice(index, 1);

  res.status(200).json(deletedItem[0]);
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});