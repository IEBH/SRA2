app.controller('TrialWizardController', ['$scope','$location', '$sce', function($scope, $location, $sce) {
  var params = $location.search();
  var id = params.id;
  var trialWizardUrl = "https://trialwizard.sr-accelerator.com/#/";
  if(id) {
    trialWizardUrl = trialWizardUrl.concat(id);
  }
  console.log(trialWizardUrl);
  $scope.trialWizardUrl = $sce.trustAsResourceUrl(trialWizardUrl);
}]);