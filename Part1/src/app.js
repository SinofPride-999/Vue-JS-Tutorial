let app = Vue.createApp({
  data() {
    return {
      inventory: [],
      cart: {},
      showSideBar: false
    }
  },
  computed: {
    totalQuantity() {
      return Object.values(this.cart).reduce((acc, curr) => {
        return acc + curr
      }, 0)
    }
  },
  methods: {
    toggleSidebar() {
      this.showSideBar = !this.showSideBar;
    },
    addToCart(name, index) {
      const quantity = this.inventory[index].quantity || 0;
      if (quantity <= 0) return; // Don't add invalid quantities

      if (!this.cart[name]) this.cart[name] = 0;
      this.cart[name] += quantity;

      this.inventory[index].quantity = 1; // Reset quantity after adding to cart
      console.log(this.cart);
    },
    remove(name) {
      delete this.cart[name]
    }
  },
  async mounted() {
    const res = await fetch('./food.json');
    const data = await res.json();

    this.inventory = data.map(product => ({
      ...product,
      quantity: 1
    }));
  }
})

app.component('sidebar', {
  props: ['toggle', 'cart', 'inventory', 'remove'],

  methods: {
    getPrice(name) {
      const product = this.inventory.find((p) => {
        return p.name === name
      })
      return product.price.USD
    },
    calculateTotal() {
      const total = Object.entries(this.cart).reduce((acc, [name, qty]) => {
        return acc + (qty * this.getPrice(name));
      }, 0);
      return total.toFixed(2);
    }
  },

  template: `
    <aside class="cart-container">
      <div class="cart">
        <h1 class="cart-title spread">
          <span>
            Cart
            <i class="icofont-cart-alt icofont-1x"></i>
          </span>
          <button @click="toggle" class="cart-close">&times;</button>
        </h1>

        <div class="cart-body">
          <table class="cart-table">
            <thead>
              <tr>
                <th><span class="sr-only">Product Image</span></th>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(quantity, key, i) in cart" :key="i" >
                <td><i class="icofont-carrot icofont-3x"></i></td>
                <td>{{ key }}</td>
                <td>\${{ getPrice(key) }}</td>
                <td class="center">{{ quantity }}</td>
                <td>\${{ quantity * getPrice(key) }}</td>
                <td class="center">
                  <button @click="remove(key)" class="btn btn-light cart-remove">
                    &times;
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-if="Object.keys(cart).length === 0" class="center">
            <em>No items in cart</em>
          </p>
          <div class="spread">
            <span><strong>Total:</strong> \${{ calculateTotal() }}</span>
            <button class="btn btn-light">Checkout</button>
          </div>
        </div>
      </div>
    </aside>
  `
})

app.mount('#app')