(function () {
  "use strict";

  // Open shadow DOM: everything below is attached to a shadow root, so a
  // plain CSS/XPath query against the main document won't find any of
  // it — locators have to pierce the shadow root (e.g. Playwright's
  // built-in piercing, or `element.shadowRoot` in a JS evaluator).

  var STYLES =
    ":host { display: block; }" +
    ".reviews-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }" +
    ".review-item { border-bottom: 1px solid #e2e5ea; padding-bottom: 8px; }" +
    ".review-author { font-weight: 600; font-size: 13px; }" +
    ".review-rating { color: #f59e0b; font-size: 13px; }" +
    ".review-comment { font-size: 13px; color: #1f2430; margin: 4px 0 0; }" +
    ".reviews-empty { font-size: 13px; color: #667085; }" +
    "form { display: flex; flex-direction: column; gap: 8px; max-width: 360px; }" +
    "label { font-size: 12px; font-weight: 600; }" +
    "input, select, textarea { font-size: 13px; padding: 6px 8px; border: 1px solid #e2e5ea; border-radius: 6px; font-family: inherit; }" +
    "button { align-self: flex-start; padding: 6px 14px; font-size: 13px; font-weight: 600; border-radius: 6px; border: none; background: #0d9488; color: #fff; cursor: pointer; }" +
    ".review-form-error { color: #dc2626; font-size: 12px; }";

  function starString(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  class ProductReviewsElement extends HTMLElement {
    connectedCallback() {
      var root = this.attachShadow({ mode: "open" });

      root.innerHTML =
        "<style>" + STYLES + "</style>" +
        '<div data-testid="product-reviews-list" class="reviews-list"></div>' +
        '<p class="review-form-error" data-testid="product-review-form-error" hidden></p>' +
        '<form data-testid="product-review-form">' +
        '<label for="review-author">Your name</label>' +
        '<input type="text" id="review-author" data-testid="product-review-author-input" />' +
        '<label for="review-rating">Rating</label>' +
        '<select id="review-rating" data-testid="product-review-rating-select">' +
        '<option value="5">5 - Excellent</option>' +
        '<option value="4">4 - Good</option>' +
        '<option value="3">3 - Okay</option>' +
        '<option value="2">2 - Poor</option>' +
        '<option value="1">1 - Terrible</option>' +
        "</select>" +
        '<label for="review-comment">Comment</label>' +
        '<textarea id="review-comment" rows="3" data-testid="product-review-comment-input"></textarea>' +
        '<button type="submit" data-testid="product-review-submit">Submit review</button>' +
        "</form>";

      this._listEl = root.querySelector('[data-testid="product-reviews-list"]');
      this._errorEl = root.querySelector('[data-testid="product-review-form-error"]');
      this._form = root.querySelector('[data-testid="product-review-form"]');
      this._authorInput = root.querySelector('[data-testid="product-review-author-input"]');
      this._ratingSelect = root.querySelector('[data-testid="product-review-rating-select"]');
      this._commentInput = root.querySelector('[data-testid="product-review-comment-input"]');

      this._form.addEventListener("submit", (event) => {
        event.preventDefault();
        this._submitReview();
      });

      this._loadReviews();
    }

    _loadReviews() {
      var productId = this.getAttribute("product-id");
      fetch("/api/products/" + productId + "/reviews")
        .then((res) => res.json())
        .then((json) => this._renderReviews(json.reviews || []))
        .catch(() => this._renderReviews([]));
    }

    _renderReviews(reviewList) {
      this._listEl.innerHTML = "";

      if (reviewList.length === 0) {
        var empty = document.createElement("p");
        empty.className = "reviews-empty";
        empty.setAttribute("data-testid", "product-reviews-empty");
        empty.textContent = "No reviews yet. Be the first to write one.";
        this._listEl.appendChild(empty);
        return;
      }

      reviewList.forEach((review) => {
        var item = document.createElement("div");
        item.className = "review-item";
        item.setAttribute("data-testid", "product-review-" + review.id);

        var author = document.createElement("div");
        author.className = "review-author";
        author.setAttribute("data-testid", "product-review-author-" + review.id);
        author.textContent = review.author;
        item.appendChild(author);

        var rating = document.createElement("div");
        rating.className = "review-rating";
        rating.setAttribute("data-testid", "product-review-rating-" + review.id);
        rating.textContent = starString(review.rating);
        item.appendChild(rating);

        var comment = document.createElement("p");
        comment.className = "review-comment";
        comment.setAttribute("data-testid", "product-review-comment-" + review.id);
        comment.textContent = review.comment;
        item.appendChild(comment);

        this._listEl.appendChild(item);
      });
    }

    _submitReview() {
      var productId = this.getAttribute("product-id");
      this._errorEl.hidden = true;

      var body = {
        author: this._authorInput.value.trim(),
        rating: parseInt(this._ratingSelect.value, 10),
        comment: this._commentInput.value.trim()
      };

      fetch("/api/products/" + productId + "/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
        .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
        .then((result) => {
          if (!result.ok) {
            this._errorEl.textContent = result.json.message || "Failed to submit review.";
            this._errorEl.hidden = false;
            return;
          }
          this._authorInput.value = "";
          this._commentInput.value = "";
          this._ratingSelect.value = "5";
          this._loadReviews();
        })
        .catch(() => {
          this._errorEl.textContent = "Failed to submit review. Please try again.";
          this._errorEl.hidden = false;
        });
    }
  }

  customElements.define("product-reviews", ProductReviewsElement);
})();
