var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

// Display list of all Authors
exports.author_list = function(req, res, next) {

  Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('author_list', { title: 'Author List', author_list: list_authors });
    });
};

// Display detail page for a specific Author
exports.author_detail = function(req, res, next) {

    async.parallel({
    author: function(callback) {

      Author.findById(req.params.id)
        .exec(callback);
    },

    book: function(callback) {

      Book.find({ 'author': req.params.id })
        .populate('author')
        .exec(callback);
    },
  }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('author_detail1', { title: 'Author', book: results.book, author: results.author } );
  });

};

// Display Author create form on GET
exports.author_create_get = function(req, res, next) {
  res.render('author_form', { title: 'Create Author' });
};

// Handle Author create on POST
exports.author_create_post = function(req, res, next) {

        //Check that the name field is not empty
        //what about the Model requirements?
    req.checkBody('first_name', 'First name must be specified.').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
    req.checkBody('family_name', 'Family name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlpha();
    req.checkBody('date_of_birth', 'Invalid date').notEmpty().optional({ checkFalsy: true }).isDate();
    

    /**We can use the optional() function to run a subsequent validation only if a field has been entered
    (this allows us to validate optional fields). For example, above we check that the optional
    date of birth is a date (the checkFalsy flag means that we'll accept either an empty string or
    null as an empty value).**/

    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();
    req.sanitize('family_name').trim();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();

    //Run the validators
    var errors = req.validationErrors();

    //Create a genre object with escaped and trimmed data.
    var author = new Author(
      { first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
       });

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('author_form', { title: 'Create Author', author: author, errors: errors});
    return;
    }
    else {
        // Data from form is valid.
        //Check if Author with same name already exists
        Author.findOne({ 'family_name': req.body.family_name, 'first_name': req.body.first_name})
            .exec( function(err, found_author) {
                 console.log('found_author: ' + found_author);
                 if (err) { return next(err); }

                 if (found_author) {
                     //Genre exists, redirect to its detail page
                     res.redirect(found_author.url);
                 }
                 else {

                     author.save(function (err) {
                       if (err) { return next(err); }
                       //Genre saved. Redirect to genre detail page
                       res.redirect(author.url);
                     });

                 }

             });
    }

};
// Display Author delete form on GET
// exports.author_delete_get = function(req, res, next) {       

//     async.parallel({
//         author: function(callback) {     
//             Author.findById(req.params.id).exec(callback);
//         },
//         authors_books: function(callback) {
//           Book.find({ 'author': req.params.id }).exec(callback);
//         },
//     }, function(err, results) {
//         if (err) { return next(err); }
//         //Successful, so render
//         res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
//     });
    
// };
//Display Author delete form on GET
exports.author_delete_get = function(req, res, next) {

      async.parallel({
           author: function(callback) {
              Author.findById(req.params.id)
             .exec(callback);
    },

            book: function(callback) {    
             Book.find({ 'author': req.params.id })
             .populate('author')
             .exec(callback);
    },
  }, function(err, results) {
    if (err) { return next(err); }
    
    res.render('author_delete1', { title: 'Delete Author', book: results.book, author: results.author } );
  
  });
    
};


//Handle Author delete on POST 
//exports.author_delete_post = function(req, res, next) {

    // req.checkBody('authorid', 'Author id must exist').notEmpty();  
    // console.log(req.params.id);
    // async.parallel({
    //     author: function(callback) {     
    //         Author.findById(req.body.authorid).exec(callback);
    //     },
    //     authors_books: function(callback) {
    //       Book.find({ 'author': req.body.authorid },'title summary').exec(callback);
    //     },
    // }, function(err, results) {
    //     if (err) { return next(err); }
    //     //Success
    //     if (results.authors_books>0) {
    //         //Author has books. Render in same way as for GET route.
    //         res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    //         return;
    //     }
    //     else {
            //Author has no books. Delete object and redirect to the list of authors.
            // Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
            //     if (err) { return next(err); }
            //     //Success - got to author list
            //     res.redirect('/catalog/authors');
            // });

        //}
   // });

//};
exports.author_delete_post = function(req, res, next) {

  Author.findByIdAndRemove(req.params.id, function deleteAuthor(err, results) {
    console.log(req.body);
    if (err) { return next(err); }
    res.redirect('/catalog/authors');
  })
};

// Display Author update form on GET
exports.author_update_get = function(req, res, next) {

  Author.findById(req.params.id, function(err, results) {
    if (err) { return next(err); }
    res.render('author_form', { title: 'Update Author', author: results});
    console.log(results)
  })
    
};


// Handle Author update on POST
exports.author_update_post = function(req, res, next) {
        req.checkBody('first_name', 'First name must be specified.').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
    req.checkBody('family_name', 'Family name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlpha();
    req.checkBody('date_of_birth', 'Invalid date').notEmpty().optional({ checkFalsy: true }).isDate();
    

    /**We can use the optional() function to run a subsequent validation only if a field has been entered
    (this allows us to validate optional fields). For example, above we check that the optional
    date of birth is a date (the checkFalsy flag means that we'll accept either an empty string or
    null as an empty value).**/

    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();
    req.sanitize('family_name').trim();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();

    //Run the validators
    var errors = req.validationErrors();

    //Create a genre object with escaped and trimmed data.
    var author = new Author(
      { first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id
       });

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('author_form', { title: 'Create Author', author: author, errors: errors});
    return;
    }
    else {
       Author.findByIdAndUpdate(req.params.id, author, {new: true}, function(err, updated_author) {
          if (err) { return next(err); }
          console.log(updated_author);
          res.redirect(updated_author.url);
          });

    }
};