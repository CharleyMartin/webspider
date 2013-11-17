'use strict';
 
/**
* Web Scraper
*/
// Instead of the default console.log, you could use your own augmented console.log !
var oldLog = console.log;
console.log = function()
{
  var tab = Array.prototype.slice.call(arguments)
  tab.unshift(new Date().toString())
  oldLog.apply(console, tab)
}

var arg = process.argv;
var links = [];
var fs = require('fs');
 
// Url regexp from http://daringfireball.net/2010/07/improved_regex_for_matching_urls
var EXTRACT_URL_REG = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
var PORT = 3000;
 
var request = require('request');
 

// You should (okay: could) use your OWN implementation here!
var EventEmitter = require('events').EventEmitter;
 
// We create a global EventEmitter (Mediator pattern: http://en.wikipedia.org/wiki/Mediator_pattern )
var em = new EventEmitter();
 
/**
* Remainder:
* queue.push("http://..."); // add an element at the end of the queue
* queue.shift(); // remove and get the first element of the queue (return `undefined` if the queue is empty)
*
* // It may be a good idea to encapsulate queue inside its own class/module and require it with:
* var queue = require('./queue');
*/
var queue = [];
 
/**
* Get the page from `page_url`
* @param {String} page_url String page url to get
*
* `get_page` will emit
*/
function get_page(page_url){
  em.emit('page:scraping', page_url);
 
// See: https://github.com/mikeal/request
  request({
    url:page_url,
  }, function(error, http_client_response, html_str){
 
    if(error){
      em.emit('page:error', page_url, error);
      return;
    }
 
    em.emit('page', page_url, html_str);
  });
}
 
/**
* Extract links from the web pagr
* @param {String} html_str String that represents the HTML page
*
* `extract_links` should emit an `link(` event each
*/
function extract_links(page_url, html_str){
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
  // "match" can return "null" instead of an array of url
  // So here I do "(match() || []) in order to always work on an array (and yes, that's another pattern).
  (html_str.match(EXTRACT_URL_REG) || []).forEach(function(url){
    // see: http://nodejs.org/api/all.html#all_emitter_emit_event_arg1_arg2
    // Here you could improve the code in order to:
    // - check if we already crawled this url
    // - ...
    em.emit('url', page_url, html_str, url);
  });
 
}
 
function handle_new_url(from_page_url, from_page_str, url){
  // Add the url to the queue
  queue.push(url);
 
  // ... and may be do other things like saving it to a database
  // in order to then provide a Web UI to request the data (or monitoring the scraper maybe ?)
  // You'll want to use `express` to do so
}
 
 
em.on('page:scraping', function(page_url){
  console.log('Loading... ', page_url);
});
 
// Listen to events, see: http://nodejs.org/api/all.html#all_emitter_on_event_listener
em.on('page', function(page_url, html_str){
  //links.push(page_url);
  //console.log('We got a new page!', page_url);
  //fs.writeFile('BDD.txt',page_url,function(err){if(err) throw err},{'flags':'a+'});
  fs.appendFileSync('BDD.txt',page_url+"\n","UTF-8",{'flags':'a+'});
});
 
em.on('page:error', function(page_url, error){
  console.error('Oops an error occured on', page_url, ' : ', error);
});
 
em.on('page', extract_links);
 
em.on('url', function(page_url, html_str, url){
  //links.push(url);
  //console.log('We got a link! ', url);
  fs.appendFileSync('BDD.txt',url+"\n","UTF-8",{'flags':'a+'});
});
 
em.on('url', handle_new_url);
 
 
// A simple (non-REST) API
// You may (should) want to improve it in order to provide a real-GUI for:
// - adding/removing urls to scrape
// - monitoring the crawler state
// - providing statistics like
// - a word-cloud of the 100 most used word on the web
// - the top 100 domain name your crawler has see
// - the average number of link by page on the web
// - the most used top-level-domain (TLD: http://en.wikipedia.org/wiki/Top-level_domain )

var api = require('./api');
api.listen(PORT, get_page, queue);

console.log('Web UI Listening on port '+PORT);
 
// #debug Start the crawler with a link

//get_page(arg[2]);
console.log(this);
