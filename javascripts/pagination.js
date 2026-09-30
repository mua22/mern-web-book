/*
 * Client-side pagination for category listing pages (e.g. tutorials/html-css/).
 * Paginates any ".cu-paginated" container's direct ".cu-paginated-item"
 * children, page size from its "data-page-size" attribute (default 6), and
 * injects Prev / page-number / Next controls right after the container.
 * Shared by every category page so the pagination markup and behavior stay
 * identical across all of them -- add a new category page, get the same
 * pager for free, no per-page script needed.
 */
(function () {
  "use strict";

  function paginate(container) {
    var pageSize = parseInt(container.dataset.pageSize, 10) || 6;
    var items = Array.prototype.slice.call(
      container.querySelectorAll(":scope > .cu-paginated-item")
    );
    var pageCount = Math.max(1, Math.ceil(items.length / pageSize));

    var controls = container.nextElementSibling;
    if (!controls || !controls.classList.contains("cu-paginated-controls")) {
      controls = document.createElement("div");
      controls.className = "cu-paginated-controls";
      container.insertAdjacentElement("afterend", controls);
    }

    function makeButton(label, extraClass) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cu-page-btn" + (extraClass ? " " + extraClass : "");
      btn.textContent = label;
      return btn;
    }

    function render(page) {
      items.forEach(function (item, i) {
        var itemPage = Math.floor(i / pageSize) + 1;
        item.style.display = itemPage === page ? "" : "none";
      });

      controls.innerHTML = "";
      if (pageCount <= 1) return;

      var prev = makeButton("← Prev", "cu-page-nav");
      prev.disabled = page === 1;
      prev.addEventListener("click", function () {
        render(page - 1);
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      controls.appendChild(prev);

      for (var p = 1; p <= pageCount; p++) {
        var btn = makeButton(String(p), p === page ? "active" : "");
        btn.addEventListener("click", (function (p) {
          return function () {
            render(p);
            container.scrollIntoView({ behavior: "smooth", block: "start" });
          };
        })(p));
        controls.appendChild(btn);
      }

      var next = makeButton("Next →", "cu-page-nav");
      next.disabled = page === pageCount;
      next.addEventListener("click", function () {
        render(page + 1);
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      controls.appendChild(next);
    }

    render(1);
  }

  function init() {
    document.querySelectorAll(".cu-paginated").forEach(paginate);
  }

  if (window.document$) {
    /* Material's navigation.instant swaps page content via fetch, without a
       full reload -- document$ fires on every such swap, so re-init there
       instead of (only) on DOMContentLoaded. */
    document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
