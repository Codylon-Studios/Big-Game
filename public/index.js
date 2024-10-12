//chesssboard
function fillBoard() {
    let board = document.getElementById("chess-board");
    for (let column = 0; column < 8; column++) {
        for (let row = 0; row < 8; row++) {
            let field = document.createElement("div");
            field.classList.add("chess-field");
            field.classList.add("chess-field-" + (((column + row) % 2) ? "black" : "white"));
            board.appendChild(field);
            field.addEventListener("click", () => {
                let index = [...board.children].indexOf(field);
                console.log(index);
            });
            if (piecesConfiguration[8 * column + row] != null) {
                let img = document.createElement("img");
                img.src = "images/pieces/" + piecesConfiguration[8 * column + row] + ".png";
                field.appendChild(img);
            }
        }
    }
}

//sidebar options
function updateAccountOptions() {
    $.get('/account/auth', (data) => {
        if (data.authenticated) {
            console.log("auth");
            document.getElementById("account-login-button").style.display = "none";
            document.getElementById("account-register-button").style.display = "none";
            document.getElementById("account-logout-button").style.display = "block";
        } else {
            console.log("not auth");
            document.getElementById("account-login-button").style.display = "block";
            document.getElementById("account-register-button").style.display = "block";
            document.getElementById("account-logout-button").style.display = "none";
        }
    });
}

const socket = io();

socket.on('updtplayer', (accounts) => {
    console.log(accounts);
});

const importHtmlPromise = new Promise((resolve, reject) => {
    let toLoad = document.querySelectorAll("div[import-html]").length
    document.querySelectorAll("div[import-html]").forEach((element) => {
        $.ajax({
            url: './html/' + element.getAttribute("href"),
            method: 'GET',
            success: (data) => {
                element.innerHTML = data;
                toLoad--;
                if (toLoad == 0) {
                    resolve();
                };
            }
        });
    });
});

let piecesConfiguration;

importHtmlPromise.then(() => {
    $.getJSON("pieces_configuration.json", (loadedJson) => {
        piecesConfiguration = loadedJson;
        fillBoard();
    });
})
updateAccountOptions();

importHtmlPromise.then(() => {
    //
    // CONTROL BAR
    //
    document.getElementById("control-bar-game").addEventListener("click", () => {
        document.getElementById("game").style.display = "block";
        document.getElementById("settings").style.display = "none";
    });
    document.getElementById("control-bar-settings").addEventListener("click", () => {
        document.getElementById("game").style.display = "none";
        document.getElementById("settings").style.display = "block";
    });


    document.getElementById("account-login-button").addEventListener("click", () => {
        document.getElementById("login-popup-bg").style.visibility = "visible";
        document.getElementById("account-select").style.visibility = "hidden";
    });
    document.getElementById("account-register-button").addEventListener("click", () => {
        document.getElementById("register-popup-bg").style.visibility = "visible";
        document.getElementById("account-select").style.visibility = "hidden";
    });
    document.getElementById("account-logout-button").addEventListener("click", () => {
        // Send request to server
        let url = "/account/logout";
        let data = {};
        let hasResponded = false;
        $.post(url, data, function (result, status) {
            hasResponded = true;
            // Handle result
            if (result == "0") {
                console.log("logged out");
                updateAccountOptions();
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
            if (result == "0") {
                document.getElementById("login-popup-bg").style.visibility = "hidden";
                document.querySelectorAll("#login-form > .account-error")[0].style.display = "none";
                updateAccountOptions();

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
            if (result == "0") {
                document.getElementById("register-popup-bg").style.visibility = "hidden";
                document.querySelectorAll("#register-form > .account-error")[0].style.display = "none";
                document.querySelectorAll("#register-form > .account-error")[1].style.display = "none";
                updateAccountOptions();

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
        $.post(url, data, function (result, status) {
            hasResponded = true;
            // Handle result
            if (result == "0") {
                console.log("account deleted");
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
})
