const gallery = document.getElementById('gallery');
const models = [];
let currentPage = 1;
const modelsPerPage = 12;
const maxPagesToShow = 10; // Maximum number of page buttons to show

// Function to display models for the current page
function displayModels(page) {
    const startIndex = (page - 1) * modelsPerPage;
    const endIndex = startIndex + modelsPerPage;
    const modelsToDisplay = models.slice(startIndex, endIndex);

    gallery.innerHTML = ''; // Clear existing models

    modelsToDisplay.forEach(model => {
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
}

// Function to update pagination buttons
function updatePaginationButtons() {
    const totalPages = Math.ceil(models.length / modelsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Create "Previous" button
    const prevButton = createPaginationButton('Previous', currentPage > 1, () => {
        currentPage--;
        displayModels(currentPage);
        updatePaginationButtons();
    });
    pagination.appendChild(prevButton);

    if (totalPages <= maxPagesToShow) {
        // Display all page buttons
        for (let i = 1; i <= totalPages; i++) {
            const button = createPaginationButton(i, true, () => {
                currentPage = i;
                displayModels(currentPage);
                updatePaginationButtons();
            });
            // Apply active class correctly
            if (i === currentPage) {
                button.classList.add('bg-gray-500', 'text-white');
                button.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-300', 'dark:hover:bg-gray-600');
            }
            pagination.appendChild(button);
        }
    } else {
        // Display input field and limited page buttons

        // Determine start and end pages for visible buttons
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Adjust if near the beginning or end
        if (endPage - startPage + 1 < maxPagesToShow) {
            if (currentPage < totalPages / 2) {
                endPage = Math.min(totalPages, maxPagesToShow);
                startPage = 1;
            } else {
                startPage = Math.max(1, totalPages - maxPagesToShow + 1);
                endPage = totalPages;
            }
        }

        // Display first page button (if not already visible)
        if (startPage > 1) {
            const button = createPaginationButton(1, true, () => {
                currentPage = 1;
                displayModels(currentPage);
                updatePaginationButtons();
            });
            pagination.appendChild(button);
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.classList.add('px-4', 'py-2');
                pagination.appendChild(ellipsis);
            }
        }

        // Display visible page buttons
        for (let i = startPage; i <= endPage; i++) {
            const button = createPaginationButton(i, true, () => {
                currentPage = i;
                displayModels(currentPage);
                updatePaginationButtons();
            });
            if (i === currentPage) {
                button.classList.add('bg-gray-500', 'text-white');
                button.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-300', 'dark:hover:bg-gray-600');
            }
            pagination.appendChild(button);
        }

        // Display last page button (if not already visible)
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.classList.add('px-4', 'py-2');
                pagination.appendChild(ellipsis);
            }
            const button = createPaginationButton(totalPages, true, () => {
                currentPage = totalPages;
                displayModels(currentPage);
                updatePaginationButtons();
            });
            pagination.appendChild(button);
        }

        // Input field for page number
        const pageInput = document.createElement('input');
        pageInput.type = 'number';
        pageInput.min = 1;
        pageInput.max = totalPages;
        pageInput.value = currentPage;
        pageInput.classList.add(
            'w-16',
            'px-2',
            'py-1',
            'mx-1',
            'border',
            'rounded',
            'text-center',
            'bg-gray-700',       // Dark background for dark mode
            'dark:bg-gray-800',   // Explicit dark mode background
            'text-white',         // White text color for dark mode
            'placeholder-gray-400', // Lighter placeholder text in dark mode (optional)
            'dark:text-gray-200'   // Ensure text is visible in dark mode
        );
        pageInput.addEventListener('change', () => {
            let newPage = parseInt(pageInput.value);
            if (newPage >= 1 && newPage <= totalPages) {
                currentPage = newPage;
                displayModels(currentPage);
                updatePaginationButtons();
            } else {
                // Reset to the current page if the input is invalid
                pageInput.value = currentPage;
            }
        });
        pagination.appendChild(pageInput);


    }

    // Create "Next" button
    const nextButton = createPaginationButton('Next', currentPage < totalPages, () => {
        currentPage++;
        displayModels(currentPage);
        updatePaginationButtons();
    });
    pagination.appendChild(nextButton);

    // Ensure buttons are responsive
    pagination.classList.add('flex', 'flex-wrap', 'justify-center', 'mt-8');
}

// Helper function to create pagination buttons
function createPaginationButton(text, enabled, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('px-4', 'py-2', 'mx-1', 'rounded', 'transition-colors', 'duration-300');

    if (enabled) {
        button.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-300', 'dark:hover:bg-gray-600');
        button.addEventListener('click', clickHandler);
    } else {
        button.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-400', 'dark:text-gray-600', 'cursor-not-allowed');
    }

    // Make button responsive on smaller screens
    if (text === 'Previous' || text === 'Next') {
        button.classList.add('sm:px-2', 'sm:py-1');
    }

    return button;
}

// Fetch model data from model_info.json
fetch('model_info.json')
    .then(response => response.json())
    .then(data => {
        models.push(...data);
        displayModels(currentPage);
        updatePaginationButtons();
    })
    .catch(error => {
        console.error('Error fetching or parsing model_info.json:', error);
        gallery.innerHTML = '<p class="text-red-500">Failed to load models. Please check your network connection and try again.</p>';
    });

// Dark Mode Toggle (same as before)
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