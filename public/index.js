var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
const socket = io();
ctx.fillStyle = 'red';
ctx.fillRect(50, 50, 100, 100);