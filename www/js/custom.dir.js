customModule.directive('esPullup', [function() {
  return {
    restrict: 'E',
    replace: true,
    require: ['^?$ionicScroll', 'esPullup'],
    controller: 'pullupctrl',
    template:
    '<div class="scroll-pu invisible" collection-repeat-ignore>' +
      '<div class="ionic-refresher-content" ' +
      'ng-class="{\'ionic-refresher-with-text\': pullingText || pulledText}">' +
        '<div class="icon-pulling" ng-class="{\'pulling-rotation-disabled\':disablePullingRotation}">' +
          '<i class="icon {{pullingIcon}}"></i>' +
        '</div>' +
        '<div class="text-pulling" ng-bind-html="pullingText"></div>' +
        '<div class="icon-refreshing">' +
          '<ion-spinner ng-if="showSpinner" icon="{{spinner}}"></ion-spinner>' +
          '<i ng-if="showIcon" class="icon {{refreshingIcon}}"></i>' +
        '</div>' +
        '<div class="text-refreshing" ng-bind-html="pulledText"></div>' +
      '</div>' +
    '</div>',
    link: function($scope, $element, $attrs, ctrls) {
      console.log("linked function");

      // JS Scrolling uses the scroll controller
      var scrollCtrl = ctrls[0],
          puCtrl = ctrls[1];
      if (!scrollCtrl || scrollCtrl.isNative()) {
        // Kick off native scrolling
        puCtrl.init();
        console.log("native scrolling");
      } else {
        console.log("js scrolling");
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
      }

    }
  };
}])
.directive('esformview', [function() {


return{
templateUrl:'esview.html'

};

}]);
