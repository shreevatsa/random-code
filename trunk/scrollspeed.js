// ==UserScript==
// @name          ScrollSpeed (auto-scroll)
// @description   Automatically scrolls page so as to end by a specified time
// @namespace     
// @version       0.1
// @require       http://web.mit.edu/vatsa/www/json2.js
// @include       *
// ==/UserScript==
//
// Copyright (c) 2010, Shreevatsa R.
// Released under the GNU GPL: http://www.gnu.org/copyleft/gpl.html
//
/*

  Usage
  =====
  Scroll down to the end of the text you want to read,
  and choose "Set_bottom" in the Greasemonkey User Script Commands.

  Now scroll up. The page will scroll down automatically at the proper
  rate to finish in time. Good luck reading.

  Notes
  =====
  * If the horizontal (x) scroll position of the final state is not
  the same as the current, it scrolls that as well. This may not be
  what you want.

  Changelog:

  2010-01-15 v0.1    First version
*/

"use strict";
/*jslint browser: true, onevar: false, white:false, plusplus: false, undef: true, eqeqeq: true*/
/*global window, document, alert, GM_registerMenuCommand, GM_log */

if(window===window.top) {
  (function () {
    //JSLint thinks function names starting with uppercase are constructors
    var gm_log=GM_log, gm_registerMenuCommand=GM_registerMenuCommand;
    function assert(cond, str) { if (!cond) { throw new Error('Assertion failed: ' + str); } }
    function curTime() { return (new Date()).getTime(); }

    var T = 60*1000; // 60000 ms = (1 minute) * (60 s/minute) * (1000 ms/s)
    var endTime;

    function scrollSlightly(bx, by) {
      T = endTime - curTime();
      if(T<0) { alert("Done scrolling; you should be done reading!"); return; }
      var tx = window.scrollX, ty = window.scrollY;
      var eps = 100;
      var x = tx + (eps/T)*(bx-tx);
      var y = ty + (eps/T)*(by-ty);
      window.scrollTo(x,y);
      window.setTimeout(scrollSlightly, eps, bx, by);
    }

    gm_registerMenuCommand('Set_bottom',
                           function() {
                             var bx=window.scrollX;
                             var by=window.scrollY;
                             endTime = 60000 + curTime();
                             gm_log("End position is (" + bx + "," + by + ") at " + (new Date(endTime)).toLocaleString());
                             scrollSlightly(bx, by);
                           },
                           'b', 'control alt');

  }());
 }
