// ==UserScript==
// @name          ScrollSpeed (auto-scroll)
// @description   Automatically scrolls page to end by a specified time
// @namespace     http://code.google.com/p/random-code/
// @version       0.2
// @include       *
// ==/UserScript==
//
// Copyright (c) 2010, Shreevatsa R.
// Released under the GNU GPL: http://www.gnu.org/copyleft/gpl.html
//
/*

  Purpose
  =======
  Imagine you're reading a long webpage (e.g. a novel!) that you don't
  care to read too carefully, but want to finish in, say, two hours.

  Usage
  =====
  Scroll down to the end of the page/region you want to read,
  and choose "Set_bottom" in the Greasemonkey User Script Commands.

  A text box should appear at the top right corner of the window.
  Enter a number (of minutes) in the box, and click on the button.

  Now scroll up. The page will scroll automatically at the proper rate
  (shown in button), to reach the end in the given time.

  Good luck reading.

  (You can enter another number and click again to change the end time.
  To make it stop entirely, enter a very large number, e.g. 99999.)

  Notes
  =====
  * The scroll rate, instead of remaining constant, tends to increase.
  This is probably because Firefox can only scroll by discrete amounts.
  I'm not sure how to fix this. In the meantime, set it to end earlier
  than you need it to.

  * If the horizontal (x) scroll position of the final state (when you
  "Set_bottom") is not the same as the current, it scrolls horizontally
  as well.  This is a "feature", but it may not be what you want.

  Changelog:

  2010-02-06 v0.1    First working version
  2010-01-15 v0.0    First version
*/

"use strict";
/*jslint browser: true, onevar: false, white:false, plusplus: false, undef: true, eqeqeq: true*/
/*global window, document, alert, GM_registerMenuCommand, GM_log */

if(window===window.top) {
  (function() {
    //JSLint thinks function names starting with uppercase are constructors
    var gm_log=GM_log, gm_registerMenuCommand=GM_registerMenuCommand;
    function assert(cond, str) { if (!cond) { throw new Error('Assertion failed: ' + str); } }

    function curTime() { return (new Date()).getTime(); }
    var endTime;
    var eps = 100; //Number of milliseconds

    var things_to_do = [];
    function pop_queue(func) {
      if(things_to_do.length>0) { things_to_do.shift()(); }
      window.setTimeout(pop_queue, eps);
    }

    /*
    function toWidth(w, n) {
      s = '' + n;
      while(s.length < w) s = '0' + s;
      return s;
    }
    function printTime(ms) { //Convert milliseconds to hours:minutes:seconds
      var d = new Date(ms);
      return d.getUTCHours() + ':' + toWidth(2,d.getUTCMinutes()) + ':' + toWidth(2,d.getUTCSeconds());
    }
    */

    function scrollSlightly(bx, by) {
      var T = endTime - curTime();
      if(T<0) { alert("Done scrolling; you should be done reading!"); return; }
      var tx = window.scrollX, ty = window.scrollY;
      var x = Math.ceil(tx + (eps/T)*(bx-tx));
      var y = Math.ceil(ty + (eps/T)*(by-ty) + 0.8); //Attempt to fix the increasing rate
      window.scrollTo(x,y);
      document.getElementById('scrspbutton').value = '' + ((eps/T)*(by-ty)).toFixed(2);
      //document.getElementById('scrspminutes').value= printTime(T);
      things_to_do.push(function() { scrollSlightly(bx, by); });
    }

    function make_box() {
      var d = document.createElement('div');
      d.innerHTML =
        '<input type="text"  id="scrspminutes" name="minutes" value="120" size="4" style="text-align:right">' +
        '<input type="submit" id="scrspbutton" name="bbutton" value="min">' +
        '';
      document.body.appendChild(d);
      d.style.position = 'fixed';
      d.style.right = "0px";
      d.style.top = "0px";

      function setAndScroll() {
        var t = document.getElementById('scrspminutes').value;
        var bx=window.scrollX;
        var by=window.scrollY;
        endTime = 1000*60*t + curTime();
        gm_log('Got ' + t + ', so End position is (' + bx + ',' + by + ') at ' + (new Date(endTime)).toLocaleString());
        things_to_do = [ function() { scrollSlightly(bx, by);} ];
        return false;
      }
      document.getElementById('scrspbutton').addEventListener('click', setAndScroll, true);
      pop_queue();
    }

    gm_registerMenuCommand('Set_bottom',
                           make_box,
                           'b', 'control alt');

  })();

 }

/*
Manually, in Firebug:

function curTime() { return (new Date()).getTime(); }
function scrollSlightly(bx, by) {T = endTime - curTime(); if(T<0) { alert("Done scrolling; you should be done reading!"); return; } var tx = window.scrollX, ty = window.scrollY; var eps = 100; var x = tx + (eps/T)*(bx-tx); var y = ty + (eps/T)*(by-ty); window.scrollTo(x,y); window.setTimeout(scrollSlightly, eps, bx, by);}
bx = window.scrollX
by = window.scrollY
endTime = curTime() + 1000*60*(minutes)
scrollSlightly(bx,by)
*/
