angular.module('app.filters',[])

.filter('noTransactions', function(){
  return function(input){
    if(typeof(input[0]) === "undefined"){
      return 'No transactions';
    } else {
      return input;
    }
  };
})

.filter('zeroFilter', function(){
  return function(input){
    if(input.delegate_info.votes_for === 0){
      return false;
    } else {
      return input;
    }
  };
})

.filter('assetIssuer', function() {
  return function(input){
    var arrayToReturn = [];

    if ((input !==undefined)) {
      input.forEach(function(entry,index) {
        if(entry.issuer_id !== 0 && entry.issuer_id !==-2){
          arrayToReturn.push(entry);
        }
      });
    }
    return arrayToReturn;
  };
})

.filter('absoluteValue', function() {

  return function(input){
    console.log('filtering absoluteValue');
    console.log(input);
    var arrayToReturn = [];
    // console.log(input);
    input.forEach(function(entry,index) {
      if(Math.abs(entry.vote) > 100){
        entry.vote = Math.round(entry.vote);
        arrayToReturn.push(entry);
      }
    });
    return arrayToReturn;
  };
})

.filter('nfcurrency', [ '$filter', '$locale', function ($filter, $locale) {
  var currency = $filter('currency'), formats = $locale.NUMBER_FORMATS;
  return function (amount, symbol) {
    var value = currency(amount, symbol);
    return value.replace(new RegExp('\\' + formats.DECIMAL_SEP + '\\d{2}'), '');
  };
}])

.filter('notEmpty', function () {
  return function (items) {
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!/vide/i.test(item.choice)) {
        filtered.push(item);
      }
    }
    return filtered;
  };
});

