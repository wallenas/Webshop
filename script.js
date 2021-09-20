let products = [];
let cart = [];

window.onload = async function () {
    await fetchProducts();
    app.products = products;
}

// Closes pop-up if click is in the background
window.onclick = function (event) {
    if (event.target.id == "modalBox") {
        let div = document.getElementById('modalBox');
        div.style.display = "none";
        app.isProductSelected = false;
        app.productId = "";
    }
}

async function fetchProducts() {
    await axios.get('/products/products.json')
        .then(response => {
            products = response.data;
        })
        .catch(error => {
            console.log("Något gick fel: " + error)
        })
        .finally(() => {
            app.loading = false; // Will start creating the components
        });
}

function getProduct(productId) {
    return products.find(p => p.ID == productId);
}

Vue.component('vueheader', {
    data: function () {
        return {
            title: "wallenas clothing company",
            description: "basic clothing and fair pricing"
        }
    },
    template: '<div>' +
        '<div class="titleContainer">' +
        '<h2>{{title}}</h2>' +
        '<h3>{{description}}</h3>' +
        '</div>' +
        '</div>'
});

Vue.component('about', {
    data: function () {
        return {
            title: "about us",
            subheader: ".quality | .simplicity | .sustainability",
            description: "We care about you. You need to look your best. Bla bla bla lorem ipsum yeah" +
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum" +
                "numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium" +
                "optio, eaque rerum! Provident similique accusantium nemo autem.Veritatis" +
                "obcaecati tenetur iure eius earum ut molestias architecto voluptate aliquam" +
                "nihil, eveniet aliquid culpa officia aut! Impedit sit sunt quaerat, odit," +
                "tenetur error, harum nesciunt ipsum debitis quas aliquid.Reprehenderit, " +
                "quia.Quo neque error repudiandae fuga? Ipsa laudantium molestias eos " +
                "sapiente officiis modi at sunt excepturi expedita sint? Sed quibusdam" +
                "recusandae alias error harum maxime adipisci amet laborum.Perspiciatis " +
                "minima nesciunt dolorem! Officiis iure rerum voluptates a cumque velit " +
                "quibusdam sed amet tempora."
        }
    },
    // TODO: Gör stil av detta
    template: '<div class="about">' +
        '<h2>{{title}}</h2>' +
        '<h3 class="thin">{{subheader}}</h3>' +
        '<p>{{description}}</p>' +
        '</div>'
})

Vue.component('deals', {
    data: function () {
        return {
            firstPageProducts: [],
        }
    },
    methods: {
        getFirstPageProducts: function () {
            if (!products.length) {
                console.log("Produkter har inte laddats (deals)");
                return;
            }

            // Get all products that has ShowOnFirstPage == true and is in stock
            this.firstPageProducts = products.filter(p => p.ShowOnFirstPage && p.InStock > 0);
            // TODO: Randomize three products from an array that holds all first page items (admin-functionality)
        }
    },
    created: function () {
        this.getFirstPageProducts();
    },

    template: '<div class="deals">' +
        '<div>' +
        '<h2>deals of the week</h2>' +
        '</div>' +
        '<div class="dealsContainer">' +
        '<div class="deal" v-for="product in firstPageProducts" >' +
        '<div class="imgContainer" @click="app.showProduct(product.ID)" >' +
        '<img v-bind:src="product.Img" v-bind:alt="product.Title">' +
        '</div>' +
        '<p class="bold">{{product.Title}}, {{product.Price}}:-</p>' +
        '<button class="cart-button" @click="app.addToCart(product.ID)">add to cart</button>' +
        '</div></div></div></div>'
})

// TODO: Gör en snygg stil av detta
Vue.component('popped-product', {
    data: function () {
        return {
            product: getProduct(app.productId),
        }
    },
    template: '<div id="modalBox" class="modal" style="display: block;">' +
        '<div class="modal-content">' +
        '<span class="close" onclick="app.closeModal()">&times;</span>' +
        '<p>{{product.Title}}</p>' +
        '<p>{{product.Price}}</p>' +
        '<p>{{product.Description}}</p>' +
        '</div></div>'
})



Vue.component('product-category', {
    data: function () {
        return {
            productsInCategory: products.filter(p => p.Category == app.currentPage)
        }
    },

    template: '<div>' +
        '<div class="dealsContainer">' +
        '<div class="deal" v-for="product in productsInCategory">' +
        '<div class="imgContainer" @click="app.showProduct(product.ID)" >' +
        '<img v-bind:src="product.Img" v-bind:alt="product.Title">' +
        '</div>' +
        '<p class="bold">{{product.Title}}, {{product.Price}}:-</p>' +
        '<div class="flex">' +
        '<p class="thin">Add to cart:</p>' +
        '<div class="dealInputs">' +
        '<input type="number" min="1" v-bind:max="product.InStock" v-bind:value="1"' +
        '<button class="cart-button">OK</button>' +
        '</div></div></div></div>'
})

Vue.component('cartvue', {
    data: function () {
        return {
            cart: cart,
            total: 0,
            totalstring: ""
        }
    },
    created: function () {
        this.total = this.getTotal();
    },
    methods: {
        getTotal: function () {
            this.cart.forEach(p => {
                this.total += (p.product.Price * p.quantity);

                console.log("total: ")
                console.log(typeof (this.total) + ": " + this.total.toFixed(2) + ':-');
            })

            // Format total to string and swedish currency (to keep it simple)
            this.totalstring = this.total.toLocaleString(('se-SE'));
        }
    },
    template: '<div class="cart">' +
        '<li v-for="product in cart">{{product.product.Title}} -- Qty: {{product.quantity}} -- Price/item: {{product.product.Price}} -- Line total: {{(product.product.Price * product.quantity).toLocaleString(\'se-SE\')}}</li>' +
        '<p class="bold">Total: {{totalstring}}:-</p>' +
        '</div>'
})

var app = new Vue({
    el: "#app",
    data: {
        currentPage: "HOME", // sets starting page
        products: Array,
        isProductSelected: false, // controls the pop-up/modal box
        productId: "", //istället för hela objektet
        loading: true, // while loading products from API
        cart: []

    },
    methods: {
        changePage: function (pageName) {
            if (this.currentPage != pageName) {
                this.currentPage = pageName;
            }
        },
        showProduct: function (productId) {
            this.productId = productId;
            this.isProductSelected = true;
        },
        closeModal: function () {
            let div = document.getElementById('modalBox');
            div.style.display = "none";
            this.isProductSelected = false;
            this.productId = "";
        },
        addToCart: function (productId) {
            let product = getProduct(productId);
            let indexOfObj = cart.findIndex((p => p.product.ID == productId));

            // if product is not in the cart (index = -1), then add to cart
            if (indexOfObj === -1) {
                cart.push({ product: product, quantity: + 1 })
                console.log("Object not found in cart and pushed successfully. Current index of object: ");
                console.log(cart.findIndex((p => p.product.ID === productId)));

                this.updateCart();
                return;
            }

            // if product already is in cart, add +1 to its quantity
            cart[indexOfObj].quantity += 1;
            console.log(cart[indexOfObj])

            console.log(cart);
            this.updateCart();
        },
        updateCart: function () {
            this.cart = cart;
        }
    }
})