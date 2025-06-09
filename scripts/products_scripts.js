// script.js
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const sortOptions = document.getElementById('sort-options');

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    // -- Bagian Baru: Selektor untuk Pagination --
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfoSpan = document.getElementById('page-info');

    let allProducts = [];
    let currentProducts = []; // Data yang sedang ditampilkan (bisa ter-sort)
    let currentPage = 1;
    const ITEMS_PER_PAGE = 9; // Maksimal 9 produk per halaman

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

        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');

        const addToCartBtn = document.createElement('button');
        addToCartBtn.classList.add('add-to-cart');
        addToCartBtn.innerHTML = `+<i class="fas fa-cart-shopping"></i>`;
        buttonGroup.appendChild(addToCartBtn);

        // 2. Buat tombolnya
        const button = document.createElement('button');
        button.classList.add('rent-button');

        // 3. Masukkan teks tombol DAN harga yang sudah diformat ke dalam tombol
        button.innerHTML = `
            ${product.buttonText}
            <span class="price">${formattedPrice} / hari</span>
        `;
        buttonGroup.appendChild(button);
        card.appendChild(buttonGroup);
        // --- Akhir dari bagian yang diubah ---

        return card;
    }

    // ... (sisa kodenya: fungsi renderProducts, fetch, dan event listener sorting SAMA PERSIS) ...
    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p>Yah, produk yang kamu cari nggak ketemu :(</p>';
            return;
        }
        productsToRender.forEach(product => {
            const productCardElement = createProductCard(product);
            productGrid.appendChild(productCardElement);
        });
    }

    // Fungsi untuk menampilkan halaman tertentu
    function displayPage(page) {
        currentPage = page;
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        
        // "Potong" array produk sesuai halaman aktif
        const paginatedItems = currentProducts.slice(startIndex, endIndex);
        
        // Render produk yang udah dipotong
        renderProducts(paginatedItems);
        // Update tampilan info & tombol pagination
        updatePaginationUI();
    }

    // Fungsi untuk update info "Page 1 of 3" dan status tombol
    function updatePaginationUI() {
        // Jangan tampilkan pagination jika tidak ada produk
        if (currentProducts.length === 0) {
            pageInfoSpan.textContent = '';
            prevPageBtn.classList.add('disabled');
            nextPageBtn.classList.add('disabled');
            return;
        }
        const totalPages = Math.ceil(currentProducts.length / ITEMS_PER_PAGE);
        pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.classList.toggle('disabled', currentPage === 1);
        nextPageBtn.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);
    }

    function applyFiltersAndSort() {
        const searchQuery = searchInput.value.toLowerCase().trim();
        const sortValue = sortOptions.value;

        // 1. Filter dulu dari data master berdasarkan pencarian
        let processedProducts = allProducts.filter(product => 
            product.title.toLowerCase().includes(searchQuery)
        );

        // 2. Sort hasil filter berdasarkan pilihan dropdown
        if (sortValue === 'price-asc') {
            processedProducts.sort((a, b) => parseFloat(a.pricePerDay) - parseFloat(b.pricePerDay));
        } else if (sortValue === 'price-desc') {
            processedProducts.sort((a, b) => parseFloat(b.pricePerDay) - parseFloat(a.pricePerDay));
        } else if (sortValue === 'rating-desc') {
            processedProducts.sort((a, b) => b.rating.average - a.rating.average);
        } else if (sortValue === 'name-asc') {
            processedProducts.sort((a, b) => a.title.localeCompare(b.title));
        }

        // 3. Update data yang akan ditampilkan dan reset ke halaman 1
        currentProducts = processedProducts;
        displayPage(1);
    }

    // --- Ambil data dari JSON dan Setup Awal ---
    fetch('../data/products.json')
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            currentProducts = allProducts; // Awalnya, data aktif = data master
            
            if (allProducts.length === 0) {
                productGrid.innerHTML = '<p>Produk kosong!</p>';
                return;
            }
            // Tampilkan halaman pertama saat data berhasil dimuat
            displayPage(1);
        })
        .catch(error => console.error('Gagal memuat produk:', error));

    // --- MODIFIKASI: Event listener untuk sorting ---
    sortOptions.addEventListener('change', applyFiltersAndSort);

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFiltersAndSort();
    });

    searchInput.addEventListener('input', () => {
        if (searchInput.value === '') {
            applyFiltersAndSort();
        }
    });

    // --- BAGIAN BARU: Event listener untuk tombol pagination ---
    prevPageBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Mencegah link pindah halaman
        if (currentPage > 1) {
            displayPage(currentPage - 1);
        }
    });

    nextPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const totalPages = Math.ceil(currentProducts.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            displayPage(currentPage + 1);
        }
    });
});