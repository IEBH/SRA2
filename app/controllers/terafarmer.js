app.controller('TerafarmerController', ['$scope','$location', '$sce', function($scope, $location, $sce) {
    var params = $location.search();
    var token = params.token;
    var terafarmerUrl = "https://terafarmer.tera-tools.com";
    $scope.terafarmerUrl = $sce.trustAsResourceUrl(terafarmerUrl);
  }]);
