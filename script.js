let products = [];
let selectedProduct = {};



async function fetchProducts() {
    await axios.get('/products/products.json')
        .then(response => {
            products = response.data;
            console.log(products);
        })
        .catch(error => {
            console.log("Något gick fel: " + error)
        });
}

function closeModal() {
    modal.style.display = "none";
    app.selectedProduct = {};
    console.log(selectedProduct);
    console.log("borde vara undefined typ ^")
}

window.onclick = function (event) {
    let modal = document.getElementById('myModal');
    if (event == modal) {
        modal.style.display = "none";
    }
}

window.onload = async function () {
    await fetchProducts();

    var app = new Vue({
        el: "#app",
        data: {
            currentPage: "home",
            products: Array,
            selectedProduct: Object,
            productId: ""//istället för hela objektet

        },
        created: async function () {
            this.products = products;
        },

        methods: {
            changePage: function (pageName) {
                if (this.currentPage != pageName)
                    this.currentPage = pageName;
            }
        }
    })
}

// function popProduct(productId) {
//     modal = document.getElementById("myModal");
//     modal.style.display = "block";

//     selectedProduct = products.find(p => p.ID === productId)
//     console.log("selected product: ")
//     console.log(selectedProduct);

//     modal = document.getElementById("myModal");
//     modal.style.display = "block";

//     this.selectedItem = products.find(p => p.ID === productId)
//     console.log("selected product: ")
//     console.log(this.selectedItem);

// }







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
            // TODO: detta condition fungerar ej
            if (this.products == null) {
                console.log("Produkter har inte laddats");
                console.log(this.products)
                return;
            }

            // Get all products that has ShowOnFirstPage == true and is in stock
            this.firstPageProducts = products.filter(p => p.ShowOnFirstPage && p.InStock > 0);
            // TODO: Randomize three products from an array that holds all first page items
        }
    },
    created: async function () {
        this.products = products;
        this.getFirstPageProducts();
    },

    template: '<div class="deals">' +
        '<div>' +
        '<h2>deals of the week</h2>' +
        '</div>' +
        '<div class="dealsContainer">' +
        '<div class="deal" v-for="product in firstPageProducts" >' +
        '<div class="imgContainer" @click="productPopping.modal(product.ID)">' +
        '<img v-bind:src="product.Img" v-bind:alt="product.Title">' +
        '</div>' +
        '<p class="bold">{{product.Title}}, {{product.Price}}:-</p>' +
        '<div class="flex">' +
        '<p class="thin">Add to cart:</p>' +
        '<div class="dealInputs">' +
        '<input type="number" min="1" v-bind:max="product.InStock" value="1">' +
        '<button class="cart-button">OK</button>' +
        '</div></div></div></div></div>'
})


Vue.component('popped-product', {
    data: function () {
        return {
            product: {}
        }
    },
    methods: {
        updateProduct: function () {
            if (app.selectedProduct){
                this.product = app.selectedProduct;
                console.log(this.product);
            }
        }
    }
})


var productPopping = new Vue({
    data: {
        selectedItem: {}
    },
    methods: {
        modal: function (productId) {
            modal = document.getElementById("myModal");
            modal.style.display = "block";

            this.selectedItem = products.find(p => p.ID === productId)
            console.log("selected product: ")
            console.log(this.selectedItem);

            this.render();
        },
        render: function () {
            var content = document.getElementsByClassName("modal-content")[0];

            content.innerHTML = `<span class="close" onclick="closeModal()">&times;</span>` +
                '<div id="productContainer">' +
                `<h1>${this.selectedItem.Title}</h1>` +
                `<p><strong>${this.selectedItem.Description}</strong></p>` +
                `<p>${this.selectedItem.Price}:-</p>` +
                `<p>${this.selectedItem.InStock} antal i lager</p>` +
                '<p>Hej hej</p>' +
                '</div>'
        }
    }
})
