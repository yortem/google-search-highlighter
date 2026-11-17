chrome.storage.sync.get('categories', (data) => {
    const categories = data.categories || [];

    if (categories.length > 0) {
        const websiteLists = categories.map(category =>
            category.urls.split('\n').map(url => url.trim()).filter(url => url !== '')
        );
        const categoryColors = categories.map(category => category.color);

        const observer = new MutationObserver((mutationsList) => {
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

        const searchElement = document.querySelector('#search');
        const searchResultsContainer =
            (searchElement && searchElement.closest('div[role="main"]')) ||
            document.querySelector('div[role="main"]') ||
            searchElement ||
            document.body;

        // Google appends additional results outside of "#search" while
        // scrolling, so observe the whole main results container.
        observer.observe(searchResultsContainer, { childList: true, subtree: true });

        // Initial highlight on page load
        highlightSearchResults(document, websiteLists, categoryColors);
    }
});

// "cvP2Ce" is an image result card in Google Images, while the image pack
// inside regular search results uses "vCUuC m3LIae" tiles inside "cakeVe".
const IMAGE_RESULT_SELECTOR = 'div.cvP2Ce, div.vCUuC.m3LIae';

function highlightSearchResults(rootElement, websiteLists, categoryColors) {
    highlightTextResults(rootElement, websiteLists, categoryColors);
    highlightImageResults(rootElement, websiteLists, categoryColors);
}

function highlightTextResults(rootElement, websiteLists, categoryColors) {
    const searchResultElements = queryAll(rootElement, 'div.wHYlTd, div.BYM4Nd');

    searchResultElements.forEach((resultElement) => {
        const anchorTag = resultElement.querySelector('a.zReHs');

        if (anchorTag && anchorTag.href) {
            const categoryIndex = findMatchingCategory([anchorTag.href], websiteLists);

            if (categoryIndex !== -1) {
                applyHighlight(resultElement, categoryColors[categoryIndex]);
            }
        }
    });
}

function highlightImageResults(rootElement, websiteLists, categoryColors) {
    const imageResultElements = getImageResultElements(rootElement);

    imageResultElements.forEach((resultElement) => {
        const resultUrls = getImageResultUrls(resultElement);

        if (resultUrls.length === 0) {
            return;
        }

        const categoryIndex = findMatchingCategory(resultUrls, websiteLists);

        if (categoryIndex !== -1) {
            applyHighlight(resultElement, categoryColors[categoryIndex], '6px');
        }
    });
}

function getImageResultElements(rootElement) {
    const elements = new Set(queryAll(rootElement, IMAGE_RESULT_SELECTOR));

    // Fallback in case the card class name changes: locate the card from
    // the "data-lpage" attribute that Google sets on image results.
    queryAll(rootElement, '[data-lpage]').forEach((element) => {
        const card = element.closest(IMAGE_RESULT_SELECTOR) || element;
        elements.add(card);
    });

    // The images grid itself also has the "cvP2Ce" class. Coloring it would
    // color every image result inside it, so only keep leaf elements.
    return Array.from(elements).filter(element => !element.querySelector(IMAGE_RESULT_SELECTOR));
}

// Returns the URLs that can identify the website of an image result.
function getImageResultUrls(resultElement) {
    const urls = [];
    const landingPageElement = resultElement.hasAttribute('data-lpage')
        ? resultElement
        : resultElement.querySelector('[data-lpage]');

    if (landingPageElement) {
        const landingPage = landingPageElement.getAttribute('data-lpage');
        if (landingPage) {
            urls.push(landingPage);
        }
    }

    resultElement.querySelectorAll('a[href], a[ping]').forEach((linkElement) => {
        if (linkElement.href) {
            urls.push(linkElement.href);
        }

        const pingUrl = extractUrlParameter(linkElement.getAttribute('ping'), 'url');
        if (pingUrl) {
            urls.push(pingUrl);
        }
    });

    // Some image results expose the website only through their favicon URL.
    resultElement
        .querySelectorAll('img[src*="faviconV2"], img[data-src*="faviconV2"]')
        .forEach((imageElement) => {
            const faviconUrl = extractUrlParameter(
                imageElement.getAttribute('src') || imageElement.getAttribute('data-src'),
                'url'
            );

            if (faviconUrl) {
                urls.push(faviconUrl);
            }
        });

    return urls.map(unwrapGoogleUrl).filter(Boolean);
}

function extractUrlParameter(value, parameterName) {
    if (!value) {
        return null;
    }

    try {
        const parameterValue = new URL(value, window.location.href).searchParams.get(parameterName);

        if (parameterValue && /^https?:\/\//i.test(parameterValue)) {
            return parameterValue;
        }
    } catch (error) {
        // Ignore invalid URLs.
    }

    return null;
}

// Some Google links point to /imgres or /url instead of the actual website.
function unwrapGoogleUrl(href) {
    try {
        const url = new URL(href, window.location.href);
        const googleHost = /(^|\.)google\.[a-z.]+$/i.test(url.hostname);

        if (!googleHost) {
            return href;
        }

        if (url.pathname === '/imgres') {
            return url.searchParams.get('imgrefurl') || url.searchParams.get('imgurl') || href;
        }

        if (url.pathname === '/url') {
            return url.searchParams.get('q') || url.searchParams.get('url') || href;
        }

        return href;
    } catch (error) {
        return href;
    }
}

function findMatchingCategory(urls, websiteLists) {
    let matchingCategoryIndex = -1;

    websiteLists.forEach((websiteList, categoryIndex) => {
        const matches = websiteList.some(website =>
            urls.some(href => urlMatchesWebsite(href, website))
        );

        if (matches) {
            matchingCategoryIndex = categoryIndex;
        }
    });

    return matchingCategoryIndex;
}

function urlMatchesWebsite(href, website) {
    if (!href || !website) {
        return false;
    }

    const decodedHref = safeDecode(href);
    const decodedWebsite = safeDecode(website).trim();

    if (!decodedWebsite) {
        return false;
    }

    // Full URLs and paths are still matched as substrings.
    if (/^https?:\/\//i.test(decodedWebsite) || decodedWebsite.includes('/')) {
        return href.includes(website) || decodedHref.includes(decodedWebsite);
    }

    // Plain domains are matched against the hostname and its subdomains,
    // so "example.com" does not match "notexample.com".
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(decodedWebsite)) {
        try {
            const hostname = new URL(href, window.location.href).hostname
                .replace(/^www\./i, '')
                .toLowerCase();
            const domain = decodedWebsite
                .replace(/^www\./i, '')
                .replace(/\.$/, '')
                .toLowerCase();

            return hostname === domain || hostname.endsWith(`.${domain}`);
        } catch (error) {
            // Fall back to substring matching for malformed URLs.
        }
    }

    return href.includes(website) || decodedHref.includes(decodedWebsite);
}

function applyHighlight(resultElement, color, padding) {
    // Use border-box because image result tiles may use content-box,
    // which would grow and break the results layout when adding padding.
    resultElement.style.boxSizing = 'border-box';
    resultElement.style.backgroundColor = color;
    resultElement.style.padding = padding || '10px';
    resultElement.style.borderRadius = '8px';

    // Reset background color for all child elements
    const children = resultElement.querySelectorAll('*');
    children.forEach(child => {
        child.style.backgroundColor = ''; // Reset to default or transparent
    });
}

// querySelectorAll does not include the root element itself,
// but added nodes from the MutationObserver may be the results.
function queryAll(rootElement, selector) {
    const elements = Array.from(rootElement.querySelectorAll(selector));

    if (rootElement.nodeType === 1 && rootElement.matches(selector)) {
        elements.unshift(rootElement);
    }

    return elements;
}

function safeDecode(value) {
    try {
        return decodeURI(value);
    } catch (error) {
        return value;
    }
}
