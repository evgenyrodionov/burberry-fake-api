/* eslint-disable global-require */
const express = require('express'); // eslint-disable-line import/newline-after-import
const cors = require('cors');

const collections = {
  men: {
    suits: require('./data/men-suits.json'),
    // blazers: require('./data/men-blazers.json'),
    // shirts: require('./data/men-shirts.json'),
    // 'dress-shirts': require('./data/men-dress-shirts.json'),
    // knitwear: require('./data/men-knitwear.json'),
    // sweatshirts: require('./data/men-sweatshirts.json'),
    // polos: require('./data/men-polos.json'),
    // trousers: require('./data/men-trousers.json'),
    // jeans: require('./data/men-jeans.json'),
    // swimwear: require('./data/men-swimwear.json'),
    // underwear: require('./data/men-underwear.json'),
  },
  // women: {
  //   clothing: require('./data/women-clothing.json'),
  //   bags: require('./data/women-bags.json'),
  //   scarves: require('./data/women-scarves.json'),
  //   accessories: require('./data/women-accessories.json'),
  //   shoes: require('./data/women-shoes.json'),
  //   fragrance: require('./data/women-fragrance.json'),
  //   gifts: require('./data/women-gifts.json'),
  // },
};

const app = express();
const router = express.Router();

router.get('/products/:group/:type', (req, res) => {
  const { group, type } = req.params;
  const { limit = 32, offset = 0 } = req.query;

  if (collections[group] && collections[group][type]) {
    const { items, title, description } = collections[group][type];

    res.send({
      title,
      description,
      items: [...items].splice(offset, limit),
      total: items.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } else {
    res.sendStatus(404);
  }
});

router.get('/products/:group/:type/:slugOrId', (req, res) => {
  const { group, type, slugOrId } = req.params;

  if (collections[group] && collections[group][type]) {
    const product = collections[group][type].items.find(
      p => p.slug === slugOrId || p.id === slugOrId,
    );

    if (product) res.send(product);
    else res.sendStatus(404);
  } else {
    res.sendStatus(404);
  }
});

app.use(cors());
app.use('/v1', router);
app.get('/', (req, res) => {
  res.send({
    docs: 'https://github.com/evgenyrodionov/burberry-fake-api',
    version: `1.0.0-${process.env.BUILD_DATE || 'local'}`,
    routes: ['/v1/products/men/suits', '/v1/products/men/suits/:slugOrId'],
  });
});

app.listen(3000, () => {
  console.log('burberry-fake-api listening on port 3000!'); // eslint-disable-line no-console
});
