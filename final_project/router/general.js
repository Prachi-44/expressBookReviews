
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();
const BOOKS_API = 'http://127.0.0.1:5000/api/books';

// Internal data endpoint used by Axios requests
public_users.get('/api/books', (req, res) => {
  res.json(books);
});

// Register user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'Username already exists'
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered'
  });
});

// Retrieve all books using async/await and Axios
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_API);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books'
    });
  }
});

// Retrieve book by ISBN using a Promise
public_users.get('/isbn/:isbn', (req, res) => {
  axios.get(BOOKS_API)
    .then(response => {
      const book = response.data[req.params.isbn];

      if (!book) {
        return res.status(404).json({
          message: 'Book not found'
        });
      }

      return res.status(200).json(book);
    })
    .catch(() => {
      return res.status(500).json({
        message: 'Unable to retrieve book'
      });
    });
});

// Retrieve books by author using async/await
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_API);
    const author = req.params.author.toLowerCase();

    const results = Object.values(response.data).filter(book =>
      book.author &&
      book.author.toLowerCase() === author
    );

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books'
    });
  }
});

// Retrieve books by title using async/await
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_API);
    const title = req.params.title.toLowerCase();

    const results = Object.values(response.data).filter(book =>
      book.title &&
      book.title.toLowerCase().includes(title)
    );

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books'
    });
  }
});

// Retrieve reviews for a book
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
