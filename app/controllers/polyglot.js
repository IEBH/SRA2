app.controller('PolyglotController', ['$scope','$location', '$sce', function($scope, $location, $sce) {
    var params = $location.search();
    var token = params.token;
    var polyglotUrl = "https://polyglot.sr-accelerator.com";
    if(token) {
      polyglotUrl = polyglotUrl.concat("?token=" + token);
    }
    // console.log(polyglotUrl);
    $scope.polyglotUrl = $sce.trustAsResourceUrl(polyglotUrl);
  }]);