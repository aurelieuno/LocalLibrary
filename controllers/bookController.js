var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        book_count: function(callback) {
            Book.count(callback);
        },
        book_instance_count: function(callback) {
            BookInstance.count(callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.count({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.count(callback);
        },
        genre_count: function(callback) {
            Genre.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};


// Display list of all Books
exports.book_list = function(req, res, next) {

  Book.find({}, 'title author ')
    .populate('author')//Here we also call populate() on Book, specifying the author field—this will replace the stored book author id with the full author details.
    .populate('genre')
    .exec(function (err, list_books) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('book_list', { title: 'Book List', book_list: list_books });
    });

};

// Display detail page for a specific book
exports.book_detail = function(req, res, next) {

  async.parallel({
    book: function(callback) {

      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    book_instance: function(callback) {

      BookInstance.find({ 'book': req.params.id })
        //.populate('book')
        .exec(callback);
    },
  }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('book_detail', { title: 'Title', book: results.book, book_instances: results.book_instance } );
  });

};
//////////////////////////////////////////////////////GET//////////////////////////////////////////////////////
// Display book create form on GET
exports.book_create_get = function(req, res, next) {

    async.parallel({
    author: function(callback) {
      Author.find()
      .sort([['family_name', 'ascending']])
      .exec(callback);
    },

    genre: function(callback) {
      Genre.find()
        .sort([['name', 'ascending']])
        .exec(callback);
    },
  }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('book_form', { title: 'Create book', author_list: results.author, genre_list: results.genre } );
  });

};
////////////////////////////////////////////////////POST///////////////////////////////////////////////////////////
// Handle book create on POST
exports.book_create_post = function(req, res, next) {

    //Check that the name field is not empty
    //what about the Model requirements?
    req.checkBody('title', 'Title name must be specified.').notEmpty();
    req.checkBody('summary', 'Summary must be specified.').notEmpty();
    req.checkBody('author', 'Author name must be specified.').notEmpty();
    req.checkBody('isbn', 'ISBN must be specified.').notEmpty();
    req.checkBody('genre', 'Genre must be specified.').notEmpty();

    req.sanitize('title').escape();
    req.sanitize('summary').escape();
    req.sanitize('author').escape();
    req.sanitize('isbn').escape();
    req.sanitize('genre').escape();
    req.sanitize('title').trim();
    req.sanitize('summary').trim();
    req.sanitize('author').trim();
    req.sanitize('isbn').trim();
    req.sanitize('genre').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a genre object with escaped and trimmed data.
    var book = new Book(
      {  title: req.body.title,
         summary: req.body.summary,
         author: req.body.author,
         isbn: req.body.isbn,
         genre: req.body.genre
       });

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('book_form', { title: 'Create book', book: book, errors: errors});
    return;
    }
    else {
        // Data from form is valid.
        //Check if book with same name already exists
        Book.findOne({ 'title': req.body.title, 'author': req.body.author})
            .exec( function(err, found_book) {
                 console.log('found_book: ' + found_book);
                 if (err) { return next(err); }

                 if (found_book) {
                     //Genre exists, redirect to its detail page
                     res.redirect(found_book.url);
                 }
                 else {

                     book.save(function (err) {
                       if (err) { return next(err); }
                       //Genre saved. Redirect to genre detail page
                       res.redirect(book.url);
                     });

                 }

             });
    }

};

// Display book delete form on GET
exports.book_delete_get = function(req, res, next) {
    
  async.parallel({
    book: function(callback) {

      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    book_instance: function(callback) {

      BookInstance.find({ 'book': req.params.id })
        //.populate('book')
        .exec(callback);
    },
  }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('book_delete', { title: 'Title', book: results.book, book_instances: results.book_instance } );
  });
};

// Handle book delete on POST
exports.book_delete_post = function(req, res, next) {
    Book.findByIdAndRemove(req.params.id, function deleteAuthor(err, results) {
    console.log(req.body);
    if (err) { return next(err); }
    res.redirect('/catalog/books');
  })
};

// Display book update form on GET
exports.book_update_get = function(req, res, next) {
        async.parallel({
    author: function(callback) {
      Author.find()
      .sort([['family_name', 'ascending']])
      .exec(callback);
    },

    genre: function(callback) {
      Genre.find()
        .sort([['name', 'ascending']])
        .exec(callback);
    },

    book: function(callback) {
      Book.findById(req.params.id)
        .exec(callback);
    },
  }, function(err, results) {
    if (err) { return next(err); }

    // Mark our selected genres as checked
            for (i = 0; i < results.genre.length; i++) {
                if (results.book.genre.indexOf(results.genre[i]._id) > -1) {
                    //Current genre is selected. Set "checked" flag.
                    results.genre[i].checked='true';
                }}
    //Successful, so render
    res.render('book_form', { title: 'Update book', author_list: results.author, genre_list: results.genre, book : results.book } );

  });
};

// Handle book update on POST
exports.book_update_post = function(req, res, next) {
    //Check that the name field is not empty
    //what about the Model requirements?
    req.checkBody('title', 'Title name must be specified.').notEmpty();
    req.checkBody('summary', 'Summary must be specified.').notEmpty();
    req.checkBody('author', 'Author name must be specified.').notEmpty();
    req.checkBody('isbn', 'ISBN must be specified.').notEmpty();
    req.checkBody('genre', 'Genre must be specified.').notEmpty();

    req.sanitize('title').escape();
    req.sanitize('summary').escape();
    req.sanitize('author').escape();
    req.sanitize('isbn').escape();
    req.sanitize('genre').escape();
    req.sanitize('title').trim();
    req.sanitize('summary').trim();
    req.sanitize('author').trim();
    req.sanitize('isbn').trim();
    req.sanitize('genre').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a genre object with escaped and trimmed data.
    var book = new Book(
      {  title: req.body.title,
         summary: req.body.summary,
         author: req.body.author,
         isbn: req.body.isbn,
         genre: req.body.genre,
         _id:req.params.id
       });

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('book_form', { title: 'Update book', book: book, errors: errors});
    return;
    }
    else {
        // Data from form is valid.
        //Check if book with same name already exists
        Book.findByIdAndUpdate(req.params.id, book, {new: true}, function(err, updated_book) {
          if (err) { return next(err); }
          console.log(updated_book);
          res.redirect(updated_book.url);
          });

        }           
    }


