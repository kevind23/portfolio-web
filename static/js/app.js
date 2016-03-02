(function(window, document, $, undefined){
  /** GLOBALS **/
  var polarity = {
    right: 0,
    left: -1
  };
  var polarityRev = {
    "0": "right",
    "-1": "left"
  };

  function ShowcasePages() {
    this.pages = {},
    this.sequence = [];

    this.state = {
      index: -1,
      path: null,
      lastPath: null,
      animate: null
    };

    // Find all pages and assemble them
    this.assemblePages( $('[data-path]') );

    // If we aren't on the default page, navigate
    if (window.location.pathname.match(/[^\/]/)) {
      this.setPageByPathName( window.location.pathname );
    } else {
      $('[data-path="/"]').addClass("page-active");
      this.setPageByPathName("/");
    }

    window.onpopstate = this.onPopState.bind(this);

    var self = this;
    window.onresize = function(){
        if (!self.resizeTimeout) {
          self.resizeTimeout =
            window.setTimeout(self.recalculate.bind(self), 150);
        }
    }

  }
  ShowcasePages.prototype = {

    setPageByPathName: function(pathName, direction) {
      if (this.pages[pathName]) {
        // direction the pane is coming from
        direction = direction || (this.pages[pathName].idx > this.state.index ?
                                  "right" : "left");

        // determine if this action is opposite the last action
        if (this.state.animate ^ polarity[direction] &&
              this.state.lastPath === pathName) {
          if (window.history && window.history.replaceState) {
            this.animationDirection = direction;
            window.history.back();
            return true;
          }
        }

        this.state = {
          index: this.pages[pathName].idx,
          path:  pathName,
          lastPath: this.state.path,
          animate: polarity[direction]
        };
        if (window.history && window.history.pushState)
          window.history.pushState(this.state, null, pathName);
        // console.log('+', this.state, polarityRev[this.state.animate]);

        this.activatePage(this.pages[pathName].$set, direction);
        $(document.body).attr("data-active-page", this.state.path);
        return true;
      } else {
        return false;
      }
    },

    onPopState: function(event) {
      // console.log('-', event.state, polarityRev[~event.state.animate]);
      this.state = event.state;
      window.history.replaceState(this.state, null, this.state.path);
      // If we don't know the previous direction (we're back to the starting state)
      // then use the saved direction
      var direction = (event.state.lastPath === null) ?
                        this.animationDirection :
                        polarityRev[~this.state.animate];
      this.activatePage(this.pages[this.state.path].$set, direction);
    },

    setPageByIndex: function(index, direction) {
      if (index >= 0 && index < this.sequence.length) {
        return this.setPageByPathName(this.sequence[index], direction);
      } else {
        return false;
      }
    },

    nextPage: function() {
      return this.setPageByIndex(this.state.index+1 < this.sequence.length ?
                                  this.state.index+1 : 0, "right");
    },

    prevPage: function() {
      return this.setPageByIndex(this.state.index-1 >= 0 ?
                                  this.state.index-1 : this.sequence.length-1, "left");
    },

    assemblePages: function($pages) {
      var i = 0;
      var self = this;
      $pages.each(function(){
        var path = $(this).attr("data-path");
        if (!self.pages[path]) {
          // create new object
          self.sequence[i] = path;
          self.pages[path] = {
            $set:  $pages.filter('[data-path="'+path+'"]'),
            idx: i
          };
          i++;
        }
      });
    },

    activatePage: function($new, direction) {
      var opDirection = direction=="left" ? "right" : "left";
      if (this.$active) {
        this.$active.removeClass("animate")
                    .removeClass("hidden-left hidden-right")
                    .addClass("animate hidden-" + opDirection)
                    .removeClass("page-active");
      }
      this.$active = $new;
      this.$active.show()
                  .removeClass("animate")
                  .removeClass("hidden-left hidden-right")
                  .addClass("hidden-" + direction);

      var $el = this.$active;
      window.setTimeout(function(){
        $el.addClass("animate page-active");
      }, 10);
      window.setTimeout(function(){
        $('.hidden-left, .hidden-right').filter(':not(.page-active)')
          .hide().removeClass('animate hidden-left hidden-right');
      }, 425);

      this.recalculate();
    },

    recalculate: function() {
      delete this.resizeTimeout;
      // adjust footer height
      $(".footer").css("transform", "translateY(" + this.$active.height() + "px)");
      $(".page").css("padding-bottom", this.$active.height());
    }

  }

  window.showcase = new ShowcasePages();
  var moveLeft = window.showcase.prevPage.bind(window.showcase);
  var moveRight = window.showcase.nextPage.bind(window.showcase);
  $('.left-arrow').on('click', moveLeft);
  $('.right-arrow').on('click', moveRight);
  $(document).on('movestart', function(e){
    // If the movestart is heading off in an upwards or downwards
    // direction, prevent it so that the browser scrolls normally.
    if ((e.distX > e.distY && e.distX < -e.distY) ||
        (e.distX < e.distY && e.distX > -e.distY)) {
      e.preventDefault();
    } else {
      if (e.distX > 10) moveLeft();
      else if (e.distX < -10) moveRight();
    }
  });

  $(document).keydown(function(evt){
    var key = evt.which != null ?
                evt.which : evt.charCode != null ?
                    evt.charCode : evt.keyCode;

    switch (key) {
      case 39:
        // right arrow
        window.showcase.nextPage();
        break;
      case 37:
        // left arrow
        window.showcase.prevPage();
    }
  });

  // resize events can be expensive, wait (Default: 200ms) between function calls
  function throttled(originalFunction, wait) {
    var timeout, wait = wait || 200;
    return function() {
      if (timeout == null) {
        window.setTimeout(function(){
          originalFunction();
          timeout = null;
        }, wait);
      }
    }
  }

  // image lazyloading
  function lazyload() {
    var $image = $(this);
    if ($image.css('display') !== 'none') {
      $image.attr('src', $image.attr('data-src')).removeAttr('data-src');
    }
  }
  $(window).on('load', function(){
    // first load images on active page
    window.showcase.$active.find('img[data-src]').each(lazyload);
    // load the rest
    $('img[data-src]').each(lazyload);
  }).on('resize', throttled(function(){
    $('img[data-src]').each(lazyload);
  }));

  $(document).on('ready', function() {
    // expose left & right arrows on page load
    if (window.innerWidth > 640) {
        $('.left-arrow, .right-arrow').addClass('hover').delay(1800).animate({opacity: 0}, 900, 'linear', function(){
          $(this).removeClass('hover');
        });
    }
  });

})(window, document, jQuery);
