console.log('accountPages.js');

// demo - staging
// site - production

if (Shopify.theme.name === 'SanpSuits Theme [PROD]') {
  var siteLocation = 'site';
} else {
  var siteLocation = 'demo';
}

$.ajax({
  // url: "https://demo.snapsuits.com/api/v1/groomsmen-checker/ryan@snapsuits.com/groomsmen",
  url: "https://site.snapsuits.com/api/v1/groomsmen-checker/{{ customer.email }}/groomsmen/",
  type: 'GET',
  headers : {
    'Authorization' : 'Token bb8dd34ceaf3506a63ee3986d6ab0438becf19a1'
  },
  success: function(data) {
    var groomsmanCount = data.count;
    var resultsArray = data.results;

    $('body').addClass('has-wedding');

	if (groomsmanCount === 0) {
      $('.populated-wedding, .add-groomsman').hide();
      $('.empty-wedding').show();
      $('.groomsman-btn, .account-link').attr('href', 'groomshop.snapsuits.com');
    } else {
      $('.empty-wedding, .add-groomsman').hide(); 
      $('.populated-wedding').show();
      $('.account-link, .groomsman-btn').attr('href', data.results[0].wedding_link);
    }

    $(document).on('click', '.groomsman-btn', function() {
      var $containerID = $(this).attr('href');

      $('.empty-wedding, .populated-wedding').hide();
      $($containerID).show();
    });

    resultsArray.forEach(function(groomsman, index) {
      
      console.log(groomsman);
      
      if (groomsman.order_status === 'Not ordered') {
        var statusClass = 'red-text';
      } else if (groomsman.order_status === 'Shipped' || 'Delivered') {
        var statusClass = 'green-text';
      }

      var $name = $('<div />', { 'text': groomsman.name, 'class': 'groomsman-info-block' });
      var $email = $('<div />', { 'text': groomsman.email, 'class': 'groomsman-info-block' });
      var $phone = $('<div />', { 'text': groomsman.phone, 'class': 'groomsman-info-block' });
      var $orderStatus = $('<div />', { 'text': groomsman.order_status, 'class': statusClass + ' groomsman-info-block' });
      var $populatedRow = $('<div />', {
        'html': [$name, $email, $phone, $orderStatus],
        'class': 'single-populated-row row-' + index
      });

      $('.populated-row').append($populatedRow);
    });
  

//     $('.account-link').attr('href', data.results[0].wedding_link);

  },
  error: function (jqXHR, textStatus, errorThrown){
    console.log('jqXHR Detail: ', JSON.parse(jqXHR.responseText).detail);
    console.log('jqXHR Status Code: ', JSON.parse(jqXHR.responseText).status_code);
    console.log('textStatus', textStatus);

    $('body').addClass('no-wedding');
    $('.empty-wedding-content').text('You do not have a wedding associated to this email.');
    $('.populated-wedding, .add-groomsman').hide();
    $('.groomsman-btn').text('Register Now').attr('href', 'https://groomshop.snapsuits.com/');
    $('.empty-wedding').show();
  }
});
  

$('#add-groomsman-form').submit(function(e) {
  $.ajax({
    url: "https://site.snapsuits.com/api/v1/groomsmen-checker/{{ customer.email }}/groomsmen/create/",
    type: 'POST', 
    contentType: 'application/json',
    data: {
      'name': $('.form-name').val(),
      'email': $('.form-email').val(),
      'phone': $('.form-phone').val(),
      'designation': $('.form-designation').val()
    },
    dataType: 'json',
    headers : {
      'Authorization' : 'Token bb8dd34ceaf3506a63ee3986d6ab0438becf19a1'
    },
    success: function(data){
      console.log('success');
      console.log(data);
    },
    error: function(data) {
      console.log('error');
      console.log(data);
    },
    complete: function(data) {
      console.log('complete');
      console.log(data);
    }
  });

  e.preventDefault(); 
});
