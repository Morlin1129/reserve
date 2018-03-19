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
  $scope.upload = function(file) {
    var formData = new FormData();
     formData.append( 'file', file.files[0] );
     $http({
       method: 'POST',
       url: '/api/upload',
       data: formData
     }).then(function(response) {
       $scope.user.imageUrl = response;
     })
  };
});
app.controller('ReserveCtrl', function($scope, $routeParams, $location, $filter, $q, User, UserReserve, $http, $window) {
  $scope.moment = moment;
  $http({
    method: 'GET',
    url : '/api/loginUser'
  }).then(function(response) {

    if(response.data.account_id) {
      $scope.user = response.data;
        UserReserve.query({_id: $scope.user._id}).$promise.then(function(result) {
          $scope.reserves = result;
          _loadNewDates();
        });
    }

    // if(response.data.account_id) {
    //   $scope.user = response.data;
    //   $scope.moment = moment;
    //   console.log({_id: $scope.user._id});
    //   UserReserve.query({_id: $scope.user._id}).$promise.then(function(result) {
    //     $scope.reserves = result;
    //     $scope.dates = [];
    //     var today = new Date();
    //     var day = angular.copy(today);
    //     for(var i = 0 ; i < 5; i++) {
    //       console.log('date: ' + day);
    //       var dateString = parseInt($filter('date')(day,'yyyyMMdd',today.getTimezoneOffset()), 10);
    //       console.log('dateString:' + dateString );
    //       var reserve = undefined;
    //       angular.forEach($scope.reserves, function(r, j) {
    //         if(r.date == dateString) {
    //           console.log('r.date:' + r.date );
    //           reserve = r;
    //         }
    //       });
    //       if(!reserve) {
    //         reserve = getNewReserveModel(dateString);
    //       }
    //       $scope.dates.push(angular.copy(reserve));
    //       day.setDate(day.getDate() + 1);
    //     }
    //   });
    // } else {
    //   $window.location.href="/#/login";
    // }
  }, function() {
    $window.location.href="/#/login";
  });

  $scope.loadNewDates = function() {
    _loadNewDates();
  };

  function _loadNewDates() {
    //日付一覧から最新を取得
    $scope.dates =  $scope.dates || [{date : moment().format('YYYYMMDD')}];
    var latestDate = moment($scope.dates[$scope.dates.length - 1].date, 'YYYYMMDD');
    for(var i = 0 ; i < 5 ; i++) {
      $scope.dates.push({date :latestDate.add(1,'days').format('YYYYMMDD')});
    }
    _buildReserveDateCollection();
  }

  function _buildReserveDateCollection() {
    //dateとreserveのマッチング
    $scope.reserves = $scope.reserves || [];
    $scope.dates.forEach(function(date) {
      $scope.reserves.forEach(function(r) {
        if(r.date == date.date) {
          date.reserve = r;
        }
      })
    })
  }

  function getFutureDates(pages) {
    var today = new Date();
    var day = angular.copy(today);
    day.setDate(day.getDate() + (pages - 1) * 5);
    for(var i = 0; i < 5; i++) {
      var dateString = parseInt($filter('date')(day,'yyyyMMdd',today.getTimezoneOffset()), 10);
      $scope.reserves.push(getNewReserveModel(dateString));
      day.setDate(day.getDate() + 1);
    }
  };

  function getNewReserveModel(dateString) {
    return {
      date : parseInt(dateString),
      owner: $scope.user._id,
      _id: $scope.user._id,
    };
  }


  $scope.update = function(date, room, status) {
    date.reserve = date.reserve || getNewReserveModel(date.date);
    date.reserve[room] = status;
    $scope.user.updated = new Date();

    UserReserve.save({_id: $scope.user._id, reserve: date.reserve}, function() {
      User.save($scope.user, function() {
      });
    });
  }
});

app.directive('infiniteScroll', function($window) {
  return function(scope,  elem,  attr) {
      var raw = elem[0];
      angular.element($window).bind('scroll',  function() {
        var scrollTop = $('html, body').scrollTop();
        if (raw.offsetTop + raw.offsetHeight < scrollTop + window.innerHeight) {
          scope.$apply(attr.infiniteScroll);
        }
      });
    };
})
