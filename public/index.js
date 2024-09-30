const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const socket = io();
c.fillStyle = "#ff9966";
c.fillRect(0, 0, 200, 300);
console.log("I'm working");

socket.on('updtplayer', (accounts) => {
    console.log(accounts);
});



//
// CLICK ON USER ICON
//
document.getElementById("user").addEventListener("click", () => {
    $.ajax({
        url: '/account/auth',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        success: (data) => {
            if (data.authenticated) {
                console.log("auth");
                document.getElementById("account-select-login").style.display = "none";
                document.getElementById("account-select-register").style.display = "none";
                document.getElementById("account-select-logout").style.display = "block";
                document.getElementById("account-select-delete").style.display = "block";
            } else {
                console.log("not auth");
                document.getElementById("account-select-login").style.display = "block";
                document.getElementById("account-select-register").style.display = "block";
                document.getElementById("account-select-logout").style.display = "none";
                document.getElementById("account-select-delete").style.display = "none";
            }
            document.getElementById("account-select").style.visibility = "visible";
        }
    });
});

//
// HIDE DROPDOWN IF USER DOESNT CLICK ON USER ICON
//
window.addEventListener("click", (ev) => {
    if (ev.target != document.getElementById("user")) {
        document.getElementById("account-select").style.visibility = "hidden";
    }
});

//
// LOGIN - REGISTER - LOGOUT - DELETE
//
document.getElementById("account-select-login").addEventListener("click", () => {
    document.getElementById("login-popup-bg").style.visibility = "visible";
    document.getElementById("account-select").style.visibility = "hidden";
});
document.getElementById("account-select-register").addEventListener("click", () => {
    document.getElementById("register-popup-bg").style.visibility = "visible";
    document.getElementById("account-select").style.visibility = "hidden";
});
document.getElementById("account-select-logout").addEventListener("click", () => {
    // Send request to server
    let url = "/account/logout";
    let data = {};
    let hasResponded = false;
    $.ajax({
        url: url,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        data: data,
        success: (result) => {
            hasResponded = true;
            // Handle result
            if (result == "0") {
                console.log("logged out");
                localStorage.removeItem('token');
                let notificationBox = document.createElement("notification-box");
                notificationBox.setAttribute("color", "blue");
                notificationBox.innerHTML = `You have been logged out.`;
                document.body.appendChild(notificationBox);
            }
            else if (result == "1") {
                console.log("error");
                let notificationBox = document.createElement("notification-box");
                notificationBox.setAttribute("color", "red");
                notificationBox.innerHTML = `An error has occurred on the server side!`
                document.body.appendChild(notificationBox);
            }
            else {
                let notificationBox = document.createElement("notification-box");
                notificationBox.setAttribute("color", "red");
                notificationBox.innerHTML = `You are not logged in!`;
                document.body.appendChild(notificationBox);
            }
        }
    });
    setTimeout(() => {
        if (!hasResponded) {
            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "red");
            notificationBox.innerHTML = `The server didn't respond in time!`;
            document.body.appendChild(notificationBox);
        }
    }, 5000);
});
document.getElementById("account-select-delete").addEventListener("click", () => {
    document.getElementById("delete-popup-bg").style.visibility = "visible";
    document.getElementById("account-select").style.visibility = "hidden";
});

document.querySelectorAll(".popup-close").forEach((element) => {
    element.addEventListener("click", () => {
        document.getElementById("login-popup-bg").style.visibility = "hidden";
        document.getElementById("register-popup-bg").style.visibility = "hidden";
        document.getElementById("delete-popup-bg").style.visibility = "hidden";
    });
})


//
// LOGIN FORM
//
document.getElementById("login-form").addEventListener("submit", (ev) => {
    // Send request to server
    ev.preventDefault();
    let url = "/account/login";
    let data = {
        username: document.getElementById("login-username").value,
        password: document.getElementById("login-password").value
    };
    let hasResponded = false;
    $.post(url, data, function (result, status) {
        hasResponded = true;
        // Handle result
        if (result.token) {
            localStorage.setItem('token', result.token);
            document.getElementById("login-popup-bg").style.visibility = "hidden";
            document.querySelectorAll("#login-form > .account-error")[0].style.display = "none";

            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "green");
            notificationBox.innerHTML = `Welcome back, ${document.getElementById("login-username").value}!`;
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
        if (!hasResponded) {
            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "red");
            notificationBox.innerHTML = `The server didn't respond in time!`;
            document.body.appendChild(notificationBox);
        }
    }, 5000);
});

//
// REGISTER FORM
//
document.getElementById("register-form").addEventListener("submit", (ev) => {
    // Send request to server
    ev.preventDefault();
    let url = "/account/register";
    let data = {
        username: document.getElementById("register-username").value,
        password: document.getElementById("register-password").value,
        passwordRepeat: document.getElementById("register-password-repeat").value
    };
    let hasResponded = false;
    $.post(url, data, function (result, status) {
        hasResponded = true;
        // Handle result
        if (result.token) {
            localStorage.setItem('token', result.token);
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
            if (result.includes("4")) {
                document.querySelectorAll("#register-form > .account-error")[2].style.display = "block";
            }
            else {
                document.querySelectorAll("#register-form > .account-error")[2].style.display = "none";
            }
            if (result.includes("5")) {
                document.querySelectorAll("#register-form > .account-error")[3].style.display = "block";
            }
            else {
                document.querySelectorAll("#register-form > .account-error")[3].style.display = "none";
            }
        }
    });
    setTimeout(() => {
        if (!hasResponded) {
            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "red");
            notificationBox.innerHTML = `The server didn't respond in time!`;
            document.body.appendChild(notificationBox);
        }
    }, 5000);
});


document.getElementById("delete-form").addEventListener("submit", (ev) => {
    // Send request to server
    ev.preventDefault();
    let url = "/account/delete";
    let data = {
        password: document.getElementById("delete-password").value
    };
    let hasResponded = false;
    $.ajax({
        url: url,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        data: data,
        success: (result) => {
            hasResponded = true;
            // Handle result
            if (result == "0") {
                console.log("account deleted");
                localStorage.removeItem('token');
                document.getElementById("delete-popup-bg").style.visibility = "hidden";
                document.querySelectorAll("#delete-form > .account-error")[0].style.display = "none";
                let notificationBox = document.createElement("notification-box");
                notificationBox.setAttribute("color", "blue");
                notificationBox.innerHTML = `Your account has been deleted.`;
                document.body.appendChild(notificationBox);
            }
            else if (result == "1") {
                let notificationBox = document.createElement("notification-box");
                notificationBox.setAttribute("color", "green");
                notificationBox.innerHTML = `An error has occurred on the server side!`;
                document.body.appendChild(notificationBox);
            }
            else if (result == "2") {
                document.querySelectorAll("#delete-form > .account-error")[0].style.display = "block";
            }
            else if (result == "3") {
                let notificationBox = document.createElement("notification-box");
                notificationBox.setAttribute("color", "red");
                notificationBox.innerHTML = `You are not logged in!`;
                document.body.appendChild(notificationBox);
            }
        }
    });
    setTimeout(() => {
        if (!hasResponded) {
            let notificationBox = document.createElement("notification-box");
            notificationBox.setAttribute("color", "red");
            notificationBox.innerHTML = `The server didn't respond in time!`;
            document.body.appendChild(notificationBox);
        }
    }, 5000);
});

document.querySelector(".moves-chat-select-moves").addEventListener("click", () => {
    document.querySelector(".chat").style.display = "none";
    document.querySelector(".moves").style.display = "flex";
});

document.querySelector(".moves-chat-select-chat").addEventListener("click", () => {
    document.querySelector(".chat").style.display = "block";
    document.querySelector(".moves").style.display = "none";
});
