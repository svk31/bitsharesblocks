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
        "vendor/js/angular-sanitize.js",       
        "vendor/js/angular-cookies.js",   
        "vendor/js/angular-meta.js",   
        "vendor/js/angular-ui-router.min.js",
        "vendor/js/angular-translate.js",
        "vendor/js/angular-translate-loader-static-files.min.js",
        "vendor/js/angular-translate-storage-cookie.min.js",
        "vendor/js/angular-translate-storage-local.min.js",        
        "vendor/js/angulartics.min.js",       
        "vendor/js/angulartics-ga.min.js",       
        "vendor/js/underscore.js",
        "vendor/js/tooltip.js",
        "vendor/js/angular-strap.js",       
        "vendor/js/angular-strap.tpl.js",       
        "vendor/js/ui-bootstrap-0.11.2.min.js",       
        "vendor/js/ui-bootstrap-tpls-0.11.2.min.js",       
        "vendor/js/highcharts-ng.js",     
        "vendor/js/angu-fixed-header-table.js",   
        "vendor/js/store.js",   
        "vendor/js/jdenticon-1.0.min.js", 
        "vendor/js/sha256.js",   
        "vendor/js/technical-indicators.src.js",  
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