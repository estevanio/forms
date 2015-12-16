var customModule = angular.module('custom', ['ngAnimate', 'ngSanitize', 'ui.router', 'ngIOS9UIWebViewPatch']),
extend = angular.extend,
forEach = angular.forEach,
isDefined = angular.isDefined,
isNumber = angular.isNumber,
isString = angular.isString,
jqLite = angular.element,
noop = angular.noop;

customModule
.controller('pullupctrl', [
  '$scope',
  '$attrs',
  '$element',
  '$ionicBind',
  '$timeout',
  function($scope, $attrs, $element, $ionicBind, $timeout) {
    var self = this,
        isDragging = false,
        isOverscrolling = false,
        dragOffset = 0,
        lastOverscroll = 0,
        ptrThreshold = 60,
        activated = false,
        scrollTime = 500,
        startY = null,
        deltaY = null,
        canOverscroll = true,
        scrollParent,
        scrollChild,
        puHeight = $element[0].clientHeight || 60;

        // sets pulling icon if it is not defined
    if (!isDefined($attrs.pullingIcon)) {
      $attrs.$set('pullingIcon', 'ion-android-arrow-up');
    }

    $scope.showSpinner = !isDefined($attrs.refreshingIcon) && $attrs.spinner != 'none';

    $scope.showIcon = isDefined($attrs.refreshingIcon);

    $ionicBind($scope, $attrs, {
      pullingIcon: '@',
      pullingText: '@',
      refreshingIcon: '@',
      pulledText: '@',
      spinner: '@',
      disablePullingRotation: '@',
      $onRefresh: '&onRefresh',
      $onPulling: '&onPulling'
    });

    function handleTouchend() {
      console.log('handling touch end');
      // if this wasn't an overscroll, get out immediately
      if (!canOverscroll && !isDragging) {
        return;
      }
      // reset Y
      startY = null;
      // the user has overscrolled but went back to native scrolling
      if (!isDragging) {
        dragOffset = 0;
        isOverscrolling = false;
        setScrollLock(false);
      } else {
        isDragging = false;
        dragOffset = 0;

        // the user has scrolled far enough to trigger a refresh
        if (lastOverscroll > ptrThreshold) {
          console.log("lastovescroll");
          start();
          scrollTo(ptrThreshold, scrollTime);

        // the user has overscrolled but not far enough to trigger a refresh
        } else {
          scrollTo(0, scrollTime, deactivate);
          isOverscrolling = false;
        }
      }
    }

    function handleTouchmove(e) {
      console.log('handling touch move');
      // if multitouch or regular scroll event, get out immediately
      if (!canOverscroll || e.touches.length > 1) {
        return;
      }
      //if this is a new drag, keep track of where we start
      if (startY === null) {
        startY = parseInt(e.touches[0].screenY, 10);
      }

      // kitkat fix for touchcancel events http://updates.html5rocks.com/2014/05/A-More-Compatible-Smoother-Touch
      if (ionic.Platform.isAndroid() && ionic.Platform.version() === 4.4 && scrollParent.scrollTop === 0) {
        isDragging = true;
        e.preventDefault();
      }

      // how far have we dragged so far?
      deltaY = parseInt(e.touches[0].screenY, 10) - startY;
      console.log(deltaY);
          //do some rewriting in here because we our stuff is irrelvant of the top overscrolling
      if (deltaY - dragOffset <= 0 || scrollParent.scrollTop !== 0) {
        // if we've dragged up and back down in to native scroll territory
        if (isOverscrolling) {
          isOverscrolling = false;
          setScrollLock(false);
        }

        if (isDragging) {
          console.log("dragging");
          nativescroll(scrollParent, parseInt(deltaY - dragOffset, 10) * -1);
        }

        // if we're not at overscroll 0 yet, 0 out
        if (lastOverscroll !== 0) {
          overscroll(0);
        }
        return;

      } else if (deltaY > 0 && scrollParent.scrollTop === 0 && !isOverscrolling) {
        // starting overscroll, but drag started below scrollTop 0, so we need to offset the position
        dragOffset = deltaY;
      }

      // prevent native scroll events while overscrolling
      e.preventDefault();

      // if not overscrolling yet, initiate overscrolling
      if (!isOverscrolling) {
        isOverscrolling = true;
        setScrollLock(true);
      }

      isDragging = true;
      // overscroll according to the user's drag so far
      overscroll(parseInt((deltaY - dragOffset) / 3, 10));

      // update the icon accordingly
      if (!activated && lastOverscroll > ptrThreshold) {
        activated = true;
        ionic.requestAnimationFrame(activate);

      } else if (activated && lastOverscroll < ptrThreshold) {
        activated = false;
        ionic.requestAnimationFrame(deactivate);
      }
    }

    function handleScroll(e) {
      console.log("handling scroll");
      // canOverscroll is used to greatly simplify the drag handler during normal scrolling
      canOverscroll = (e.target.scrollTop === 0) || isDragging;
    }

    function overscroll(val) {
      console.log(val);
      scrollChild.style[ionic.CSS.TRANSFORM] = 'translateY(' + val + 'px)';
      lastOverscroll = val;
    }

    function nativescroll(target, newScrollTop) {
      console.log('fn nativescroll');
      target.scrollTop = newScrollTop;
      console.log(newScrollTop);
      var e = document.createEvent("UIEvents");
      e.initUIEvent("scroll", true, true, window, 1);
      target.dispatchEvent(e);
    }

    function setScrollLock(enabled) {
      // set the scrollbar to be position:fixed in preparation to overscroll
      // or remove it so the app can be natively scrolled
      if (enabled) {
        ionic.requestAnimationFrame(function() {
          scrollChild.classList.add('overscroll');
          show();
        });

      } else {
        ionic.requestAnimationFrame(function() {
          scrollChild.classList.remove('overscroll');
          hide();
          deactivate();
        });
      }
    }

    $scope.$on('scroll.refreshComplete', function() {
      // prevent the complete from firing before the scroll has started
      $timeout(function() {
        ionic.requestAnimationFrame(tail);
        // scroll back to home during tail animation
        scrollTo(0, scrollTime, deactivate);
        // return to native scrolling after tail animation has time to finish
        $timeout(function() {
          if (isOverscrolling) {
            isOverscrolling = false;
            setScrollLock(false);
          }
        }, scrollTime);
      }, scrollTime);
    });

    function scrollTo(Y, duration, callback) {
      console.log("scroll to launched");
          // scroll animation loop w/ easing
          // credit https://gist.github.com/dezinezync/5487119
          var start = Date.now(),
              from = lastOverscroll;

          if (from === Y) {
            callback();
            return; /* Prevent scrolling to the Y point if already there */
          }

          // decelerating to zero velocity
          function easeOutCubic(t) {
            return (--t) * t * t + 1;
          }

          // scroll loop
          function scroll() {
            var currentTime = Date.now(),
              time = Math.min(1, ((currentTime - start) / duration)),
              // where .5 would be 50% of time on a linear scale easedT gives a
              // fraction based on the easing method
              easedT = easeOutCubic(time);

            overscroll(parseInt((easedT * (Y - from)) + from, 10));

            if (time < 1) {
              ionic.requestAnimationFrame(scroll);

            } else {

              if (Y < 5 && Y > -5) {
                isOverscrolling = false;
                setScrollLock(false);
              }

              callback && callback();
            }
          }

          // start scroll loop
          ionic.requestAnimationFrame(scroll);
        }

    self.init = function() {
      scrollParent = $element.parent().parent()[0];
      scrollChild = $element.parent()[0];
      if (!scrollParent || !scrollParent.classList.contains('ionic-scroll') ||
        !scrollChild || !scrollChild.classList.contains('scroll')) {
        throw new Error('Refresher must be immediate child of ion-content or ion-scroll');
      }

      ionic.on('touchmove', handleTouchmove, scrollChild);
      ionic.on('touchend', handleTouchend, scrollChild);
      ionic.on('scroll', handleScroll, scrollParent);

      // cleanup when done
      $scope.$on('$destroy', destroy);
    };

    function destroy() {
      ionic.off('touchmove', handleTouchmove, scrollChild);
      ionic.off('touchend', handleTouchend, scrollChild);
      ionic.off('scroll', handleScroll, scrollParent);
      scrollParent = null;
      scrollChild = null;
    }

    // DOM manipulation and broadcast methods shared by JS and Native Scrolling
    // getter used by JS Scrolling


    function activate() {
      console.log("activating");
      $element[0].classList.add('active');
      // launch the onpulling function set in the attributes
      $scope.$onPulling();
    }

    function deactivate() {
      console.log("deactivating");
      // give tail 150ms to finish
      $timeout(function() {
        // deactivateCallback
        $element.removeClass('active refreshing refreshing-tail');
        if (activated) activated = false;
      }, 150);
    }


    function start() {
      console.log("starting");
      // TODO: we will be calling this "pulled"
      $element[0].classList.add('refreshing');
      // launch the onrefresh function set in the attributes
      $scope.$onRefresh();
    }

    // it's ok
    function show() {
      console.log("showing");
      // make it visible
      $element[0].classList.remove('invisible');
    }
    // it's ok
    function hide() {
      console.log("hideing");
      // make it invisible again
      $element[0].classList.add('invisible');
    }
    //it's ok
    function tail() {
      console.log("tailing");
      // flips the arrow after it's been pulled enough, before it's been released
      $element[0].classList.add('refreshing-tail');
    }
    // returns activate, deactivate, start, show, hide, tail
    self.getRefresherDomMethods = function() {
      console.log('getting refresher dom methods');
      return {
        activate: activate,
        deactivate: deactivate,
        start: start,
        show: show,
        hide: hide,
        tail: tail
      };
    };

    // for testing
    self.__handleTouchmove = handleTouchmove;
    self.__getScrollChild = function() { return scrollChild; };
    self.__getScrollParent = function() { return scrollParent; };
  }
]);
