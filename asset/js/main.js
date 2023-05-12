// Local Storage
function updateLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
// Consumir API
async function getProducts() {
    try {
        const data = await fetch (
            "https://ecommercebackend.fundamentos-29.repl.co/"
        );
        const res = await data.json();

        updateLocalStorage("products", res);
        return res;
    } catch (error) {
        console.error(error);
    }
}

// Pintar los pruductos
function printProducts(db) {
    let html = "";

        db.products.forEach(({ image, name, price, quantity, id, category }) => {
            html+= `
                <div class="product">
                    <div class="product__img">
                        <img src="${image}" alt="${name}">
                    </div>
                    <div class="product__body">
                        <h4>${name}</h4>
                        <h5>${category}</h5>
                        <p>
                            <b>Price: </b> $${price}.00 USD
                        </p>
                        <p class="${quantity ? "" : "SoldOut"}">
                            <b>Stock: </b> ${quantity ? quantity : "SoldOut"}
                        </p>
                        ${
                            quantity
                            ? `<i class='bx bx-plus' id="${id}"></i>`
                            : "<div></div>"
                        }
                    </div>
                </div>
            `;
        });

        document.querySelector(".products").innerHTML = html;
        printTotal(db);
}

// Enseñar el carrito
function showCart() {
    const iconCartHTML = document.querySelector("#iconCart");
    const cartHTML = document.querySelector(".cart");

    iconCartHTML.addEventListener("click", function(){
        cartHTML.classList.toggle("cart__show");
    });
}

// agregar productos en el carrito
function showProductsInCart(db) {
    let html = "";

            Object.values(db.cart).forEach((item)  => {
                html += `

                <div class="cartItem">
                    <div class="cartItem__img">
                        <img src="${item.image}" alt="${item.name}" />
                    </div>

                    <div class="cartItem__body">
                        <h4>${item.name}</h4>
                        <p><span>Stock:</span> ${item.quantity} | $${item.price}.00 USD</p>
                        <p>Subtotal: $${item.price * item.amount}.00 USD</p>


                        <div class="cartItem__options" data-id="${item.id}">
                            <i class='bx bx-minus'></i>
                            <span>${item.amount} Unit</span>
                            <i class='bx bx-plus'></i>
                            <i class='bx bx-trash'></i>
                        </div>
                    </div>
                </div>
                `;
            });
            document.querySelector(".cart__products").innerHTML = html;

}

// Mantenerme los Items en el carrito
function productsAddedInCart(db) {
    const productsHTML = document.querySelector(".products");

    productsHTML.addEventListener("click", function (e) {
        if (e.target.classList.contains("bx-plus")) {
            const productId = Number(e.target.id);

            const productFind = db.products.find(function (product) {
                return product.id === productId;
            });

            if (db.cart[productId]) {
                if (db.cart[productId].amount === db.cart[productId].quantity)
                    return alert ("Ya no tenemos mas disponibles");

                db.cart[productId].amount += 1;
            } else {
                db.cart[productId] = structuredClone(productFind);
                db.cart[productId].amount = 1;
            }

            updateLocalStorage("cart", db.cart);
            printTotal(db);
            showProductsInCart(db);
        }
    });
}

// Aumento, descremento y eliminar productos
function handleCart(db) {
    const cartProductsHTML = document.querySelector(".cart__products");

    cartProductsHTML.addEventListener("click", function (e) {
        if(e.target.classList.contains("bx-minus")) {
            const productId = Number(e.target.parentElement.dataset.id);

            if(db.cart[productId].amount === 1) {
                const response = confirm(
                    "Estas seguro que quieres eliminar este producto 🫤?"
                );
                if(!response) return;
                delete db.cart[productId];
            }else {
                db.cart[productId].amount -= 1;
            }

        }

        if(e.target.classList.contains("bx-plus")) {
            const productId = Number(e.target.parentElement.dataset.id);

            if (db.cart[productId].amount === db.cart[productId].quantity)
                    return alert ("Ya no tenemos mas disponibles 😟");

            db.cart[productId].amount += 1;

        }

        if(e.target.classList.contains("bx-trash")) {
            const productId = Number(e.target.parentElement.dataset.id);

            const response = confirm(
                "Estas seguro que quieres eliminar este producto 🫤?"
            );
            if(!response) return;
            delete db.cart[productId];
        }
        showProductsInCart(db);
        updateLocalStorage("cart", db.cart);
        printTotal(db);
    });
}

// Mostrando el monto total
function printTotal(db) {
    const amountItemsHTML = document.querySelector("#amountItems");
    const cartTotaInfoHTML = document.querySelector(".cart__tota--info");

    let productsAmount = 0;
    let totalPrice = 0;

   Object.values(db.cart).forEach((item) => {
    productsAmount += item.amount;
    totalPrice += item.amount * item.price
   });

    let html = `
        <p>
            <b>Items:</b> ${productsAmount}
        </p>
        <p>
            <b>Precio total: </b> $${totalPrice}.00 USD
        </p>
    `;

    cartTotaInfoHTML.innerHTML = html;
    amountItemsHTML.textContent = productsAmount;
}

// Logica de compra
function handlePurcharsing(db) {
    document.querySelector("#btn__buy").addEventListener("click", function() {
        if(!Object.values(db.cart).length)
        return alert("Compra algo primero 😅");

        const newProducts = [];

        for (const product of db.products) {
            const productCart = db.cart[product.id];

            if (product.id === productCart?.id) {
                newProducts.push({
                    ...product,
                    quantity: product.quantity - productCart.amount,
                })
            } else {
                newProducts.push(product);
            }

        }

        db.products = newProducts;
        db.cart = {};

        updateLocalStorage("products", db.products);
        updateLocalStorage("cart", db.cart);

        printProducts(db);
        showProductsInCart(db);
        printTotal(db);

    });
}

// logica de filtrar productos
function filterProduct(db){
    const btnAll = document.querySelector(".showAllProducts");
    const btnShirt = document.querySelector(".shirt");
    const btnHoddies = document.querySelector(".hoddie");
    const btnSweater = document.querySelector(".sweater");
    const productsHTML = document.querySelector(".products");

    btnAll.addEventListener("click", function () {                     
        printProducts(db);
     });

     btnShirt.addEventListener("click", function () {
        const category = "shirt";
        const productsByCategory = db.products.filter(
            (product) => product.category === category);
            
            let html = "";

            for (const product of productsByCategory) {
            
            
            html += `
            <div class="product">
                <div class="product__img">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product__body">
                    <h4>${product.name}</h4>
                    <h5>${product.category}</h5>
                    <p>
                        <b>Price: </b> $${product.price}.00 USD
                    </p>
                    <p class="${product.quantity ? "" : "SoldOut"}">
                        <b>Stock: </b> ${product.quantity ? product.quantity : "SoldOut"}
                    </p>
                    ${
                        product.quantity
                        ? `<i class='bx bx-plus' id="${product.id}"></i>`
                        : "<div></div>"
                    }
                </div>
            </div>
                `;
            }
            productsHTML.innerHTML = html;
      });


      btnHoddies.addEventListener("click", function () {
        const category = "hoddie";
        const productsByCategory = db.products.filter(
            (product) => product.category === category);
            
            let html = "";

            for (const product of productsByCategory) {
            
            
            html += `
            <div class="product">
                <div class="product__img">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product__body">
                    <h4>${product.name}</h4>
                    <h5>${product.category}</h5>
                    <p>
                        <b>Price: </b> $${product.price}.00 USD
                    </p>
                    <p class="${product.quantity ? "" : "SoldOut"}">
                        <b>Stock: </b> ${product.quantity ? product.quantity : "SoldOut"}
                    </p>
                    ${
                        product.quantity
                        ? `<i class='bx bx-plus' id="${product.id}"></i>`
                        : "<div></div>"
                    }
                </div>
            </div>
                `;
            }
            productsHTML.innerHTML = html;
      });


      btnSweater.addEventListener("click", function () {
        const category = "sweater";
        const productsByCategory = db.products.filter(
            (product) => product.category === category);
            
            let html = "";

            for (const product of productsByCategory) {
            
            
            html += `
            <div class="product">
                <div class="product__img">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product__body">
                    <h4>${product.name}</h4>
                    <h5>${product.category}</h5>
                    <p>
                        <b>Price: </b> $${product.price}.00 USD
                    </p>
                    <p class="${product.quantity ? "" : "SoldOut"}">
                        <b>Stock: </b> ${product.quantity ? product.quantity : "SoldOut"}
                    </p>
                    ${
                        product.quantity
                        ? `<i class='bx bx-plus' id="${product.id}"></i>`
                        : "<div></div>"
                    }
                </div>
            </div>
                `;
            }
            productsHTML.innerHTML = html;
      });
}

// Donde se ejecuta todo
async function main() {
    const db = {
        products: JSON.parse(localStorage.getItem("products")) ||
        await getProducts(),
        cart: JSON.parse(localStorage.getItem("cart")) || {},
    };


    printProducts(db);
    showCart();
    showProductsInCart(db);
    productsAddedInCart(db);
    handleCart(db);
    printTotal(db);
    handlePurcharsing(db);
    filterProduct(db);
}

window.addEventListener("load", function () {
    main();
});


