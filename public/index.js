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
    document.getElementById("login-popup-bg").style.visibility = "visible";
});

document.getElementById("account-select-register").addEventListener("click", () => {
    document.getElementById("register-popup-bg").style.visibility = "visible";
});

document.querySelectorAll(".popup-close").forEach((element) => {
    element.addEventListener("click", () => {
        document.getElementById("login-popup-bg").style.visibility = "hidden";
        document.getElementById("register-popup-bg").style.visibility = "hidden";
    });
})

document.getElementById("login-form").addEventListener("submit", (ev) => {
    // Send request to server
    ev.preventDefault();
    let url = "/login";
    let data = {username: document.getElementById("login-username").value,
                password: document.getElementById("login-password").value
               };
    let hasResponded = false;
    $.post(url, data, function (result, status) {
        hasResponded = true;
        // Handle result
        if (result == "0") {
            document.getElementById("login-popup-bg").style.visibility = "hidden";
            document.querySelectorAll("#login-form > .account-error")[0].style.display = "none";

            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "green");
            notificationBox.innerHTML = `Welcome back ${document.getElementById("login-username").value}!`;
            document.body.appendChild(notificationBox);
        }
        else if (result == "1") {
            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "red");
            notificationBox.innerHTML = `An error has occurred on the server side!`;
            document.body.appendChild(notificationBox);
        }
        else {
            document.querySelectorAll("#login-form > .account-error")[0].style.display = "block";
        }
    });
    setTimeout(() => {
        if (! hasResponded) {
            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "red");
            notificationBox.innerHTML = `The server didn't respond in time!`;
            document.body.appendChild(notificationBox);
        }
    }, 5000);
});

document.getElementById("register-form").addEventListener("submit", (ev) => {
    // Send request to server
    ev.preventDefault();
    let url = "/register";
    let data = {username: document.getElementById("register-username").value,
                password: document.getElementById("register-password").value,
                passwordRepeat: document.getElementById("register-password-repeat").value
               };
    let hasResponded = false;
    $.post(url, data, function (result, status) {
        hasResponded = true;
        // Handle result
        if (result == "0") {
            document.getElementById("register-popup-bg").style.visibility = "hidden";
            document.querySelectorAll("#register-form > .account-error")[0].style.display = "none";
            document.querySelectorAll("#register-form > .account-error")[1].style.display = "none";
            
            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "green");
            notificationBox.innerHTML = `Registered you successfully as ${document.getElementById("register-username").value}!`;
            document.body.appendChild(notificationBox);
        }
        else if (result == "1") {
            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "green");
            notificationBox.innerHTML = `An error has occurred on the server side!`;
            document.body.appendChild(notificationBox);
        }
        else {
            if (result.includes("2")) {
                document.querySelectorAll("#register-form > .account-error")[0].style.display = "block";
            }
            else {
                document.querySelectorAll("#register-form > .account-error")[0].style.display = "none";
            }
            if (result.includes("3")) {
                document.querySelectorAll("#register-form > .account-error")[1].style.display = "block";
            }
            else {
                document.querySelectorAll("#register-form > .account-error")[1].style.display = "none";
            }
        }
    });
    setTimeout(() => {
        if (! hasResponded) {
            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "red");
            notificationBox.innerHTML = `The server didn't respond in time!`;
            document.body.appendChild(notificationBox);
        }
    }, 5000);
});
