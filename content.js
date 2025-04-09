chrome.storage.sync.get('categories', (data) => {
    const categories = data.categories || [];
  
    if (categories.length > 0) {
      const websiteLists = categories.map(category =>
        category.urls.split('\n').map(url => url.trim()).filter(url => url !== '')
      );
      const categoryColors = categories.map(category => category.color);
  
      const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) {
                highlightSearchResults(node, websiteLists, categoryColors);
              }
            });
          }
        }
      });
  
      const searchResultsContainer = document.querySelector('#search') || document.querySelector('div[role="main"]');
      if (searchResultsContainer) {
        observer.observe(searchResultsContainer, { childList: true, subtree: true });
  
        // Initial highlight on page load
        highlightSearchResults(document, websiteLists, categoryColors);
      }
    }
  });
  
  function highlightSearchResults(rootElement, websiteLists, categoryColors) {
    const searchResultElements = rootElement.querySelectorAll('div.wHYlTd');
  
    searchResultElements.forEach((resultElement) => {
      const anchorTag = resultElement.querySelector('a.zReHs');
  
      if (anchorTag && anchorTag.href) {
        const href = anchorTag.href;
        websiteLists.forEach((websiteList, categoryIndex) => {
          websiteList.forEach(website => {
            const regex = new RegExp(`(^${website}$)|(^${website}\\.)|(^${website}/)`, 'i');
            if (href.includes(website) || regex.test(new URL(href).hostname)) {
              // Set the background color and padding for the target element
              resultElement.style.backgroundColor = categoryColors[categoryIndex];
              resultElement.style.padding = '10px';
  
              // Reset background color for all child elements
              const children = resultElement.querySelectorAll('*');
              children.forEach(child => {
                child.style.backgroundColor = ''; // Reset to default or transparent
              });
  
              // Optionally, stop after the first match if you don't want multiple highlights
              return;
            }
          });
        });
      }
    });
  }
  

  // ... (previous content of content.js) ...

function addImdbSearchLink() {
    const targetElement = document.getElementById('JTPWx');
    if (targetElement) {
      const searchInput = document.querySelector('input[name="q"]');
      if (searchInput && searchInput.value) {
        const currentQuery = searchInput.value;
        const imdbSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(currentQuery + ' IMDB')}`;
  
  
        const linkSpan = document.createElement('span');
        linkSpan.setAttribute('jsname', 'AznF2e');
        linkSpan.setAttribute('class', 'NQyKp Hyaw8c h4wEae');
        linkSpan.setAttribute('aria-selected', 'false');
        linkSpan.setAttribute('data-ti', 'IMDBSearch');
        linkSpan.setAttribute('tabindex', '-1');
        linkSpan.setAttribute('role', 'tab');
        linkSpan.setAttribute('jsaction', 'keydown:uYT2Vb;R9zItb');
        linkSpan.setAttribute('data-hveid', 'CC4QAA');
        linkSpan.setAttribute('data-ved', '2ahUKEwiypt7ypcmMAxV00AIHHWaKBhwQyNoBKAB6BAguEAA'); // Example ved
        linkSpan.setAttribute('data-tab-index', '-1');
        linkSpan.style.backgroundColor = 'rgb(255 232 122)'; // Light background color
        linkSpan.style.cursor = 'pointer'; // Make it look clickable
        linkSpan.style.display = 'block';
        linkSpan.style.fontFamily = 'Arial, sans-serif';
        linkSpan.style.padding = '10px 20px'; // Padding for the link
        linkSpan.style.float = 'right'; // Align to the left

  
        const innerSpan = document.createElement('span');
        innerSpan.setAttribute('class', 'T9jMmf');
  
        const textSpan = document.createElement('span');
        textSpan.setAttribute('class', 'b0Xfjd Hyaw8c');
        textSpan.textContent = 'IMDB';
        textSpan.style.color = 'black';
        textSpan.style.fontWeight = 'bold';
  
        innerSpan.appendChild(textSpan);
        linkSpan.appendChild(innerSpan);
        targetElement.appendChild(linkSpan);
  
        // Add an event listener to navigate when clicked
        linkSpan.addEventListener('click', () => {
          window.location.href = imdbSearchUrl;
        });
  
        // Basic styling to remove default link underline
        const style = document.createElement('style');
        style.textContent = '.NQyKp a { text-decoration: none; }';
        document.head.appendChild(style);
      }
    }
  }
  
  // Run the function when the page loads and on subsequent updates
  window.addEventListener('load', addImdbSearchLink);
  
  const searchResultsContainer = document.querySelector('#search') || document.querySelector('div[role="main"]');
  if (searchResultsContainer) {
    const observerForImdbLink = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.querySelector('#JTPWx')) {
              addImdbSearchLink();
            }
          });
        }
      }
    });
    observerForImdbLink.observe(searchResultsContainer, { childList: true, subtree: true });
  }
  
  // ... (previous content of content.js) ...