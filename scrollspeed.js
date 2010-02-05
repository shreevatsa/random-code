// ==UserScript==
// @name          ScrollSpeed (auto-scroll)
// @description   Automatically scrolls page so as to end by a specified time
// @namespace     
// @version       0.1
// @include       *
// ==/UserScript==
//
// Copyright (c) 2010, Shreevatsa R.
// Released under the GNU GPL: http://www.gnu.org/copyleft/gpl.html
//
/*

  Usage
  =====
  Scroll down to the end of the page/region you want to read,
  and choose "Set_bottom" in the Greasemonkey User Script Commands.

  Now scroll up. The page will scroll automatically at the proper rate
  to reach the end in the given time. Good luck reading.

  Notes
  =====

  * If the horizontal (x) scroll position of the final state (when you
  "Set_bottom") is not the same as the current, it scrolls horizontally
  as well.  This may not be what you want.

  Changelog:

  2010-01-15 v0.1    First version
*/

"use strict";
/*jslint browser: true, onevar: false, white:false, plusplus: false, undef: true, eqeqeq: true*/
/*global window, document, alert, GM_registerMenuCommand, GM_log, $ */

if(window===window.top) {
  (function() {
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
      var eps = 100; //Number of milliseconds
      var x = tx + (eps/T)*(bx-tx);
      var y = ty + (eps/T)*(by-ty);
      window.scrollTo(x,y);
      window.setTimeout(scrollSlightly, eps, bx, by);
    }

    function make_box() {
      var d = document.createElement('div');
      //var i = document.createElement('input'); i.type='text'; i.id='defaultEntry'; i.value='120'; d.appendChild(i);
      d.innerHTML =
        '<input type="text" id="defaultEntry" value="120" size="8">' +
        '<input type="submit" value="S" id="scrspsubmit">';
      document.body.appendChild(d);
      d.style.position = 'fixed';
      d.style.right = "0px";
      d.style.top = "0px";
      //d.id = 'did';

      function setAndScroll() {
        gm_log('Clicked: ' + this.value);
        var bx=window.scrollX;
        var by=window.scrollY;
        endTime = 1000*60*120 + curTime();
        gm_log("End position is (" + bx + "," + by + ") at " + (new Date(endTime)).toLocaleString());
        scrollSlightly(bx, by);
      }

      var b = document.getElementById('scrspsubmit');
      b.addEventListener('click', setAndScroll, true);
    }

    gm_registerMenuCommand('Set_bottom',
                           function() {
                             gm_log('Making box');
                             make_box();
//                              var bx=window.scrollX;
//                              var by=window.scrollY;
//                              endTime = 1000*60*120 + curTime();
//                              gm_log("End position is (" + bx + "," + by + ") at " + (new Date(endTime)).toLocaleString());
//                              scrollSlightly(bx, by);
                           },
                           'b', 'control alt');

  })();

 }

/*
In Firebug:

function curTime() { return (new Date()).getTime(); }
function scrollSlightly(bx, by) {T = endTime - curTime(); if(T<0) { alert("Done scrolling; you should be done reading!"); return; } var tx = window.scrollX, ty = window.scrollY; var eps = 100; var x = tx + (eps/T)*(bx-tx); var y = ty + (eps/T)*(by-ty); window.scrollTo(x,y); window.setTimeout(scrollSlightly, eps, bx, by);}
bx = window.scrollX
by = window.scrollY
endTime = curTime() + 1000*60*(minutes)
scrollSlightly(bx,by)
*/
