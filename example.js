const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    var height=600;
    var width=1200;
    await page.setViewport({height, width});

    await page.goto('https://www.forbes.com/');
    await scrollDown(page);
    const authorsNames = await page.evaluate(() => [...document.documentElement.querySelectorAll('.byline__author-name')].map(elem => elem.innerText));
    const authorsType = await page.evaluate(() => [...document.documentElement.querySelectorAll('.byline__author-type')].map(elem => elem.innerText));
    await save(page,authorsNames,authorsType);
    const topLinks = await page.evaluate(() => [...document.documentElement.querySelectorAll('a.header__title')].map(elem => elem.href));
    for (let index = 0; index < topLinks.length; index++) {
        console.log(topLinks[index])
    }

    await browser.close();
})();

function save(page,authorsNames,authorsType){
    let authorList = {};
    authorsNames.forEach((key, i) => authorList[key]=authorsType[i]);
    console.log(authorList);
    let authorsString= "";
    for (var key in authorList) {
        authorsString+=key+": "+authorList[key]+"\r\n";
    }
    fs.writeFile("test.txt", authorsString, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function scrollDown(page){
    console.log('Scrolling through page');
    return page.evaluate(async () => {
        return new Promise((resolve, reject) => {
            try {
                const maxScroll = Number.MAX_SAFE_INTEGER;
                let lastScroll = 0;
                const interval = setInterval(() => {
                    window.scrollBy(0, 100);
                    const scrollTop = document.documentElement.scrollTop;
                    if (scrollTop === maxScroll || scrollTop === lastScroll) {
                        clearInterval(interval);
                        console.log('Finished scrolling');
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
}