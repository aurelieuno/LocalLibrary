var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var AuthorSchema = Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Virtual for author's full name
//Virtual properties are document properties that you can get and set but that do not get persisted
//to MongoDB. The getters are useful for formatting or combining fields

AuthorSchema
.virtual('name')
.get(function () {
  return this.family_name + ', ' + this.first_name;
});

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});

AuthorSchema
.virtual('date_of_birth_formatted')
.get(function () {
  return moment(this.date_of_birth).format('MMMM Do, YYYY')+"-"+moment(this.date_of_death).format('MMMM Do, YYYY');
});


//Export model
module.exports = mongoose.model('Author', AuthorSchema);