const { JSDOM } = require('jsdom');
const Nightmare = require('nightmare');

// const URL = process.argv[2];
// const OUTPUT_FILE = process.argv[3];
const errors = [];

const nightmare = Nightmare({ show: false });
const counter = [0, 0];

const stripText = text => text.replace(/\t/g, '').replace(/\n/g, '');

nightmare
  .goto('https://uk.burberry.com/mens-tailoring-suits/')
  .click('.js-text-truncate__show-link')
  .wait('.text-truncate--restored')
  .evaluate(() => ({
    title: document.querySelector('.plp-hero-asset .cell-title').textContent,
    description: document.querySelector('.plp-hero-asset .js-text-truncate__text-holder')
      .textContent,
    items: [...document.querySelectorAll('.product-card')].map(
      el => `https://uk.burberry.com${el.dataset.url}`,
    ),
  }))
  .end()
  .then(({ title, description, items }) => {
    const productsPages = items.map(link => JSDOM.fromURL(link));

    Promise.all(productsPages)
      .then((pages) => {
        const items2 = pages.map(({ window, window: { document } }) => {
          try {
            const gbpPrice =
              Number(document.querySelector('[property="og:price:amount"]').content) * 100;

            return {
              title: stripText(document.querySelector('.product-title').textContent),
              id: document.querySelector('#product-id').value,
              slug: document
                .querySelector('[property="og:url"]')
                .content.replace('https://uk.burberry.com/', ''),
              multiCurrencyPrices: {
                GBP: String(Math.round(gbpPrice)),
                USD: String(Math.round(gbpPrice * 1.28)),
                RUB: String(Math.round(gbpPrice * 76)),
                EUR: String(Math.round(gbpPrice * 1.09)),
              },
              colours: [...document.querySelectorAll('.picker-type-colour')].map(el => ({
                heroSrc: el.dataset.heroSrc
                  .replace('&wid=__WID__&hei=__HEI__', '')
                  .replace(/\$.+\$/g, '')
                  .replace('?', ''),
                value: el.dataset.textValue,
                src: window
                  .getComputedStyle([...el.getElementsByClassName('picker-colour')][0])
                  .getPropertyValue('background-image')
                  .replace('&wid=60)', '')
                  .replace('url(', '')
                  .replace(/\$.+\$/g, '')
                  .replace('?', ''),
              })),
              sizes: [...document.querySelectorAll('.picker-input-size-sku')].map(el => ({
                title: el.dataset.textValue,
                id: el.dataset.id,
              })),
              description: stripText(
                document.querySelector('.cell-paragraph_description').innerHTML,
              ),
              details: stripText(document.querySelector('.cell-paragraph_details').innerHTML),
              images: [...document.querySelectorAll('.gallery-asset-item-container')].map(el =>
                el.dataset.src
                  .replace('&wid=__WID__&hei=__HEI__', '')
                  .replace(/\$.+\$/g, '')
                  .replace('?', ''),
              ),
              linkedProductIds: [
                ...document.querySelectorAll('.recommended-cell-template .product-card'),
              ].map(el => el.dataset.productId),
            };

            counter[0]++;
          } catch (e) {
            errors.push(`${window.location.href} ${e}`);
            counter[1]++;
          }
        });

        const result = {
          title,
          description,
          items: items2,
        };
        console.log(JSON.stringify(result, null, 2));
        // console.log(JSON.stringify(errors, null, 2));

        // fs.writeFile(OUTPUT_FILE, JSON.stringify(json, null, 2), () =>
        //   console.log(`done: success(${counter[0]}), errors(${counter[1]})`)
        // );
      })
      .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
