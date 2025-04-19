function injectButton() {
  const targetSection = document.evaluate(
    "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (targetSection) {
    const btn = document.createElement('button');
    btn.innerText = '🔥 Clip All Coupons';
    btn.style.padding = '10px 16px';
    btn.style.backgroundColor = '#0078d4';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.marginBottom = '16px';
    
    btn.onclick = () => {
      alert("Clipping logic goes here!");
    };

    // Inject the button at the top of the section
    targetSection.prepend(btn);
  } else {
    console.warn("❗ Target section not found");
  }
}

// Wait for DOM to fully load
window.addEventListener('load', () => {
  setTimeout(injectButton, 3000);
});
