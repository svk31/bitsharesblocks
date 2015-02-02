var app = angular.module('app', ['ui.router', 'ngSanitize', 'app.filters', 'mgcrea.ngStrap', 'app.services', 'ngAnimate', 'once',
 'angulartics', 'angulartics.google.analytics', 'highcharts-ng', 'ui.bootstrap.tpls', 'ui.bootstrap.collapse', 'ui.bootstrap.pagination',
  'ui.bootstrap.dropdown', 'ui.bootstrap.alert', 'ui.bootstrap.tabs', 'pascalprecht.translate', 'ngCookies', 'meta'])
.config(['$locationProvider', '$compileProvider', '$translateProvider', '$modalProvider', 'MetaProvider', '$urlMatcherFactoryProvider',
    function($locationProvider, $compileProvider, $translateProvider, $modalProvider, MetaProvider, $urlMatcherFactoryProvider) {
        $locationProvider.hashPrefix('!');
        $locationProvider.html5Mode(true);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(http|https|ftp|mailto|bts):/);
        $compileProvider.debugInfoEnabled(false);
        $translateProvider.useLoaderCache(true);
        $translateProvider.useLoader('customStaticFilesLoader', {
            'prefix': 'locale-',
            'suffix': '.json'
        }).use('en').fallbackLanguage('en').determinePreferredLanguage().useLocalStorage();
        angular.extend($modalProvider.defaults, {
            html: true
        });

        $urlMatcherFactoryProvider.strictMode(false);
            }
]).run(
    ['$rootScope', 'api', '$state', '$stateParams', 'Meta',
        function($rootScope, api, $state, $stateParams, Meta) {
            api.getInfo().success(function(info) {
                $rootScope.clientVersion = info.clientVersion;
                $rootScope.maintenance = info.maintenance;
            });
            $rootScope.language = 'init';
            $rootScope.booleanTrx = false;
            $rootScope.standbyBoolean = false;
            $rootScope.activeBoolean = true;
            $rootScope.showDelegateAlert = true;
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });
            Meta.init();
        }
    ]);