// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

.filter('titlecase', function() {
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
        }
})

.controller('AppCtrl', function($scope) {
    $scope.items = [{
            label: 'username',
            type: 'text'
        }, {
            label: 'email',
            type: 'email'
        }, {
            label: 'website',
            type: 'url'
        }, {
            label: 'Phone number',
            type: 'tel'
        }, {
            label: 'Number',
            type: 'number'
        }, {
            label: 'Time',
            type: 'time'
        }, {
            label: 'date',
            type: 'date'
        }, {
            label: 'local date time',
            type: 'datetime-local'
        },
        // {label:'global date time', type:'datetime'},
        {
            label: 'Month',
            type: 'month'
        }, {
            label: 'password',
            type: 'password'
        }, {
            label: 'color',
            type: 'color'
        }, {
            label: 'week',
            type: 'week'
        }, {
            label: 'list select',
            type: 'select',
            options:['a','b','c']
        }, {
            label: 'toggler',
            type: 'checkbox',
        }, {
            label: 'add image',
            type: 'picture',
        }, {
            label: 'add location',
            type: 'location',
        }
    ];

})