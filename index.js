const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

var mainContext;
var counter= new Date().valueOf() 

const status_url = 'https://cgifederal.secure.force.com/summaryofselectedinformation';
const login_url = 'https://cgifederal.secure.force.com/SiteRegister?country=&language=';


const chromeOptions = {
  headless:false,
  slowMo:10,
  defaultViewPort:null
}

async function configureBrowser() {
    const browser =  await puppeteer.launch(chromeOptions);
    const context = await browser.createIncognitoBrowserContext();
    mainContext=context;
    // const page = await context.newPage();
    // await page.goto(status_url);
    // return page;
}

async function getLoginPage() {
    
    const context = mainContext;
    const page = await context.newPage();
    await page.goto(login_url);
    return page;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createUserAndLogin(){
    console.log("Creating new page")
    const page = await getLoginPage();

    const countryValue = "001C000000o0mDsIAI";
    await page.evaluate(val => document.getElementById('Registration:SiteTemplate:theForm:accountId').value = val, countryValue);
    
    const emailName="y" + counter + "@gmail.com";
    counter++;
    console.log("email: " + emailName);
    await page.evaluate(val => document.getElementById("Registration:SiteTemplate:theForm:username").value = val, emailName);

    const firstName = "yolo";
    await page.evaluate(val => document.getElementById("Registration:SiteTemplate:theForm:firstname").value = val, firstName); 

    const lastName = "yolo";
    await page.evaluate(val => document.getElementById("Registration:SiteTemplate:theForm:lastname").value = val, lastName); 

    const password = "Temp@0270";
    await page.evaluate(val => document.getElementById("Registration:SiteTemplate:theForm:password").value = val, password); 
    await page.evaluate(val => document.getElementById("Registration:SiteTemplate:theForm:confirmPassword").value = val, password); 

    await page.evaluate(val => document.getElementsByName("Registration:SiteTemplate:theForm:j_id169")[0].checked = val, true);  

    await page.waitForFunction(() => {
      const captcha = document.getElementById('Registration:SiteTemplate:theForm:recaptcha_response_field').value;  

      return captcha.length >= 4;
    },
    {"polling":5000, "timeout": 0}, null);
    
    await Promise.all([
          page.click('[id="Registration:SiteTemplate:theForm:submit"]'),
          page.waitForNavigation({ timeout: 50000, waitUntil: 'load' }),
    ]);

    // console.log("on second page");
    // await sleep(3000);

    await Promise.all([
          page.click('[id="j_id0:SiteTemplate:j_id52:j_id53:j_id54:j_id58"]'),
          page.waitForNavigation({ timeout: 50000, waitUntil: 'load' }),
    ]);

    await page.evaluate(val => document.getElementById("j_id0:SiteTemplate:theForm:ttip:0").checked = val, true);  

    await sleep(1000);

    // await page.click()
    document.getElementsByClassName("ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only")[1].click()

    await Promise.all([
          page.click('.button.continue.ui-button.ui-widget.ui-state-default.ui-corner-all'),
          page.waitForNavigation({ timeout: 50000, waitUntil: 'load' }),
    ]);


    // await page.waitForNavigation();

    // await page.evaluate(() => {document.getElementById("j_id0:SiteTemplate:j_id52:j_id53:j_id54:j_id58").click();});

    // await page.waitForNavigation();
}

async function checkDate(page) {
    
    if(await page.$('.login.ui-state-error.ui-corner-all')){
      await createUserAndLogin()
    }

    await page.reload();
    console.log("old page");

    // let html = await page.evaluate(() => document.body.innerHTML);
    // // console.log(html);

    // $('#priceblock_dealprice', html).each(function() {
    //     let dollarPrice = $(this).text();
    //     // console.log(dollarPrice);
    //     let currentPrice = Number(dollarPrice.replace(/[^0-9.-]+/g,""));

    //     if (currentPrice < 300) {
    //         console.log("BUY!!!! " + currentPrice);
    //         sendNotification(currentPrice);
    //     }
    // });
}

async function startTracking() {

    // const page = await configureBrowser();
    // console.log("Page is here");
    // await checkDate(page);

    await configureBrowser();
    await createUserAndLogin();

    // let job = new CronJob('* */5 * * * *', function() { //runs every 30 minutes in this config
    //   checkDate(page);
    // }, null, true, null, null, true);
    // job.start();
}

async function sendNotification(price) {

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '*****@gmail.com',
        pass: '*****'
      }
    });
  
    let textToSend = 'Price dropped to ' + price;
    let htmlText = `<a href=\"${url}\">Link</a>`;
  
    let info = await transporter.sendMail({
      from: '"Price Tracker" <*****@gmail.com>',
      to: "*****@gmail.com",
      subject: 'Price dropped to ' + price, 
      text: textToSend,
      html: htmlText
    });
  
    console.log("Message sent: %s", info.messageId);
  }

console.log("console testing");
startTracking();