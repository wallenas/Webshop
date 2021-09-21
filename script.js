let productsClone = [];
let cart = [];


// products is the clone!
window.onload = async function () {
    await fetchProducts();
}

// Closes pop-up if click is in the background
window.onclick = function (event) {
    if (event.target.id === "modalBox") {
        let div = document.getElementById('modalBox');
        div.style.display = "none";
        app.isProductSelected = false;
        app.productId = "";
    }
}

async function fetchProducts() {
    await axios.get('/products/products.json')
        .then(response => {
            // original data to keep track of the cart
            app.products = response.data;
        })
        .catch(error => {
            console.log("Något gick fel: " + error)
        })
        .finally(() => {
            // clone, to keep track of cart (I'm aware that this is ineffective in larger projects)
            productsClone = JSON.parse(JSON.stringify(app.products));
            app.isLoaded = true; // Will start creating the components

        });
}


function changeQty(amount, cartObject) {
    // add to quantity
    cartObject.quantity += amount; // -1 or +1

    amount == -1 ? cartObject.product.InStock += 1 : cartObject.product.InStock -= 1;
    
    let originalProduct = getRealProduct(cartObject.product);
    
    if (cartObject.quantity < 1) {
        // TODO: Remove product metod?
        cartObject.product.InStock -= cartObject.quantity;
        cartObject.quantity = 1;

        // TODO: explain this spaghetti
        if(cartObject.quantity === 1){
            cartObject.product.InStock = originalProduct.InStock - 1;
        }
    }
    
    else if (cartObject.quantity > originalProduct.InStock) {
        cartObject.quantity = originalProduct.InStock;
        cartObject.product.InStock = 0;
        // TODO: gör pil o-klickbar
    }
    console.log("antal i kundkorgen av produkt: " + cartObject.quantity);
    // console.log("original produkts instock: " + originalProduct.InStock)
    console.log("klonens instock: " + cartObject.product.InStock)
    
}

function getRealProduct(product) {
    return app.products.find(p => p.ID == product.ID);
}

function getCloneProduct(productId) {
    return productsClone.find(p => p.ID == productId);
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
            if (!productsClone.length) {
                console.log("Produkter har inte laddats (deals)");
                return;
            }

            // Get all products that has ShowOnFirstPage == true and is in stock
            this.firstPageProducts = productsClone.filter(p => p.ShowOnFirstPage && p.InStock > 0);
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
        '<button class="cart-button" v-if="product.InStock > 0" @click="app.addToCart(product.ID)">Add to cart</button>' +
        '<button class="cart-button" v-else>Kan inte lägga till fler av denna produkt</button>' +
        '</div></div></div></div>'
})

// TODO: Gör en snygg stil av detta
Vue.component('popped-product', {
    data: function () {
        return {
            product: getCloneProduct(app.productId),
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

Vue.component('category-products', {
    data: function () {
        return {
            category: "",
            productsInCategory: productsClone.filter(p => p.Category == app.currentPage)
        }
    },

    created: function () {
        console.log("skapar category-products");
        let currentPage = app.currentPage.toLowerCase();
        // Adds an "s" to tshirt
        if (currentPage === "tshirt") {
            this.category = currentPage.concat("s"); //tshirts
            return;
        }

        this.category = currentPage;
    },

    template: '<div class="categoryProducts">' +
        '<div>' +
        '<h2>{{category}}</h2>' +
        '</div>' +
        '<div class="cpContainer">' +
        '<div class="category" v-for="product in productsInCategory">' +
        '<div class="imgContainer" @click="app.showProduct(product.ID)" >' +
        '<img v-bind:src="product.Img" v-bind:alt="product.Title">' +
        '</div>' +
        '<p class="bold">{{product.Title}}, {{product.Price}}:-</p>' +
        '<button class="cart-button"  v-if="product.InStock > 0" @click="app.addToCart(product.ID)">add to cart</button>' +
        '<button class="cart-button" v-else>Kan inte lägga till fler av denna produkt</button>' +
        '</div></div></div></div></div>'
})

Vue.component('cartvue', {
    data: function () {
        return {
            cart: cart,
            totalstring: ""
        }
    },
    created: function () {
        this.getTotal();
    },
    methods: {
        getTotal: function () {
            let calc = 0;
            this.cart.forEach(p => {
                calc += p.product.Price * p.quantity;
            })

            let total = calc.toFixed(2);
            // Format total to string and swedish currency (to keep it simple)
            return total.toLocaleString(('se-SE'));
        },
        getCurrencyFormatedString: function (product) {
            let price = product.product.Price;
            price = price.toFixed(2);
            return price.toLocaleString(('se-SE')) + ":-";
        },
        getLineTotalToCurrency: function (product) {
            let total = product.product.Price * product.quantity;
            total = total.toFixed(2);
            return total.toLocaleString(('se-SE')) + ":-";
        }
    },

    template: '<div v-if="cart.length">' +
        '<h2 style="text-align: center; margin: 5px; padding: 5px;">cart</h2>' +
        '<div class="cart">' +
        '<div class="cartHeaders"><h2>Product</h2><h2>Quantity</h2><h2>Price</h2><h2>Total</h2></div>' +
        '<div class="cartItem" v-for="p in cart">' +
        '<div class="productInfo" style="display: flex; align-items: center;">' +
        '<div class="cartImgContainer">' +
        '<img class="cartImg" v-bind:src="p.product.Img">' +
        '</div>' +
        '<div style="width: 200px; margin-left: 10px;">' +
        '<h3 style="text-align: left;">{{p.product.Title}}</h3>' +
        '<p style="text-align: left; font-size: 14px;">{{p.product.Category.toLowerCase()}}</p>' +
        '<button @click="app.removeFromCart(p)" style="float: left;">Remove</button>' +
        '</div>' +
        '</div>' +
        '<div class="quantityContainer">' +
        '<span class="minus bold" @click="changeQty(-1, p)">&minus;</span>' +
        '<p v-model="p.quantity">{{p.quantity}}</p>' +
        '<span class="plus bold" @click="changeQty(1, p)">&plus;</span >' +
        '</div>' +
        '<div class="priceContainer">' +
        '<p class="bold">{{getCurrencyFormatedString(p)}}</p>' +
        '</div>' +
        '<div class="totalContainer">' +
        '<p class="bold">{{getLineTotalToCurrency(p)}}</p>' +
        '</div></div>' +
        '<div>Total: {{getTotal()}}:-</div>' +
        '<button @click="app.goToPayment()">Pay Now</button>' +
        '</div></div>'
})

Vue.component('payment', {
    data: function () {
        return {
            cart: cart,
            isFormOkay: false,
            firstName: "",
            lastName: "",
            email: "",
            country: "",
            city: "",
            street: "",
            zipCode: "",
            paymentMethod: "", // maybe a boolean instead (swish/bank) isPayingByBank?
            swishImg: "", //for radiobuttons
            bankImg: "", //for radiobuttons

        }
    },
    methods: {

    },
    template: '<div>' +
        '<div>' +
        '<h2>Payment</h2>' +
        '<button @click>Buy now</button>'
})

// 1. When program loads -> fill app.products with the response, and save the response separetly at the top (window.onload function)
// 2. When adding to cart, use app.products to handle the InStock of the product (can't add if trying to add more than InStock)
// 3. When purchase is done -> products = app.products
// 4. Use products during payout


var app = new Vue({
    el: "#app",
    data: {
        currentPage: "HOME", // sets starting page
        products: Array, // the original response data
        isProductSelected: false, // controls the pop-up/modal box
        productId: "", // istället för hela objektet
        isLoaded: false, // while loading products from API
        cart: [], // used as a condition in the navbar
        showPayment: false

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
            let product = getCloneProduct(productId);
            // let indexOfObj = cart.findIndex((p => p.product.ID == productId));
            let cartObject = cart.find((p => p.product.ID == productId));

            if (product.InStock < 1) {
                console.log("varan är slut, lägger inte till i kundvagnen")
                return;
            }
            // cartObject == null covers both null and undefined
            if (cartObject == null) {
                cart.push({ product: product, quantity: 1 })
                product.InStock -= 1;

                // console.log("klonens inStock (första gången): " + product.InStock)
                this.updateCart();
                return;
            }

            // if product already is in cart, add +1 to its quantity
            product.InStock -= 1; //klonens InStock
            cartObject.quantity += 1;

            // let original = getRealProduct(product);

            // to show that we're indeed working with a clone
            // console.log("klonens inStock: " + product.InStock)
            // console.log("originalets inStock: " + original.InStock);
            this.updateCart();
        },
        removeFromCart: function (cartObject) {
            let indexOfObj = cart.findIndex((p => p.product.ID == cartObject.product.ID));
            cart.splice(indexOfObj, 1);
            let p = getCloneProduct(cartObject.product.ID)

            // Fill the product's InStock with what was in the cart
            p.InStock += cartObject.quantity;
        },
        updateCart: function () {
            this.cart = cart;
        },
        goToPayment: function () {
            this.showPayment = true;
        }
    }
})