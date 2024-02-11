const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const socket = io();
canvas.width = 600
canvas.height = 700
c.fillStyle = "#ff9966"
c.fillRect(0, 0, 200, 300)
console.log("I'm working");

socket.on('updtplayer', (accounts) =>{
    console.log(accounts);
})

document.getElementById("user").addEventListener("click", () => {
    document.getElementById("account-select").style.visibility = "visible";
});

window.addEventListener("click", (ev) => {
    if (ev.target != document.getElementById("user")) { // hides the dropdown if the user doesn't click on the icon
        document.getElementById("account-select").style.visibility = "hidden";
    }
});

document.getElementById("account-select-login").addEventListener("click", () => {
    document.querySelector("#account-header > span").innerHTML = "Login";
    document.getElementById("login-form").style.display = "block";
    document.getElementById("register-form").style.display = "none";
    document.getElementById("account-bg").style.visibility = "visible";
});

document.getElementById("account-select-register").addEventListener("click", () => {
    document.querySelector("#account-header > span").innerHTML = "Register";
    document.getElementById("register-form").style.display = "block";
    document.getElementById("login-form").style.display = "none";
    document.getElementById("account-bg").style.visibility = "visible";
});

document.getElementById("close").addEventListener("click", () => {
    document.getElementById("account-bg").style.visibility = "hidden";
    document.getElementById("login-form").style.display = "hidden";
    document.getElementById("register-form").style.display = "hidden";
});
