// @noflow
/* eslint-disable */
var callback = arguments[0];

// Create a new instance
var collection = Crisp.Collection({
  handle: 'cars',
  template: '__DO-NOT-SELECT__.products',
});

// Get the first 10 products
collection.get({
  number: 10,
  callback: function(response) {
    // Handle error
    if (response.error) {
      // Check if due to cancellation
      if (Crisp.isCancel(response.error)) {
        return;
      }
      // Non cancellation error
      throw error;
    }

    // Use products
    callback(response.payload);
  }
});
