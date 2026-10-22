const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
let users = [];

const isValid = (username) =>
  users.some(user => user.username === username);

const authenticatedUser = (username, password) =>
  users.some(user =>
    user.username === username && user.password === password
  );

// Register users through the general router; this array is shared
// with general.js through module exports.

// Login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const token = jwt.sign(
    { username },
    'fingerprint_customer',
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    message: 'Login successful',
    token
  });
});

// Add or update a review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.session.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!username) {
    return res.status(401).json({ message: 'Please log in first' });
  }

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'A review is required' });
  }

  books[isbn].reviews = books[isbn].reviews || {};
  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({
    message: 'Review added or updated successfully',
    reviews: books[isbn].reviews
  });
});

// Delete your review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!username) {
    return res.status(401).json({ message: 'Please log in first' });
  }

  if (!books[isbn].reviews ||
      !books[isbn].reviews[username]) {
    return res.status(404).json({ message: 'Review not found' });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully'
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
