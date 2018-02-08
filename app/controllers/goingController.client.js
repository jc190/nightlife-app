'use strict';

(function () {
  var allGoingBtns = document.querySelectorAll('.going-btn');

  allGoingBtns.forEach(function (item) {
    var apiURL = appUrl + '/business/' + item.dataset.business + '/going';
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiURL, apiCallback.bind(null, item)));
    item.addEventListener('click', function(e) {
      e.preventDefault();
      ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', apiURL, apiCallback.bind(null, item)));
    });
  });

  function apiCallback (item, data) {
    data = JSON.parse(data);
    if (data.redirect) {
      return window.location.href = data.redirect;
    }
    var span = item.querySelector('.badge');
    span.innerHTML = data;
  }
})();
