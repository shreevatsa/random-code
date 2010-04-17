// ==UserScript==
// @name          Citation wikitext generator for Archive.org
// @description   Generates {{citation}} wiki markup from archive.org links
// @namespace     http://code.google.com/p/random-code/
// @require       http://ecmanaut.googlecode.com/svn/trunk/lib/gm/wget.js
// @include       http://www.archive.org/details/*
// ==/UserScript==
//
// Copyright (c) 2010, Shreevatsa R.
// Released under the GNU GPL: http://www.gnu.org/copyleft/gpl.html
// either version 2 or (at your option) any later version.

/*
  From an archive.org link, generates wiki markup in the
  {{citation|...}} format, suitable for inclusion on Wikipedia:
  http://en.wikipedia.org/wiki/Template:Citation

  For example, when at the URL:
  http://www.archive.org/details/womenseyesbeingv00ryderich
  you can click "Show citation" to get


  which is in the right format for Wikipedia, more or less.

  Based on my earlier script http://userscripts.org/scripts/show/44314
  for Google Books.

  Notes
  =====
  Suggestions for improvement are very much welcome!

  Changelog:
  2010-04-16 First version
*/

if(!this.iacitation && window === window.top) {
  var iacitation = function () {

    function do_doc(url, func) { wget(url, func, /*runGM=*/false, /*div=*/false); }
    function assert(cond, str) { if (!cond) { throw new Error('Assertion failed: ' + str); } }
    String.prototype.startsWith = function(str) { return (this.indexOf(str) === 0); };

    function infoFromBook() {
      var s = '';
      var nauthors=1;
      var neditors=1;

      var bar = document.getElementById('col1');
      var pcontent = bar.nextElementSibling.firstElementChild.firstElementChild.nextElementSibling;
      var nodes= pcontent.childNodes;
      var ret = ' | title = ' + pcontent.previousElementSibling.textContent;
      for(var ti=0; ti<nodes.length; ++ti) {
        if(nodes[ti].className!=='key') { continue; }
        var key = nodes[ti].textContent; key = key.substr(0, key.length - 1);
        while(nodes[ti].className!=='value') { ++ti; }
        var value = nodes[ti].textContent;
        key = key[0].toLowerCase() + key.substr(1);
        if(key !== 'Subject' &&
           key !== 'Possible copyright status' &&
           key !== 'Language' &&
           key !== 'Call number' &&
           key !== 'Digitizing sponsor' &&
           key !== 'Book contributor' &&
           key !== 'Collection' &&
           key !== 'Scanfactors') {
          ret += ' | ' + key + '=' + value;
        }
      }
      console.log('Returning ' + ret);
      return ret;
    }

    function showCitationFromInfo(info, url) {
      //alert('Looking for citation from info '+info+url);
      var s = '{{citation';
      s += info;
      /*
      var pg = url.match(/&pg=PA(\d+)/i);
      if (pg!==null) {
        if(pg.length<2) { alert('Too short match in pg: '+pg[0]+' only.'); }
        s += ' | page='+pg[1];
      } else {
        if (url.match(/&pg=/i)!==null) {
          alert('Page number is not PAsomething.');
        }
      }
      */
      s += ' | url=' + url + '}}';
      alert(s);
    }

    function showCitationFromPage() {
      var u = location.href; //cleanURI();//location.href;
      var book = u.split('&')[0];
      GM_log('Getting info from '+book);
      /*
      do_doc(book, function(doc) {
          var info = infoFromBook(doc);
          showCitationFromInfo(info, u);
        });
      */
      var info = infoFromBook();
      showCitationFromInfo(info, u);
    }

    function cleanURI() {
      var o = location.href; var hash = o.indexOf('#');
      if(hash > -1) { o = o.substr(0,hash); }
      var q = o.indexOf('?'), prefix = o.substr(0,q+1), u = o.substr(q+1), nu='';
      var parts = u.split('&');
      for(var i=0; i<parts.length; ++i) {
        var [p, v, e] = parts[i].split('='); assert(typeof e === 'undefined');
        GM_log(p + ' is ' + v);
        if(p!=='hl' &&               //language of the interface
           p!=='ei' &&               //Some user-specific (cookie-specific?) constant
           p!=='ots' && p!=='sig' && //Similar long sigs, don't know what
           p!=='source' &&           //how you got there: gbs_hpintrst, bl(?) etc.
           p!=='lr' &&               //restrict searches to a language
           p!=='as_brr' &&           //as_brr=3 restricts to books with preview
           p!=='printsec' &&         //e.g. printsec=frontcover
           p!=='sa' &&               //e.g. sa=X
           p!=='oi' &&               //e.g. oi=book_result
           p!=='ct' &&               //e.g. ct=result
           p!=='resnum') {
          nu += (nu!=='' ? '&' : '')+p+'='+v;
        }
      }
      nu = prefix + nu;
      GM_log('new url is ' + nu);
      return nu;
    }

    //Add a link to the top bar
    function add_link(text, title, func) {
      var bar = document.getElementById('col1');
      var content = bar.nextElementSibling.firstElementChild.firstElementChild.nextElementSibling;
      var link = document.createElement('a');
      link.title = title;
      link.innerHTML = text;
      var dofunc = function(event) {
        event.stopPropagation();
        event.preventDefault();
        func();
      };
      link.addEventListener('click', dofunc, false);
      //var lp = document.createElement('td');
      //lp.appendChild(link);
      //bar.childNodes[0].childNodes[0].appendChild(lp);
      content.appendChild(link);
    }
    GM_log('Adding links to top bar');
    add_link('[Show citation]', 'Show a citation for this book', showCitationFromPage);
    //add_link('[Clean up link]', 'Remove useless parameters from URI', function() { location.href = cleanURI(); });

  }();
 }
