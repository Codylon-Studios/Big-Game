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

// Clicking on user icon
document.getElementById("user").addEventListener("click", () => {
    $.get('/auth', (data) => {
        if (data.authenticated) {
            document.getElementById("account-select-login").style.display = "none";
            document.getElementById("account-select-register").style.display = "none";
            document.getElementById("account-select-logout").style.display = "block";
            document.getElementById("account-select-delete").style.display = "block";
        } else {
            document.getElementById("account-select-login").style.display = "block";
            document.getElementById("account-select-register").style.display = "block";
            document.getElementById("account-select-logout").style.display = "none";
            document.getElementById("account-select-delete").style.display = "none";
        }
        document.getElementById("account-select").style.visibility = "visible";
    });
});

// Hides the dropdown if the user doesn't click on the icon
window.addEventListener("click", (ev) => {
    if (ev.target != document.getElementById("user")) {
        document.getElementById("account-select").style.visibility = "hidden";
    }
});

// Clicking on dropdown login
document.getElementById("account-select-login").addEventListener("click", () => {
    document.getElementById("login-popup-bg").style.visibility = "visible";
    document.getElementById("account-select").style.visibility = "hidden";
});

// Clicking on dropdown register
document.getElementById("account-select-register").addEventListener("click", () => {
    document.getElementById("register-popup-bg").style.visibility = "visible";
    document.getElementById("account-select").style.visibility = "hidden";
});

// Clicking on dropdown logout
document.addEventListener('DOMContentLoaded', () => {
    // Find the logout button element
    const logoutButton = document.getElementById('account-select-logout');
  
    // Add event listener to the logout button
    logoutButton.addEventListener('click', async () => {
      try {
        // Send a POST request to the server's logout endpoint
        const response = await fetch('/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        // Check if the logout was successful
        if (response.ok) {
          console.log('Logout successful');
          document.getElementById("account-select-auth").style.visibility = "hidden";
        } else {
          console.error('Logout failed');
          document.getElementById("account-select-auth").style.visibility = "hidden";
        }
      } catch (error) {
        console.error('Error during logout:', error);
        document.getElementById("account-select-auth").style.visibility = "hidden";
      }
    });
  });


//clicking on dropdown delete account
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
        if (! hasResponded) {
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
    let url = "/delete";
    let data = {username: document.getElementById("delete-username").value,
                password: document.getElementById("delete-password").value
               };
    $.post(url, data, function (result, status) {
        // Handle result
        if (result == "0") {
            document.getElementById("delete-popup-bg").style.visibility = "hidden";
            document.querySelectorAll("#delete-form > .account-error")[0].style.display = "none";
        }
        else {
            document.querySelectorAll("#delete-form > .account-error")[0].style.display = "block";
        }
    });
});
  