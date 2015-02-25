/* Exports a function which returns an object that overrides the default &
 *   plugin file patterns (used widely through the app configuration)
 *
 * To see the default definitions for Lineman's file paths and globs, see:
 *
 *   - https://github.com/linemanjs/lineman/blob/master/config/files.coffee
 */
module.exports = function(lineman) {
  //Override file patterns here
  return {
    js: {
      vendor: [
        "vendor/js/temp/jquery.js",
        "vendor/js/temp/react.js",
        "vendor/js/temp/highstock.src.js",
        "vendor/js/angular.js",
        "vendor/js/angular-ui-router.min.js",
        "vendor/js/angular-translate.js",
        "vendor/js/angular-translate-loader-static-files.min.js",
        "vendor/js/angular-translate-storage-cookie.min.js",
        "vendor/js/angular-translate-storage-local.min.js",        
        "vendor/js/underscore.js",
        "vendor/js/tooltip.js",
        "vendor/js/**/*.js",
        "!vendor/js/temp/jquery.js",
        "!vendor/js/temp/react.js",
        "!vendor/js/temp/highstock.src.js"
      ],
      app: [
        "app/js/app.js",
        "app/js/**/*.js",
        "app/components/**/*.js"
      ]
    },
    vendor: [
      "vendor/css/normalize.css",
      "vendor/css/bootstrap.css",
      "vendor/css/**/*.css",
      "!vendor/css/temp/font-awesome.css"
    ],
    app: [
      "app/css/**/*.css"
    ],
    pages: {
      source: "app/components/index/*.us"
    }
  };
};