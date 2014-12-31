angular.module('app')

.directive('fastRepeat', function($injector) {
  return {
    restrict: 'E',
    scope:{
      data: '=',
      headers: '=',
      component: '='
    },
    link:function(scope, el, attrs){
      var reactComponent = $injector.get(scope.component);
      scope.$watchGroup(['data','headers'], function(newValues, oldValues){
        if (newValues[0] && newValues[1]) {
          React.render(React.createElement(reactComponent,{data:JSON.stringify(newValues[0]), headers:newValues[1]}),
            el[0]
            );  
        }        
      });

      // cleanup when scope is destroyed
      scope.$on('$destroy', function() {
        React.unmountComponentAtNode(el[0]);
      });
    }
  };
});