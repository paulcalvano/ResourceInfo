/* 
  resourceInfo.js
  Author: Paul Calvano
  Description: 
  	This javaScript will retrieve resource timings from the ResourceTiming API as well as additional information
  	from the DOM and output it to a table in the Chrome browser's JavaScript console.
  	
  	The set of metrics provided are:
  		- (index)			: The URL for the Resource
			- num					: A numerical index
  		- cached			:	A YES/NO indicator of whether the resource was served from the browser cache.   This is set to YES if the resource timing duration = 0ms.
  		- dns					:	DNS Lookup Time
  		- tcp_connect	:	Time it took to establish a TCP Connection
  		- redirect		: Redirect time
  		- firstByte		: First Byte Time
  		- duration		: Response Time for resource
  		- tagName			: The type of HTML tag that loaded the resource
  		- outerHTML		: The HTML that loaded the resource
  		- v						: If the element is an image, is it visible?

	Usage:
			1) Navigate to a page in Chrome
			2) Open the JavaScript Console
			3) Paste the following to execute this script:
			
			var script= document.createElement('script');script.type='text/javascript';script.src='https://cdn.rawgit.com/pcal79/ResourceInfo/master/resourceInfo.js'; document.head.appendChild(script);
			
			You can also copy and paste the entire script to the JavaScript console to execute it.

*/


// Function to populate Resource Timing Statistics
function Resource(num, cached, dns, tcp_connect, redirect, firstByte, duration) {
	this.num = num;
  this.cached = cached;
	this.dns = Number(dns);
  this.tcp_connect = Number(tcp_connect);
  this.redirect = Number(redirect);
  this.firstByte = Number(firstByte);
  this.duration = Number(duration);

}

// Function to determine if a DOM element is visbible.  From https://github.com/UseAllFive/true-visibility
Element.prototype.isVisible = function() {
 
    'use strict';
 
    /**
     * Checks if a DOM element is visible. Takes into
     * consideration its parents and overflow.
     *
     * @param (el)      the DOM element to check if is visible
     *
     * These params are optional that are sent in recursively,
     * you typically won't use these:
     *
     * @param (t)       Top corner position number
     * @param (r)       Right corner position number
     * @param (b)       Bottom corner position number
     * @param (l)       Left corner position number
     * @param (w)       Element width number
     * @param (h)       Element height number
     */
    function _isVisible(el, t, r, b, l, w, h) {
        var p = el.parentNode,
                VISIBLE_PADDING = 2;
 
        if ( !_elementInDocument(el) ) {
            return false;
        }
 
        //-- Return true for document node
        if ( 9 === p.nodeType ) {
            return true;
        }
 
        //-- Return false if our element is invisible
        if (
             '0' === _getStyle(el, 'opacity') ||
             'none' === _getStyle(el, 'display') ||
             'hidden' === _getStyle(el, 'visibility')
        ) {
            return false;
        }
 
        if (
            'undefined' === typeof(t) ||
            'undefined' === typeof(r) ||
            'undefined' === typeof(b) ||
            'undefined' === typeof(l) ||
            'undefined' === typeof(w) ||
            'undefined' === typeof(h)
        ) {
            t = el.offsetTop;
            l = el.offsetLeft;
            b = t + el.offsetHeight;
            r = l + el.offsetWidth;
            w = el.offsetWidth;
            h = el.offsetHeight;
        }
        //-- If we have a parent, let's continue:
        if ( p ) {
            //-- Check if the parent can hide its children.
            if ( ('hidden' === _getStyle(p, 'overflow') || 'scroll' === _getStyle(p, 'overflow')) ) {
                //-- Only check if the offset is different for the parent
                if (
                    //-- If the target element is to the right of the parent elm
                    l + VISIBLE_PADDING > p.offsetWidth + p.scrollLeft ||
                    //-- If the target element is to the left of the parent elm
                    l + w - VISIBLE_PADDING < p.scrollLeft ||
                    //-- If the target element is under the parent elm
                    t + VISIBLE_PADDING > p.offsetHeight + p.scrollTop ||
                    //-- If the target element is above the parent elm
                    t + h - VISIBLE_PADDING < p.scrollTop
                ) {
                    //-- Our target element is out of bounds:
                    return false;
                }
            }
            //-- Add the offset parent's left/top coords to our element's offset:
            if ( el.offsetParent === p ) {
                l += p.offsetLeft;
                t += p.offsetTop;
            }
            //-- Let's recursively check upwards:
            return _isVisible(p, t, r, b, l, w, h);
        }
        return true;
    }
 
    //-- Cross browser method to get style properties:
    function _getStyle(el, property) {
        if ( window.getComputedStyle ) {
            return document.defaultView.getComputedStyle(el,null)[property];
        }
        if ( el.currentStyle ) {
            return el.currentStyle[property];
        }
    }
 
    function _elementInDocument(element) {
        while (element = element.parentNode) {
            if (element == document) {
                    return true;
            }
        }
        return false;
    }
 
    return _isVisible(this);
 
};

//  Function to Add additional information from DOM to the Resource Array
function AddToResourceFromDOM(attribute) {
	curClass =elements[i].getAttribute(attribute);
	if(curClass != null){
	        curClass = curClass.split(" ");
	        for( j=0; j < curClass.length; j++){       	
	        			// Attempt to format as absolute URL to get a better match with Resource Timing data... 
	        			url=curClass[j];
	        			if (url.indexOf("http") != 0 && url.indexOf("//") != 0) {
	        				if (url.indexOf("/") != 0) {
	        					url = host + "/" + url;
	        					} else {
	        					url = host + url;
	        					}
	        			}
								// If the URL we identified in the DOM had an entry in the ResourceTiming array, then collect some additional info from the DOM.
								if(resources[url]) {									
									resources[url].tagName = elements[i].tagName
									resources[url].outerHTML = elements[i].outerHTML;
									if (elements[i].tagName == "IMG") {
										resources[url].v = elements[i].isVisible(elements[i]);;
									}
								}
	        }
			}
}

function htmlEncode( html ) {
    return document.createElement( 'a' ).appendChild( 
        document.createTextNode( html ) ).parentNode.innerHTML;
};

// Get  Resource Timings.
var resourceList = window.performance.getEntriesByType("resource");
var resources = {};

// Loop through ResourceTiming data and populate the resources[] array. 
for (i= 0; i < resourceList.length; i++){
	num=i+1;
	cached=(resourceList[i].duration <= 0.0 ? "YES" : "NO");  //  If asset takes 0ms to download, assume it came from the browser cache.
	dns = parseFloat(resourceList[i].domainLookupEnd - resourceList[i].domainLookupEnd).toFixed(0);
	tcp_connect = parseFloat(resourceList[i].connectEnd - resourceList[i].connectStart).toFixed(0);
	redirect = parseFloat(resourceList[i].redirectEnd - resourceList[i].redirectStart).toFixed(0);
	firstByte = parseFloat(resourceList[i].responseStart - resourceList[i].requestStart).toFixed(0);
	duration = parseFloat(resourceList[i].duration).toFixed(0);
	resources[resourceList[i].name]= new Resource(num, cached, dns, tcp_connect, redirect, firstByte, duration);
}




// Determine base hostname with protocol, for use when DOM elements contain relative URIs
var http = location.protocol;	  
var slashes = http.concat("//");
var host = slashes.concat(window.location.hostname);


// Get a list of all the DOM elements and loop through them..
elements = document.getElementsByTagName('*');
for( i=0; i < elements.length; i++ ){
		// If a DOM element contains a SRC or HREF attribute, attempt to match it up to the Resource Timing array 
    AddToResourceFromDOM("src");
    AddToResourceFromDOM("href");
}

// Output eveything to a table in the JavaScript console.
 console.log("Resource Overview for: " + window.location); 
 console.table(resources, ["num", "cached", "dns", "tcp_connect", "redirect", "firstByte", "duration", "tagName", "v", "outerHTML"]);

var tbl = "<table><tr><th>Num</th><th>URL</th><th>cached</th><th>dns</th><th>tcp_connect</th><th>redirect</th><th>firstByte</th><th>duration</th><th>tagName</th><th>visible</th><th>outerHTML</th></tr>";
for (var key in resources) {

	tbl = tbl + "<tr>";
	tbl = tbl + "<td>" + resources[key]['num'] + "</td>";
	tbl = tbl + "<td>" + htmlEncode(key) + "</td>";
	tbl = tbl + "<td>" + resources[key]['cached'] + "</td>";
	tbl = tbl + "<td>" + resources[key]['dns'] + "</td>";
	tbl = tbl + "<td>" + resources[key]['tcp_connect'] + "</td>";
	tbl = tbl + "<td>" + resources[key]['redirect'] + "</td>";
	tbl = tbl + "<td>" + resources[key]['firstByte'] + "</td>";
	tbl = tbl + "<td>" + resources[key]['duration'] + "</td>";
	tbl = tbl + "<td>" + htmlEncode(resources[key]['tagName']) + "</td>";
	tbl = tbl + "<td>" + htmlEncode(resources[key]['v']) + "</td>";
	tbl = tbl + "<td>" + htmlEncode(resources[key]['outerHTML']) + "</td>";
	tbl = tbl + "</tr>";

}

window.open('data:application/vnd.ms-excel,' + escape(tbl));
