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

    else if (event.target.id === 'purchaseDone') {
        let div = document.getElementById('purchaseDone');
        cart = [];
        app.cartCount = 0;
        app.isPaymentComplete = false;
        console.log()

        app.changePage("HOME");
        div.style.display = "none";
    }
}

async function fetchProducts() {
    // await axios.get('/products/products.json') //when running locally
    await axios.get('/Webshop/products/products.json') // when running github pages
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


function getGUID() {
    var u = '', i = 0;
    while (i++ < 36) {
        var c = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'[i - 1],
            r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        u += (c == '-' || c == '4') ? c : v.toString(16)
    }
    return u;
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
            description: ""
        }
    },
    // TODO: Gör stil av detta
    template: `<div class="about">
        <h1>{{title}}</h1>
        <h3><strong>{{subheader}}</strong></h3>
        <p>We care about you. You need to both look your best and feel your best, but without hurting your wallet or the environment. <br><br>
            <strong>wallenas clothing company</strong> takes care of all those needs, where our focus is on: 
        </p>
        <ul>
            <li>Only adding products that were produced with quality and sustainability in mind</li>
            <li>Keeping the price reasonable for everyone</li>
            <li>"Less is more" approach to design</li>
        <ul>
            <p>We hope you find our products to your liking. Our site is still under development, so if you come across any bugs - please contact us (see information below).</p>
        </div>`
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



    template: `<div class="categoryProducts">
    <div>
        <h2>deals of the week</h2>
    </div>
    <div class="cpContainer">
        <div class="category" v-for="product in firstPageProducts">
            <div class="imgContainer" @click="app.showProduct(product.ID)" >
                <img v-bind:src="product.Img" v-bind:alt="product.Title">
            </div>
            <p>{{product.Title}}</p>
            <p><strong>{{product.Price.toFixed(2)}}:-<strong></p>
            <p>In stock: {{product.InStock}}</p>
            <button class="cart-button" v-if="product.InStock > 0" @click="app.addToCart(product.ID)">Add to cart</button>
            <button class="cart-button" v-else>Kan inte lägga till fler av denna produkt</button>
        </div>
    </div>
</div>`
})

Vue.component('popped-product', {
    data: function () {
        return {
            product: getCloneProduct(app.productId),
        }
    },
    template: `<div id="modalBox" class="modal" style="display: block;">
                    <div class="modal-content">
                        <span class="close" onclick="app.closeModal()">&times;</span>
                        <div class="modalContentContainer">
                            <h1>{{product.Title}}</h1>
                            <div class="modalImgContainer" style="margin: auto;">
                                <img v-bind:src="product.Img" v-bind:alt="product.Title">
                            </div>
                            <div class="align-left">
                                <p>Price: <strong>{{product.Price.toFixed(2)}}:-</strong></p>
                                <h2><strong>Description:</strong></h2>
                                <p>{{product.Description}}</p>
                                <p>In stock: {{product.InStock}}</p>
                            </div>
                            <button class="cart-button" v-if="product.InStock > 0" @click="app.addToCart(product.ID)">Add to cart</button>
                            <button class="cart-button" v-else>Kan inte lägga till fler av denna produkt</button>
                        </div>
                    </div>
                </div>`
})

Vue.component('category-products', {
    data: function () {
        return {
            category: "",
            productsInCategory: productsClone.filter(p => p.Category == app.currentPage)
        }
    },

    created: function () {
        let currentPage = app.currentPage.toLowerCase();
        // Adds an "s" to tshirt
        if (currentPage === "tshirt") {
            this.category = "t-shirts";
            return;
        }

        this.category = currentPage;
    },

    template: `<div class="categoryProducts">
                    <div>
                        <h2>{{category}}</h2>
                    </div>
                    <div class="cpContainer">
                        <div class="category" v-for="product in productsInCategory">
                            <div class="imgContainer" @click="app.showProduct(product.ID)" >
                                <img v-bind:src="product.Img" v-bind:alt="product.Title">
                            </div>
                            <p>{{product.Title}}</p>
                            <p><strong>{{product.Price.toFixed(2)}}:-<strong></p>
                            <p>In stock: {{product.InStock}}</p>
                            <button class="cart-button" v-if="product.InStock > 0" @click="app.addToCart(product.ID)">Add to cart</button>
                            <button class="cart-button" v-else>Kan inte lägga till fler av denna produkt</button>
                        </div>
                    </div>
                </div>`
})

Vue.component('cartvue', {
    data: function () {
        return {
            cart: cart,
            totalstring: "",
            total: 0
        }
    },
    created: function () {
        this.setTotalAndVat();
    },
    methods: {
        setTotalAndVat: function () {
            this.total = 0;
            this.cart.forEach(p => {
                this.total += p.product.Price * p.quantity;
            })
            this.total = this.total;
        },
        getLineTotalToCurrency: function (product) {
            let total = product.product.Price * product.quantity;
            return total.toFixed(2) + ":-";
        },
        // TODO: this one works but is the ONLY place where i use the cloned array. stupid
        changeQty: function (amount, cartObject) {
            cartObject.quantity += amount; // add/remove 1 from quantity
            amount == -1 ? cartObject.product.InStock += 1 : cartObject.product.InStock -= 1

            let originalProduct = getRealProduct(cartObject.product);

            // to keep at least one object in the cart (so that quantity doesn't become 0 etc.)
            if (cartObject.quantity <= 1) {
                cartObject.product.InStock = originalProduct.InStock - 1;
                cartObject.product.InStock = originalProduct.InStock - 1;
                cartObject.quantity = 1;
            }

            // if the quantity is larger than what's in stock (comparing to original (unchanged) product to keep track of InStock)
            else if (cartObject.quantity > originalProduct.InStock) {
                cartObject.quantity = originalProduct.InStock;
                cartObject.product.InStock = 0;
            }

            // sets total amount of products in cart
            this.setCartCount();
            this.setTotalAndVat();
        },
        setCartCount() {
            app.cartCount = 0;
            this.cart.forEach(p => {
                app.cartCount += p.quantity;
            })
        },
    },
    template: `<div v-if="cart.length">
                    <h2 style="text-align: center; margin: 5px; padding: 5px;">cart</h2>
                    <div class="cartHeaders">
                        <h2>Product</h2>
                        <h2>Quantity</h2>
                        <h2>Price</h2>
                        <h2>Total</h2>
                    </div>
                    <div class="cart">
                        <div class="cartItem" v-for="p in cart">
                            <div class="productInfo" style="display: flex; align-items: center;">
                                <div class="cartImgContainer">
                                    <img class="cartImg" v-bind:src="p.product.Img">
                                </div>
                                <div style="width: 200px; margin-left: 10px;">
                                    <h3 style="text-align: left;">{{p.product.Title}}</h3>
                                    <p style="text-align: left; font-size: 14px;">{{p.product.Category.toLowerCase()}}</p>
                                    <button @click="app.removeFromCart(p)" style="float: left; background-color: orangered;" v-if="!app.showPayment">Remove</button>
                                </div>
                            </div>
                            <div class="quantityContainer">
                                <span class="minus bold" @click="changeQty(-1, p)" v-if="!app.showPayment">&minus;</span>
                                <p v-model="p.quantity">{{p.quantity}}</p>
                                <span class="plus bold" @click="changeQty(1, p)" v-if="!app.showPayment">&plus;</span >
                            </div>
                            <div class="priceContainer">
                                <p class="bold">{{p.product.Price.toFixed(2)}}:-</p>
                            </div>
                            <div class="totalContainer">
                                <p class="bold">{{getLineTotalToCurrency(p)}}</p>
                            </div>
                        </div>
                    </div>
                    <div class="total">
                        <h4 v-if="!app.showPayment">Total: {{total.toFixed(2)}}:-</h4>
                        <div class="pay-cancel">
                            <button @click="app.goToPayment(total)" v-if="!app.showPayment">Pay Now</button>
                            <button id="cancelButton" @click="app.cancelOrder()">Cancel order</button>
                        </div>
                    </div>
                </div>`
});

Vue.component('payment', {
    data: function () {
        return {
            total: 0,
            vat: this.setVat(),
            firstName: null,
            lastName: null,
            email: null,
            phoneNumber: null,
            country: null,
            city: null,
            street: null,
            zipCode: null,
            errors: [],
            isPaymentComplete: false,
            shippingCost: 40,
            isPayingByBank: false

        }
    },
    created: function () {
        this.total = app.orderTotal;
        console.log("payment created. total = " + this.total)
        this.setVat();
    },
    methods: {
        setVat: function () {
            this.vat = (this.total * 0.25).toFixed(2);
        },
        setShippingCost: function (shipping) {
            if (shipping === "schenker") {
                this.shippingCost = 40;
            }
            else {
                this.shippingCost = 25
            }
        },
        changePaymentOption() {
            if (!this.isPayingByBank) {
                this.isPayingByBank = true;
                return;
            }
            this.isPayingByBank = false;
        },
        checkForm: function (e) {
            try {
                this.errors = [];

                for (const [key, value] of Object.entries(this.$refs)) {
                    value.value = value.value.trim() //remove any leading or ending whitespace
                    value.style.border = "";

                    if (!value.value) {
                        this.errors.push("error with " + key)
                        // alternativt appenda klassnamn, typ value.className += " red-border";
                        value.style.border = "2px solid red";
                    }

                    else if (key.startsWith("number_")) {
                        let regexLetters = /[A-Za-z]/g; // contains any letter (case insensitive) or whitespace

                        value.value = value.value.replace(/\s/g, ""); // remove ALL whitespace in the string

                        if (regexLetters.test(value.value)) {
                            console.log("Nummerinput innehåller bokstäver eller mellanslag");
                            this.errors.push("error with " + key);
                            value.style.border = "2px solid red";
                        }
                    }
                }

                if (!this.errors.length) {
                    this.completePayment();
                    return true;
                }

                console.log(this.errors);
                e.preventDefault();
            }
            catch (error) {
                alert(error);
                e.preventDefault();
            }

        },
        completePayment: function () {
            app.isPaymentComplete = true;
        }
    },
    template: `<div>
                    <form id="deliveryDetails" action="#" method="post">
                        <h1>Delivery details</h1>
                        <div id="pay" class="payment">
                            <div class="details" >
                                <label for="firstName">First name:</label>
                                <input id="firstName" class="inputs" type="text" ref="name_first" name="firstName" v-model="firstName">
                                <label for="lastName">Last name:</label>
                                <input id="lastName" class="inputs" type="text" ref="name_last" name="lastName" v-model="lastName">
                                <label for="phonenumber">Phone number:</label>
                                <input id="phonenumber" class="inputs" type="tel" ref="number_phonenr" name="phoneNumber" v-model="phoneNumber">
                                <label for="email">E-mail:</label>
                                <input id="email" class="inputs" type="email" ref="email" name="email" v-model="email">
                            
                                <label for="country">Country:</label>
                                    <input id="country" type="text" class="inputs" ref="country" name="country" v-model="country">
                                    <label for="city">City:</label>
                                    <input id="city" type="text" class="inputs" ref="city" name="city" v-model="city">
                                    <label for="street">Street:</label>
                                    <input id="street" type="text" class="inputs" ref="street" name="street" v-model="street">
                                    <label for="zipcode">Zip code:</label>
                                    <input id="zipcode" type="text" class="inputs" ref="number_zip" name="zipCode" v-model="zipCode">
                            </div>
                        </div>
                        <div>
                            <h2>Choose payment option: </h2>
                            <div class="radios">
                                <div class="flex-row">    
                                    <label for="swish">Swish</label>
                                    <input id="swish" type="radio" v-on:change="changePaymentOption()" name="paymentOption" value="swish" checked ref="payment_swish">
                                </div>
                                <div class="flex-row">
                                    <label for="bank">Card</label>
                                    <input id="bank" type="radio" v-on:change="changePaymentOption()" value="bank" name="paymentOption" ref="payment_bank">
                                </div>
                            </div>

                        <div class="details" v-if="isPayingByBank">
                            <label for="cardNumber">Card number:</label>
                            <input id="cardNumber" type="text" name="cardNumber" ref="cardNumber" placeholder="xxxx-xxxx-xxxx-xxxx">
                            <label for="cvc">CVC:</label>
                            <input id="cvc" type="number" class="inputs" name="cvc" ref="cvc" style="width: 60px">

                            
                            <label for="month">MM:</label>
                            <select ref="month" id="month">
                                <option value="">-Select Month-</option>
                                <option value="01">January</option>
                                <option value="02">February</option>
                                <option value="03">March</option>
                                <option value="04">April</option>
                                <option value="05">May</option>
                                <option value="06">June</option>
                                <option value="07">July</option>
                                <option value="08">August</option>
                                <option value="09">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                            <label for="year">YY:</label>
                            <select ref="year" id="month">
                                <option value="">-Select Year-</option>
                                <option value="2021">2021</option>
                                <option value="2022">2022</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                        
                        </div>
                        <h2>Shipping</h2>
                        <div class="radios">
                            <div class="flex-row">
                                <label for="schenker">Schenker (40:-)</label>
                                <input id="schenker" type="radio" name="delivery" value="schenker" checked v-on:change="setShippingCost(\'schenker\')" ref="shipping_schenker">
                            </div>
                            <div class="flex-row">
                                <label for="dhl">DHL (25:-)</label>
                                <input id="dhl" type="radio" name="delivery" value="DHL" v-on:change="setShippingCost(\'dhl\')" ref="shipping_dhl">
                            </div>
                        </div>
                        <div class="totals">
                            <p>Cart total: <strong>{{total.toFixed(2)}}:-</strong></p>
                            <p>VAT (25%): <strong>{{vat}}:-</strong></p>
                            <p>Shipping: <strong>{{shippingCost}}:-</strong></p>
                            <p>Order total: <strong>{{(total + shippingCost).toFixed(2)}}:-</strong></p>
                        </div>
                        <div class="submitContainer">
                            <input id="submitButton" type="button" @click="checkForm" value="Complete payment">
                        </div>
                    </form>
                </div>`
})

Vue.component('purchase-done', {
    data: function () {
        return {
            cart: cart,
            title: "Purchase done",
            message: "Your purchase is done! Thank you for shopping with wallenas clothing company.",
        }
    },
    template: `<div id="purchaseDone" class="modal" style="display: block;">
                    <div class="modal-content">
                        <span class="close" onclick="app.closeModal()">&times;</span>
                        <h1 style="text-align: center">{{title}}</h1>
                        <div class="purchaseText">
                            <h2>{{message}}</h2>
                            <p>Expected arrival in 2-5 days</p>
                        </div>    
                    </div>
                </div>`
})

Vue.component('admin', {
    data: function (){
        return {
            productId: "",
            category: "",
            title: "",
            price: 1,
            description: "",
            img: "",
            showOnFirstPage: false,
            inStock: 0
        }
    },
    methods: {
        addProduct: function(){
            productsClone.push({
                ID: getGUID(),
                Category: this.category,
                Title: this.title,
                Price: parseFloat(this.price),
                Description: this.description,
                Img: this.img,
                ShowOnFirstPage: this.showOnFirstPage,
                InStock: this.inStock
            });


            app.products = JSON.parse(JSON.stringify(productsClone));
            alert("Product added!");
        },
        removeProduct: function(){
            let indexOfObj = productsClone.indexOf(p => p.ID == this.productId);

            if(indexOfObj != null){
                productsClone.splice(indexOfObj, 1);
                console.log("produkt togs bort")
                alert("Produkt removed!");
                this.clearValues();
            }

            else{
                console.log("Hittade inte produkten/något gick fel");
                console.log("index of object: " + indexOfObj);
            }
        },
        getSelectedProduct: function(productId){
            console.log("inne i get selected product")
            console.log("selected product id: " + this.productId);
            let productToEdit = getCloneProduct(productId);

            if (productToEdit == null){
                console.log("Något gick fel!")
                return;
            }

            this.category = productToEdit.Category;
            this.title = productToEdit.Title;
            this.price = productToEdit.Price;
            this.description = productToEdit.Description;
            this.img = productToEdit.Img;
            this.showOnFirstPage = productToEdit.ShowOnFirstPage;
            this.inStock = productToEdit.InStock;
            app.showEditOptions = true;
        },
        saveProduct: function(){
            let product = getCloneProduct(this.productId);
            if (product == null){
                console.log("Kunde inte hitta produkten som skulle redigeras.")
                return;
            }

            product.Category = this.category;
            product.Title = this.title;
            product.Price = this.price;
            product.Description = this.description;
            product.Img = this.img;
            product.ShowOnFirstPage = this.showOnFirstPage;
            product.InStock = this.inStock;

            alert("Produkt: " + product.Title + " sparades!")
            this.clearValues();
        },
        clearValues: function() {
            this.category = "";
            this.title = "";
            this.price = 1,
                this.description = "";
            this.img = "";
            this.showOnFirstPage = false;
            this.inStock = 0;
            this.productId = "";
            app.showEditOptions = false;
        }
    },

    template: `<div class="admin">
                    <h2>admin</h2>
                    <div class="adminHeaders flex-row larger">
                    <li @click="app.addProductPage = true">add product</li>
                    <li @click="app.addProductPage = false">edit product</li>
                    </div>
                    <div class="editOrAddProduct" v-if="app.addProductPage">
                        <h1>Add product</h1>
                        <form id="adminForm">
                                <div class="details">
                                    <label for="category">Category:</label>
                                    <select id="category" v-model="category">
                                        <option value="">-Select Category-</option>
                                        <option value="TSHIRT">T-shirt</option>
                                        <option value="UNDERWEAR">Underwear</option>
                                        <option value="TSHIRT">Pants</option>
                                    </select>

                                    <label for="Title">Title:</label>
                                    <input id="title" class="inputs" type="text" name="title" v-model="title">

                                    <label for="price">Price:</label>
                                    <input id="price" class="inputs" type="number" name="price" min="0.00" v-model="price">

                                    <label for="description">Description:</label>
                                    <textarea name="description" id="description" rows="5" v-model="description"></textarea> 

                                    <label for="imgUrl">ImgUrl:</label>
                                    <input id="imgUrl" type="text" class="inputs" name="img" v-model="img">
                                    <div class="showFirstPage">
                                        <label for="showOnFirstPage">Show on first page:</label>
                                        <input id="showOnFirstPage" type="checkbox" class="inputs" name="showOnFirstPage" v-model="showOnFirstPage">
                                    </div>
                                    <label for="inStock">In stock:</label>
                                    <input id="inStock" style="width: 60px;" type="number" class="inputs" min="1" max="100" name="inStock" v-model="inStock">                               
                                </div>
                                </form>
                                <button @click="addProduct">Add product</button>
                    </div>

                    
                    <div class="editOrAddProduct" v-if="!app.addProductPage">
                        <h1>Edit product</h1>
                        <form id="adminForm">
                                <div class="details">
                                    <label for="productPicker">Select product to edit:</label>
                                    
                                    <select id="productPicker" v-model="productId">
                                        <option value="">-Select Product-</option>
                                        <option v-for="product in productsClone" v-bind:style="product.ShowOnFirstPage ? 'background-color: lightgray;' : '' " v-bind:value="product.ID">{{product.Title}} --- FirstPage: {{product.ShowOnFirstPage}}</option>
                                    </select>


                                    <div>
                                    <button id="getProductBtn" @click="getSelectedProduct(productId)">Get product</button>
                                    </div>
                                    <div class="details noMargin" v-if="app.showEditOptions">
                                        <label for="category">Category:</label>
                                        <select id="category" v-model="category">
                                            <option value="">-Select Category-</option>
                                            <option value="TSHIRT">T-shirt</option>
                                            <option value="UNDERWEAR">Underwear</option>
                                            <option value="PANTS">Pants</option>
                                        </select>

                                        <label for="Title">Title:</label>
                                        <input id="title" class="inputs" type="text" name="title" ref="title" v-model="title">

                                        <label for="price">Price:</label>
                                        <input id="price" class="inputs" type="number" name="price" min="0.00" v-model="price">

                                        <label for="description">Description:</label>
                                        <textarea name="description" id="description" rows="5" v-model="description"></textarea> 

                                        <label for="imgUrl">ImgUrl:</label>
                                        <input id="imgUrl" type="text" class="inputs" name="img" v-model="img">
                                        <div class="showFirstPage">
                                            <label for="showOnFirstPage">Show on first page:</label>
                                            <input id="showOnFirstPage" type="checkbox" class="inputs" name="showOnFirstPage" v-model="showOnFirstPage">
                                        </div>
                                        <label for="inStock">In stock:</label>
                                        <input id="inStock" style="width: 60px;" type="number" class="inpumts" min="1" max="100" name="inStock" v-model="inStock">    
                                        </div>                           
                                        </div>
                                        </form>
                                        <button v-if="app.showEditOptions" @click="saveProduct()">Save changes</button>
                                        <button v-if="app.showEditOptions" style="background-color: orangered;" @click="removeProduct()">Remove product</button>
                                        </div>
                </div>`
});
