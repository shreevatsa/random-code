// ==UserScript==
// @name          Remove access keys
// @namespace     http://code.google.com/p/random-code/
// ==/UserScript==
//

/*
  From http://userscripts.org/scripts/show/18306 by zzo38:
  http://zzo38computer.cjb.net/userjs/
  I just changed the keys.
*/

r=document.evaluate("//*[@accesskey]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
for(i=0;i<r.snapshotLength;i++) {
  item=r.snapshotItem(i);
  k=item.getAttribute("accesskey");
  if(k.match(/^[fbaenpdk]$/i)) item.removeAttribute("accesskey");
}
