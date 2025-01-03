const puppeteer = require('puppeteer');
const { parse } = require('node-html-parser');
const fs = require('fs');

async function scrapeModelUrls(url, criteria, page) {
    console.log(`Starting to scrape: ${url}`);
    const modelUrls = [];

    try {
        const modelItems = await page.$$('.card.card-model');
        console.log(`Found ${modelItems.length} model items on ${url}`);

        for (const item of modelItems) {
            const modelUrlElement = await item.$('.card-model__thumbnail-link');
            const modelUrl = await modelUrlElement.evaluate((el) => el.getAttribute('href'));
            const modelId = modelUrl.split('-').pop();

            console.log(`  Model URL: ${modelUrl}, Model ID: ${modelId}`);

            const isStaffPick = await item.$('meta[itemprop="award"]') !== null;
            console.log(`    isStaffPick: ${isStaffPick}`);

            const likesElement = await item.$(
                '.c-like-button.c-star-like-button.card__footer__stats.--likes .count'
            );
            const likesText = likesElement
                ? await likesElement.evaluate((el) => el.textContent.trim())
                : '0';
            const likes = parseInt(likesText.replace(/[^\d]/g, '')) || 0;
            console.log(`    likes: ${likes}`);

            const viewsElement = await item.$(
                '.card__footer__stats.--views.help .count'
            );
            const viewsText = viewsElement
                ? await viewsElement.evaluate((el) => el.textContent.trim())
                : '0';
            const views = parseInt(viewsText.replace(/[^\d]/g, '')) || 0;
            console.log(`    views: ${views}`);

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
                const categoryPage = await page.browser().newPage();
                await categoryPage.goto(categoryUrl, { waitUntil: 'networkidle2' });
                const categoriesTag = await categoryPage.$('script[type="application/ld+json"]');

                if (categoriesTag) {
                    const categoriesData = JSON.parse(await categoryPage.evaluate((el) => el.textContent, categoriesTag));
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
                await categoryPage.close();
            }

            const fullModelUrl = modelUrl;
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
    const browser = await puppeteer.launch({
        headless: false, // Hiển thị trình duyệt
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    let allModelUrls = [];

    // Ước lượng số model trên mỗi lần load (có thể cần điều chỉnh)
    const modelsPerLoad = 24;

    async function scrapePage(url, maxPages) {
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.card.card-model');

        // Tính số lần nhấn nút "Load More"
        const numClicks = maxPages > 0 ? Math.ceil((maxPages * modelsPerLoad) / modelsPerLoad) : 1;

        for (let i = 0; i < numClicks; i++) {
            try {
                // Tìm nút "Load More"
                const loadMoreButton = await page.$('.c-grid__button.--next .button.btn-primary.btn-large');

                if (loadMoreButton) {
                    // Lấy số lượng model hiện tại
                    const currentModels = await page.$$('.card.card-model');
                    console.log(`Current models before clicking "Load More": ${currentModels.length}`);

                    // Nhấn nút "Load More"
                    await loadMoreButton.click();

                    // Chờ load thêm model cho đến khi số lượng model thay đổi
                    await page.waitForFunction(
                        (prevModelCount) => {
                            const currentModelCount = document.querySelectorAll('.card.card-model').length;
                            return currentModelCount > prevModelCount;
                        },
                        { timeout: 10000 }, // Tăng timeout lên 10 giây
                        currentModels.length
                    );

                    // Lấy số lượng model sau khi đã nhấn nút "Load More"
                    const loadedModels = await page.$$('.card.card-model');
                    console.log(`Loaded models after clicking "Load More" ${i + 1}: ${loadedModels.length}`);
                } else {
                    console.log('Could not find "Load More" button.');
                    break;
                }
            } catch (e) {
                console.log('Error during loading more:', e);
                break;
            }
        }

        // Scrape model URLs sau khi đã nhấn "Load More" đủ số lần
        allModelUrls = allModelUrls.concat(await scrapeModelUrls(url, criteria, page));
    }
    if (criteria.staff_picks) {
        const staffPicksUrl = `https://sketchfab.com/3d-models/staffpicks`;
        await scrapePage(staffPicksUrl, criteria.pages_to_scrape_staff_picks);
    }

    if (criteria.pages_to_scrape > 0) {
        const exploreUrl = `https://sketchfab.com/explore/popular`;
        await scrapePage(exploreUrl, criteria.pages_to_scrape);
    }

    allModelUrls = [...new Set(allModelUrls)];
    console.log('All model URLs scraped:', allModelUrls);

    try {
        console.log('Writing model URLs to file...');
        fs.writeFileSync(outputFile, JSON.stringify(allModelUrls, null, 2));
        console.log(`Saved model URLs to ${outputFile}`);
    } catch (err) {
        console.error('Error writing to file:', err);
    }

    await browser.close();
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