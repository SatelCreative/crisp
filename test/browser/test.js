var callback = arguments[0];

// Create a new instance
var filter = Crisp.FilterFactory({
  path: '/collections/cars',
  template: '__DO-NOT-SELECT__.products'
});

setTimeout(function() {
  callback('Timed Out');
}, 1000);

// Get the first 10 products
filter
  .get(10)
  .then(callback)
  .catch(function(error) {
    console.error(error);
    callback('Failed to load products');
  });
