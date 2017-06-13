var common = angular.module('common', []);
common.run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);
common.factory('User', function($resource) {
  return $resource('/api/users/:_id');
});
common.factory('Reserve', function($resource) {
  return $resource('/api/reserves');
});
common.factory('UserReserve', function($resource) {
  return $resource('/api/reserves/users/:_id');
});
common.constant('Option', {
  tags : {
      wifi: '無料W-fi',
      moring:'朝食',
      dinner: '夕食',
  }
})
