// script.js
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');

    // Fungsi buat nampilin bintang rating
    function getStarRatingHTML(ratingData) {
        let starsHTML = '';
        const average = ratingData.average;
        const fullStars = Math.floor(average);
        const hasHalfStar = average % 1 >= 0.4; // Anggap 0.4 ke atas itu setengah bintang (buat contoh)
        let starCount = 0;

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star filled">★</span>';
            starCount++;
        }
        // Untuk contoh ini, kita sederhanakan, gak pake half-star, langsung empty aja
        // if (hasHalfStar && starCount < 5) {
        //     starsHTML += '<span class="star filled">★</span>'; // Atau karakter half star
        //     starCount++;
        // }
        while (starCount < 5) {
            starsHTML += '<span class="star empty">☆</span>';
            starCount++;
        }
        starsHTML += ` <span class="rating-text">${average.toFixed(1)} (${ratingData.count.toLocaleString()})</span>`;
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
                productGrid.innerHTML = '<p>Yah, produknya lagi kosong nih, Kiwil!</p>';
                return;
            }
            products.forEach(product => {
                const productCardElement = createProductCard(product);
                productGrid.appendChild(productCardElement);
            });
        })
        .catch(error => {
            console.error('Gagal ngambil data produk:', error);
            productGrid.innerHTML = `<p>Waduh, Kiwil, ada masalah nih pas ngambil data produk: ${error.message}</p>`;
        });
});