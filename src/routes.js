import { Router } from 'crawlee';
import {log } from 'crawlee';
import { Actor } from 'apify';


// Define the rejectCookies function
async function rejectCookies(page) {
    // Click the 'Απόρριψη cookies' button if it exists
    try {
        const declineButton = await page.waitForSelector('button.cc_button.cc_button--required', { timeout: 15000 });
        if (declineButton) {
          await declineButton.click();
          console.log ("✅ Declined cookie consent.");
      }
    } catch (error) {
        console.log("⚠️ No cookie consent found, continuing.");//log.info iparxei mono sto apify oxi sto aplo playwright
    }
}

const router = async ({ page, request, log, pushData  }) => {
    log.info(`Scraping URL: ${request.url}`);
    console.log(`Scraping URL: ${request.url}`);

    /*
    if kinita {
        const results = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.wcs-item')).map(el => {
                const title = el.querySelector('.wcs-item-title')?.innerText.split('\n')[1]?.trim();
                const data = el.querySelector('.wcs-row.wcs-data')?.innerText.trim();
                const minutes = el.querySelector('.wcs-row.wcs-calls')?.innerText.trim();
                const sms = el.querySelector('.wcs-row.wcs-sms')?.innerText.trim();
                const priceEl = el.querySelector('.wcs-item-price strong');
                const price = priceEl?.getAttribute('data-discount') || priceEl?.innerText.trim();
                const oldPrice = priceEl?.getAttribute('data-old') || null;
                const cta = el.querySelector('a.wcs-item-more')?.href;
        
                return {
                    title,
                    data,
                    minutes,
                    sms,
                    price,
                    oldPrice,
                    link: cta
                };
            });
        });
    };
    */

    
    
        await rejectCookies(page);
        await page.waitForTimeout(5000); // Let DOM stabilize
        log.info('Scraping COSMOTE ...');

        /// SOS me auto glitoneis olo to logging sto browser 2025.04.29
        page.on('console', msg => {
            console.log(`PAGE LOG: ${msg.text()}`);
        });
        
        //// Auto gia kapoio logo de paizei - kathiesterei poli kai ksanaprospathei na patisei to Click the dropdown menu
        //await page.click('#dropdown-menu-perpage');
        //await page.waitForTimeout(1000); // Small delay to allow dropdown to appear
       
        //// Click the "48 ανά σελίδα" option (ensure selector is correct)
        ////await page.click('a[href*="Nrpp=48"]');
        ////await page.waitForLoadState("networkidle");
        //await page.click('.dropdown-menu .dropdown-item[href*="Nrpp=48"]');
        //await page.waitForTimeout(3000); // Wait for reload
       // await page.getByRole('button', { name: 'ανά σελίδα' }).click();
       // await page.getByRole('link', { name: '48 ανά σελίδα' }).click();
        

    let EXECUTIONRUNS = '1';    
   // while (true) {
        log.info(`ΞΕΚΙΝΑΕΙ EXECUTIONRUNS = ${EXECUTIONRUNS}`);
        const plans = await page.evaluate(() => {
            const planelements = document.querySelectorAll('.productGridCard:not(#backupProd .productGridCard)', { timeout: 15000 });
            console.log("planelements = ", planelements);
            
            function safeText(el, selector) {
                const target = el.querySelector(selector);
                return target && target.innerText ? target.innerText.trim() : null;
            }

            
            function extractMinutes(planCard, type) {
                const el = Array.from(planCard.querySelectorAll('li')).find(li => li.innerText.includes(type));
                if (el) {
                   const val = el.querySelector('.override_prefix_span')?.innerText.trim();
                    return val || 'N/A';
                }
                
                // Fallback: try inside .media-body .override_prefix_span
                const mediaBodyElements = Array.from(planCard.querySelectorAll('.media-body .override_prefix_span'));
                const mediaBodyEl = mediaBodyElements.find(span => {
                    const nextSpan = span.nextElementSibling;
                    return nextSpan && nextSpan.classList.contains('override_span') && nextSpan.innerText.includes(type);
                });
                if (mediaBodyEl) {
                    return mediaBodyEl.innerText.trim();
                }

                return 'N/A';
            }

            

            if (planelements.length === 0) {
                console.log("⚠️ No product cards found on the page.");

            }
            else {
                return Array.from(planelements).map(element => {
                    

                    const a01timestamp = new Date().toISOString();
                    const a02company = "COSMOTE";
                    const a03statheromobile = "σταθερό";
                    
                    
                    //<div class="sb-description-text mainName">Business Double Play Highspeed Full Pack </div>    ONOMa BUSINESS paketou 
                    //<div class="rateplan-name">Double Play Unlimited</div>                                       ONOMa OIKIAKOU paketou
                    const title_explanation = safeText(element, "listing-top-tag-text"); // thelo na piaso to "100% FIBER" "Με επιδότηση Gigabit Voucher" giati ta paketa FTTH exoyn epipleon ekptosi gia na min emfanistoun diplotipa 
                    //let a04title = safeText(element, '.sb-description-text mainName')?.innerText?.trim() || element.querySelector('.rateplan-name')?.innerText?.trim();
                    let a04title = ( () => {
                        const nameText = safeText(element, '.sb-description-text.mainName');
                        if (nameText) return nameText;
                    
                        const ratePlanText = safeText(element, '.rateplan-name');
                        if (ratePlanText) return ratePlanText;
                    
                        return null;
                    })();    
                    a04title = title_explanation? `${a04title}, ${title_explanation}` : a04title; //kano append to extradaki gia na uparxei monosimanto onoma na min mperdeuomai

                    // Select the element with the 'original-price' attribute
                    const originalPriceElement = element.querySelector('.override_price_right[original-price]');
                    // Extract the original price value
                    const originalPrice = originalPriceElement ? originalPriceElement.getAttribute('original-price') : null;
                    console.log("originalPrice = ", originalPrice);

                    // Select the element with the 'text-decoration-line-through h-ft' class
                    const strikethroughPriceElement = element.querySelector('.text-decoration-line-through.h-ft');
                    // Extract the strikethrough price text
                    const strikethroughPrice = strikethroughPriceElement ? strikethroughPriceElement.textContent : null;
                    console.log("strikethroughPrice = ", strikethroughPrice);

                    // Extract price from the new div element
                    const priceElementAplouBox = element.querySelector('.fs-26.ff-bold.align-self-center');
                    console.log("Price from new div:", priceElementAplouBox);
                    const a05price = originalPrice || (priceElementAplouBox ? priceElementAplouBox?.innerText.trim().replace(',', '.').replace(/[^\d.]/g, '') : null);
                    
                    //element.querySelector('.override_rateplans_left_price')?.innerText.trim().replace('€', '').trim();
                    const a051discountedprice = strikethroughPrice  ? strikethroughPrice.replace(',', '.').replace(/[^\d.]/g, '') : null;//element.querySelector('.override_price_right')?.innerText.trim().replace('€', '').trim() || "N/A"; //timi me ekptosi

                    //const myelements = element.querySelectorAll('.media-body .override_prefix_span ');
                    const myelements = Array.from(element.querySelectorAll('.media-body .override_prefix_span'));

                    const a09downspeed = (() => {
                        // First try to find in .override_prefix_span
                        const speedFromMyelements = myelements.find(e => 
                            e.innerText.includes("Mbps") || 
                            e.innerText.includes("Έως") ||
                            (/(\d+\s*[GΜM]bps)/i.test(e.innerText) && e.innerText.toLowerCase().includes('bps'))
                        );
                        if (speedFromMyelements) return speedFromMyelements.innerText.trim();
                    
                        // Fallback: try inside .specs-list.mt-2 ul.tick li
                        const specsList = element.querySelectorAll('.specs-list.mt-2 ul.tick li');
                        const speedFromSpecs = Array.from(specsList).find(li =>
                            li.innerText.includes("Mbps") || 
                            li.innerText.includes("Έως") ||
                            (/(\d+\s*[GΜM]bps)/i.test(li.innerText) && li.innerText.toLowerCase().includes('bps'))
                        );
                        if (speedFromSpecs) return speedFromSpecs.innerText.trim();
                    
                        return "N/A";
                    })();
                    const a10upspeed = (() => {
                        const el = myelements.find(e => 
                            e.innerText.toLowerCase().includes("upload") || 
                            e.innerText.toLowerCase().includes("ταχύτητα αποστολής")
                        );
                        return el ? el.innerText.trim() : "N/A";
                    })();
                    
                    /*                   
                    const extractMinutes = (type = 'fixed') => {
                        const isFixed = type === 'fixed';
                        const keywords = isFixed
                            ? ["σταθερά", "προς σταθερά", "λεπτά προς σταθερά"]
                            : ["κινητά", "προς κινητά", "λεπτά προς κινητά", "κινητής"];
                    
                        // Step 1: Try override_prefix_span + override_span combo
                        const primaryElement = myelements.find((e, i) => {
                            const next = myelements[i + 1];
                            return (
                                e.classList.contains('override_prefix_span') &&
                                next && next.classList.contains('override_span') &&
                                keywords.some(k => next.innerText.toLowerCase().includes(k))
                            );
                        });
                        if (primaryElement) return primaryElement.innerText.trim();
                    
                        // Step 2: Fallback in .specs-list.mt-2
                        const specsList = element.querySelectorAll('.specs-list.mt-2 ul.tick li');
                        const fallback = Array.from(specsList).find(li =>
                            keywords.some(k => li.innerText.toLowerCase().includes(k))
                        );
                        return fallback ? fallback.innerText.trim() : "N/A";
                    };
                    
                    const a121minutesToFixed = extractMinutes('fixed');
                    const a122minutesToMobile = extractMinutes('mobile');*/
                    const a121minutesToFixed = extractMinutes(element, 'προς σταθερά');
                    const a122minutesToMobile = extractMinutes(element, 'προς κινητά') === "N/A"? extractMinutes(element, 'προς εθνικά κινητά') : extractMinutes(element, 'προς κινητά');
                    
                   
                    // Log the captured prices
                    //console.log(`Original Price: ${originalPrice}`);
                    //console.log(`Strikethrough Price: ${strikethroughPrice}`);
                    
                    // Combine remaining elements into a06details
                    let a06details = myelements.map(el => el.innerText.trim()).join(', '); 
                                    // den bazo filtro giati ginetai xamoulis eidika me ta lepta omilias iparxoun dio kai treis eggrafes me ti leksi lepta se kapoia paketa
                                    // Array.from(myelements)
                                    //    .filter(el => !el.innerText.includes("ταχύτητα download") && !el.innerText.includes("ταχύτητα upload") && !el.innerText.includes("λεπτά"))
                                    //    .map(el => el.innerText.trim())
                                    //    .join(', ');

                    // Extract additional specs
                    const specsList = element.querySelector('.specs-list.mt-2 ul.tick');
                    const a13specs = specsList ? Array.from(specsList.querySelectorAll('li')).map(li => li.innerText.trim()).join(', ') : "N/A";                    
                    a06details = a06details ? `${a06details}, ${a13specs}` : a13specs;

                    
                    // Extract the "Μάθε Περισσότερα" URL
                    const learnMoreButton = element.querySelector('.learn_more_button');
                    const a21urllink = learnMoreButton ? learnMoreButton.href : 'N/A';

                    


                    // Assign values to variables based on conditions
                    // Log the extracted values
                    //console.log("Downspeed:", a09downspeed);
                    //console.log("Upspeed:", a10upspeed);
                    //console.log("Minutes to Fixed:", a121minutesToFixed);
                    //console.log("Minutes to Mobile:", a122minutesToMobile);

                    return {
                        a01timestamp, a02company, a03statheromobile,
                        a04title, a05price, a051discountedprice, a09downspeed, a10upspeed, a121minutesToFixed, a122minutesToMobile, a06details, a21urllink

                    };
                });
            }
        });

        const randomNumber = Math.random();
        const key = `ERROR-LOGIN-${randomNumber}`;
        log.info(`Will take snapshot named ${key}..`);
        // Take a screenshot and write it to the filesystem
        await page.screenshot({ path: `${key}.png`, fullPage: true  });

        //log.info("plans =", plans);
        await pushData(plans);
        await Actor.charge({ eventName: 'plan_scraped', count: Array.isArray(plans) ? plans.length : 1 });

        // Check if the "Next" button is present and click it
        const nextButton = await page.$('#paginationNextLink');
        if (nextButton) {

            const previousFirstTitle = await page.evaluate(() => {
                const firstCard = document.querySelector('.productGridCard');
                if (!firstCard) return null;
                const title = firstCard.querySelector('.rateplan-name, .sb-description-text.mainName');
                return title ? title.innerText.trim() : null;
            });
            log.info("previousFirstTitle=", previousFirstTitle);
            EXECUTIONRUNS = EXECUTIONRUNS + 1;
            await nextButton.click();

            // Wait until first product card changes — prevents duplicates
            await page.waitForFunction((prevTitle) => {
                const firstCard = document.querySelector('.productGridCard');
                if (!firstCard) return false;
                const title = firstCard.querySelector('.rateplan-name, .sb-description-text.mainName');
               
                return title && title.innerText.trim() !== prevTitle;
            }, {}, previousFirstTitle);
            


            await page.waitForTimeout(1000); // Wait for the next page to load
            log.info("Clicked next, waiting for content to change...")
        } else {
            log.info("Exit the loop BECAUSE there is no 'Next'button..")
         //   break; // Exit the loop if there is no "Next" button
        }
   // }
       
}
    

export default router;



//console.log("PAGE COSMOTE =",page);
/*
      //  try {
            // Select the dropdown button and the span inside it
            const dropdownButton = document.querySelector('#dropdown-menu-perpage');
            let dropdownSpan = dropdownButton.querySelector('.override_dropdown_span');

            // Get the current value displayed in the dropdown
            let currentValue = dropdownSpan.textContent.trim().split(' ')[0];
            console.log("currentValue of the dropdownspan pages per page =", currentValue);

            // Check if the current value is not '48'
            if (currentValue !== '48') {
                // Select the dropdown menu item for '48 items per page'
                const dropdownItem48 = document.querySelector('.dropdown-menu .dropdown-item[href*="Nrpp=48"]');

                // Simulate a click on the dropdown menu item
                dropdownItem48.click();
                console.log(" I clicked 48 items per page...");
                await page.waitForTimeout(2000); // Small delay to allow dropdown to appear
                
                //elegxos afou to ksanadiabaso
                dropdownSpan = dropdownButton.querySelector('.override_dropdown_span');
                currentValue = dropdownSpan.textContent.trim().split(' ')[0];
                console.log(" NEA TIMI GIA TO currentValue of the dropdownspan pages per page =", currentValue);


            } else {
           //     console.log("⚠️ Simvolaio plans (Mix&Match) - Switch was already checked.");
                log.info("⚠️ I timi itan idi 48 items ana selida - no clicking needed.");
            }
     //   } catch (error) {
    //        console.log("⚠️ page results change from 12 to 48 seems to malfunction....");
     //       log.info("⚠️ page results change from 12 to 48 seems to malfunction....");
    //    } 
    */