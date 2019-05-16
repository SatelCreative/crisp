var callback = arguments[0];

function filter(item) {
  return item.tags.indexOf('on-sale') >= 0;
}

// Create a new instance
var filter = Crisp.Filter({
  url: '/collections/cars',
  template: '__DO-NOT-SELECT__.products',
  filter: filter
});

setTimeout(function() {
  callback('Timed Out');
}, 1000);

// Get the first 10 products (only 9 exist)
filter
  .get({
    number: 10
  })
  .then(callback)
  .catch(function(error) {
    console.error(error);
    callback('Failed to load products');
  });
