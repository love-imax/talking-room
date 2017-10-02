var express=require('express');
var app=express();
var http=require('http').createServer(app);
var path=require('path');
var io=require('socket.io').listen(http);

app.set('views',path.join(__dirname,'views'))
app.engine('html',require('ejs').__express)
app.use(require('express').static(path.join(__dirname, 'public')));
app.set('view engine','html');

app.get('/',function(req,res){
  res.render('index',{title:'welcome to node.js'})
})

var room={};
io.on('connection',function(socket){
    var url=socket.request.headers.referer;
    var urlId=url.split('/');
    var roomId=urlId[urlId.length-1];
    var user='';
    socket.on('join',function(username){
          user=username;
          if(!room[roomId]){
            room[roomId]=[]
          };
          room[roomId].push(user);
          socket.join(roomId);
          io.to(roomId).emit('sys',user+'加入了房间',room[roomId]);
          console.log(user+'加入了'+roomId)
    });
    socket.on('leave',function(){
      socket.emit('disconnect')
    });
    socket.on('disconnect',function(){
      var index=room[roomId].indexOf(user);
      if(index!==-1){
          room[roomId].splice(index,1)
      };
      socket.leave(roomId);
      io.to(roomId).emit('sys',user+'退出了房间',room[roomId]);
      console.log(user+'退出了房间'+roomId)
    });
    socket.on('message',function(msg){
        if(room[roomId].indexOf(user)===-1){
          return false
        }
        io.to(roomId).emit('msg',user,msg)
    })
})
app.use('/room/:roomID', function (req, res) {
    var roomID = req.params.roomID;


    res.render('room', {
        roomID: roomID,
        users: room[roomID]
    });
});
http.listen(3000,function(){
    console.log("server 3000 is open")
})