// 1. When program loads -> fill app.products with the response, and save the response separetly at the top (window.onload function)
// 2. When adding to cart, use app.products to handle the InStock of the product (can't add to cart if trying to add more than InStock)
// 3. When purchase is done -> products = app.products
// 4. Use products during payout

var app = new Vue({
    el: "#app",
    data: {
        currentPage: "HOME", // sets starting page
        products: Array, // the original response data
        isProductSelected: false, // controls the pop-up/modal box
        productId: "", // for the pop up window
        isLoaded: false, // while loading products from API
        cartCount: 0, // used to display in navbar
        showPayment: false,
        orderTotal: 0,
        isPaymentComplete: false,
        addProductPage: true,
        showEditOptions: false,

    },
    methods: {
        changePage: function (pageName) {
            if (this.currentPage != pageName) {
                this.currentPage = pageName;
            }

            if (this.currentPage !== "CART") {
                this.showPayment = false;
            }
        },
        showProduct: function (productId) {
            this.productId = productId;
            this.isProductSelected = true;
        },
        closeModal: function () {
            let div = document.getElementById('modalBox');
            if (div != null) {
                div.style.display = "none";
                this.isProductSelected = false;
                this.productId = "";
                return;
            }

            
            let div2 = document.getElementById('purchaseDone');
            this.isPaymentComplete = false;
            cart = [];
            this.cartCount = 0;
            this.changePage("HOME");
            div2.style.display = "none";
            
        },
        addToCart: function (productId) {
            let product = getCloneProduct(productId);

            if (product.InStock < 1) {
                console.log("varan är slut, lägger inte till i kundvagnen")
                return;
            }

            let cartObject = cart.find((p => p.product.ID == productId));
            // if product is not in cart
            // cartObject == null covers both null and undefined
            if (cartObject == null) {
                cart.push({ product: product, quantity: 1 })

                product.InStock -= 1;

                this.cartCount++;
                return;
            }


            cartObject.quantity += 1; // if product already is in cart: add +1 to its quantity
            product.InStock -= 1; // remove one from stock
            this.cartCount++; // add to cartCounter
        },
        removeFromCart: function (cartObject) {
            let indexOfObj = cart.findIndex((p => p.product.ID == cartObject.product.ID));
            this.cartCount -= cart[indexOfObj].quantity; // adjust amount in cart
            cart.splice(indexOfObj, 1);

            // Fill the product's InStock with what was in the cart
            let p = getCloneProduct(cartObject.product.ID)
            p.InStock += cartObject.quantity;

            // if the cart becomes empty - return to home-page
            if (!cart.length){
                this.changePage("HOME");
            }
        },
        goToPayment: function (orderTotal) {
            console.log("ordertotal: " + orderTotal)
            this.orderTotal = orderTotal;
            this.showPayment = true;
        },
        cancelOrder: function () {
            cart.forEach(p => {
                p.product.InStock += p.quantity;
            })

            this.showPayment = false;
            this.cart = [];
            cart = [];
            this.cartCount = 0;
            this.currentPage = "HOME";
        }
    }
})