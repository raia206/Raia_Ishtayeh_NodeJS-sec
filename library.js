const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');
const app = express();
const port = 2222;

// Set the view engine to Pug
app.set('view engine', 'pug');
app.use(express.static('styles'));

app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse JSON in the request body
app.use(express.json());

// GET /books endpoint - returns a list of books
app.get('/books', (req, res, next) => {
  // Read the books from books.json file
  fs.readFile('books.json', 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send('Books file not found');
      } else {
        return next(err);
      }
    }

    try {
      // Parse the JSON data
      const books_detail = JSON.parse(data);
      res.render('books', { books_detail });
    } catch (parseError) {
      return res.status(500).send('Error parsing books file');
    }
  });
});




// GET /books/:id endpoint - returns book details by ID
app.get('/books/:id', (req, res, next) => {
  console.log(req.params.id.substring(1));
  const bookId = parseInt(req.params.id.substring(1));

  // Read the books from books.json file
  fs.readFile('books.json', 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send('Books file not found');
      } else {
        return next(err);
      }
    }
    try {
      // Parse the JSON data
      const books_detail = JSON.parse(data);

      // Find the book by ID
      const book = books_detail.find((b) => b.id === bookId);
      if (!book) {
        return res.status(404).send('Book not found');
      }
      res.render('books_detail', { book });
    } catch (parseError) {
      return res.status(500).send('Error parsing books file');
    }
  });
});






// POST /books endpoint - adds a new book
app.post('/books', (req, res, next) => {
  const book = req.body;
console.log(req.body);
  // Read the existing books from books.json file, if it exists
  fs.readFile('books.json', 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return next(err);
    }
    let books_detail = [];
    try {
      if (data) {
        // If the file exists, parse the JSON data
        books_detail = JSON.parse(data);
      }
    } catch (parseError) {
      return res.status(500).send('Error parsing books file');
    }
    // Add the new book to the array
    books_detail.push(book);
    // Write the updated books array back to the file
    fs.writeFile('books.json', JSON.stringify(books_detail), (err) => {
      if (err) {
        return next(err);
      }
      res.send('Book added successfully');
    });
  });
});



// Error handling middleware for invalid endpoints
app.use((req, res, next) => {
  const error = new Error('Invalid endpoint');
  error.status = 404;
  next(error);
});

// Error handling middleware for handling all errors
app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).send(message);
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});