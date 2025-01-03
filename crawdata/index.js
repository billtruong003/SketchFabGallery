const axios = require('axios');
const { parse } = require('node-html-parser');
const fs = require('fs');

async function scrapeModelUrls(url, criteria) {
    console.log(`Starting to scrape: ${url}`);
    const modelUrls = [];
    const headers = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    };

    try {
        const response = await axios.get(url, headers);
        console.log(`Successfully fetched: ${url}`);
        const root = parse(response.data);

        const modelItems = root.querySelectorAll('.card.card-model');
        console.log(`Found ${modelItems.length} model items on ${url}`);

        for (const item of modelItems) {
            const modelUrl = item
                .querySelector('.card-model__thumbnail-link')
                .getAttribute('href');
            const modelId = modelUrl.split('-').pop();

            console.log(`  Model URL: ${modelUrl}, Model ID: ${modelId}`);

            const isStaffPick = !!item.querySelector('meta[itemprop="award"]');
            console.log(`    isStaffPick: ${isStaffPick}`);

            const likesElement = item.querySelector(
                '.c-like-button.c-star-like-button.card__footer__stats.--likes .count'
            );
            const likesText = likesElement ? likesElement.text.trim() : '0';
            const likes = parseInt(likesText.replace(/[^\d]/g, '')) || 0;
            console.log(`    likes: ${likes}`);

            const viewsElement = item.querySelector(
                '.card__footer__stats.--views.help .count'
            );
            const viewsText = viewsElement ? viewsElement.text.trim() : '0';
            const views = parseInt(viewsText.replace(/[^\d]/g, '')) || 0;
            console.log(`    views: ${views}`);

            // Bỏ qua kiểm tra staff_picks vì đã lọc từ đầu
            if (
                (criteria.min_likes && likes < criteria.min_likes) ||
                (criteria.min_views && views < criteria.min_views)
            ) {
                console.log(`    Model does not meet criteria. Skipping.`);
                continue;
            }

            if (criteria.category) {
                console.log(`    Checking category for model: ${modelUrl}`);
                const categoryUrl = `https://sketchfab.com${modelUrl}`;
                const categoryResponse = await axios.get(categoryUrl, headers);
                const categoryRoot = parse(categoryResponse.data);
                const categoriesTag = categoryRoot.querySelector(
                    'script[type="application/ld+json"]'
                );

                if (categoriesTag) {
                    const categoriesData = JSON.parse(categoriesTag.text);
                    const categories = categoriesData.keywords
                        ? categoriesData.keywords.map((c) => c.name.toLowerCase())
                        : [];

                    console.log(`    Categories found: ${categories.join(', ')}`);

                    if (!categories.includes(criteria.category.toLowerCase())) {
                        console.log(
                            `    Model does not belong to category: ${criteria.category}. Skipping.`
                        );
                        continue;
                    }
                } else {
                    console.log(`    Could not find category information for model.`);
                }
            }

            // Sửa lỗi ở đây: Xóa phần https://sketchfab.com thừa
            const fullModelUrl = modelUrl; // Không cộng chuỗi nữa
            modelUrls.push(fullModelUrl);
            console.log(`    Added model URL to list: ${fullModelUrl}`);
        }
    } catch (error) {
        console.error(`Error scraping ${url}: ${error.message}`);
    }

    console.log(`Finished scraping: ${url}`);
    return modelUrls;
}

async function cloneSketchfabFeaturedModels(
    criteria,
    outputFile = 'featured_models.json'
) {
    console.log('Starting cloneSketchfabFeaturedModels');
    let allModelUrls = [];

    if (criteria.staff_picks) {
        const pagesToScrapeStaffPicks = criteria.pages_to_scrape_staff_picks || 1;
        for (let page = 1; page <= pagesToScrapeStaffPicks; page++) {
            const staffPicksUrl = `https://sketchfab.com/3d-models/staffpicks?page=${page}`;
            allModelUrls = allModelUrls.concat(await scrapeModelUrls(staffPicksUrl, criteria));
        }
    }

    const pagesToScrape = criteria.pages_to_scrape || 1;
    for (let page = 1; page <= pagesToScrape; page++) {
        const exploreUrl = `https://sketchfab.com/explore/popular?page=${page}`;
        allModelUrls = allModelUrls.concat(
            await scrapeModelUrls(exploreUrl, criteria)
        );
    }

    console.log('All model URLs scraped:', allModelUrls);

    try {
        console.log('Writing model URLs to file...');
        fs.writeFileSync(outputFile, JSON.stringify(allModelUrls, null, 2));
        console.log(`Saved model URLs to ${outputFile}`);
    } catch (err) {
        console.error('Error writing to file:', err);
    }
    console.log('Finished cloneSketchfabFeaturedModels');
}

const criteria = {
    staff_picks: true,
    min_likes: 0,
    min_views: 0,
    category: null,
    pages_to_scrape: 0,
    pages_to_scrape_staff_picks: 100,
};

cloneSketchfabFeaturedModels(criteria);