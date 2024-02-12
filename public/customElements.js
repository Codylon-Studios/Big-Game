class NotificationBox extends HTMLElement {
    static getObservedAttributes() {
        return ["color"];
    }
    connectedCallback() {
        // Check if a notification list exists, if not create one
        let notificationList = document.querySelector(".notification-list");
        if (! notificationList) {
            notificationList = document.createElement("div");
            notificationList.classList.add("notification-list");
            document.body.appendChild(notificationList);
        };

        let color = this.getAttribute("color");
        color = (["green", "red", "blue"].includes(color)) ? color: "blue";
        this.classList.add("notification-box-main", `notification-box-main-${color}`);

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

        this.appendChild(closeIcon);
        if (this.parentElement != document.querySelector(".notification-list")) {
            notificationList.appendChild(this);
        };

        setTimeout(() => {
            this.style.transform = "translateX(0px)";
        }, 0);

        setTimeout(() => {
            this.style.transform = "translateX(223px)";
            setTimeout(() => {
                if (this.parentElement) {
                    this.parentElement.removeChild(this);
                };
            }, 1500);
        }, 6500);
    };
};

customElements.define('notification-box', NotificationBox);
