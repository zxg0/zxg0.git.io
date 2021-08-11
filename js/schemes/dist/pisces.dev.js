"use strict";

/* global NexT, CONFIG */
var Affix = {
  init: function init(element, options) {
    var _this = this;

    this.element = element;
    this.offset = options || 0;
    this.affixed = null;
    this.unpin = null;
    this.pinnedOffset = null;
    this.checkPosition();
    window.addEventListener('scroll', this.checkPosition.bind(this));
    window.addEventListener('click', this.checkPositionWithEventLoop.bind(this));
    window.matchMedia('(min-width: 992px)').addListener(function (event) {
      if (event.matches) {
        _this.offset = NexT.utils.getAffixParam();

        _this.checkPosition();
      }
    });
  },
  getState: function getState(scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop = window.scrollY;
    var targetHeight = window.innerHeight;

    if (offsetTop != null && this.affixed === 'top') {
      if (document.querySelector('.content-wrap').offsetHeight < offsetTop) return 'top';
      return scrollTop < offsetTop ? 'top' : false;
    }

    if (this.affixed === 'bottom') {
      if (offsetTop != null) return this.unpin <= this.element.getBoundingClientRect().top ? false : 'bottom';
      return scrollTop + targetHeight <= scrollHeight - offsetBottom ? false : 'bottom';
    }

    var initializing = this.affixed === null;
    var colliderTop = initializing ? scrollTop : this.element.getBoundingClientRect().top + scrollTop;
    var colliderHeight = initializing ? targetHeight : height;
    if (offsetTop != null && scrollTop <= offsetTop) return 'top';
    if (offsetBottom != null && colliderTop + colliderHeight >= scrollHeight - offsetBottom) return 'bottom';
    return false;
  },
  getPinnedOffset: function getPinnedOffset() {
    if (this.pinnedOffset) return this.pinnedOffset;
    this.element.classList.remove('affix-top', 'affix-bottom');
    this.element.classList.add('affix');
    return this.pinnedOffset = this.element.getBoundingClientRect().top;
  },
  checkPositionWithEventLoop: function checkPositionWithEventLoop() {
    setTimeout(this.checkPosition.bind(this), 1);
  },
  checkPosition: function checkPosition() {
    if (window.getComputedStyle(this.element).display === 'none') return;
    var height = this.element.offsetHeight;
    var offset = this.offset;
    var offsetTop = offset.top;
    var offsetBottom = offset.bottom;
    var scrollHeight = document.body.scrollHeight;
    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);

    if (this.affixed !== affix) {
      if (this.unpin != null) this.element.style.top = '';
      var affixType = 'affix' + (affix ? '-' + affix : '');
      this.affixed = affix;
      this.unpin = affix === 'bottom' ? this.getPinnedOffset() : null;
      this.element.classList.remove('affix', 'affix-top', 'affix-bottom');
      this.element.classList.add(affixType);
    }

    if (affix === 'bottom') {
      this.element.style.top = scrollHeight - height - offsetBottom + 'px';
    }
  }
};

NexT.utils.getAffixParam = function () {
  var sidebarOffset = CONFIG.sidebar.offset || 12;
  var headerOffset = document.querySelector('.header-inner').offsetHeight;
  var footerOffset = document.querySelector('.footer').offsetHeight;
  document.querySelector('.sidebar').style.marginTop = headerOffset + sidebarOffset + 'px';
  return {
    top: headerOffset,
    bottom: footerOffset
  };
};

document.addEventListener('DOMContentLoaded', function () {
  Affix.init(document.querySelector('.sidebar-inner'), NexT.utils.getAffixParam());
});