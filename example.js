const puppeteer = require('puppeteer');
const fs = require('fs');
const list=["billionare", "innovation", "leadership", "money", "consumer", "industry", "lifestyle", "lists"];
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout("60000");
    var height=600;
    var width=1200;
    await page.setViewport({height, width});

    await page.goto('https://www.forbes.com/', {waitUntil: "networkidle2"});
    await page.addScriptTag({url:"https://code.jquery.com/jquery-3.2.1.min.js"});
    await scrollDown(page);
    const authorsNames = await page.evaluate(() => $(".byline__author-name").map(function(i,el) { return $(el).text(); }).get());
    const authorsType = await page.evaluate(() =>$(".byline__author-type").map(function(i,el) { return $(el).text(); }).get());
    await save(page,authorsNames,authorsType, "index");
    const topLinks = await page.evaluate(() => $("a.header__title").map(function(i,el) { return $(el).attr('href'); }).get());
    for (let index = 0; index < topLinks.length; index++) {
        await page.goto(topLinks[index], {waitUntil: "networkidle2"});
        await scrollDown(page);
        const authorsNames = await page.evaluate(() => $(".name-desc>a").map(function(i,el) { return $(el).text(); }).get());
        const authorsType = await page.evaluate(() =>$(".atype>span").map(function(i,el) { return $(el).text(); }).get());
        await save(page,authorsNames,authorsType, list[index]);
    }

    await browser.close();
})();

function save(page,authorsNames,authorsType, name){
    let authorList = {};
    authorsNames.forEach((key, i) => authorList[key]=authorsType[i]);
    console.log(authorList);
    let authorsString= "";
    for (var key in authorList) {
        authorsString+=key+": "+authorList[key]+"\r\n";
    }
    fs.writeFile(name+".txt", authorsString, function(err) {
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