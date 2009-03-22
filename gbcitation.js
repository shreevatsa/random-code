// ==UserScript==
// @name          Citation wikitext generator
// @description   Generates {{citation}} wiki markup from Google Books links
// @namespace     http://code.google.com/p/random-code/
// @require       http://ecmanaut.googlecode.com/svn/trunk/lib/gm/wget.js
// @include       http://books.google.com/*
// ==/UserScript==
//
// Copyright (c) 2009, Shreevatsa R.
// Released under the GNU GPL: http://www.gnu.org/copyleft/gpl.html
// either version 3 or (at your option) any later version.

/*
  From a Google Books link, generates wiki markup in the
  {{citation|...}} format, suitable for inclusion on Wikipedia:
  http://en.wikipedia.org/wiki/Template:Citation

  For example, when at the URL:
  http://books.google.com/books?id=_tnwmvHmVwMC&pg=PA5&dq=%22The+trouble+is%22
  you can click "Show citation" to get
  {{citation | title=Asymptotic Methods in Analysis | author=N. G. de Bruijn | edition=3, illustrated | year=1981 | publisher=Courier Dover Publications | isbn=9780486642215 | page=5 | url=http://books.google.com/books?id=_tnwmvHmVwMC&pg=PA5&dq=%22The+trouble+is%22}}
  which is in the right format for Wikipedia, more or less.

  Notes
  =====
  It works somewhat, but there are several things it doesn't handle, or
  could handle better.
  Suggestions for improvement are very much welcome!

  Changelog:
  2009-03-15 First version
  2009-03-15 Remove unneeded @requires
  2009-03-15 Return to using wget
  2009-03-22 Take care of 'Published 1885' etc.
*/

if(!this.gbcitation && window===window.top) {
  var gbcitation = function () {

    function do_doc(url, func) { wget(url, func, runGM=false, div=true); }

    String.prototype.startsWith = function(str) {
      return (this.indexOf(str) === 0);
    };

    function infoFromBook(doc) {
      var s = '';
      var nauthors=1;
      var tdivs = doc.getElementsByClassName('bookinfo_sectionwrap');
      //Yes, there are pages with more than one: see /books?id=xh0YAAAAYAAJ
      for(var ti=0;ti<tdivs.length;++ti) {
        var tdiv = tdivs[ti];
        var pieces = tdiv.childNodes;
        var n = pieces.length;
        for(var i=0; i<n; ++i) {
          var p = pieces[i];
          if(p.className==='bookinfo_section_line book_title_line') {
            s += ' | title='+p.innerHTML;
            continue;
          }
          var t = p.innerHTML;
          if(t.startsWith('By')) {
            var authors = t.substr(3).split(',');
            for(var aj=0; aj<authors.length; ++aj) {
              s += ' | author'+nauthors+'='+authors[aj];
              ++nauthors;
            }
            continue;
          }
          if(t.startsWith('Translated by')) {
            var authors = t.substr(14).split(',');
            for(var aj=0; aj<authors.length; ++aj) {
              s += ' | author'+nauthors+'='+authors[aj] + " (transl.)";
              ++nauthors;
            }
            continue;
          }
          if(t.startsWith('Compiled by')) {
            s += ' | editor='+t.substr(12); //editor1=... etc. doesn't work
            continue;
          }
          if(t.startsWith('edited by') || t.startsWith('Edited by')) {
            s += ' |editor='+t.substr(10);
            continue;
          }
          if(t.startsWith('Edition')) {
            s += ' | edition='+t.substr(9);
            continue;
          }
          if(t.startsWith('Published by')) {
            var year = t.match(/\d+$/);
            if(year !== null) {
              s += ' | year='+year[0];
              s += ' | publisher='+t.substring(13,t.length-year[0].length-2); //2 is for ', '
            } else {
              s += ' | publisher='+t.substr(13);
            }
            continue;
          }
          if(t.startsWith('Published')) {
            var year = t.match(/\d+$/);
            if(year !== null) {
              s += ' | year='+year[0];
            }
            continue;
          }

          if(t.startsWith('ISBN')) {
            var isbn = t.match(/\d+$/);
            if(isbn===null || isbn.length<1) {
              alert('No match for trailing ISBN in "'+t+'".');
            } else {
              s += ' | isbn='+isbn[0];
            }
            continue;
          }
          if(t.startsWith('Original from') || t.startsWith('Digitized')) {
            continue;
          }
          var pages = t.match(/(\d+) pages/i);
          if(pages!==null) {
            if(pages.length<2) { alert('Too short match: '+pages[0]+' only.'); }
            //s += ' | pages='+pages[1];
            continue;
          }
          alert('Don\'t know what to do with "'+t+'"');
        }
      }
      return s;
    }

    function showCitationFromInfo(info, url) {
      //alert('Looking for citation from info '+info+url);
      var s = '{{citation';
      s += info;
      var pg = url.match(/&pg=PA(\d+)/i);
      if (pg!==null) {
        if(pg.length<2) { alert('Too short match: '+pg[0]+' only.'); }
        s += ' | page='+pg[1];
      }
      s += ' | url=' + url + '}}';
      alert(s);
    }

    function showCitationFromPage() {
      var u = location.href;
      var book = u.split('&')[0];
      alert('Getting info from '+book);
      do_doc(book, function(doc) {
          var info = infoFromBook(doc);
          showCitationFromInfo(info, u);
        });
    }

    //Add link in title div that says 'Generate citation'
    function add_link() {
      var topbar = document.getElementById('gaia_bar').parentNode;
      var link = document.createElement('a');
      link.href = 'show://a-citation-for-this-book';
      link.innerHTML = '[Show citation]';
      var showcitation = function(event) {
        event.stopPropagation();
        event.preventDefault();
        showCitationFromPage();
      };
      link.addEventListener('click', showcitation, false);
      topbar.appendChild(link);
    }
    add_link();

    // gm_registerMenuCommand('Generate citation', function() { alert(citation()); });
  }();
 }
