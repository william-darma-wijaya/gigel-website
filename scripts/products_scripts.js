// script.js
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');

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

        // Badge
        if (product.badge && product.badge.text) {
            const badge = document.createElement('div');
            badge.classList.add('badge', product.badge.type);
            badge.textContent = product.badge.text;
            card.appendChild(badge);
        }

        // Gambar
        const image = document.createElement('img');
        image.classList.add('product-image');
        image.src = product.image;
        image.alt = product.title;
        card.appendChild(image);

        // Judul
        const title = document.createElement('h3');
        title.classList.add('product-title');
        title.textContent = product.title;
        card.appendChild(title);

        // Rating
        const ratingDiv = document.createElement('div');
        ratingDiv.classList.add('product-rating');
        ratingDiv.innerHTML = getStarRatingHTML(product.rating);
        card.appendChild(ratingDiv);

        // Deskripsi
        const description = document.createElement('p');
        description.classList.add('product-description');
        description.textContent = product.description;
        card.appendChild(description);

        // Tombol Sewa
        const button = document.createElement('button');
        button.classList.add('rent-button');
        button.innerHTML = `${product.buttonText} <span class="price">${product.pricePerDay}</span>`;
        card.appendChild(button);

        return card;
    }

    // Ambil data dari JSON dan tampilkan
    fetch('../data/products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            if (products.length === 0) {
                productGrid.innerHTML = '<p>The product is empty!</p>';
                return;
            }
            products.forEach(product => {
                const productCardElement = createProductCard(product);
                productGrid.appendChild(productCardElement);
            });
        })
        .catch(error => {
            console.error('Failed to load product:', error);
            productGrid.innerHTML = `<p>There is a problem while retrieving the products: ${error.message}</p>`;
        });
});