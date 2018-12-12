const puppeteer = require('puppeteer');
const pevents = [
    'response'
];

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.forbes.com/');

    console.log('Scrolling through page');

    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            try {
                const maxScroll = Number.MAX_SAFE_INTEGER;
                let lastScroll = 0;
                const interval = setInterval(() => {
                    window.scrollBy(0, 100);
                    const scrollTop = document.documentElement.scrollTop;
                    if (scrollTop === maxScroll || scrollTop === lastScroll) {
                        clearInterval(interval);
                        resolve();
                    } else {
                        lastScroll = scrollTop;
                    }
                }, 100);
            } catch (err) {
                console.log(err);
                reject(err.toString());
            }
        });
    });
    
    console.log('Finished scrolling');
    const authorsNames = await page.evaluate(() => [...document.documentElement.querySelectorAll('.byline__author-name')].map(elem => elem.innerText));
    const authorsType = await page.evaluate(() => [...document.documentElement.querySelectorAll('.byline__author-type')].map(elem => elem.innerText));
    let authorList = {};
    authorsNames.forEach((key, i) => authorList[key]=authorsType[i]);
    console.log(authorList);
    await browser.close();
})();