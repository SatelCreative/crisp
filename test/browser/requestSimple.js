var callback = arguments[0];

// Request and parse JSON
Crisp.request('/collections/all?view=__DO-NOT-SELECT__.products').then(function(
  response
) {
  callback(response);
});
