document.addEventListener("DOMContentLoaded", () => {
    // Redirect buttons to respective pages
    document.querySelector(".nav-buttons button:nth-child(1)").addEventListener("click", () => {
        window.location.href = "/join";
    });

    document.querySelector(".nav-buttons button:nth-child(2)").addEventListener("click", () => {
        window.location.href = "/host";
    });

    document.querySelector(".nav-buttons button:nth-child(3)").addEventListener("click", () => {
        window.location.href = "/gymbuddy";
    });

    document.querySelector(".auth-buttons button:nth-child(1)").addEventListener("click", () => {
        window.location.href = "/signup";
    });

    document.querySelector(".auth-buttons button:nth-child(2)").addEventListener("click", () => {
        window.location.href = "/signin";
    });

    // Button hover effect
    const buttons = document.querySelectorAll(".nav-buttons button, .auth-buttons button");
    buttons.forEach(button => {
        button.addEventListener("mouseenter", () => {
            button.style.backgroundColor = "#f0f0f0";
        });
        button.addEventListener("mouseleave", () => {
            button.style.backgroundColor = "transparent";
        });
    });
});
