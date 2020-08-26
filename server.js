const express = require('express');
const connectDb = require('./config/db');

const app = express();

// Connect Database
connectDb();

// Init Middleware
app.use(express.json({ extended: false }));

// Define routes
app.use('/api/customers', require('./routes/api/customers'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/account', require('./routes/api/account'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
