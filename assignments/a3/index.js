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

const cats = ["Abyssinian", "American-Bobtail", "American-Curl", "American-Shorthair", "American-Wirehair",
              "Balinese-Javanese", "Bengal", "Birman", "Bombay", "British-Shorthair", "Burmese", "Chartreux",
              "Cornish-Rex", "Devon-Rex", "Egyptian-Mau", "European-Burmese", "Exotic-Shorthair",
              "Havana-Brown", "Himalayan", "Japanese-Bobtail", "Korat", "LaPerm", "Maine-Coon", "Manx",
              "Norwegian-Forest", "Ocicat", "Oriental", "Persian", "Peterbald", "Pixiebob", "Ragamuffin",
              "Ragdoll", "Russian-Blue", "Savannah", "Scottish-Fold", "Selkirk-Rex", "Siamese", "Siberian",
              "Singapura", "Somali", "Sphynx", "Tonkinese", "Toyger", "Turkish-Angora", "Turkish-Van"];

let users = [];

let messages = [];

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  let randColor = colors[Math.floor(Math.random() * colors.length)];
  let randCat = cats[Math.floor(Math.random() * cats.length)];
  let name = randColor + "-" + randCat;

  let hexchars = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += hexchars[Math.floor(Math.random() * 16)];
  }

  socket.on('send cookie', function(cookie){
    var cookieName = cookie.replace(/(?:(?:^|.*;\s*)name\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if(cookieName != "" && !(users.includes(cookieName))){
      name = cookieName;
    }
    socket.emit('user welcome', name, color);
    socket.emit('get messages', messages);

    users.push(name);
    io.emit('update users', users);
  });

  socket.on('chat message', function(msg){
    if(msg.length > 0){
      if(msg[0] == '/'){
        var command = msg.split(" ");
        if(command[0] == '/nick'){
          if (command.length != 2){
            socket.emit('error message', 'Error: invalid number of arguments provided, use format /nick <new-nickname>');
          } else {
            if(users.includes(command[1])){
              socket.emit('error message', 'Error: that username is already taken, please choose another name');
            } else {
              users.splice( users.indexOf(name), 1 );
              name = command[1];
              users.push(name);
              socket.emit('user welcome', name, color);
              io.emit('update users', users);
            }
          }
        } else if(command[0] == '/nickcolor'){
          if(command.length != 2 || command[1].length != 6){
            socket.emit('error message', 'Error: invalid number of arguments provided, use format /nickcolor RRGGBB');
          } else {
            let checkchar = true;
            let hexnum = command[1].toUpperCase();
            for(let i = 0; i < hexnum.length; i++){
              checkchar = hexchars.includes(hexnum[i]);
              if(checkchar == false) {
                break;
              }
            }
            if(checkchar == false) {
              socket.emit('error message', 'Error: please enter a valid hexidecimal number');
            } else {
              color = '#' + hexnum;
            }
          }
        } else {
          socket.emit('error message', 'Error: invalid command');
        }
      } else {
        let date = new Date();
        let messageinfo = {
            date : date,
            name : name,
            message : msg,
            color: color
        }
        messages.push(messageinfo);
        io.emit('chat message', msg, date, name, color);
      }
    } else {
      socket.emit('error message', 'Error: please enter a message');
    }
  });

  socket.on('disconnect', function(){
    users.splice( users.indexOf(name), 1 );
    io.emit('update users', users);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
