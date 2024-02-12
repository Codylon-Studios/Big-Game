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
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "none";
});

document.getElementById("login-form").addEventListener("submit", (ev) => {
    // Send request to server
    ev.preventDefault();
    let url = "/login";
    let data = {username: document.getElementById("login-username").value,
                password: document.getElementById("login-password").value
               };
    $.post(url, data, function (result, status) {
        // Handle result
        console.log(status, ":", res);
    });
});

document.getElementById("register-form").addEventListener("submit", (ev) => {
    // Send request to server
    ev.preventDefault();
    let url = "/register";
    let data = {username: document.getElementById("register-username").value,
                password: document.getElementById("register-password").value,
                passwordRepeat: document.getElementById("register-password-repeat").value
               };
    $.post(url, data, function (result, status) {
        // Handle result
        if (result.includes("Username already used")) {
            console.log("Schon genutzt")
        }
        if (result.includes("Passwords dont match")) {
            console.log("Passwörter passen nicht")
        }
        if (result == "Registration successful") {
            console.log("Alles gut")
            document.getElementById("account-bg").style.visibility = "hidden";
            document.getElementById("login-form").style.display = "none";
            document.getElementById("register-form").style.display = "none";
        }
    });
});
