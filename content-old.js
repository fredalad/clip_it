function injectButton() {
  const targetContainer = document.querySelector('.kds-Row'); // Use a container that exists on the page
  if (!targetContainer) return;

  const btn = document.createElement('button');
  btn.innerText = '🔥 Clip All Coupons';
  btn.style.padding = '10px 20px';
  btn.style.backgroundColor = '#0078d4';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '5px';
  btn.style.cursor = 'pointer';
  btn.style.margin = '10px';

  btn.onclick = () => {
    alert('Button clicked! Clip logic goes here.');
  };

  targetContainer.prepend(btn);
}

window.addEventListener('load', () => {
  setTimeout(injectButton, 1500); // wait for DOM to be ready
});
