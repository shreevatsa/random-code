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

  2010-02-06 v0.2    First working version
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
    var endTime;
    var eps = 100; //Number of milliseconds

    var things_to_do = [];
    function pop_queue(func) {
      if(things_to_do.length>0) { things_to_do.shift()(); }
      window.setTimeout(pop_queue, eps);
    }
    //pop_queue(); //Get it going

    function toWidth(w, n) {
      s = '' + n;
      while(s.length < w) s = '0' + s;
      return s;
    }
    function printTime(ms) { //Convert milliseconds to hours:minutes:seconds
      var d = new Date(ms);
      return d.getUTCHours() + ':' + toWidth(2,d.getUTCMinutes()) + ':' + toWidth(2,d.getUTCSeconds());
    }

    function scrollSlightly(bx, by) {
      var T = endTime - curTime();
      if(T<0) { alert("Done scrolling; you should be done reading!"); return; }
      var tx = window.scrollX, ty = window.scrollY;
      var x = tx + (eps/T)*(bx-tx);
      var y = ty + (eps/T)*(by-ty);
      window.scrollTo(x,y);
      document.getElementById('scrspbutton').value = '' + ((eps/T)*(by-ty)).toFixed(2);
      //document.getElementById('scrspminutes').value= printTime(T);
      things_to_do.push(function() { scrollSlightly(bx, by); }); //Let's not setTimeout ourselves
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
    }

    gm_registerMenuCommand('Set_bottom',
                           function() {
                             gm_log('Setting...');
                             make_box();
                             pop_queue();
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
