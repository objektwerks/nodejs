Node.js + NPM
-------------
OSX - https://sites.google.com/site/nodejsmacosx/ && http://dandean.com/nodejs-npm-express-osx/
Ubuntu - http://arnolog.net/post/8424207595/installing-node-js-npm-express-mongoose-on-ubuntu

Mongo
-----
start: ~/nodespace$ nohup mongod --dbpath ./madmaxdb --rest &
stop: $ mongo
      > use admin
      > db.shutdownServer()
      > exit

MadMax
------
start: ~/nodespace/madmax$ node index 8079 192.168.101.53 || ~/nodespace/madmax$ nohup node index 8079 192.168.101.53 &
      [ Where 192.168.101.53 is the host IP ]
stop: control C 'OR' kill PID 'OR' kill -9 PID
find: ps -ax | grep node

SCP
---
scp -r nodespace/madmax mike@192.168.101.53:/home/mike/nodespace

Todo
----
Linux upstart and monit