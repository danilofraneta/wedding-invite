const envelope = document.getElementById('envelope');
const overlay = document.getElementById('envelopeOverlay');

envelope.addEventListener('click', () => {
  // Add open class to animate flap & bottom
  envelope.classList.add('open');

  // After flap animation, fade out overlay
  setTimeout(() => {
    overlay.classList.add('open');
  }, 1200); // slightly after flap starts opening
});