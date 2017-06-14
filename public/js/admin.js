var app = angular.module('app', ['common','ngResource', 'ngRoute', 'angularMoment']);

app.config(function($routeProvider) {
  $routeProvider.when('/list', {
    templateUrl: '/admin/list.html', controller: 'ListCtrl'
  }).when('/users/new', {
    templateUrl: '/admin/edit.html', controller: 'EditCtrl'
  }).otherwise({
    redirectTo: '/list'
  });
});

app.controller('ListCtrl', function($scope, $route, User) {
  $scope.users = User.query();
  $scope.delete = function(_id) {
    if(confirm('削除します。よろしいでしょうか？')) {
      User.delete({_id: _id}, function() {
        $route.reload();
      });
    }
  };
});

app.controller('EditCtrl', function($scope, $routeParams, $location, User) {
      if ($routeParams._id != 'new') {
        $scope.user = User.get({_id: $routeParams._id});
      }
      $scope.edit = function() {
        User.save($scope.user, function() {
          $location.url('/');
        });
      };
    });