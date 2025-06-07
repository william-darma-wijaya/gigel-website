// script.js
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const sortOptions = document.getElementById('sort-options');
    let allProducts = [];

    // Fungsi buat nampilin bintang rating
    function getStarRatingHTML(ratingData) {
        const average = parseFloat(ratingData.average); // Pastikan ini angka
        const count = ratingData.count;
        let starsHTML = '';

        const fullStars = Math.floor(average); // Jumlah bintang penuh utuh
        const decimalPart = average - fullStars; // Bagian desimalnya, misal 4.3 -> 0.3

        let currentStarsRendered = 0;

        // 1. Tambahin bintang yang bener-bener penuh dulu
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star filled">★</span>';
            currentStarsRendered++;
        }

        // 2. Cek buat bintang setengah atau yang hampir penuh (jika total bintang belum 5)
        if (currentStarsRendered < 5) {
            if (decimalPart >= 0.75) {
                // Kalo desimalnya 0.75 ke atas, anggap aja bintang penuh berikutnya
                starsHTML += '<span class="star filled">★</span>';
                currentStarsRendered++;
            } else if (decimalPart >= 0.25) {
                // Kalo desimalnya 0.25 s.d. 0.74, ini jadi bintang setengah
                // Kita pake karakter bintang KOSONG sebagai dasar di HTML,
                // nanti CSS yang akan "ngisi" setengahnya.
                starsHTML += '<span class="star half-filled">☆</span>';
                currentStarsRendered++;
            }
        }

        // 3. Sisanya (kalo masih ada) jadi bintang kosong
        const remainingEmptyStars = 5 - currentStarsRendered;
        for (let i = 0; i < remainingEmptyStars; i++) {
            starsHTML += '<span class="star empty">☆</span>';
        }

        // Tambahin teks ratingnya
        starsHTML += ` <span class="rating-text">${average.toFixed(1)} (${count.toLocaleString()})</span>`;
        return starsHTML;
    }


    // Fungsi buat bikin satu kartu produk
    function createProductCard(product) {
        const card = document.createElement('div');
        card.classList.add('product-card');

        // ... (kode untuk badge, image, title, rating, description sama persis) ...
        if (product.badge && product.badge.text) {
            const badge = document.createElement('div');
            badge.classList.add('badge', product.badge.type);
            badge.textContent = product.badge.text;
            card.appendChild(badge);
        }
        const image = document.createElement('img');
        image.classList.add('product-image');
        image.src = product.image;
        image.alt = product.title;
        card.appendChild(image);
        const title = document.createElement('h3');
        title.classList.add('product-title');
        title.textContent = product.title;
        card.appendChild(title);
        const ratingDiv = document.createElement('div');
        ratingDiv.classList.add('product-rating');
        ratingDiv.innerHTML = getStarRatingHTML(product.rating);
        card.appendChild(ratingDiv);
        const description = document.createElement('p');
        description.classList.add('product-description');
        description.textContent = product.description;
        card.appendChild(description);


        // --- BAGIAN YANG DIUBAH: Tombol & Format Harga ---
        // 1. Format harga jadi format Rupiah (Rp 5.000)
        const formattedPrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0, // Gak pake koma nol nol
            maximumFractionDigits: 0
        }).format(product.pricePerDay);

        // 2. Buat tombolnya
        const button = document.createElement('button');
        button.classList.add('rent-button');

        // 3. Masukkan teks tombol DAN harga yang sudah diformat ke dalam tombol
        button.innerHTML = `
            ${product.buttonText}
            <span class="price">${formattedPrice} / hari</span>
        `;

        card.appendChild(button);
        // --- Akhir dari bagian yang diubah ---

        return card;
    }

    // ... (sisa kodenya: fungsi renderProducts, fetch, dan event listener sorting SAMA PERSIS) ...
    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';
        productsToRender.forEach(product => {
            const productCardElement = createProductCard(product);
            productGrid.appendChild(productCardElement);
        });
    }

    fetch('../data/products.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(products => {
            allProducts = products;
            if (allProducts.length === 0) {
                productGrid.innerHTML = '<p>Produk kosong!</p>';
                return;
            }
            renderProducts(allProducts);
        })
        .catch(error => {
            console.error('Gagal memuat produk:', error);
            productGrid.innerHTML = `<p>Ada masalah saat mengambil data produk: ${error.message}</p>`;
        });

    sortOptions.addEventListener('change', (event) => {
        const selectedValue = event.target.value;
        let sortedProducts = [...allProducts];

        if (selectedValue === 'price-asc') {
            sortedProducts.sort((a, b) => parseFloat(a.pricePerDay) - parseFloat(b.pricePerDay));
        } else if (selectedValue === 'price-desc') {
            sortedProducts.sort((a, b) => parseFloat(b.pricePerDay) - parseFloat(a.pricePerDay));
        } else if (selectedValue === 'rating-desc') {
            sortedProducts.sort((a, b) => b.rating.average - a.rating.average);
        } else if (selectedValue === 'name-asc') {
            sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
        }

        renderProducts(sortedProducts);
    });
});