var app = angular.module('app', ['common','ngResource', 'ngRoute', 'angularMoment']);
app.config(function($routeProvider) {
  $routeProvider.when('/users', {
    templateUrl: 'list.html', controller: 'ListCtrl'
  }).when('/users/:_id', {
    templateUrl: 'edit.html', controller: 'EditCtrl'
  }).when('/reserves/view/:_id', {
    templateUrl: 'reserve/view.html', controller: 'ViewCtrl'
  }).when('/reserves/users/:_id', {
    templateUrl: 'reserve/reserves.html', controller: 'ReserveCtrl'
  }).when('/reserves/t/users/:_id', {
    templateUrl: 'reserve/reserves_t.html', controller: 'ReserveCtrl'
  }).when('/reserves', {
    templateUrl: 'reserve/list.html', controller: 'ReserveListCtrl'
  }).otherwise({
    redirectTo: '/reserves'
  });
});

app.controller('ListCtrl', function($scope, $route, User) {
  $scope.users = User.query();
  $scope.delete = function(_id) {
    User.delete({_id: _id}, function() {
      $route.reload();
    });
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
app.controller('ReserveCtrl', function($scope, $routeParams, $location, $filter, $q, User, UserReserve) {
  $scope.moment = moment;
  if ($routeParams._id != 'new') {
    $scope.user = User.get({_id: $routeParams._id});
  }
  $q.all([UserReserve.query({_id: $routeParams._id}).$promise]).then(function(result) {
    $scope.reserves = result[0];
    console.log('reserves:' + $scope.reserves);
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
          owner: $routeParams._id
        };
      }
      $scope.dates.push(angular.copy(reserve));
      day.setDate(day.getDate() + 1);

    }
  })

  $scope.update = function(date, room, status) {
    date[room] = status;
    $scope.user.updated = new Date();

    UserReserve.save({_id: $routeParams._id, reserve: date}, function() {
      User.save($scope.user, function() {
      });
    });
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

app.filter('nl2br', function($sce){
    return function(msg,is_xhtml) {
        var is_xhtml = is_xhtml || true;
        var breakTag = (is_xhtml) ? '<br />' : '<br>';
        var msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
        return $sce.trustAsHtml(msg);
    }
});
