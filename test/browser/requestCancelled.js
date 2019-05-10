var callback = arguments[0];

// Request and cancel
var cancel;
Crisp.request('/collections/all?view=__DO-NOT-SELECT__.products', function(c) {
  cancel = c;
})
  .then(function() {
    callback('Request did not get cancelled');
  })
  .catch(function(error) {
    if (Crisp.isCancel(error)) {
      callback('Cancelled Successfully!');
    } else {
      console.error(error);
      callback('Request threw a non-cancellation error');
    }
  });
setTimeout(cancel, 10);
