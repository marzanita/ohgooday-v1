var messageSent = false;

document.getElementById('contact-form').addEventListener('submit', contactForm);

function contactForm(event) {
  event.preventDefault();
  var loaderIcon = document.getElementById('server-response');
  loaderIcon.insertAdjacentHTML('beforebegin',
    '<div id="spinner" class="preloader-wrapper small active">' +
      '<div id="spinner-color" class="spinner-layer">' +
        '<div class="circle-clipper left">' +
          '<div class="circle"></div>' +
        '</div><div class="gap-patch">' +
          '<div class="circle"></div>' +
        '</div><div class="circle-clipper right">' +
          '<div class="circle"></div>' +
        '</div>' +
      '</div>' +
    '</div>'
    );
  var disableSubmitBtn = document.getElementById('submit-button');
  disableSubmitBtn.classList.add('disabled');

  // Disable text fields while sending message
  var disableFirstName = document.querySelectorAll('input.validate')[0];
  var disableLastName = document.querySelectorAll('input.validate')[1];
  var disableEmail = document.querySelectorAll('input.validate')[2];
  var disablePhone = document.querySelectorAll('input.validate')[3];
  var disableMessage = document.querySelectorAll('textarea')[0];
  disableFirstName.setAttribute('disabled', '');
  disableLastName.setAttribute('disabled', '');
  disableEmail.setAttribute('disabled', '');
  disablePhone.setAttribute('disabled', '');
  disableMessage.setAttribute('disabled', '');

  // Get form values
  var first_name = document.getElementById('first_name').value;
  var last_name = document.getElementById('last_name').value;
  var email = document.getElementById('email').value;
  var phone = document.getElementById('phone').value;
  var message = document.getElementById('message').value;

  // Create object and stringify to JSON so it can be sent back to the backend
  var formData = JSON.stringify({
    first_name: first_name,
    last_name: last_name,
    email: email,
    phone: phone,
    message: message
  });

  // Ajax request
  var request = new XMLHttpRequest();
  request.open('POST', '/contact', true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.send(formData);

  // Catch errors from Ajax request
  request.onreadystatechange = function () {
  var DONE = 4; // readyState 4 means the request is done
  var OK = 200; // status 200 is a successful return
    if (request.readyState === DONE) {
      if (request.status === OK) {
        // console.log(request.responseText); // Returns 'OK'
        setTimeout(function(){
          messageSent = true;
          document.getElementById('spinner').remove();
          document.getElementById('contact-form').reset();
          disableSubmitBtn.classList.remove('disabled');
          // Enable text fields after sending message
          var disableFirstName = document.querySelectorAll('input.validate')[0];
          var disableLastName = document.querySelectorAll('input.validate')[1];
          var disableEmail = document.querySelectorAll('input.validate')[2];
          var disablePhone = document.querySelectorAll('input.validate')[3];
          var disableMessage = document.querySelectorAll('textarea')[0];
          disableFirstName.removeAttribute('disabled', '');
          disableLastName.removeAttribute('disabled', '');
          disableEmail.removeAttribute('disabled', '');
          disablePhone.removeAttribute('disabled', '');
          disableMessage.removeAttribute('disabled', '');
          document.getElementById('server-response').innerHTML = "<span id='last-server-response'>Your message was sent successfully. We'll be in touch!</span>";
        }, 1500);
        
      } else {
        // console.log('Error: ' + request.status); // Returns '500'
        setTimeout(function(){
          messageSent = true;
          document.getElementById('spinner').remove();
          disableSubmitBtn.classList.remove('disabled');
          // Enable text fields after sending message
          var disableFirstName = document.querySelectorAll('input.validate')[0];
          var disableLastName = document.querySelectorAll('input.validate')[1];
          var disableEmail = document.querySelectorAll('input.validate')[2];
          var disablePhone = document.querySelectorAll('input.validate')[3];
          var disableMessage = document.querySelectorAll('textarea')[0];
          disableFirstName.removeAttribute('disabled', '');
          disableLastName.removeAttribute('disabled', '');
          disableEmail.removeAttribute('disabled', '');
          disablePhone.removeAttribute('disabled', '');
          disableMessage.removeAttribute('disabled', '');
          document.getElementById('server-response').innerHTML = "<span id='last-server-response' style='color: #d50000;'>Please complete all fields as requested</span>";
        }, 1500);
      }
    }
  }
}

// Add ###-###-#### message to phone input on click
document.getElementById('phone').addEventListener('click', addPlaceholder);
function addPlaceholder() {
  document.getElementById('phone-area').innerHTML = "<span id='phone-area-message' class='helper-text' style='color: #9e9e9e;'>10-digit phone number with or without dashes (e.g. ###-###-####)</span>"
}

document.getElementById('contact-form').addEventListener('click', removeSuccessMessage);
function removeSuccessMessage() {
  if (messageSent) {
    document.querySelector('#last-server-response').remove();
    messageSent = false;
  }
}