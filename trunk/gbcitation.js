// ==UserScript==
// @name          Citation wikitext generator
// @description   Generates {{citation}} wiki markup from Google Books links
// @namespace     http://code.google.com/p/random-code/
// @require       http://ecmanaut.googlecode.com/svn/trunk/lib/gm/wget.js
// @require       http://www.json.org/json2.js
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

  Notes
  =====
  It is essentially screen-scraping. Very likely it will not work.

  Changelog:
  2009-03-15 Start writing.
*/

if(!this.gbcitation && window===window.top) {
  var gbcitation = function () {

    //Perform func on the document at url
    function do_doc_iframe(url, func) {
      if(url == document.location.href) { func(document); return; }
      var iframe = document.createElement('iframe');
      // iframe.width = iframe.height = 0;
      // iframe.style.visibility = 'hidden';
      // iframe.style.opacity = '0'; //Redundant?

      //iframe.style.display = 'none';
      iframe.src = url;
      iframe.addEventListener('load', function(){
          //gm_log('Loaded iframe.');
          func(iframe.contentDocument);
          // iframe.src = '';
          // iframe.contentWindow.close(); // may not be needed but may help.
          // document.removeChild(iframe);
        }, false);

      /*If debugging
      iframe.width = 400;
      iframe.height = 100;
      document.body.insertBefore(iframe, document.body.firstChild);
      */
      document.body.appendChild(iframe);
    }

    function createFragment(s) {
      var node = document.createElement('div');
      //var range = document.createRange();
      //range.setStartAfter(document.body);
      //node.appendChild(range.createContextualFragment(s));
      node.innerHTML = s;
      return node;
    }

    function do_doc_xmlhttp(url, func) {
      if(url == document.location.href) { func(document); return; }
      gm_xmlhttpRequest({
        method : 'GET',
            url: url,
            onload: function(res) {
            var docfrag = createFragment(res.responseText);
            func(docfrag);
          }
        });
    }

    String.prototype.startsWith = function(str) {
      return (this.indexOf(str) === 0);
    };

    //JSLint thinks function names starting with uppercase are constructors
    //var gm_log=GM_log, gm_setValue=GM_setValue, gm_getValue=GM_getValue;
    //var gm_registerMenuCommand=GM_registerMenuCommand, gm_xmlhttpRequest=GM_xmlhttpRequest;
    //var do_doc = wget;
    var do_doc = do_doc_iframe;

    function infoFromBook(doc) {
      var tdiv = doc.getElementsByClassName('bookinfo_sectionwrap')[0];
      var pieces = tdiv.childNodes;
      var n = pieces.length;
      var s = '';
      for(var i=0; i<n; ++i) {
        var p = pieces[i];
        if(p.className=='bookinfo_section_line book_title_line') {
          s += ' | title='+p.innerHTML;
          continue;
        }
        var t = p.innerHTML;
        if(t.startsWith('By')) {
          var authors = t.substr(3).split(',');
          if(authors.length===1) {
            s += ' | author='+authors[0];
          } else {
            for(var aj=0; aj<authors.length; ++aj) {
              s += ' | author'+(aj+1)+'='+authors[aj];
            }
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
        var re = /(\d+) pages/i;
        var pages = t.match(re);
        if(pages!==null) {
          if(pages.length<2) { alert('Too short match: '+pages[0]+' only.'); }
          //s += ' | pages='+pages[1];
          continue;
        }
        alert('Don\'t know what to do with "'+t+'"');
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

//     gm_registerMenuCommand('Generate citation', function() { alert(citation()); });

  }();
 }
