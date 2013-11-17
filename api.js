exports.listen= function(port, get_page, queue)
{
  // See: http://expressjs.com/guide.html
  var express = require('express');
  var app = express();
 
  //fonction appelée sur http://127.0.0.1:3000
  app.get('/', function(req, res){
    res.sendfile("pageType.html");
  });
  //fonction appelée sur http://127.0.0.1:3000/queue/size
  app.get('/queue/size', function(req, res){
    res.setHeader('Content-Type', 'text/plain');
    res.json(200, {queue:{length:queue.length}});
  });
 //fonction appelée sur http://127.0.0.1:3000/queue/add
  app.get('/queue/add', function(req, res){
    var url = req.param('url');
    while(queue.length>0){queue.pop();}//empty the queue before the next search
    get_page(url);
    res.json(200, {
      queue:{
        added:url,
        length:queue.length,
      }
    });
  });
 
  app.get('/queue/list', function(req, res){
    res.json(200, {
      queue:{
        length:queue.length,
        urls:queue
      }
    });
  });

  app.get('/stats/linkscount', function(req, res){
    var fs = require('fs');
    var data=(String)(fs.readFileSync('./BDD.txt')).split('\n');
    res.setHeader('Content-Type', 'text/plain');
    res.json(200, {length: data.length});
  });

  app.listen(port);
}
