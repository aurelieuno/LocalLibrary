var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GenreSchema = Schema({
  name: {type: String, required: true, max: 100, min: 3 },
});

// Virtual for bookgenre's URL
GenreSchema
.virtual('url')
.get(function () {
  return '/catalog/genre/' + this._id;
});

//Export model
module.exports = mongoose.model('Genre', GenreSchema);

/**The model should have a String SchemaType called name to describe the genre.
This name should be required and have between 3 and 100 characters.
Declare a virtual for the genre's URL, named url.
Export the model.**/