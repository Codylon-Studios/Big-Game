const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 600
canvas.height = 700
const socket = io();
c.fillStyle = "#ff9966"
c.fillRect(0, 0, 200, 300)
console.log("I'm working");

socket.on('updtplayer', (accounts) =>{
    console.log(accounts);
})