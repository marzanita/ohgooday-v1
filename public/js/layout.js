$(document).ready(function(){    
document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.parallax');
  var instances = M.Parallax.init(elems, options);
});

$('.sidenav').sidenav();
$('.parallax').parallax();
$('select').formSelect();
});

// 404 page
var initialWidth = $("h1.not-found").width()
var initialHeight = $("h1.not-found").height()
$(document).on("mousemove", function (event) {
  var scaleX = event.pageX / initialWidth
  var scaleY = event.pageY / initialHeight
  $("h1.not-found").css("transform", "scale(" + scaleX + ", " + scaleY + ")")
});

// Scroll reveal
ScrollReveal().reveal('.headline', { duration: 1000 });
ScrollReveal().reveal('.widget', { interval: 350 });

// Styled phone label field here because it was not working in CSS
$('#phone-field').css({'left': '0'});