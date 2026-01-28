// Initialize mermaid when the page loads
window.addEventListener("DOMContentLoaded", () => {
  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
    });

    // Render mermaid diagrams
    mermaid.contentLoaded();
  }
});
