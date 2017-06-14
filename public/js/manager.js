var app = angular.module('app', ['common','ngResource', 'ngRoute', 'angularMoment']);
app.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/manager/reserves_t.html', controller: 'ReserveCtrl'
  }).when('/edit', {
    templateUrl: '/manager/edit.html', controller: 'EditCtrl'
  }).when('/list', {
    templateUrl: '/manager/reserves.html', controller: 'ReserveCtrl'
  }).otherwise({
    redirectTo: '/'
  });
});

app.controller('EditCtrl', function($scope, $routeParams, $location, User, $http, $window) {
  $http({
    method: 'GET',
    url : '/api/loginUser'
  }).then(function(response) {
    if(response.data.account_id) {
      $scope.user = response.data;
    } else {
      $window.location.href="/#/login";
    }
  }, function() {
    $window.location.href="/#/login";
  })
  $scope.edit = function() {
    User.save($scope.user, function() {
      $location.url('/');
    });
  };
});
app.controller('ReserveCtrl', function($scope, $routeParams, $location, $filter, $q, User, UserReserve, $http, $window) {
  $http({
    method: 'GET',
    url : '/api/loginUser'
  }).then(function(response) {
    if(response.data.account_id) {
      $scope.user = response.data;
      $scope.moment = moment;
      console.log({_id: $scope.user._id});
      UserReserve.query({_id: $scope.user._id}).$promise.then(function(result) {
        $scope.reserves = result;
        $scope.dates = [];
        var today = new Date();
        var day = angular.copy(today);
        for(var i = 0 ; i < 5; i++) {
          console.log('date: ' + day);
          var dateString = parseInt($filter('date')(day,'yyyyMMdd',today.getTimezoneOffset()), 10);
          console.log('dateString:' + dateString );
          var reserve = undefined;
          angular.forEach($scope.reserves, function(r, j) {
            if(r.date == dateString) {
              console.log('r.date:' + r.date );
              reserve = r;
            }
          })
          if(!reserve) {
            reserve = {
              date : dateString,
              owner: $scope.user._id
            };
          }
          $scope.dates.push(angular.copy(reserve));
          day.setDate(day.getDate() + 1);

        }
      })
    } else {
      $window.location.href="/#/login";
    }
  }, function() {
    $window.location.href="/#/login";
  })


  $scope.update = function(date, room, status) {
    date[room] = status;
    $scope.user.updated = new Date();

    UserReserve.save({_id: $scope.user._id, reserve: date}, function() {
      User.save($scope.user, function() {
      });
    });
  }
});
