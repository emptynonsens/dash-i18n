

window.dash_clientside = Object.assign({}, window.dash_clientside, {
    translations: {

        translateKeyOverAll: function (translationStore, categoryIncludes, listOfKeys) {
            let result = {};
        
            // Iterate over each key in the list of keys
            listOfKeys.forEach((key) => {
                // Iterate over each category in the translation store
                for (let category in translationStore) {
                    // Check if the category should be included based on the categoryIncludes filter
                    let categoryLower = category.toLowerCase();
                    if (categoryIncludes === "" || categoryLower.includes(categoryIncludes.toLowerCase())) {
                        let translationCategory = translationStore[category];
                        
                        // If the key exists in the category, add it and break out of the loop
                        if (translationCategory[key]) {
                            result[key] = translationCategory[key];
                            break; // Stop checking other categories once the key is found
                        }
                    }
                }
        
                // If the key is not found in any category, add it to the result as is
                if (!result.hasOwnProperty(key)) {
                    result[key] = key;
                    if (key != " " && key != "" && key != null && key != undefined){
                        console.log("Could not translate: " + key + " in categories containing string: " + categoryIncludes);
                    }
                        
                }
            });
        
            return result;
        },


// Utility function for debouncing
debounce: function(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
},

// Function to translate text nodes in the DOM
translate_TagsDOM: function(tagsToReplace, ...args) {
    const category = 'i18nLike';
    const translations = tagsToReplace[category];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const translatePrefix = 'devtrn_';
    let node;

    while (node = walker.nextNode()) {
        if (node.nodeValue.includes(translatePrefix)) {
            try {
                node.nodeValue = node.nodeValue.replace(new RegExp(`${translatePrefix}\\w+`, 'g'), (match) => {
                    console.log('match:', match, '->', translations[match] || match);
                    return translations[match] || match;
                });
            } catch (error) {
                console.error('Error during translation replacement:', error);
            }
        }
    }
},



// Function to monitor DOM changes and trigger translation with debouncing
observeDOMChanges: function(tagsToReplace) {
    const targetNode = document.body;  // Monitor changes in the body of the document

    // Observer configuration options
    const config = { 
        childList: true, 
        subtree: true, 
        characterData: true 
    };

    // Debounced version of translate_TagsDOM
    const debouncedTranslate = window.dash_clientside.translations.debounce(() => {
        window.dash_clientside.translations.translate_TagsDOM(tagsToReplace);
    }, 10); 

    // Callback function for when mutations are detected
    const callback = (mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                // Trigger the debounced version of translate_TagsDOM whenever the DOM changes
                debouncedTranslate();
            }
        }
    };

    // Create a new MutationObserver and start observing
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    document.addEventListener('wheel', function(event) {
        // Optionally handle wheel event, but ensure it's passive
    }, { passive: true });

    console.log('Started observing DOM changes for translations.');
},
      
        translate_AIO_PivotGrid: function(translationStore, categoryIncludes, listOfKeys) {},
        translate_AIO_AgGrid:  function (columnDefs, category = "Datasets") {
                let new_columnDefs = [...columnDefs];
                for (let i = 0; i < new_columnDefs.length; i++) {
                    let fieldTranslations = window.dash_clientside.translations.translateKeyOverAll(
                        translationStore, category, [new_columnDefs[i]['field']]
                    );
                    let fieldTranslation = Object.values(fieldTranslations)[0];
                    new_columnDefs[i]['headerName'] = fieldTranslation;
                }
                return new_columnDefs;
            }
    

// Call this function to start monitoring DOM changes


    }
});
