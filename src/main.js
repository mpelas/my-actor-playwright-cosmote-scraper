/**
 * This template is a production ready boilerplate for developing with `PlaywrightCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

// For more information, see https://docs.apify.com/sdk/js
import { Actor } from 'apify';
// For more information, see https://crawlee.dev
import { PlaywrightCrawler } from 'crawlee';
// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
import  router  from './routes.js';

// Initialize the Apify SDK
await Actor.init();
  // One-time per-run charge event (pay-per-event monetization)
  await Actor.charge({ eventName: 'run_started', count: 1 });




const {
    startUrls = [
        //'https://www.cosmote.gr/eshop/browse//Fixed-Plans/-/N-dccg6m?Nr=AND(OR(product.siteId:storeSiteUS),product.isVisibleOn:eShop,product.priceListPair:salePrices_listPrices)' //AUTO ANA 12 to epomeno ana 24
       'https://www.cosmote.gr/eshop/browse/Fixed-Plans/-/N-dccg6m?No=0&Nr=AND(product.language:Ελληνικά,OR(product.siteId:storeSiteUS),product.isVisibleOn:eShop,product.priceListPair:salePrices_listPrices)&Nrpp=48',
        // 'https://www.cosmote.gr/cs/cosmote/gr/programmata-kinitis-kartosymvolaio.html',
        //'https://www.cosmote.gr/cs/cosmote/gr/programmata-kinitis.html'
    ],
    maxConcurrency = 2,
} = await Actor.getInput() ?? {};

if (!startUrls || startUrls.length === 0) {
    console.log('No startUrls in input, exiting.');
    await Actor.exit();
}

console.log('starturls pou tha skanaro einai ta : ', startUrls);

const proxyConfiguration = await Actor.createProxyConfiguration();

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    maxRequestRetries: 3,
    requestHandlerTimeoutSecs: 180,
    maxConcurrency: Math.max(1, Math.min(5, maxConcurrency)),
    requestHandler: router,
    launchContext: {
        launchOptions: {
            args: [
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
            ]
        }
    }
});

try {
    console.log("🚀 Starting crawler...");
    await crawler.run(startUrls);
    console.log("✅ Crawler finished");
} catch (err) {
    console.error("❌ Error during crawl:", err);
}

// Exit successfully
await Actor.exit();