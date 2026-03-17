document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".reveal");
    const envelope = document.querySelector(".envelope");
    const trigger = document.querySelector(".envelope-section");

    window.addEventListener("scroll", () => {
        // Reveal sections
        reveals.forEach(el => {
            const top = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (top < windowHeight - 100) {
                el.classList.add("active");
            }
        });

        // Envelope animation
        const topTrigger = trigger.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (topTrigger < windowHeight - 80) {
            envelope.classList.add("open");
        }
    });
});