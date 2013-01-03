document.addEventListener('DOMContentLoaded', function() {
  if (localStorage['enabled'] != 'true') {
    buttonWrapper.style.display = 'block';
  }

  enableButton.onclick = function() {
    localStorage['enabled'] = 'true';
    this.disabled = true;
    this.innerText = 'cleanup enabled!';
    setTimeout(function() {
      buttonWrapper.style.opacity = 0;
      setTimeout(function() {
        buttonWrapper.style.display = 'none';
        chrome.extension.sendRequest({type: 'enableCleanup'}, function(){});
      }, 700);
    }, 600);
  }
});
