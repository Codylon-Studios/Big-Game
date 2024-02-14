class NotificationBox extends HTMLElement {
    static getObservedAttributes() {
        return ["color", "duration"];
    }
    connectedCallback() {
        // Check if a notification list exists, if not create one
        let notificationList = document.querySelector(".notification-list");
        if (! notificationList) {
            notificationList = document.createElement("div");
            notificationList.classList.add("notification-list");
            document.body.appendChild(notificationList);
        };
        if (this.parentElement != notificationList) {
            notificationList.appendChild(this);
            return
        }

        let color = this.getAttribute("color");
        color = (["green", "red", "blue"].includes(color)) ? color: "blue";
        this.classList.add("notification-box-main", `notification-box-main-${color}`);

        let duration = this.getAttribute("duration");
        let cssMsTimeRegExp = /^\d+(\.\d+)?ms$/; // Is it a valid CSS time in milliseconds?
        let cssSTimeRegExp = /^\d+(\.\d+)?s$/;   // Is it a valid CSS time in seconds?
        if (cssMsTimeRegExp.test(duration)) {
            duration = parseInt(duration.substring(0, duration.length - 2));
        }
        else if (cssSTimeRegExp.test(duration)) {;
            duration = parseInt(duration.substring(0, duration.length - 1)) * 1000;
        }
        else {
            duration = 5000;
        }

        let closeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        closeIcon.setAttribute("width", 20);
        closeIcon.setAttribute("height", 20);
        closeIcon.setAttribute("viewBox", "0 0 10 10");
        closeIcon.innerHTML =
        `<g stroke-linecap="round" stroke-width="1">
            <line x1="3" x2="7" y1="3" y2="7" />
            <line x1="3" x2="7" y1="7" y2="3" />
        </g>`;
        closeIcon.addEventListener("click", () => {
            this.parentElement.removeChild(this);
        });

        let progressBar = document.createElement("div");
        progressBar.classList.add("notification-box-progressbar")
        progressBar.classList.add(`notification-box-${color}-progressbar`)
        
        this.appendChild(closeIcon);
        this.appendChild(progressBar);
        
        this.style.transform = "translateX(223px)";
        this.style.transition = "1.5s";
        setTimeout(() => {
            this.style.transform = "translateX(0px)";
            setTimeout(() => {
                progressBar.style.transition = `${duration}ms linear`;
                progressBar.style.width = "0px";
                setTimeout(() => {
                    this.style.transform = "translateX(223px)";
                    setTimeout(() => {
                        if (this.parentElement) {
                            this.parentElement.removeChild(this);
                        };
                    }, 1500);
                }, duration);
            }, 1500);
        }, 20)
    
    };
};

customElements.define('notification-box', NotificationBox);
