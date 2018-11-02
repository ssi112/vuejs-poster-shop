// console.log(Vue);

const PRICE = 9.99;
const LOAD_NUM = 10;

// pass an object to create a Vue instance
new Vue({
  el: '#app',
  data: {
    total: 0,
    items: [
      /* test data
      { id: 1, title: 'Item 1' },
      { id: 2, title: 'Item 2' },
      { id: 3, title: 'Item 3' },
      { id: 4, title: 'Item 4' }
      */
    ],
    cart: [],
    results: [],
    newSearch: 'anime',
    lastSearch: '',
    loading: false,
    price: PRICE
  },
  methods: {
    appendItems: function() { // used by scrollMonitor to load more items
      // console.log('appendItems');
      if (this.items.length < this.results.length) {
        // get the next set of items then append to items array
        let append = this.results.slice(this.items.length, this.items.length + LOAD_NUM);
        this.items = this.items.concat(append);
      }
    },
    onSubmit: function() {
      if (this.newSearch.length) {
        this.items = [];
        this.loading = true;
        this.$http
          .get('/search/'.concat(this.newSearch))
          .then(function(response) {
            this.lastSearch = this.newSearch;
            this.results = response.data;
            this.appendItems();
            this.loading = false;
          });
      }
    },
    addItem: function(index) {
      this.total += PRICE;
      var item = this.items[index];
      var found = false;
      for (let i = 0; i < this.cart.length; i++) {
        if (this.cart[i].id === item.id) {
          found = true;
          this.cart[i].qty++;
          break;
        }
      }
      if (!found) {
        this.cart.push({
          id: item.id,
          title: item.title,
          qty: 1,
          price: PRICE
        });
      }
    },
    inc: function(item) {
      item.qty++;
      this.total += PRICE;
    },
    dec: function(item) {
      item.qty--;
      this.total -= PRICE;
      if (item.qty <= 0) {
        for (let i = 0; i < this.cart.length; i++) {
          if (this.cart[i].id === item.id) {
            this.cart.splice(i, 1); // remove item from cart
            break;  // found so exit loop
          }
        }
      }
    }
  },
  computed: {
    noMoreItems: function() {
      return this.items.length === this.results.length && this.results.length > 0
    }
  },
  filters: {
    currency: function(price) {
      return '$'.concat(price.toFixed(2));
    }
  },
  mounted: function() { // vue lifecycle event
    // use default search term so something is shown on page load
    this.onSubmit();
    var vueInstance = this; // need to alias 'this' to work with scrollMonitor
    // pass in DOM node reference
    var elem = document.getElementById('product-list-bottom');
    var watcher = scrollMonitor.create(elem);
    watcher.enterViewport( function() {
      // console.log(`Entered viewport: ${elem}`);
      vueInstance.appendItems();
    });
  }
});

