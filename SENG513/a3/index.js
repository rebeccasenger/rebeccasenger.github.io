var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const colors = ["Amaranth", "Amber", "Amethyst", "Azure", "Beige", "Black", "Blue", "Blush", "Bronze", "Brown",
              "Burgundy", "Carmine", "Cerulean", "Champagne", "Copper", "Coral", "Crimson", "Cyan", "Emerald",
              "Gold", "Gray", "Green", "Indigo", "Ivory", "Jade", "Lavender", "Lemon", "Lilac", "Lime", "Magenta",
              "Maroon", "Mauve", "Ochre", "Olive", "Orange", "Orchid", "Peach", "Pear", "Periwinkle", "Pink",
              "Plum", "Puce", "Purple", "Raspberry", "Red", "Rose", "Ruby", "Salmon", "Sangria", "Sapphire",
              "Scarlet", "Silver", "Tan", "Taupe", "Teal", "Turquoise", "Ultramarine", "Violet", "Viridian",
              "White", "Yellow"];

const cats = ["Abyssinian", "American Bobtail", "American Curl", "American Shorthair", "American Wirehair",
              "Balinese-Javanese", "Bengal", "Birman", "Bombay", "British Shorthair", "Burmese", "Chartreux",
              "Cornish Rex", "Devon Rex", "Egyptian Mau", "European Burmese", "Exotic Shorthair",
              "Havana Brown", "Himalayan", "Japanese Bobtail", "Korat", "LaPerm", "Maine Coon", "Manx",
              "Norwegian Forest", "Ocicat", "Oriental", "Persian", "Peterbald", "Pixiebob", "Ragamuffin",
              "Ragdoll", "Russian Blue", "Savannah", "Scottish Fold", "Selkirk Rex", "Siamese", "Siberian",
              "Singapura", "Somali", "Sphynx", "Tonkinese", "Toyger", "Turkish Angora", "Tturkish Van"];

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  let randColor = Math.floor(Math.random() * colors.length);
  let randCat = Math.floor(Math.random() * cats.length);
  let name = colors[randColor] + " " + cats[randCat];

  socket.emit('user welcome', name);

  io.emit('user connection', name);
  socket.on('chat message', function(msg){
    let date = new Date();
    io.emit('chat message', msg, date, name);
  });

  socket.on('disconnect', function(){
    io.emit('user disconnection', name);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
