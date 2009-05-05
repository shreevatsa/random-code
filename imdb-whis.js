// ==UserScript==
// @name          IMDB "Where Have I Seen" tool
// @description   Shows you what roles someone has had in movies you've seen
// @namespace     http://shreevatsa.wordpress.com/2008/08/09/where-have-i-seen/
// @require       http://www.json.org/json2.js
// @require       http://ecmanaut.googlecode.com/svn/trunk/lib/gm/wget.js
// @include       http://imdb.com/title/*
// @include       http://*.imdb.com/title/*
// @include       http://imdb.com/name/*
// @include       http://*.imdb.com/name/*
// @include	  http://www.imdb.com/chart/*
// ==/UserScript==
//
// Copyright (c) 2008, Shreevatsa R.
// Released under the GNU GPL: http://www.gnu.org/copyleft/gpl.html
//
/*
  When you are looking at the cast listing of a movie you haven't
  seen, you don't care about all its actors; you only care about those
  who are "known" to you, and yet not familiar: actors you have seen
  in some other movie. Similarly, when you're looking at an actor's
  filmography, you don't care about all her movies, you only care
  about the ones you've seen.

  This script addresses the above use case, by doing two things:

  (i) For a cast listing, showing next to each actor other movies
  you've seen that actor in.

  (ii) Keeping track of which movies you've seen, by highlighting
  links to them wherever they occur, and making it easy to add movies
  to the list (using a [+] link next to any movie you haven't seen).

  Screenshots: http://shreevatsa.wordpress.com/2008/08/09/where-have-i-seen/

  Notes
  =====

  * This script keeps track of the seen movies in its own table (an
  about:config preference), not online on IMDB. It's a good idea to
  backup the list occasionally; click on "Show seen movies" in "User
  script commands", hit Ctrl-A, and copy to a file.
  I plan to make it backup to IMDB's "My movies" in a future revision.

  * For each cast listing, it actually visits each actor's page to
  find all his movies. Not only can this be slow if you're on a slow
  connection, it might also be considered too much strain on IMDb's
  servers. Use with discretion.

  Changelog:
  2008-08-25 First upload
  2008-08-26 Removed cruft, switched to external "wget" library
  2008-08-28 Turns out script didn't actually work for new users (sorry!), but 47 people installed it anyway :D Fixed now.
*/

if(!this.imdbwhis && window===window.top) {
  imdbwhis = function () {
    //JSLint thinks function names starting with uppercase are constructors
    var gm_log=GM_log, gm_setValue=GM_setValue, gm_getValue=GM_getValue;
    var gm_registerMenuCommand=GM_registerMenuCommand, gm_xmlhttpRequest=GM_xmlhttpRequest;
    var do_doc = wget;
    var my_movies = gm_getValue('my_movies');
    if(my_movies == undefined) my_movies='{}';
    my_movies =  JSON.parse(my_movies);

    //Take a page with a "cast" in it, and work on each cast row.
    function fiddle_castpage(tt) {
      var castrows = document.getElementsByClassName('cast')[0].getElementsByTagName('tbody')[0].childNodes || [];
      for(var i=0; i<castrows.length; ++i) {
        fiddle_castrow(castrows[i], tt);
        //What does this have to do with Cuba, anyway?
      }
    }

    //For a cast row, get actor name, and change accordingly
    function fiddle_castrow(crow, tt) {
      if(!(crow.getElementsByClassName && crow.getElementsByClassName('nm').length)) { return; }
      var a = crow.getElementsByClassName('nm')[0].getElementsByTagName('a')[0];
      do_doc('http://www.imdb.com' + a.pathname.substr(0,15) + '/', function(doc) { crow.appendChild(seen_filmography(doc, tt)); });
    }

    //Return a div with a list of seen films in the actor's filmography
    function seen_filmography(doc, excepttt) {
      var type = '';
      if(doc.getElementsByName('actor').length) { type = 'actor'; }
      else if(doc.getElementsByName('actress').length) { type = 'actress'; }
      if(!type) { return; }

      var ret = document.createElement('div');
      var ul = document.createElement('ul');
      var movies = doc.getElementsByName(type)[0].parentNode.parentNode.lastChild.childNodes;
      for(var i=0; i<movies.length; ++i) {
        var as = movies[i].getElementsByTagName('a');
        var someseen = false;
        for(var j=0; j<as.length; ++j) { var tt=get_tt(as[j].pathname); if(tt!==excepttt && seen_movie(tt)){someseen = true;} }
        if(someseen) { ul.appendChild(movies[i].cloneNode(true)); }
      }
      ret.appendChild(ul);
      return ret;
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
        link.innerHTML = '[\u2713]';
      };
      link.addEventListener('click', onclick, false);
      a.parentNode.insertBefore(link, a.nextSibling);
    }

    function highlight(a) {
      a.style.fontWeight = 'bold';
      a.style.color = 'green';
    }

    //Parse tt[num]/ from a string
    function get_tt(s) {
      var matches = s.match(/tt(\d+)\/$/) || s.match(/tt(\d+)\/fullcredits/);
      if(matches && matches.length > 1) { return matches[1]; }
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

    function seen_movie(tt) { return my_movies[tt]!==undefined; }

    // ---------- "main" ----------

    modify_links();
    modify_title();

    if(document.getElementsByClassName('cast').length) {
      var tt = get_tt(document.location.pathname);
      if(tt) { fiddle_castpage(tt); }
    }

    gm_registerMenuCommand('Show seen movies', function() { alert(JSON.stringify(my_movies, null, 1)); }, 'S', 'shift control');

  }();
 }
