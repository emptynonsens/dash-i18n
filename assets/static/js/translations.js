var translations = {}

window.dash_clientside = Object.assign({}, window.dash_clientside, {
    translations: {
        initI18Next: function initializeI18nextify(translationStore) {
            // Helper function to dynamically load scripts
            function loadScript(url, callback) {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;
                script.onload = function() {
                    if (typeof callback === 'function') {
                        callback();
                    }
                };
                script.onerror = function() {
                    console.error('Error loading script:', url);
                };
                document.head.appendChild(script);
            }

            // Load the i18nextify script from the provided URL
            loadScript('https://unpkg.com/i18nextify@3.2.1', function() {
                console.log('i18nextify loaded successfully.');

                // Ensure i18nextify is defined
                if (typeof i18nextify === 'undefined') {
                    console.error('i18nextify is not defined. Make sure it is correctly loaded.');
                    return;
                }

                // Ensure translation store data is provided and valid
                if (!translationStore || typeof translationStore !== 'object') {
                    console.error('Invalid or missing translation data.');
                    return;
                }

                // Initialize i18nextify with the provided translations
                translations = i18nextify.init({
                    lng: 'custom', // Setting a generic language key for the example
                    debug: true,
                    autorun: false,
                    ignoreClasses: ['ignoreMeClass'],
                    resources: {
                        custom: {
                            translation: translationStore['i18nLike']
                        },
                        pl : {
                            translation: translationStore['i18nLike']
                        }
                    }
                });

                setTimeout(function () {
                    translations.start();
                  }, 300);


            });
        }
    }
});

