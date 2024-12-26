// script.js
const gallery = document.getElementById('gallery');
const models = [
    {
        title: 'The Universe!',
        author: 'Stark',
        url: 'https://sketchfab.com/models/ef1aa837c6fb480b8691c212a4d63d9d/embed',
        authorUrl: 'https://sketchfab.com/stark3d',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Wolf',
        author: 'louvey',
        url: 'https://sketchfab.com/models/551f81f9099943588cf8108c5703d59e/embed',
        authorUrl: 'https://sketchfab.com/louvey',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Asian Male Elephant 3D Model ( In Viet Nam)',
        author: 'Đức Đào Minh',
        url: 'https://sketchfab.com/models/49034f5498744df49b107dc915cc1e61/embed',
        authorUrl: 'https://sketchfab.com/dmd_hn',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Lion Statue',
        author: 'Chris Pierz',
        url: 'https://sketchfab.com/models/14f6c4e2f5e74a9bbe0ae52c7b252767/embed',
        authorUrl: 'https://sketchfab.com/pierzcd13',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Vietnam\'s Old Town',
        author: 'NGUYENNGHIAKK',
        url: 'https://sketchfab.com/models/c1251dd5edfb4f73ab6ac98ca3e3a188/embed',
        authorUrl: 'https://sketchfab.com/nguyennghiakk',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'An Dinh Palace, Historic City of Hue - Vietnam',
        author: 'CyArk',
        url: 'https://sketchfab.com/models/fd6df65eae404a7dbf006f68e7857a2e/embed',
        authorUrl: 'https://sketchfab.com/CyArk',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Cube World',
        author: 'Quanta Magazine',
        url: 'https://sketchfab.com/models/c54ea3927b854b76b531993daa793f2e/embed',
        authorUrl: 'https://sketchfab.com/quantamagazine',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'The Lost World',
        author: 'xinige',
        url: 'https://sketchfab.com/models/90f3461281ce433483e966044ff7bd35/embed',
        authorUrl: 'https://sketchfab.com/xinige',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Untamed: When Animals Ruled the World',
        author: 'Enalrem',
        url: 'https://sketchfab.com/models/d17c64f9851f4b1abb0b173cb5991c42/embed',
        authorUrl: 'https://sketchfab.com/enalrem',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Tilt Brush Deathwing World of Warcraft',
        author: 'vrhuman',
        url: 'https://sketchfab.com/models/004e04df0efb497f81e44aea97a22444/embed',
        authorUrl: 'https://sketchfab.com/vrhuman',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Quill - Hopewell Rocks, Fundy, New Brunswick',
        author: 'Nick Ladd',
        url: 'https://sketchfab.com/models/ab086caf134d4b1285d9dd76a9198771/embed',
        authorUrl: 'https://sketchfab.com/Nicktheladd',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Two Sides',
        author: 'Toni García Vilche',
        url: 'https://sketchfab.com/models/38ab24a56c6143f0a1508a206d6ff409/embed',
        authorUrl: 'https://sketchfab.com/zul_gv',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Pixel Canals - Low Poly Game Level',
        author: 'Seafoam',
        url: 'https://sketchfab.com/models/0e7cd01efb484aff817e3b03425cc080/embed',
        authorUrl: 'https://sketchfab.com/seafoam',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Fountain of Benzaiten and World Women Statues',
        author: 'STUDIO DUCKBILL',
        url: 'https://sketchfab.com/models/a7ac1df917a34cf8b8a24c95878fc0c3/embed',
        authorUrl: 'https://sketchfab.com/DuckbillStudio',
        sketchfabUrl: 'https://sketchfab.com'
    },
    {
        title: 'Lava Forest - World of Flame Florals',
        author: 'souchenki',
        url: 'https://sketchfab.com/models/2c991c7e151143da8a6a4ec3a4b03bf8/embed',
        authorUrl: 'https://sketchfab.com/souchenki',
        sketchfabUrl: 'https://sketchfab.com'
    },
];

models.forEach(model => {
    const modelElement = `
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
            <div class="sketchfab-embed-wrapper relative" style="padding-bottom: 56.25%;">
                <iframe title="${model.title}" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="${model.url}" class="absolute top-0 left-0 w-full h-full"></iframe>
            </div>
            <div class="p-4">
                <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-white transition-colors duration-300"><a href="${model.url.replace('/embed', '')}" target="_blank" rel="nofollow" class="hover:text-blue-500">${model.title}</a></h2>
                <p class="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    by <a href="${model.authorUrl}" target="_blank" rel="nofollow" class="hover:text-blue-500">${model.author}</a> on <a href="${model.sketchfabUrl}" target="_blank" rel="nofollow" class="hover:text-blue-500">Sketchfab</a>
                </p>
            </div>
        </div>
    `;
    gallery.innerHTML += modelElement;
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');

// Function to update the button text based on the current mode
function updateButtonText() {
    const isDarkMode = document.body.classList.contains('dark');
    darkModeToggle.textContent = isDarkMode ? 'Bật Light Mode' : 'Bật Dark Mode';
}

// Check for saved preference in localStorage
const savedDarkMode = localStorage.getItem('darkMode');

// Apply saved preference or default to light mode
if (savedDarkMode === 'true') {
    document.body.classList.add('dark');
} else {
    document.body.classList.remove('dark'); // Ensure light mode is applied initially if no preference is saved
}

// Update the button text on initial load
updateButtonText();

// Toggle dark mode on button click
darkModeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDarkMode);

    // Update the button text after toggling
    updateButtonText();
});