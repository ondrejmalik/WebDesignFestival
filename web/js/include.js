// js/include.js - Safe component loader
// Supports both HTTP server environments (fetch) and direct file:/// browser execution
async function loadComponent(targetId, componentPath) {
    const target = document.getElementById(targetId);
    if (!target) return;

    // If the element already contains functional HTML, do not overwrite
    if (target.children && target.children.length > 0) return;

    try {
        const response = await fetch(componentPath);
        if (response.ok) {
            const html = await response.text();
            target.innerHTML = html;
        }
    } catch (err) {
        // When launched directly from local disk (file:///), browsers block fetch due to CORS.
        // Keep the inline HTML intact so links remain fully operational everywhere.
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadComponent("nav-placeholder", "components/nav.html");
    loadComponent("footer-placeholder", "components/footer.html");
});
