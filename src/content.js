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
    const searchResultElements = rootElement.querySelectorAll('div.wHYlTd, div.BYM4Nd');

    
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