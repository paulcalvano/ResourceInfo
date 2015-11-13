This javaScript will retrieve resource timings from the ResourceTiming API as well as additional information from the DOM and output it to a table in the Chrome browser's JavaScript console.
  	
  	The set of metrics provided are:
  		- (index)			: The URL for the Resource
			- num					: A numerical index
  		- cached			:	A YES/NO indicator of whether the resource was served from the browser cache.   
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
			
var script= document.createElement('script');script.type='text/javascript';script.src='<placeholder_for_script_url>'; document.head.appendChild(script);

(You can also copy and paste the entire script to the JavaScript console to execute it.)
