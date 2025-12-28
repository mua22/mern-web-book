// Initialize mermaid when the page loads
window.addEventListener("DOMContentLoaded", () => {
  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: true, theme: "default" });

    // Render any fenced mermaid code blocks inside the content
    document
      .querySelectorAll("code.language-mermaid, pre code.language-mermaid")
      .forEach((el, i) => {
        const parent = el.closest("pre") || el.parentElement;
        const wrapper = document.createElement("div");
        wrapper.className = "mermaid";
        wrapper.textContent = el.textContent;
        parent.parentNode.replaceChild(wrapper, parent);
      });
    mermaid.init();
  }
});
