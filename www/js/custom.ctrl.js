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

    $scope.showSpinner = !isDefined($attrs.pulledIcon) && $attrs.spinner != 'none';

    $scope.showIcon = isDefined($attrs.pulledIcon);

    //this came from refesher, but we might not need it, let's do it more like infinite
    $ionicBind($scope, $attrs, {
      pullingIcon: '@', //stays
      pullingText: '@', //stays
      pulledIcon: '@', //diditt
      pulledText: '@', //mine
      spinner: '@', //TODO:deprecate
      disablePullingRotation: '@', //TODO: depracate
      $onPulled: '&onPulled', //DIDIT
      $onPulling: '&onPulling' //stay
    });

//THIS IS INFINITE SHIT
self.isLoading = false;
self.isLoading = false;

$scope.icon = function() {
  return isDefined($attrs.icon) ? $attrs.icon : 'ion-load-d';
};

$scope.spinner = function() {
  return isDefined($attrs.spinner) ? $attrs.spinner : '';
};

$scope.$on('scroll.infiniteScrollComplete', function() {
  finishInfiniteScroll();
});

$scope.$on('$destroy', function() {
  if (self.scrollCtrl && self.scrollCtrl.$element) self.scrollCtrl.$element.off('scroll', self.checkBounds);
  if (self.scrollEl && self.scrollEl.removeEventListener) {
    self.scrollEl.removeEventListener('scroll', self.checkBounds);
  }
});
// debounce checking infinite scroll events
  self.checkBounds = ionic.Utils.throttle(checkBounds, 300);

  function onInfinite() {
    console.log("infiniting");
    ionic.requestAnimationFrame(function() {
      $element[0].classList.add('active');
    });
    self.isLoading = true;
    $scope.$parent && $scope.$parent.$apply($attrs.onInfinite || '');
  }

  function finishInfiniteScroll() {
    console.log("finished infiniting");

    ionic.requestAnimationFrame(function() {
      $element[0].classList.remove('active');
    });
    $timeout(function() {
      if (self.jsScrolling) self.scrollView.resize();
      // only check bounds again immediately if the page isn't cached (scroll el has height)
      if ((self.jsScrolling && self.scrollView.__container && self.scrollView.__container.offsetHeight > 0) ||
      !self.jsScrolling) {
        self.checkBounds();
      }
    }, 30, false);
    self.isLoading = false;
  }

  // check if we've scrolled far enough to trigger an infinite scroll
  function checkBounds() {
    if (self.isLoading) return;
    var maxScroll = {};

    if (self.jsScrolling) {
      maxScroll = self.getJSMaxScroll();
      var scrollValues = self.scrollView.getValues();
      if ((maxScroll.left !== -1 && scrollValues.left >= maxScroll.left) ||
        (maxScroll.top !== -1 && scrollValues.top >= maxScroll.top)) {
        onInfinite();
      }
    } else {
      maxScroll = self.getNativeMaxScroll();
      if ((
        maxScroll.left !== -1 &&
        self.scrollEl.scrollLeft >= maxScroll.left - self.scrollEl.clientWidth
        ) || (
        maxScroll.top !== -1 &&
        self.scrollEl.scrollTop >= maxScroll.top - self.scrollEl.clientHeight
        )) {
        onInfinite();
      }
    }
  }

  // determine the threshold at which we should fire an infinite scroll
  // note: this gets processed every scroll event, can it be cached?
  self.getJSMaxScroll = function() {
    var maxValues = self.scrollView.getScrollMax();
    return {
      left: self.scrollView.options.scrollingX ?
        calculateMaxValue(maxValues.left) :
        -1,
      top: self.scrollView.options.scrollingY ?
        calculateMaxValue(maxValues.top) :
        -1
    };
  };

  self.getNativeMaxScroll = function() {
    var maxValues = {
      left: self.scrollEl.scrollWidth,
      top: self.scrollEl.scrollHeight
    };
    var computedStyle = window.getComputedStyle(self.scrollEl) || {};
    return {
      left: maxValues.left &&
        (computedStyle.overflowX === 'scroll' ||
        computedStyle.overflowX === 'auto' ||
        self.scrollEl.style['overflow-x'] === 'scroll') ?
        calculateMaxValue(maxValues.left) : -1,
      top: maxValues.top &&
        (computedStyle.overflowY === 'scroll' ||
        computedStyle.overflowY === 'auto' ||
        self.scrollEl.style['overflow-y'] === 'scroll' ) ?
        calculateMaxValue(maxValues.top) : -1
    };
  };

  // determine pixel refresh distance based on % or value
  function calculateMaxValue(maximum) {
    var distance = ($attrs.distance || '2.5%').trim();
    var isPercent = distance.indexOf('%') !== -1;
    return isPercent ?
    maximum * (1 - parseFloat(distance) / 100) :
    maximum - parseFloat(distance);
  }






//INFINITE SHIT END


//THIS IS REFRESHING SHIT
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
      console.log(" fn setScrollLock");
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

    //TODO: refactor
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

    //ignore the error, its fine just funky
    function scrollTo(Y, duration, callback) {
      console.log("fn scrollTo");
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
      $scope.$onPulled();
    }
    function show() {
      console.log("showing");
      // make it visible
      $element[0].classList.remove('invisible');
    }
    function hide() {
      console.log("hideing");
      // make it invisible again
      $element[0].classList.add('invisible');
    }
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

//REFRESHING SHIT END

  }
]);
