// ==UserScript==
// @name          ScrollSpeed (auto-scroll)
// @description   Automatically scrolls page so as to end by a specified time
// @namespace     
// @version       0.1
// @resource       jQuery               http://web.mit.edu/vatsa/www/unsorted/jquery-1.3.js
// @resource       jQueryTimeEntry      http://web.mit.edu/vatsa/www/unsorted/timeentry/jquery.timeentry.js
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
/*global window, document, alert, GM_registerMenuCommand, GM_log, $ */

if(window===window.top) {

  (function() {
    var head = document.getElementsByTagName('head')[0];

    var script = document.createElement('script');
    script.type = 'text/javascript';

    var jQuery = GM_getResourceText('jQuery');
    var jQueryTimeEntry = GM_getResourceText('jQueryTimeEntry');

    script.innerHTML = jQuery + jQueryTimeEntry;
    head.appendChild(script);

    $ = unsafeWindow.$;

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
                             endTime = 1000*60*60*2 + curTime();
                             gm_log("End position is (" + bx + "," + by + ") at " + (new Date(endTime)).toLocaleString());
                             scrollSlightly(bx, by);
                           },
                           'b', 'control alt');

    var d = document.createElement('div');
    var i = document.createElement('input'); i.type='text'; i.id='defaultEntry';
    d.appendChild(i);
    document.body.appendChild(d);
    d.id = 'did';
    d.style.position = "fixed";
    d.style.right = "0px";
    d.style.top = "0px";

    $(document).ready(function() {
        $(function () {
            var t = jQuery('#defaultEntry');
            console.log(t);
            t.timeEntry({spinnerImage: 'http://keith-wood.name/img/spinnerDefault.png'});
          });

        //$('#defaultEntry').datepicker('destroy').datepicker();
      });

  }());

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
