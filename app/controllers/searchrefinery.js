app.controller('searchrefineryController', ['$scope', '$sce', function($scope, $sce) {
    var username = $scope.user.email;
    var searchrefineryUrl = "https://searchrefinery.sr-accelerator.com";
    if(username) {
      searchrefineryUrl = searchrefineryUrl.concat("?username=" + username);
    }
    // console.log(searchrefineryUrl);
    $scope.searchrefineryUrl = $sce.trustAsResourceUrl(searchrefineryUrl);
  }]);