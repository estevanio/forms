customModule.directive('esPullup', [function() {
    return {
        restrict: 'E',
        replace: true,
        require: ['^?$ionicScroll', 'esPullup'],
        controller: 'pullupctrl',
        //scope: true,
        template: '<div class="scroll-pu invisible" collection-repeat-ignore>' +
            '<div class="ionic-refresher-content" ' +
            'ng-class="{\'ionic-refresher-with-text\': pullingText || pulledText}">' +
            '<div class="icon-pulling" ng-class="{\'pulling-rotation-disabled\':disablePullingRotation}">' +
            '<i class="icon {{pullingIcon}}"></i>' +
            '</div>' +
            '<div class="text-pulling" ng-bind-html="pullingText"></div>' +
            '<div class="icon-refreshing">' +
            '<ion-spinner ng-if="showSpinner" icon="{{spinner}}"></ion-spinner>' +
            '<i ng-if="showIcon" class="icon {{pulledIcon}}"></i>' +
            '</div>' +
            '<div class="text-refreshing" ng-bind-html="pulledText"></div>' +
            '</div>' +
            '</div>',
        link: function($scope, $element, $attrs, ctrls) {
            // console.log('DIRECTIVE:');
            // console.table($scope);
            // console.table($attrs);

            // JS Scrolling uses the scroll controller
            var puCtrl = ctrls[1];
            var scrollCtrl = puCtrl.scrollCtrl = ctrls[0];
            var jsScrolling = puCtrl.jsScrolling = !scrollCtrl.isNative();

            if (jsScrolling) {
                console.log("js scrolling");
                puCtrl.scrollView = scrollCtrl.scrollView;
                scrollCtrl.$element.on('scroll', puCtrl.checkBounds);
                $element[0].classList.add('js-scrolling');
                scrollCtrl._setRefresher(
                    $scope,
                    $element[0],
                    puCtrl.getRefresherDomMethods()
                );
                $scope.$on('scroll.refreshComplete', function() {
                    $scope.$evalAsync(function() {
                        scrollCtrl.scrollView.finishPullToRefresh();
                    });
                });

            } else {
                puCtrl.init();
                console.log("native scrolling");

            };

            $scope.$on('scroll.refreshComplete', function() {
                $scope.$evalAsync(function() {
                    scrollCtrl.scrollView.finishPullToRefresh();
                });
            });


        }
    };
}]);
