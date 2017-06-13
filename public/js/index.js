var app = angular.module('app', ['common','ngResource', 'ngRoute', 'angularMoment']);
app.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/reserve/list.html', controller: 'ReserveListCtrl'
  }).when('/view/:_id', {
    templateUrl: '/reserve/view.html', controller: 'ViewCtrl'
  }).when('/login', {
    templateUrl: '/login.html', controller: 'LoginCtrl'
  }).otherwise({
    redirectTo: '/'
  });
});
app.controller('ReserveListCtrl', function($scope, $routeParams, $location, $filter, $q, User, Reserve, Option) {
  $scope.moment = moment;
  $scope.option = Option;
  $q.all([User.query().$promise, Reserve.query().$promise]).then(function(result) {
    $scope.users = result[0];
    $scope.reserves = result[1];
    $scope.dates = [];
    var today = new Date();

    angular.forEach($scope.users, function(user, key) {
      var id = user._id;
      user.reserves = [];
      var day = angular.copy(today);
      for(var i = 0 ; i < 5; i++) {
        console.log('date: ' + day);
        var dateString = parseInt($filter('date')(day,'yyyyMMdd',today.getTimezoneOffset()), 10);
        console.log('dateString:' + dateString );
        var reserve = undefined;
        angular.forEach($scope.reserves, function(r, j) {
          if(r.date == dateString  && r.owner == id) {
            console.log('r.date:' + r.date );
            reserve = r;
          }
        })
        if(!reserve) {
          reserve = {
            date : dateString,
            owner: id,
            smoke: 0,
            nonsmoke: 0
          };
        }
        user.reserves.push(angular.copy(reserve));
        day.setDate(day.getDate() + 1);

      }
    })

  });
  $scope.hasToday = function(owner) {
    if(!$scope.searchToday) return true;
    if(owner.reserves[0].smoke > 0 || owner.reserves[0].nonsmoke > 0) {
        return true;
    } else {
      return false;
    }
  }
});
app.controller('ViewCtrl', function($rootScope, $scope, $routeParams, $location, User, Option, $q, $filter, UserReserve, Reserve) {
  $scope.moment = moment;
  $scope.option = Option;
  // if ($routeParams._id != 'new') {
  $scope.owner = User.get({_id: $routeParams._id});
  $q.all([User.get({_id: $routeParams._id}).$promise, UserReserve.query({_id: $routeParams._id}).$promise]).then(function(result) {

    $scope.owner = result[0];
    $rootScope.title = $scope.owner.name;
    $scope.reserves = result[1];
    $scope.dates = [];
    var today = new Date();

    var id = $scope.owner._id;
    $scope.owner.reserves = [];
    var day = angular.copy(today);
    for(var i = 0 ; i < 5; i++) {
      console.log('date: ' + day);
      var dateString = parseInt($filter('date')(day,'yyyyMMdd',today.getTimezoneOffset()), 10);
      console.log('dateString:' + dateString );
      var reserve = undefined;
      angular.forEach($scope.reserves, function(r, j) {
        if(r.date == dateString  && r.owner == id) {
          console.log('r.date:' + r.date );
          reserve = r;
        }
      })
      if(!reserve) {
        reserve = {
          date : dateString,
          owner: id,
          smoke: 0,
          nonsmoke: 0
        };
      }
      $scope.owner.reserves.push(angular.copy(reserve));
      day.setDate(day.getDate() + 1);

    }

    function initMap() {
      var center = {lat: parseFloat($scope.owner.latitude), lng: parseFloat($scope.owner.longitude)};
      // var center =  {lat: -34.397, lng: 150.644},
      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: center
      });
      var marker = new google.maps.Marker({
        position: center,
        map: map
      });
    }
    initMap();
  });
});


app.controller('LoginCtrl', function($scope, $http, $window) {
  $scope.login = function() {
    $http({
      method: 'GET',
      url : '/api/login?' + $.param($scope.user),
    }).then(function(response) {
      if(response.data.account_id) {
        $window.location.href = '/manager';
      }
    })
  }
})
