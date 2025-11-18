const sidebar = document.getElementById("sidebar");
const closeBtn = document.getElementById("sidebar-close");

function closeSidebar() {
            const sidebar = document.getElementById("sidebar");
            sidebar.classList.remove("open");
            sidebar.classList.remove("register-open");
        }

        function openLoginSidebar() {
            const sidebar = document.getElementById("sidebar");
            sidebar.classList.add("open");
        }

        function openRegisterSidebar() {
            const sidebar = document.getElementById("sidebar");
            sidebar.classList.add("register-open");
        }
// Close button click
if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        closeSidebar();
    });
}
