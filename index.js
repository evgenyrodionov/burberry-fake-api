/* eslint-disable global-require */
const express = require('express'); // eslint-disable-line import/newline-after-import
const cors = require('cors');
const collections = {
  men: {
    clothing: require('./data/men-clothing.json'),
    scarves: require('./data/men-scarves.json'),
    accessories: require('./data/men-accessories.json'),
    shoes: require('./data/men-shoes.json'),
    fragrance: require('./data/men-fragrance.json'),
    gifts: require('./data/men-gifts.json'),
  },
  women: {
    clothing: require('./data/women-clothing.json'),
    bags: require('./data/women-bags.json'),
    scarves: require('./data/women-scarves.json'),
    accessories: require('./data/women-accessories.json'),
    shoes: require('./data/women-shoes.json'),
    fragrance: require('./data/women-fragrance.json'),
    gifts: require('./data/women-gifts.json'),
  },
};

const app = express();
const router = express.Router();

router.get('/products/:group/:type', (req, res) => {
  const { group, type } = req.params;
  const { limit = 32, offset = 0 } = req.query;

  if (collections[group] && collections[group][type]) {
    const items = collections[group][type];

    res.send({
      items: [...items].splice(offset, limit),
      total: items.length,
    });
  } else {
    res.sendStatus(404);
  }
});

router.get('/products/:group/:type/:id', (req, res) => {
  const { group, type, id } = req.params;

  if (collections[group] && collections[group][type]) {
    const product = collections[group][type].find(p => p.id === id);

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
  });
});

app.listen(3000, () => {
  console.log('adidas-api listening on port 3000!'); // eslint-disable-line no-console
});
