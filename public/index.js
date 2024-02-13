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

//clicking on user icon
document.getElementById("user").addEventListener("click", () => {
    $.get('/auth', (data) => {
        if (data.authenticated) {
            document.getElementById("account-select-auth").style.visibility = "visible";
            document.getElementById("account-select-auth").style.position = "absolute";
            const userIconRect = document.getElementById("user").getBoundingClientRect();
            document.getElementById("account-select-auth").style.top = `${userIconRect.bottom}px`;
            document.getElementById("account-select-auth").style.left = `${userIconRect.left}px`;
            document.getElementById("account-select").style.visibility = "hidden";
            
            // Prevent clicks on account-select-auth from reaching elements underneath
            document.getElementById("account-select-auth").addEventListener("click", (event) => {
                event.stopPropagation();
            });
        } else {
            document.getElementById("account-select").style.visibility = "visible";
            document.getElementById("account-select-auth").style.visibility = "hidden";
        }
    });
});

// hides the dropdown if the user doesn't click on the icon
window.addEventListener("click", (ev) => {
    if (ev.target != document.getElementById("user")) {
        document.getElementById("account-select").style.visibility = "hidden";
        document.getElementById("account-select-auth").style.visibility = "hidden";
    }
});

//clicking on dropdown login
document.getElementById("account-select-login").addEventListener("click", () => {
    document.getElementById("login-popup-bg").style.visibility = "visible";
});
//clicking on dropdown register
document.getElementById("account-select-register").addEventListener("click", () => {
    document.getElementById("register-popup-bg").style.visibility = "visible";
});
//clicking on dropdown logout

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
    console.log("delete account");
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
    $.post(url, data, function (result, status) {
        // Handle result
        if (result == "0") {
            document.getElementById("login-popup-bg").style.visibility = "hidden";
            document.querySelectorAll("#login-form > .account-error")[0].style.display = "none";
        }
        else {
            document.querySelectorAll("#login-form > .account-error")[0].style.display = "block";
        }
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
        if (result == "0") {
            document.getElementById("register-popup-bg").style.visibility = "hidden";
            document.querySelectorAll("#register-form > .account-error")[0].style.display = "none";
            document.querySelectorAll("#register-form > .account-error")[1].style.display = "none";
        }
        else {
            if (result.includes("1")) {
                document.querySelectorAll("#register-form > .account-error")[0].style.display = "block";
            }
            else {
                document.querySelectorAll("#register-form > .account-error")[0].style.display = "none";
            }
            if (result.includes("2")) {
                document.querySelectorAll("#register-form > .account-error")[1].style.display = "block";
            }
            else {
                document.querySelectorAll("#register-form > .account-error")[1].style.display = "none";
            }
        }
    });
});
  