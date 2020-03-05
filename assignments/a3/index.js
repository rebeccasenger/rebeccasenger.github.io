var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const colors = ["Amaranth", "Amber", "Amethyst", "Azure", "Black", "Blue", "Blush", "Bronze", "Brown",
              "Carmine", "Cerulean", "Champagne", "Copper", "Coral", "Crimson", "Cyan", "Emerald",
              "Gold", "Gray", "Green", "Indigo", "Lavender", "Lemon", "Lime", "Magenta",
              "Maroon", "Ochre", "Olive", "Orange", "Orchid", "Pear", "Periwinkle", "Pink",
              "Plum", "Puce", "Purple", "Raspberry", "Red", "Rose", "Ruby", "Salmon", "Sangria", "Sapphire",
              "Scarlet", "Silver", "Tan", "Taupe", "Teal", "Turquoise", "Ultramarine", "Violet",
              "White", "Yellow"];

const cats = ["Abyssinian", "American Bobtail", "American Curl", "American Shorthair", "American Wirehair",
              "Balinese-Javanese", "Bengal", "Birman", "Bombay", "British Shorthair", "Burmese", "Chartreux",
              "Cornish Rex", "Devon Rex", "Egyptian Mau", "European Burmese", "Exotic Shorthair",
              "Havana Brown", "Himalayan", "Japanese Bobtail", "Korat", "LaPerm", "Maine Coon", "Manx",
              "Norwegian Forest", "Ocicat", "Oriental", "Persian", "Peterbald", "Pixiebob", "Ragamuffin",
              "Ragdoll", "Russian Blue", "Savannah", "Scottish Fold", "Selkirk Rex", "Siamese", "Siberian",
              "Singapura", "Somali", "Sphynx", "Tonkinese", "Toyger", "Turkish Angora", "Tturkish Van"];

let users = [];

let messages = [];

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  let randColor = Math.floor(Math.random() * colors.length);
  let randCat = Math.floor(Math.random() * cats.length);
  let name = colors[randColor] + " " + cats[randCat];
  let color = colors[randColor].toLowerCase();

  socket.on('send cookie', function(cookie){
    var cookieName = cookie.replace(/(?:(?:^|.*;\s*)name\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    var cookieColor = cookie.replace(/(?:(?:^|.*;\s*)color\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if(cookieName != ""){
      name = cookieName;
    }
    if(cookieColor != ""){
      color = cookieColor;
    }

    socket.emit('user welcome', name, color);
    socket.emit('get messages', messages);

    users.push(name);
    io.emit('update users', users);
  });

  socket.on('chat message', function(msg){
    var command = msg.split(" ");
    if(command[0] == '/nick'){
      users.splice( users.indexOf(name), 1 );
      name = command[1];
      for(let i = 2; i < command.length; i++){
        name += ' ' + command[i];
      }
      users.push(name);
      socket.emit('user welcome', name, color);
      io.emit('update users', users);
    } else if(command[0] == '/nickcolor'){
      color = command[1].toLowerCase();
    }
    let date = new Date();
    let messageinfo = {
        date : date,
        name : name,
        message : msg,
        color: color
    }
    messages.push(messageinfo);
    io.emit('chat message', msg, date, name, color);
  });

  socket.on('disconnect', function(){
    users.splice( users.indexOf(name), 1 );
    io.emit('update users', users);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
