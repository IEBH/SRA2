app.controller('MethodsWizardController', ['$scope','$location', '$sce', function($scope, $location, $sce) {
  var params = $location.search();
  var id = params.id;
  var methodsWizardUrl = "https://methodswizard.sr-accelerator.com/#/";
  if(id) {
    methodsWizardUrl = methodsWizardUrl.concat(id);
  }
  console.log(methodsWizardUrl);
  $scope.methodsWizardUrl = $sce.trustAsResourceUrl(methodsWizardUrl);
}]);