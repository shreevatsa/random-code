// ==UserScript==
// @name          IMDB "Where Have I Seen" tool
// @description   Shows you what roles someone has had in movies you've seen
// @namespace     http://shreevatsa.wordpress.com/2008/08/09/where-have-i-seen/
// @require       http://web.mit.edu/vatsa/www/json2.js
// @require       http://ecmanaut.googlecode.com/svn/trunk/lib/gm/wget.js
// @include       http://imdb.com/title/*
// @include       http://*.imdb.com/title/*
// @include       http://imdb.com/name/*
// @include       http://*.imdb.com/name/*
// @include	  http://www.imdb.com/chart/*
// @include       http://www.imdb.com/*
// @include       http://*.imdb.com/*
// ==/UserScript==
//
// Copyright (c) 2008, Shreevatsa R.
// Released under the GNU GPL: http://www.gnu.org/copyleft/gpl.html
//
/*
  Requires Firefox 3.5 or later.

  When you are looking at the cast listing of a movie, you might want
  to know which of the actors you have seen in other movies, and in
  what roles. And when looking at an actor's filmography, you might
  want your attention drawn to the movies that you've seen.

  If so, this script helps, by letting you do two things:

  (i) On a cast listing, click on "Where have I seen these actors?" to
  see next to each actor other movies you've seen that actor in.

  (ii) Keep track of which movies you've seen, by highlighting links
  to them wherever they occur, and making it easy to add movies to the
  list (using a [+] link next to any movie you haven't seen).

  Screenshots: http://shreevatsa.wordpress.com/2008/08/09/where-have-i-seen/

  Notes
  =====

  * This script keeps track of the seen movies in its own table (an
  about:config preference), not online on IMDB. It's a good idea to
  backup the list occasionally; click on "Show seen movies" in "User
  script commands", hit Ctrl-A, and copy to a file.
  I plan to make it save to IMDB's "My movies" in a future revision.

  * For each cast listing, it actually visits each actor's page to
  find all his movies. Not only can this be slow if you're on a slow
  connection, it might also be considered too much strain on IMDb's
  servers. Use with discretion.

  Changelog:
  2008-08-25 First upload
  2008-08-26 Removed cruft, switched to external "wget" library
  2008-08-28 Turns out script didn't actually work; fixed now
  2009-08-02 Make it fetch information only when asked
  2009-08-24 Show only one line from the movie listing, not all the 'aka's
  2009-10-13 Send one request per second, allow fetching just one actor
*/

"use strict";
/*jslint browser: true, onevar: false, white:false, plusplus: false */
/*global window, document, wget, GM_setValue, GM_getValue, GM_registerMenuCommand, GM_xmlhttpRequest, GM_log */

if(window===window.top) {
  (function () {
    //JSLint thinks function names starting with uppercase are constructors
    var gm_log=GM_log, gm_setValue=GM_setValue, gm_getValue=GM_getValue;
    var gm_registerMenuCommand=GM_registerMenuCommand, gm_xmlhttpRequest=GM_xmlhttpRequest;
    function assert(cond, str) { if (!cond) { throw new Error('Assertion failed: ' + str); } }
    function do_doc(url, func) { wget(url, func, /*runGM=*/false, /*div=*/true); }

    var things_to_do = [];
    function pop_queue(func) {
      if(things_to_do.length>0) {
        things_to_do.shift()();
      }
      window.setTimeout(pop_queue, 1000);
    }
    pop_queue(); //Get it going

    var my_movies = gm_getValue('my_movies');
    if(my_movies === undefined) { my_movies='{}'; }
    my_movies =  JSON.parse(my_movies);


    function seen_movie(tt) { return my_movies[tt]!==undefined; }

    //get_tt("http://www.imdb.com/title/tt0111161/fullcredits#cast") = "0111161"
    function get_tt(s) {
      var matches = s.match(/tt(\d+)\/$/) || s.match(/tt(\d+)\/fullcredits/);
      if(matches && matches.length > 1) { return matches[1]; }
    }

    //Return a div with a list of seen films, given an actor's filmography
    function seen_filmography_div(filmo, excepttt) {
      var ret = document.createElement('div');
      var ul = document.createElement('ul');
      var movies = filmo.lastChild.childNodes;
      for(var i=0; i<movies.length; ++i) {
        var as = movies[i].getElementsByTagName('a');
        var someseen = false;
        for(var j=0; j<as.length; ++j) {
          var tt=get_tt(as[j].pathname);
          if(tt && tt!==excepttt && seen_movie(tt)) { someseen = true; }
        }
        if(someseen) {
          movies[i].innerHTML = movies[i].innerHTML.replace(/<br>.*/,'');
          ul.appendChild(movies[i].cloneNode(true));
        }
      }
      ret.appendChild(ul);
      return ret;
    }

    //Return a div with a list of seen films in the actor's filmography
    function seen_filmography(doc, excepttt) {
      var type = '', filmo; //filmo = the list named 'actor' or 'actress'
      var filmos = doc.getElementsByClassName('filmo');
      for(var fi=0; fi<filmos.length; ++fi) {
        var t = filmos[fi].firstElementChild.firstElementChild.getAttribute('name');
        if(t==='actor' || t==='actress') { type = t; filmo = filmos[fi];}
      }
      if(!type) {
          return document.createTextNode('Error: Probably IMDb decided there were too many requests. Try later.');
      }
      return seen_filmography_div(filmo, excepttt);
    }

    //[When asked] For a cast row, get actor name, and add filmography accordingly
    function fiddle_castrow(crow, tt, linknode, name) {
      if(!(crow.getElementsByClassName && crow.getElementsByClassName('nm').length)) { return; }
      var a = crow.getElementsByClassName('nm')[0].getElementsByTagName('a')[0];
      things_to_do.push(function() {
          do_doc('http://www.imdb.com' + a.pathname.substr(0,15) + '/', //The page for that actor
                 function(doc) {
                   var sfo = seen_filmography(doc, tt);
                   if(sfo) { crow.appendChild(sfo); }
                   else    { crow.appendChild(doc); } //This should never happen
                   linknode.innerHTML = linknode.innerHTML.replace('['+name+']', '');
                   if(linknode.innerHTML === '<small>Getting...</small>') { linknode.innerHTML = '<small>Done</small>'; }
                 });
            });
    }

    //[When asked] Take a page with a "cast" in it, and work on each cast row.
    function fiddle_castpage(tt, linknode) {
      var castrows = document.getElementsByClassName('cast')[0].getElementsByTagName('tbody')[0].children || [];
      for(var i=0; i<castrows.length; ++i) {
        var crow = castrows[i];
        var name = '';
        try { name = crow.childNodes[1].childNodes[0].innerHTML; } catch(err) { continue; }
        linknode.innerHTML = linknode.innerHTML.replace('</small>', '['+name+']' + '</small>');
        fiddle_castrow(crow, tt, linknode, name);
        //What does this have to do with Cuba, anyway?
      }
    }

    //Add a link that will get the seen_filmography for everyone in the cast
    function add_getwhis_link() {
      var casts = document.getElementsByClassName('cast');
      if(casts.length===0) { return; }
      assert(casts.length===1, 'Just one node with class "cast"');
      var tt = get_tt(document.location.pathname);
      if(!tt) { return; }

      var getwhis = document.createElement('a');
      getwhis.href = 'see://where-you-have-seen-each-actor-in-this-cast';
      getwhis.innerHTML = '<small>Where have I seen these actors?</small>';
      var onclick = function(event) {
        getwhis.innerHTML = '<small>Getting...</small>'; event.stopPropagation(); event.preventDefault();
        fiddle_castpage(tt, getwhis);
      };
      getwhis.addEventListener('click', onclick, false);
      assert(casts[0].tagName === "TABLE");
      for(var where=casts[0]; where !== document; where=where.parentNode) {
        if(where.previousElementSibling === null) { continue; }
        if(where.previousElementSibling.children[0].innerHTML.match("Cast")) {
          where.previousElementSibling.appendChild(getwhis);
          break;
        }
      }
      //Make all the "..." into links
      var castrows = casts[0].getElementsByTagName('tbody')[0].children || [];
      for(var i=0; i<castrows.length; ++i) {
        var crow = castrows[i], name, ddd, newddd;
        try { name = crow.childNodes[1].childNodes[0].innerHTML; } catch(err) { continue; }
        try { ddd = crow.getElementsByClassName('ddd')[0].childNodes[0]; } catch(errr) { continue; }
        newddd = document.createElement('a');
        newddd.innerHTML = " ... ";
        newddd.href = "show://just-this-actor";
        newddd.addEventListener('click', (function() {
              var ccrow = crow, ctt = tt, clink=getwhis, cname=name;
              return function(event) {
                event.stopPropagation(); event.preventDefault();
                fiddle_castrow(ccrow, ctt, clink, cname);
              };
            }()), false);
        ddd.parentNode.replaceChild(newddd, ddd);
      }
    }

    function highlight(a) {
      a.style.fontWeight = 'bold';
      a.style.color = 'green';
    }

    //Add a link that says "[+]" and will add the movie to the list
    function add_addmovie_link(a, tt) {
      var link = document.createElement('a');
      link.href = 'add://this-movie-to-your-seen-list';
      link.innerHTML = '[+]';
      var onclick = function(event) {
        link.innerHTML = ' [Adding...]';
        event.stopPropagation();
        event.preventDefault();
        var url = 'http://www.imdb.com/title/tt' + tt + '/';
        do_doc(url, function(doc) {
            //The best way seems to be to get it from the photo! (Other ways will include the year, and fail on episodes.)
            my_movies[tt] = doc.getElementsByClassName('photo')[0].childNodes[1].title;
            gm_setValue('my_movies', JSON.stringify(my_movies));
            link.innerHTML = '[\u2713]';
            highlight(a);
          });
      };
      link.addEventListener('click', onclick, false);
      a.parentNode.insertBefore(link, a.nextSibling);
    }

    function add_removemovie_link(a, tt) {
      var link = document.createElement('a');
      link.href = 'remove://this-movie-from-your-seen-list';
      link.innerHTML = '[-]';
      var onclick = function(event) {
        link.innerHTML = ' [Removing...]';
        event.stopPropagation();
        event.preventDefault();
        my_movies[tt] = undefined;
        gm_setValue('my_movies', JSON.stringify(my_movies));
        link.innerHTML = '[\u2713]'; //A tick mark
      };
      link.addEventListener('click', onclick, false);
      a.parentNode.insertBefore(link, a.nextSibling);
    }


    //Highlighting "My movies" and making it easy to add them
    function modify_links() {
      var as = document.getElementsByTagName('a');
      for(var i=0; i<as.length; ++i) {
        var a = as[i];
        var tt = get_tt(a.href); if(!(tt)) { continue; }
        if(seen_movie(tt)) { highlight(a); add_removemovie_link(a,tt); }
        else { add_addmovie_link(a, tt); }
      }
    }

    function modify_title() {
      var tt = get_tt(document.location.href);
      if(!tt) { return; }
      if(!seen_movie(tt)) { return; }
      var title = document.getElementById('tn15title');
      if(title) { highlight(title); }
    }


    // ---------- "main" ----------

    modify_links();
    modify_title();
    add_getwhis_link();

    gm_registerMenuCommand('Show seen movies', function() { alert(JSON.stringify(my_movies, null, 1)); }, 'S', 'shift control');

  }());
 }
