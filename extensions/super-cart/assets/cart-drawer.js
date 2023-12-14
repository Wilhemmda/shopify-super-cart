document.addEventListener("DOMContentLoaded", function () {
    var appDrawer = document.querySelector("app-drawer");
  
    const addToCart = document.querySelectorAll(".product-form__submit");
    if (addToCart) {
      addToCart.forEach(function (button) {
        button.addEventListener("click", function () {
          appDrawer.classList.add("animate", "active");
          console.log("ouverture panier");
        });
      });
    }
  });
  
  const mainCartItemsLiquid = "coucou";
  
  function fetchConfig(type = "json") {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/${type}`,
      },
    };
  }
  
  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
  //osef de changer les noms car si il les detecte comme identique pas besoin de les mettre du tout au final.
  const APP_ON_CHANGE_DEBOUNCE_TIMER = 300;
  
  const APP_PUB_SUB_EVENTS = {
    cartUpdate: "cart-update",
    quantityUpdate: "quantity-update",
    variantChange: "variant-change",
    cartError: "cart-error",
  };
  
  class AppRemoveButton extends HTMLElement {
    constructor() {
      super();
  
      this.addEventListener("click", (event) => {
        event.preventDefault();
        const cartItems =
          this.closest("app-items") || this.closest("app-drawer-items");
        cartItems.updateQuantity(this.dataset.index, 0);
      });
    }
  }
  
  customElements.define("app-remove-button", AppRemoveButton);
  
  if (!customElements.get("cart-note")) {
    customElements.define(
      "cart-note",
      class CartNote extends HTMLElement {
        constructor() {
          super();
  
          this.addEventListener(
            "change",
            debounce((event) => {
              const body = JSON.stringify({ note: event.target.value });
              fetch(`${routes.cart_update_url}`, {
                ...fetchConfig(),
                ...{ body },
              });
            }, APP_ON_CHANGE_DEBOUNCE_TIMER)
          );
        }
      }
    );
  }
  
  class AppItems extends HTMLElement {
    constructor() {
      super();
      this.lineItemStatusElement =
        document.getElementById("shopping-cart-line-item-status") ||
        document.getElementById("CartDrawer-LineItemStatus");
  
      const debouncedOnChange = debounce((event) => {
        this.onChange(event);
      }, APP_ON_CHANGE_DEBOUNCE_TIMER);
  
      this.addEventListener("change", debouncedOnChange.bind(this));
    }
  
    cartUpdateUnsubscriber = undefined;
  
    connectedCallback() {
      this.cartUpdateUnsubscriber = subscribe(
        APP_PUB_SUB_EVENTS.cartUpdate,
        (event) => {
          if (event.source === "app-items") {
            // ???????????????????
            return;
          }
          this.onCartUpdate();
        }
      );
    }
  
    disconnectedCallback() {
      if (this.cartUpdateUnsubscriber) {
        this.cartUpdateUnsubscriber();
      }
    }
  
    onChange(event) {
      this.updateQuantity(
        event.target.dataset.index,
        event.target.value,
        document.activeElement.getAttribute("name")
      );
    }
  
    onCartUpdate() {
      fetch(`${routes.cart_url}?section_id=main-cart-items`) //Renvoi l'enorme div shopify section main cart
        .then((response) => response.text())
        .then((responseText) => {
          console.log(responseText);
  
          const html = new DOMParser().parseFromString(responseText, "text/html");
          const sourceQty = html.querySelector("cart-items"); // REMPLACE ICI
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.log("erreur onCartUpdate");
          console.error(e); //cannot read propery of null reading innerhtml
        });
    }
  
    getSectionsToRender() {
      return [
        {
          id: "main-cart-items",
          section: document.getElementById("main-cart-items").dataset.id,
          selector: ".js-contents",
        },
        {
          id: "cart-icon-bubble",
          section: "cart-icon-bubble",
          selector: ".shopify-section",
        },
        {
          id: "cart-live-region-text",
          section: "cart-live-region-text",
          selector: ".shopify-section",
        },
        {
          id: "main-cart-footer",
          section: document.getElementById("main-cart-footer").dataset.id,
          selector: ".js-contents",
        },
      ];
    }
  
    updateQuantity(line, quantity, name) {
      this.enableLoading(line);
  
      const body = JSON.stringify({
        line,
        quantity,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname,
      });
  
      fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);
          const quantityElement =
            document.getElementById(`Quantity-${line}`) ||
            document.getElementById(`Drawer-quantity-${line}`);
          const items = document.querySelectorAll(".cart-item");
  
          if (parsedState.errors) {
            quantityElement.value = quantityElement.getAttribute("value");
            this.updateLiveRegions(line, parsedState.errors);
            return;
          }
  
          this.classList.toggle("is-empty", parsedState.item_count === 0);
          const cartDrawerWrapper = document.querySelector("app-drawer"); //REMPLACE ICI
          const cartFooter = document.getElementById("main-cart-footer");
  
          if (cartFooter)
            cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
          if (cartDrawerWrapper)
            cartDrawerWrapper.classList.toggle(
              "is-empty",
              parsedState.item_count === 0
            );
  
          this.getSectionsToRender().forEach((section) => {
            const elementToReplace =
              document
                .getElementById(section.id)
                .querySelector(section.selector) ||
              document.getElementById(section.id);
            elementToReplace.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.section],
              section.selector
            );
          });
          const updatedValue = parsedState.items[line - 1]
            ? parsedState.items[line - 1].quantity
            : undefined;
          let message = "";
          if (
            items.length === parsedState.items.length &&
            updatedValue !== parseInt(quantityElement.value)
          ) {
            if (typeof updatedValue === "undefined") {
              message = window.cartStrings.error;
            } else {
              message = window.cartStrings.quantityError.replace(
                "[quantity]",
                updatedValue
              );
            }
          }
          this.updateLiveRegions(line, message);
  
          const lineItem =
            document.getElementById(`CartItem-${line}`) ||
            document.getElementById(`CartDrawer-Item-${line}`);
          if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
            cartDrawerWrapper
              ? trapFocus(
                  cartDrawerWrapper,
                  lineItem.querySelector(`[name="${name}"]`)
                )
              : lineItem.querySelector(`[name="${name}"]`).focus();
          } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
            trapFocus(
              cartDrawerWrapper.querySelector(".drawer__inner-empty"),
              cartDrawerWrapper.querySelector("a")
            );
          } else if (document.querySelector(".cart-item") && cartDrawerWrapper) {
            trapFocus(
              cartDrawerWrapper,
              document.querySelector(".cart-item__name")
            );
          }
          publish(APP_PUB_SUB_EVENTS.cartUpdate, { source: "app-items" }); //REMPLACE ICI
        })
        .catch(() => {
          this.querySelectorAll(".loading-overlay").forEach((overlay) =>
            overlay.classList.add("hidden")
          );
          const errors =
            document.getElementById("cart-errors") ||
            document.getElementById("CartDrawer-CartErrors");
          errors.textContent = window.cartStrings.error;
        })
        .finally(() => {
          this.disableLoading(line);
        });
    }
  
    updateLiveRegions(line, message) {
      const lineItemError =
        document.getElementById(`Line-item-error-${line}`) ||
        document.getElementById(`CartDrawer-LineItemError-${line}`);
      if (lineItemError)
        lineItemError.querySelector(".cart-item__error-text").innerHTML = message;
  
      this.lineItemStatusElement.setAttribute("aria-hidden", true);
  
      const cartStatus =
        document.getElementById("cart-live-region-text") ||
        document.getElementById("CartDrawer-LiveRegionText");
      cartStatus.setAttribute("aria-hidden", false);
  
      setTimeout(() => {
        cartStatus.setAttribute("aria-hidden", true);
      }, 1000);
    }
  
    getSectionInnerHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(selector).innerHTML;
    }
  
    enableLoading(line) {
      const mainCartItems =
        document.getElementById("main-cart-items") ||
        document.getElementById("CartDrawer-CartItems");
      mainCartItems.classList.add("cart__items--disabled");
  
      const cartItemElements = this.querySelectorAll(
        `#CartItem-${line} .loading-overlay`
      );
      const cartDrawerItemElements = this.querySelectorAll(
        `#CartDrawer-Item-${line} .loading-overlay`
      );
  
      [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) =>
        overlay.classList.remove("hidden")
      );
  
      document.activeElement.blur();
      this.lineItemStatusElement.setAttribute("aria-hidden", false);
    }
  
    disableLoading(line) {
      const mainCartItems =
        document.getElementById("main-cart-items") ||
        document.getElementById("CartDrawer-CartItems");
      mainCartItems.classList.remove("cart__items--disabled");
  
      const cartItemElements = this.querySelectorAll(
        `#CartItem-${line} .loading-overlay`
      );
      const cartDrawerItemElements = this.querySelectorAll(
        `#CartDrawer-Item-${line} .loading-overlay`
      );
  
      cartItemElements.forEach((overlay) => overlay.classList.add("hidden"));
      cartDrawerItemElements.forEach((overlay) =>
        overlay.classList.add("hidden")
      );
    }
  }
  
  customElements.define("app-items", AppItems);
  
  let appSubscribers = {};
  
  function subscribe(eventName, callback) {
    if (appSubscribers[eventName] === undefined) {
      appSubscribers[eventName] = [];
    }
  
    appSubscribers[eventName] = [...appSubscribers[eventName], callback];
  
    return function unsubscribe() {
      appSubscribers[eventName] = appSubscribers[eventName].filter((cb) => {
        return cb !== callback;
      });
    };
  }
  
  function publish(eventName, data) {
    if (appSubscribers[eventName]) {
      appSubscribers[eventName].forEach((callback) => {
        callback(data);
      });
    }
  }
  
  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
      )
    );
  }
  
  const appTrapFocusHandlers = {};
  
  function trapFocus(container, elementToFocus = container) {
    var elements = getFocusableElements(container);
    var first = elements[0];
    var last = elements[elements.length - 1];
  
    removeTrapFocus();
  
    appTrapFocusHandlers.focusin = (event) => {
      if (
        event.target !== container &&
        event.target !== last &&
        event.target !== first
      )
        return;
  
      document.addEventListener("keydown", appTrapFocusHandlers.keydown);
    };
  
    appTrapFocusHandlers.focusout = function () {
      document.removeEventListener("keydown", appTrapFocusHandlers.keydown);
    };
  
    appTrapFocusHandlers.keydown = function (event) {
      if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
      // On the last focusable element and tab forward, focus the first element.
      if (event.target === last && !event.shiftKey) {
        event.preventDefault();
        first.focus();
      }
  
      //  On the first focusable element and tab backward, focus the last element.
      if (
        (event.target === container || event.target === first) &&
        event.shiftKey
      ) {
        event.preventDefault();
        last.focus();
      }
    };
  
    document.addEventListener("focusout", appTrapFocusHandlers.focusout);
    document.addEventListener("focusin", appTrapFocusHandlers.focusin);
  
    elementToFocus.focus();
  
    if (
      elementToFocus.tagName === "INPUT" &&
      ["search", "text", "email", "url"].includes(elementToFocus.type) &&
      elementToFocus.value
    ) {
      elementToFocus.setSelectionRange(0, elementToFocus.value.length);
    }
  }
  
  function removeTrapFocus(elementToFocus = null) {
    document.removeEventListener("focusin", appTrapFocusHandlers.focusin);
    document.removeEventListener("focusout", appTrapFocusHandlers.focusout);
    document.removeEventListener("keydown", appTrapFocusHandlers.keydown);
  
    if (elementToFocus) elementToFocus.focus();
  }
  
  function onKeyUpEscape(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;
  
    const openDetailsElement = event.target.closest("details[open]");
    if (!openDetailsElement) return;
  
    const summaryElement = openDetailsElement.querySelector("summary");
    openDetailsElement.removeAttribute("open");
    summaryElement.setAttribute("aria-expanded", false);
    summaryElement.focus();
  }
  
  class AppDrawer extends HTMLElement {
    constructor() {
      super();
  
      this.addEventListener(
        "keyup",
        (evt) => evt.code === "Escape" && this.close()
      );
      this.querySelector("#CartDrawer-Overlay").addEventListener(
        "click",
        this.close.bind(this)
      );
      this.setHeaderCartIconAccessibility();
    }
  
    //CLICK SUR ICONE PANIER OUVRE LE CART DRAWER
    setHeaderCartIconAccessibility() {
      const cartLink = document.querySelector("#cart-icon-bubble");
      cartLink.setAttribute("role", "button");
      cartLink.setAttribute("aria-haspopup", "dialog");
      cartLink.addEventListener("click", (event) => {
        //click déclenche ouverture
        event.preventDefault();
        this.open(cartLink);
      });
      cartLink.addEventListener("keydown", (event) => {
        if (event.code.toUpperCase() === "SPACE") {
          event.preventDefault();
          this.open(cartLink);
        }
      });
    }
    //gère l'animation de l'ouverture et ajoute la classe active a l'elemt html cartdrawer et classe overflow-h au body
    open(triggeredBy) {
      if (triggeredBy) this.setActiveElement(triggeredBy);
      const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
      if (cartDrawerNote && !cartDrawerNote.hasAttribute("role"))
        this.setSummaryAccessibility(cartDrawerNote);
      // here the animation doesn't seem to always get triggered. A timeout seem to help
      setTimeout(() => {
        // Animation avec délai lors de l'ouverture du panier
        this.classList.add("animate", "active"); //ADD CLASS ACTIVE AU CART DRAWER !!   < -  ------ -   - ----
      });
  
      this.addEventListener(
        "transitionend",
        () => {
          const containerToTrapFocusOn = this.classList.contains("is-empty")
            ? this.querySelector(".drawer__inner-empty")
            : document.getElementById("CartDrawer"); //OK
          const focusElement =
            this.querySelector(".drawer__inner") ||
            this.querySelector(".drawer__close");
          trapFocus(containerToTrapFocusOn, focusElement);
        },
        { once: true }
      );
  
      document.body.classList.add("overflow-hidden");
    }
  
    close() {
      this.classList.remove("active"); //on supprime la classe active donc ca cache le panier
      removeTrapFocus(this.activeElement);
      document.body.classList.remove("overflow-hidden");
    }
  
    setSummaryAccessibility(cartDrawerNote) {
      cartDrawerNote.setAttribute("role", "button");
      cartDrawerNote.setAttribute("aria-expanded", "false");
  
      if (cartDrawerNote.nextElementSibling.getAttribute("id")) {
        cartDrawerNote.setAttribute(
          "aria-controls",
          cartDrawerNote.nextElementSibling.id
        );
      }
  
      cartDrawerNote.addEventListener("click", (event) => {
        event.currentTarget.setAttribute(
          "aria-expanded",
          !event.currentTarget.closest("details").hasAttribute("open")
        );
      });
  
      cartDrawerNote.parentElement.addEventListener("keyup", onKeyUpEscape);
    }
  
    renderContents(parsedState) {
      this.querySelector(".drawer__inner").classList.contains("is-empty") &&
        this.querySelector(".drawer__inner").classList.remove("is-empty");
      this.productId = parsedState.id;
      this.getSectionsToRender().forEach((section) => {
        const sectionElement = section.selector
          ? document.querySelector(section.selector)
          : document.getElementById(section.id);
        sectionElement.innerHTML = this.getSectionInnerHTML(
          parsedState.sections[section.id],
          section.selector
        );
      });
  
      setTimeout(() => {
        this.querySelector("#CartDrawer-Overlay").addEventListener(
          "click",
          this.close.bind(this)
        );
        this.open();
      });
    }
  
    getSectionInnerHTML(html, selector = ".shopify-section") {
      return new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(selector).innerHTML;
    }
  
    getSectionsToRender() {
      return [
        {
          id: "app-drawer",
          selector: "#AppDrawer",
        },
        {
          id: "cart-icon-bubble",
        },
      ];
    }
  
    getSectionDOM(html, selector = ".shopify-section") {
      return new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(selector);
    }
  
    setActiveElement(element) {
      this.activeElement = element;
    }
  }
  
  //on définit le nouvel element html comme <app-drawer>
  customElements.define("app-drawer", AppDrawer);
  
  class AppDrawerItems extends AppItems {
    getSectionsToRender() {
      return [
        {
          id: "AppDrawer",
          section: "app-drawer",
          selector: ".drawer__inner",
        },
        {
          id: "cart-icon-bubble",
          section: "cart-icon-bubble",
          selector: ".shopify-section",
        },
      ];
    }
  }
  
  customElements.define("app-drawer-items", AppDrawerItems);