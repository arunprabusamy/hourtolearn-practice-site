(function () {
  const signinForm = document.querySelector('.signin-form');
  const signinSuccess = document.querySelector('[data-testid="signin-success-message"]');

  signinForm.addEventListener('submit', function (event) {
    event.preventDefault();
    signinSuccess.hidden = false;
  });

  const contactForm = document.querySelector('.contact-form');
  const contactSuccess = document.querySelector('[data-testid="contact-success-message"]');

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();
    contactSuccess.hidden = false;
  });
})();
