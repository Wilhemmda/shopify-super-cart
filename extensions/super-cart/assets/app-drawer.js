document.addEventListener("DOMContentLoaded", function () {
    let cartItemsListener; // Déclarez la variable en dehors de la portée de la fonction
  
    fetch(`${routes.cart_url}?section_id=main-cart-items`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, "text/html");
        cartItemsListener = html.querySelector("cart-items");
        console.log(cartItemsListener);
  
        //RESTE DU CODE
        const ON_CHANGE_DEBOUNCE_TIMER = 300;
  
        const PUB_SUB_EVENTS = {
          cartUpdate: "cart-update",
          quantityUpdate: "quantity-update",
          variantChange: "variant-change",
          cartError: "cart-error",
        };
  
        function debounce(fn, wait) {
          let t;
          return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
          };
        }
  
        cartItemsListener.lineItemStatusElement =
          document.getElementById("shopping-cart-line-item-status") ||
          document.getElementById("CartDrawer-LineItemStatus");
  
        //ecoute les "change" et ajoute un délai au fonction (les "débites")
        const debouncedOnChange = debounce((event) => {
          cartItemsListener.onChange(event); // Appelle la fonction onChange puis updateQtt
        }, ON_CHANGE_DEBOUNCE_TIMER);
  
        //dès qu'un element dans le panier change(ATC), appele debounce qui appelle onChange qui appelle UpdateQtty
        cartItemsListener.addEventListener(
          "change",
          debouncedOnChange.bind(cartItemsListener)
        );
  
        console.log("yo");
        function connectedCallback() {
          cartItemsListener.cartUpdateUnsubscriber = subscribe(
            PUB_SUB_EVENTS.cartUpdate,
            (event) => {
              if (event.source === "cart-items") {
                return;
              }
              cartItemsListener.onCartUpdate();
            }
          );
        }
  
        function disconnectedCallback() {
          if (cartItemsListener.cartUpdateUnsubscriber) {
            cartItemsListener.cartUpdateUnsubscriber();
          }
        }
  
        //dès qu'un element change, on appelle la fonction updateQuantity
        function onChange(event) {
          cartItemsListener.updateQuantity(
            event.target.dataset.index,
            event.target.value,
            document.activeElement.getAttribute("name")
          );
        }
  
        //fetch cart-items element and update it when a cart update event come
        function onCartUpdate() {
          fetch(`${routes.cart_url}?section_id=main-cart-items`)
            .then((response) => response.text())
            .then((responseText) => {
              const html = new DOMParser().parseFromString(
                responseText,
                "text/html"
              );
              const sourceQty = html.querySelector("cart-items");
              cartItemsListener.innerHTML = sourceQty.innerHTML; //met à jour l'element courant avec le contenu de cart-items
            })
            .catch((e) => {
              console.error(e);
            });
        }
  
        function getSectionsToRender() {
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
  
        function updateQuantity(line, quantity, name) {
          cartItemsListener.enableLoading(line);
  
          const body = JSON.stringify({
            line,
            quantity,
            sections: cartItemsListener
              .getSectionsToRender()
              .map((section) => section.section),
            sections_url: window.location.pathname,
          });
  
          fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
            .then((response) => {
              return response.text();
            })
            .then((state) => {
              const parsedState = JSON.parse(state);
              //récupération de l'id - + de la qtt
              const quantityElement =
                document.getElementById(`Quantity-${line}`) ||
                document.getElementById(`Drawer-quantity-${line}`); //id de l'input - + du btn qtt
              const items = document.querySelectorAll(".cart-item");
  
              if (parsedState.errors) {
                quantityElement.value = quantityElement.getAttribute("value");
                cartItemsListener.updateLiveRegions(line, parsedState.errors);
                return;
              }
  
              cartItemsListener.classList.toggle(
                "is-empty",
                parsedState.item_count === 0
              );
              const cartDrawerWrapper = document.querySelector(".cartDrawer"); // ICI
              const cartFooter = document.getElementById("main-cart-footer");
  
              if (cartFooter)
                cartFooter.classList.toggle(
                  "is-empty",
                  parsedState.item_count === 0
                );
              if (cartDrawerWrapper)
                cartDrawerWrapper.classList.toggle(
                  "is-empty",
                  parsedState.item_count === 0 //si la qtt est 0 ajoute la class is-empty
                );
  
              cartItemsListener.getSectionsToRender().forEach((section) => {
                const elementToReplace =
                  document
                    .getElementById(section.id)
                    .querySelector(section.selector) ||
                  document.getElementById(section.id);
                elementToReplace.innerHTML =
                  cartItemsListener.getSectionInnerHTML(
                    parsedState.sections[section.section],
                    section.selector
                  );
              });
              //MAJ DES VALEURS
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
              cartItemsListener.updateLiveRegions(line, message);
  
              //AFFICHE L ITEM OU PAS SI VIDE
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
              } else if (
                document.querySelector(".cart-item") &&
                cartDrawerWrapper
              ) {
                trapFocus(
                  cartDrawerWrapper,
                  document.querySelector(".cart-item__name")
                );
              }
              publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
            })
            .catch(() => {
              cartItemsListener
                .querySelectorAll(".loading-overlay")
                .forEach((overlay) => overlay.classList.add("hidden"));
              const errors =
                document.getElementById("cart-errors") ||
                document.getElementById("CartDrawer-CartErrors");
              errors.textContent = window.cartStrings.error;
            })
            .finally(() => {
              cartItemsListener.disableLoading(line);
            });
        }
  
        function updateLiveRegions(line, message) {
          const lineItemError =
            document.getElementById(`Line-item-error-${line}`) ||
            document.getElementById(`CartDrawer-LineItemError-${line}`);
          if (lineItemError)
            lineItemError.querySelector(".cart-item__error-text").innerHTML =
              message;
  
          cartItemsListener.lineItemStatusElement.setAttribute(
            "aria-hidden",
            true
          );
  
          const cartStatus =
            document.getElementById("cart-live-region-text") ||
            document.getElementById("CartDrawer-LiveRegionText");
          cartStatus.setAttribute("aria-hidden", false);
  
          setTimeout(() => {
            cartStatus.setAttribute("aria-hidden", true);
          }, 1000);
        }
  
        function getSectionInnerHTML(html, selector) {
          return new DOMParser()
            .parseFromString(html, "text/html")
            .querySelector(selector).innerHTML;
        }
  
        function enableLoading(line) {
          const mainCartItems =
            document.getElementById("main-cart-items") ||
            document.getElementById("CartDrawer-CartItems");
          mainCartItems.classList.add("cart__items--disabled");
  
          const cartItemElements = cartItemsListener.querySelectorAll(
            `#CartItem-${line} .loading-overlay`
          );
          const cartDrawerItemElements = cartItemsListener.querySelectorAll(
            `#CartDrawer-Item-${line} .loading-overlay`
          );
  
          [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) =>
            overlay.classList.remove("hidden")
          );
  
          document.activeElement.blur();
          cartItemsListener.lineItemStatusElement.setAttribute(
            "aria-hidden",
            false
          );
        }
  
        function disableLoading(line) {
          const mainCartItems =
            document.getElementById("main-cart-items") ||
            document.getElementById("CartDrawer-CartItems");
          mainCartItems.classList.remove("cart__items--disabled");
  
          const cartItemElements = cartItemsListener.querySelectorAll(
            `#CartItem-${line} .loading-overlay`
          );
          const cartDrawerItemElements = cartItemsListener.querySelectorAll(
            `#CartDrawer-Item-${line} .loading-overlay`
          );
  
          cartItemElements.forEach((overlay) => overlay.classList.add("hidden"));
          cartDrawerItemElements.forEach((overlay) =>
            overlay.classList.add("hidden")
          );
        }
  
        onCartUpdate();
      })
      .catch((e) => {
        console.log("error in fetch");
        console.error(e);
      });
  
    // SELECTOR
    const cartDrawerClass = document.querySelector(".cartDrawer");
    const closeButton = document.querySelector(".btnClose");
    const cartDrawerBalise = document.querySelector("cart-drawer");
  
    //OUVERTURE PANIER AVEC LISTENER SUR L ATC
    const addToCart = document.querySelectorAll(".product-form__submit");
    if (addToCart) {
      addToCart.forEach(function (button) {
        button.addEventListener("click", function () {
          setTimeout(() => {
            cartDrawerClass.classList.add("active");
            console.log("ouverture panier");
          }, 200);
          setTimeout(() => {
            cartDrawerBalise.classList.remove("active"); //FERMETURE PANIER SHOPIFY
          }, 500);
        });
      });
    }
  
    //FERMETURE PANIER
    closeButton.addEventListener("click", function () {
      cartDrawerClass.classList.remove("active");
  
      // FERMETURE PANIER SHOPIFY
      //cartDrawerBalise.classList.remove("active");
    });
  });