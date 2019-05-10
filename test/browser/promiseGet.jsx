var callback = arguments[0];

// Create a new instance
var collection = Crisp.Collection({
  handle: 'cars',
  template: '__DO-NOT-SELECT__.products'
});

// Get the first 10 products
collection.get({ number: 10 }).then(function(response) {
  callback(response);
});
