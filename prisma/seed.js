import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const superCart = await prisma.superCart.create({
    data: {
        title: `
        {% comment %}
  Renders cart drawer

  Usage:
  {% render 'cart-drawer' %}
{% endcomment %}

{{ 'quantity-popover.css' | asset_url | stylesheet_tag }}

<script src="{{ 'cart.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'quantity-popover.js' | asset_url }}" defer="defer"></script>

<style>
  .drawer {
    visibility: hidden;
  }
</style>

<cart-drawer class="drawer{% if cart == empty %} is-empty{% endif %}">
  <div id="CartDrawer" class="cart-drawer">
    <div id="CartDrawer-Overlay" class="cart-drawer__overlay"></div>
    <div
      class="drawer__inner"
      role="dialog"
      aria-modal="true"
      aria-label="{{ 'sections.cart.title' | t }}"
      tabindex="-1"
    >
      {%- if cart == empty -%}
        <div class="drawer__inner-empty">
          <div class="cart-drawer__warnings center{% if settings.cart_drawer_collection != blank %} cart-drawer__warnings--has-collection{% endif %}">
            <div class="cart-drawer__empty-content">
              <h2 class="cart__empty-text">{{ 'sections.cart.empty' | t }}</h2>
              <button
                class="drawer__close"
                type="button"
                onclick="this.closest('cart-drawer').close()"
                aria-label="{{ 'accessibility.close' | t }}"
              >
                {% render 'icon-close' %}
              </button>
              <a href="{{ routes.all_products_collection_url }}" class="button">
                {{ 'general.continue_shopping' | t }}
              </a>

              {%- if shop.customer_accounts_enabled and customer == null -%}
                <p class="cart__login-title h3">{{ 'sections.cart.login.title' | t }}</p>
                <p class="cart__login-paragraph">
                  {{ 'sections.cart.login.paragraph_html' | t: link: routes.account_login_url }}
                </p>
              {%- endif -%}
            </div>
          </div>
          {%- if settings.cart_drawer_collection != blank -%}
            <div class="cart-drawer__collection">
              {% render 'card-collection', card_collection: settings.cart_drawer_collection, columns: 1 %}
            </div>
          {%- endif -%}
        </div>
      {%- endif -%}
      <div class="drawer__header">
        <h2 class="drawer__heading">{{ 'sections.cart.title' | t }}</h2>
        <button
          class="drawer__close"
          type="button"
          onclick="this.closest('cart-drawer').close()"
          aria-label="{{ 'accessibility.close' | t }}"
        >
          {% render 'icon-close' %}
        </button>
      </div>
      <cart-drawer-items
        {% if cart == empty %}
          class=" is-empty"
        {% endif %}
      >`,
      option1: "",
      form: ` <form
      action="{{ routes.cart_url }}"
      id="CartDrawer-Form"
      class="cart__contents cart-drawer__form"
      method="post"
    >
      <div id="CartDrawer-CartItems" class="drawer__contents js-contents">
        {%- if cart != empty -%}
          <div class="drawer__cart-items-wrapper">
            <table class="cart-items" role="table">
              <thead role="rowgroup">
                <tr role="row">
                  <th id="CartDrawer-ColumnProductImage" role="columnheader">
                    <span class="visually-hidden">{{ 'sections.cart.headings.image' | t }}</span>
                  </th>
                  <th
                    id="CartDrawer-ColumnProduct"
                    class="caption-with-letter-spacing"
                    scope="col"
                    role="columnheader"
                  >
                    {{ 'sections.cart.headings.product' | t }}
                  </th>
                  <th
                    id="CartDrawer-ColumnTotal"
                    class="right caption-with-letter-spacing"
                    scope="col"
                    role="columnheader"
                  >
                    {{ 'sections.cart.headings.total' | t }}
                  </th>
                  <th id="CartDrawer-ColumnQuantity" role="columnheader">
                    <span class="visually-hidden">{{ 'sections.cart.headings.quantity' | t }}</span>
                  </th>
                </tr>
              </thead>

              <tbody role="rowgroup">
                {%- for item in cart.items -%}
                  <tr id="CartDrawer-Item-{{ item.index | plus: 1 }}" class="cart-item" role="row">
                    <td class="cart-item__media" role="cell" headers="CartDrawer-ColumnProductImage">
                      {% if item.image %}
                        {% comment %} Leave empty space due to a:empty CSS display: none rule {% endcomment %}
                        <a href="{{ item.url }}" class="cart-item__link" tabindex="-1" aria-hidden="true"> </a>
                        <img
                          class="cart-item__image"
                          src="{{ item.image | image_url: width: 300 }}"
                          alt="{{ item.image.alt | escape }}"
                          loading="lazy"
                          width="150"
                          height="{{ 150 | divided_by: item.image.aspect_ratio | ceil }}"
                        >
                      {% endif %}
                    </td>

                    <td class="cart-item__details" role="cell" headers="CartDrawer-ColumnProduct">
                      {%- if settings.show_vendor -%}
                        <p class="caption-with-letter-spacing light">{{ item.product.vendor }}</p>
                      {%- endif -%}

                      <a href="{{ item.url }}" class="cart-item__name h4 break">
                        {{- item.product.title | escape -}}
                      </a>

                      {%- if item.original_price != item.final_price -%}
                        <div class="cart-item__discounted-prices">
                          <span class="visually-hidden">
                            {{ 'products.product.price.regular_price' | t }}
                          </span>
                          <s class="cart-item__old-price product-option">
                            {{- item.original_price | money -}}
                          </s>
                          <span class="visually-hidden">
                            {{ 'products.product.price.sale_price' | t }}
                          </span>
                          <strong class="cart-item__final-price product-option">
                            {{ item.final_price | money }}
                          </strong>
                        </div>
                      {%- else -%}
                        <div class="product-option">
                          {{ item.original_price | money }}
                        </div>
                      {%- endif -%}

                      {%- if item.product.has_only_default_variant == false
                        or item.properties.size != 0
                        or item.selling_plan_allocation != null
                      -%}
                        <dl>
                          {%- if item.product.has_only_default_variant == false -%}
                            {%- for option in item.options_with_values -%}
                              <div class="product-option">
                                <dt>{{ option.name }}:</dt>
                                <dd>
                                  {{ option.value -}}
                                  {%- unless forloop.last %}, {% endunless %}
                                </dd>
                              </div>
                            {%- endfor -%}
                          {%- endif -%}

                          {%- for property in item.properties -%}
                            {%- assign property_first_char = property.first | slice: 0 -%}
                            {%- if property.last != blank and property_first_char != '_' -%}
                              <div class="product-option">
                                <dt>{{ property.first }}:</dt>
                                <dd>
                                  {%- if property.last contains '/uploads/' -%}
                                    <a
                                      href="{{ property.last }}"
                                      class="link"
                                      target="_blank"
                                      aria-describedby="a11y-new-window-message"
                                    >
                                      {{ property.last | split: '/' | last }}
                                    </a>
                                  {%- else -%}
                                    {{ property.last }}
                                  {%- endif -%}
                                </dd>
                              </div>
                            {%- endif -%}
                          {%- endfor -%}
                        </dl>

                        <p class="product-option">{{ item.selling_plan_allocation.selling_plan.name }}</p>
                      {%- endif -%}

                      <ul
                        class="discounts list-unstyled"
                        role="list"
                        aria-label="{{ 'customer.order.discount' | t }}"
                      >
                        {%- for discount in item.line_level_discount_allocations -%}
                          <li class="discounts__discount">
                            {%- render 'icon-discount' -%}
                            {{ discount.discount_application.title }}
                          </li>
                        {%- endfor -%}
                      </ul>
                    </td>

                    <td class="cart-item__totals right" role="cell" headers="CartDrawer-ColumnTotal">
                      <div class="loading-overlay hidden">
                        <div class="loading-overlay__spinner">
                          <svg
                            aria-hidden="true"
                            focusable="false"
                            class="spinner"
                            viewBox="0 0 66 66"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                          </svg>
                        </div>
                      </div>

                      <div class="cart-item__price-wrapper">
                        {%- if item.original_line_price != item.final_line_price -%}
                          <div class="cart-item__discounted-prices">
                            <span class="visually-hidden">
                              {{ 'products.product.price.regular_price' | t }}
                            </span>
                            <s class="cart-item__old-price price price--end">
                              {{ item.original_line_price | money }}
                            </s>
                            <span class="visually-hidden">
                              {{ 'products.product.price.sale_price' | t }}
                            </span>
                            <span class="price price--end">
                              {{ item.final_line_price | money }}
                            </span>
                          </div>
                        {%- else -%}
                          <span class="price price--end">
                            {{ item.original_line_price | money }}
                          </span>
                        {%- endif -%}

                        {%- if item.variant.available and item.unit_price_measurement -%}
                          <div class="unit-price caption">
                            <span class="visually-hidden">{{ 'products.product.price.unit_price' | t }}</span>
                            {{ item.unit_price | money }}
                            <span aria-hidden="true">/</span>
                            <span class="visually-hidden"
                              >&nbsp;{{ 'accessibility.unit_price_separator' | t }}&nbsp;</span
                            >
                            {%- if item.unit_price_measurement.reference_value != 1 -%}
                              {{- item.unit_price_measurement.reference_value -}}
                            {%- endif -%}
                            {{ item.unit_price_measurement.reference_unit }}
                          </div>
                        {%- endif -%}
                      </div>
                    </td>
                    {%- liquid
                      assign has_qty_rules = false
                      if item.variant.quantity_rule.increment > 1 or item.variant.quantity_rule.min > 1 or item.variant.quantity_rule.max != null
                        assign has_qty_rules = true
                      endif

                      assign has_vol_pricing = false
                      if item.variant.quantity_price_breaks.size > 0
                        assign has_vol_pricing = true
                      endif
                    -%}
                    <td
                      class="cart-item__quantity {% if has_qty_rules or has_vol_pricing %} cart-item__quantity--info{% endif %}"
                      role="cell"
                      headers="CartDrawer-ColumnQuantity"
                    >
                      <quantity-popover>
                        <div class="cart-item__quantity-wrapper quantity-popover-wrapper">
                          <div class="quantity-popover-container{% if has_qty_rules or has_vol_pricing %} quantity-popover-container--hover{% endif %}">
                            <quantity-input class="quantity cart-quantity">
                              <button class="quantity__button no-js-hidden" name="minus" type="button">
                                <span class="visually-hidden">
                                  {{-
                                    'products.product.quantity.decrease'
                                    | t: product: item.product.title
                                    | escape
                                  -}}
                                </span>
                                {% render 'icon-minus' %}
                              </button>
                              <input
                                class="quantity__input"
                                type="number"
                                data-quantity-variant-id="{{ item.variant.id }}"
                                name="updates[]"
                                value="{{ item.quantity }}"
                                {% # theme-check-disable %}
                                data-cart-quantity="{{ cart | item_count_for_variant: item.variant.id }}"
                                min="{{ item.variant.quantity_rule.min }}"
                                {% if item.variant.quantity_rule.max != null %}
                                  max="{{ item.variant.quantity_rule.max }}"
                                {% endif %}
                                step="{{ item.variant.quantity_rule.increment }}"
                                {% # theme-check-enable %}
                                aria-label="{{ 'products.product.quantity.input_label' | t: product: item.product.title | escape }}"
                                id="Drawer-quantity-{{ item.index | plus: 1 }}"
                                data-index="{{ item.index | plus: 1 }}"
                              >
                              <button class="quantity__button no-js-hidden" name="plus" type="button">
                                <span class="visually-hidden">
                                  {{-
                                    'products.product.quantity.increase'
                                    | t: product: item.product.title
                                    | escape
                                  -}}
                                </span>
                                {% render 'icon-plus' %}
                              </button>
                            </quantity-input>
                          </div>
                          <cart-remove-button
                            id="CartDrawer-Remove-{{ item.index | plus: 1 }}"
                            data-index="{{ item.index | plus: 1 }}"
                          >
                            <button
                              type="button"
                              class="button button--tertiary cart-remove-button"
                              aria-label="{{ 'sections.cart.remove_title' | t: title: item.title }}"
                              data-variant-id="{{ item.variant.id }}"
                            >
                              {% render 'icon-remove' %}
                            </button>
                          </cart-remove-button>
                        </div>
                        {%- if has_qty_rules or has_vol_pricing -%}
                          <button
                            type="button"
                            class="quantity-popover__info-button quantity-popover__info-button--icon-with-label button button--tertiary"
                            aria-expanded="false"
                          >
                            {% render 'icon-info' %}
                            <span>
                              {%- if has_vol_pricing -%}
                                {{ 'products.product.volume_pricing.note' | t }}
                              {%- elsif has_qty_rules -%}
                                {{ 'products.product.quantity.note' | t }}
                              {%- endif -%}
                            </span>
                          </button>
                        {%- endif -%}
                        {%- if has_vol_pricing or has_qty_rules -%}
                          <div
                            class="cart-items__info global-settings-popup quantity-popover__info"
                            tabindex="-1"
                            hidden
                          >
                            {%- if has_qty_rules == false -%}
                              <span class="volume-pricing-label caption">
                                {{- 'products.product.volume_pricing.title' | t -}}
                              </span>
                            {%- endif -%}
                            <div class="quantity__rules caption no-js-hidden">
                              {%- if item.variant.quantity_rule.increment > 1 -%}
                                <span class="divider">
                                  {{-
                                    'products.product.quantity.multiples_of'
                                    | t: quantity: item.variant.quantity_rule.increment
                                  -}}
                                </span>
                              {%- endif -%}
                              {%- if item.variant.quantity_rule.min > 1 -%}
                                <span class="divider">
                                  {{-
                                    'products.product.quantity.minimum_of'
                                    | t: quantity: item.variant.quantity_rule.min
                                  -}}
                                </span>
                              {%- endif -%}
                              {%- if item.variant.quantity_rule.max != null -%}
                                <span class="divider">
                                  {{-
                                    'products.product.quantity.maximum_of'
                                    | t: quantity: item.variant.quantity_rule.max
                                  -}}
                                </span>
                              {%- endif -%}
                            </div>
                            <button
                              class="button-close button button--tertiary"
                              type="button"
                              aria-label="{{ 'accessibility.close' | t }}"
                            >
                              {%- render 'icon-close' -%}
                            </button>
                            {%- if item.variant.quantity_price_breaks.size > 0 -%}
                              <volume-pricing class="parent-display">
                                <ul class="list-unstyled">
                                  <li>
                                    <span>{{ item.variant.quantity_rule.min }}+</span>
                                    <span>{{ item.variant.price | money_with_currency }}/ea</span>
                                  </li>
                                  {%- for price_break in item.variant.quantity_price_breaks -%}
                                    <li>
                                      <span>
                                        {{- price_break.minimum_quantity -}}
                                        <span aria-hidden="true">+</span></span
                                      >
                                      <span>{{ price_break.price | money_with_currency }}/ea</span>
                                    </li>
                                  {%- endfor -%}
                                </ul>
                              </volume-pricing>
                            {%- endif -%}
                          </div>
                        {%- endif -%}
                        <div
                          id="CartDrawer-LineItemError-{{ item.index | plus: 1 }}"
                          class="cart-item__error"
                          role="alert"
                        >
                          <small class="cart-item__error-text"></small>
                          <svg
                            aria-hidden="true"
                            focusable="false"
                            class="icon icon-error"
                            viewBox="0 0 13 13"
                          >
                            <circle cx="6.5" cy="6.50049" r="5.5" stroke="white" stroke-width="2"/>
                            <circle cx="6.5" cy="6.5" r="5.5" fill="#EB001B" stroke="#EB001B" stroke-width="0.7"/>
                            <path d="M5.87413 3.52832L5.97439 7.57216H7.02713L7.12739 3.52832H5.87413ZM6.50076 9.66091C6.88091 9.66091 7.18169 9.37267 7.18169 9.00504C7.18169 8.63742 6.88091 8.34917 6.50076 8.34917C6.12061 8.34917 5.81982 8.63742 5.81982 9.00504C5.81982 9.37267 6.12061 9.66091 6.50076 9.66091Z" fill="white"/>
                            <path d="M5.87413 3.17832H5.51535L5.52424 3.537L5.6245 7.58083L5.63296 7.92216H5.97439H7.02713H7.36856L7.37702 7.58083L7.47728 3.537L7.48617 3.17832H7.12739H5.87413ZM6.50076 10.0109C7.06121 10.0109 7.5317 9.57872 7.5317 9.00504C7.5317 8.43137 7.06121 7.99918 6.50076 7.99918C5.94031 7.99918 5.46982 8.43137 5.46982 9.00504C5.46982 9.57872 5.94031 10.0109 6.50076 10.0109Z" fill="white" stroke="#EB001B" stroke-width="0.7">
                          </svg>
                        </div>
                      </quantity-popover>
                    </td>
                  </tr>
                {%- endfor -%}
              </tbody>
            </table>
          </div>
        {%- endif -%}
        <p id="CartDrawer-LiveRegionText" class="visually-hidden" role="status"></p>
        <p id="CartDrawer-LineItemStatus" class="visually-hidden" aria-hidden="true" role="status">
          {{ 'accessibility.loading' | t }}
        </p>
      </div>
      <div id="CartDrawer-CartErrors" role="alert"></div>
    </form>`,
      option2: "",
      total: `</cart-drawer-items>
      <div class="drawer__footer">
        {%- if settings.show_cart_note -%}
          <details id="Details-CartDrawer">
            <summary>
              <span class="summary__title">
                {{ 'sections.cart.note' | t }}
                {% render 'icon-caret' %}
              </span>
            </summary>
            <cart-note class="cart__note field">
              <label class="visually-hidden" for="CartDrawer-Note">{{ 'sections.cart.note' | t }}</label>
              <textarea
                id="CartDrawer-Note"
                class="text-area text-area--resize-vertical field__input"
                name="note"
                placeholder="{{ 'sections.cart.note' | t }}"
              >{{ cart.note }}</textarea>
            </cart-note>
          </details>
        {%- endif -%}

        <!-- Start blocks -->
        <!-- Subtotals -->

        <div class="cart-drawer__footer" {{ block.shopify_attributes }}>
          <div>
            {%- if cart.cart_level_discount_applications.size > 0 -%}
              <ul class="discounts list-unstyled" role="list" aria-label="{{ 'customer.order.discount' | t }}">
                {%- for discount in cart.cart_level_discount_applications -%}
                  <li class="discounts__discount discounts__discount--end">
                    {%- render 'icon-discount' -%}
                    {{ discount.title }}
                    (-{{ discount.total_allocated_amount | money }})
                  </li>
                {%- endfor -%}
              </ul>
            {%- endif -%}
          </div>

          <div class="totals" role="status">
            <h2 class="totals__total">{{ 'sections.cart.estimated_total' | t }}</h2>
            <p class="totals__total-value">{{ cart.total_price | money_with_currency }}</p>
          </div>`,
      option3: "",
      footer: `
      <small class="tax-note caption-large rte">
            {%- if cart.taxes_included and shop.shipping_policy.body != blank -%}
              {{ 'sections.cart.taxes_included_and_shipping_policy_html' | t: link: shop.shipping_policy.url }}
            {%- elsif cart.taxes_included -%}
              {{ 'sections.cart.taxes_included_but_shipping_at_checkout' | t }}
            {%- elsif shop.shipping_policy.body != blank -%}
              {{ 'sections.cart.taxes_and_shipping_policy_at_checkout_html' | t: link: shop.shipping_policy.url }}
            {%- else -%}
              {{ 'sections.cart.taxes_and_shipping_at_checkout' | t }}
            {%- endif -%}
          </small>
        </div>

        <!-- CTAs -->
        <div class="cart__ctas" {{ block.shopify_attributes }}>
          <noscript>
            <button type="submit" class="cart__update-button button button--secondary" form="CartDrawer-Form">
              {{ 'sections.cart.update' | t }}
            </button>
          </noscript>

          <button
            type="submit"
            id="CartDrawer-Checkout"
            class="cart__checkout-button button"
            name="checkout"
            form="CartDrawer-Form"
            {% if cart == empty %}
              disabled
            {% endif %}
          >
            {{ 'sections.cart.checkout' | t }}
          </button>
        </div>
      </div>
    </div>
  </div>
</cart-drawer>

<script>
  document.addEventListener('DOMContentLoaded', function () {
    function isIE() {
      const ua = window.navigator.userAgent;
      const msie = ua.indexOf('MSIE ');
      const trident = ua.indexOf('Trident/');

      return msie > 0 || trident > 0;
    }

    if (!isIE()) return;
    const cartSubmitInput = document.createElement('input');
    cartSubmitInput.setAttribute('name', 'checkout');
    cartSubmitInput.setAttribute('type', 'hidden');
    document.querySelector('#cart').appendChild(cartSubmitInput);
    document.querySelector('#checkout').addEventListener('click', function (event) {
      document.querySelector('#cart').submit();
    });
  });
</script>
`
    }
  })
  
  console.log()
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
