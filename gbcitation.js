// ==UserScript==
// @name          Citation wikitext generator
// @description   Generates {{citation}} wiki markup from Google Books links
// @namespace     http://code.google.com/p/random-code/
// @require       http://ecmanaut.googlecode.com/svn/trunk/lib/gm/wget.js
// @include       http://books.google.tld/*
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
  {{citation | title=Asymptotic Methods in Analysis | author1=N. G. de Bruijn | edition=3, illustrated | year=1981 | publisher=Courier Dover Publications | isbn=9780486642215 | page=5 | url=http://books.google.com/books?id=_tnwmvHmVwMC&pg=PA5&dq=%22The+trouble+is%22}}
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
  2009-03-22 Handle translators and multiple info divs
  2009-03-22 Put year at the beginning, making it easier to sort by
  2009-03-23 Change the annoying first alert() to console.log()
  2009-03-23 Fix the multiple editors bug
  2009-06-14 Google changed (improved!) its markup last week; script rewritten.
  2009-07-04 Change include from "books.google.com" to "books.google.tld"
*/

if(!this.gbcitation && window === window.top) {
  var gbcitation = function () {

    function do_doc(url, func) { wget(url, func, runGM=false, div=false); }
    if( typeof console == 'undefined' ) { console = { log: function () {} }; }
    function assert(cond) {
      if (!cond) {
        //alert("Assertion failed: " + cond);
        throw new Error("Assertion failed: " + cond);
      }
    }

    String.prototype.startsWith = function(str) {
      return (this.indexOf(str) === 0);
    };

    function infoFromBook(doc) {
      var s = '';
      var nauthors=1;
      var neditors=1;
      var metadata_rows = doc.getElementById('metadata_content_table').childNodes[0].childNodes;
      for(var ti=0;ti<metadata_rows.length;++ti) {
        var mrow = metadata_rows[ti].childNodes;
        assert(mrow.length === 2);
        assert(mrow[0].className === 'metadata_label');
        assert(mrow[1].className === 'metadata_value');
        var label = mrow[0].innerHTML;
        var value = mrow[1].childNodes[0].innerHTML.replace('[','&#91;','g').replace(']','&#93;','g');

        if(label === 'Title') {
          s += ' | title = ' + value;
          continue;
        }
        if(label === 'Author' || label === 'Authors' || label === 'Translated by') {
          var authors = value.split(',');
          for(var aj=0; aj<authors.length; ++aj) {
            s += ' | author'+nauthors+'=' + authors[aj];
            if(label==='Translated by') { s+=' (transl.)'; }
            ++nauthors;
          }
          continue;
        }
        if(label === 'Compiled by' || label === 'Editor' || label === 'Editors') {
          var editors = value.split(',');
          for(var ej=0; ej<editors.length; ++ej) {
            s += ' | editor'+neditors+'-last='+editors[ej];
            ++neditors;
          }
          continue;
        }
        if(label === 'Edition') {
          s += ' | edition='+value;
          continue;
        }
        if(label === 'Publisher') {
          var year = value.match(/\d+$/); //A trailing sequence of digits
          if(year !== null) {
            s = ' | year='+year[0] + s;
            s += ' | publisher='+value.substring(0,value.length-year[0].length-2); //2 is for ', '
          } else {
            s += ' | publisher='+value;
          }
          continue;
        }
        if(label === 'Published') {
          var pyear = value.match(/\d+$/);
          if(pyear !== null) {
            s = ' | year='+pyear[0] + s;
          }
          continue;
        }
        if(label === 'ISBN') {
          var isbn = value.match(/\d+$/); //A trailing sequence of digits
          if(isbn===null || isbn.length<1) {
            alert('No match for trailing ISBN in "'+value+'".');
          } else {
            s += ' | isbn='+isbn[0];
          }
          continue;
        }
        if(label.startsWith('Original from') || label.startsWith('Digitized') ||
           label.startsWith('Length') || label.startsWith('Subjects') ||
           label.startsWith('Item notes')) {
          continue;
        }
        alert('Don\'t know what to do with "'+label+'"');
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
      console.log('Getting info from '+book);
      do_doc(book, function(doc) {
          var info = infoFromBook(doc);
          showCitationFromInfo(info, u);
        });
    }

    //Add link in title div that says 'Generate citation'
    function add_link() {
      //var topBarRight = document.getElementById("r_toolbar").parentNode;
      var bar = document.getElementById('volumebartable');
      var link = document.createElement('a');
      link.href = 'show://a-citation-for-this-book';
      link.innerHTML = '[Show citation]';
      var showcitation = function(event) {
        event.stopPropagation();
        event.preventDefault();
        showCitationFromPage();
      };
      link.addEventListener('click', showcitation, false);
      var lp = document.createElement('td');
      lp.appendChild(link);
      //topBarRight.appendChild(lp);
      bar.childNodes[0].childNodes[0].appendChild(lp);
    }
    add_link();

    // gm_registerMenuCommand('Generate citation', function() { alert(citation()); });
  }();
 }
