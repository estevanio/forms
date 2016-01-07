angular.module('forms', ['ionic', 'firebase', 'custom'])
    .run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('stack', {
            url: '/stack',
            templateUrl: 'form.html',
            controller: 'FormCtrl'
        })
        .state('stack.card', {
            url: '/card/:phase',
            templateUrl: 'es-view.html',
            controller: 'CardCtrl'
        });
    $urlRouterProvider.otherwise('/stack/');
})

.controller('CardCtrl', function($scope, $stateParams, $state, $rootScope, Stack) {
    $scope.card = Stack[$stateParams.phase];
    $scope.infinite = function() {
        console.log("infinite");
    };
    $scope.nextPage = function() {
        $scope.$parent.prev = $scope.card.id;
        $scope.$broadcast('scroll.refreshComplete');
        $state.go('stack.card', {
            'phase': $scope.card.next
        });
    };
    $scope.prevPage = function() {

        $state.go('stack.card', {
            'phase': $scope.$parent.prev
        });

    };



})


.controller('FormCtrl', function($scope, $stateParams, Stack, $firebaseObject, $state, $ionicScrollDelegate, $rootScope) {
    $scope.formData = {};
    var ref = new Firebase("https://sandboxforms.firebaseio.com/data/0/");
    var data = $firebaseObject(ref);
    data.$bindTo($scope, "formData").then(function() {
        // console.log($scope.formData);
    });
    $scope.cards = Stack;
    $scope.phase = 0;
    $state.go('stack.card', {
        'phase': 0
    });
})

.factory('Stack', [ /*'<dependency>', */ function() {
    return [{
            id: 0,
            title: 'Arrived',
            next: '1',
            inputList: [{
                    label: 'email',
                    type: 'email',
                    name: 'userEmail'
                }, {
                    label: 'wya',
                    type: 'location',
                    name: 'location'
                }, {
                    label: 'picture',
                    type: 'picture',
                    name: 'picture'
                }, {
                    label: 'Home Phone number',
                    type: 'tel',
                    name: 'home',
                }, {
                    label: 'Cell Phone number',
                    type: 'tel',
                    name: 'cell',
                }, {
                    label: 'Favorite Number',
                    type: 'number',
                    name: 'fav',
                }, {
                    label: 'Time',
                    type: 'time',
                    name: 'time'
                }, {
                    label: 'Birthday',
                    type: 'date',
                    name: 'dob'
                }] //end inputs
        }, //end first card
        {
            id: 1,
            title: '',
            inputList: [{
                label: 'username',
                type: 'text',
                name: 'username'
            }]
        }
    ];
}])


.filter('titlecase', [function() {
    return function(input) {
        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
        input = input.toLowerCase();
        return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
            if (index > 0 && index + match.length !== title.length &&
                match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
                (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }
            if (match.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }
            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    };
}]);
