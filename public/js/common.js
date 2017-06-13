var common = angular.module('common', []);
common.run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);
common.factory('User', function($resource) {
  return $resource('/api/users/:_id');
});
common.factory('LoginUser', function($resource) {
  return $resource('/api/loginUser');
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

common.filter('nl2br', function($sce){
    return function(msg,is_xhtml) {
        var is_xhtml = is_xhtml || true;
        var breakTag = (is_xhtml) ? '<br />' : '<br>';
        var msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
        return $sce.trustAsHtml(msg);
    }
});
