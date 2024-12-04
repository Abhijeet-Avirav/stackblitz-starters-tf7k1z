const express = require('express');
const { resolve } = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let db;

(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
})();

async function fetchAllResturant() {
  const query = 'SELECT * FROM restaurants';
  const response = await db.all(query, []);
  return response;
}

app.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await fetchAllResturant();

    if (restaurants.length === 0)
      return res.status(404).json({ message: 'No Resturant found' });

    return res.status(200).json({
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({ message: error, message });
  }
});

async function fetchResturantById(id) {
  const query = 'SELECT * FROM restaurants WHERE id = ?';
  const response = await db.get(query, [id]);
  return response;
}

app.get('/restaurants/details/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ message: 'Please provide valid resturant id' });
    }

    const restaurant = await fetchResturantById(id);
    if (!restaurant) {
      return res
        .status(404)
        .json({ message: `No restaurant exist with id ${id}` });
    }
    return res.status(200).json({
      restaurant,
    });
  } catch (error) {
    return res.status(500).json({ message: error, message });
  }
});

async function fetchResturantByCuisine(cuisine) {
  const query = 'SELECT * FROM restaurants WHERE cuisine = ?';
  const response = await db.all(query, [cuisine]);
  return response;
}

app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  try {
    const cuisine = req.params.cuisine;
    if (!cuisine) {
      return res.status(400).json({ message: 'Please provide cuisine' });
    }

    const restaurants = await fetchResturantByCuisine(cuisine);

    if (restaurants.length === 0) {
      return res
        .status(404)
        .json({ message: 'No restaurants found with cuisine' + cuisine });
    }

    return res.status(200).json({
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

async function fetchResturantsByFilters(isVeg, hasOutdoorSeating, isLuxury) {
  const filters = [];
  let query = '';
  if (!query && isVeg) {
    query += 'SELECT * FROM restaurants WHERE isVeg = ?';
    filters.push(isVeg);
    if (hasOutdoorSeating) {
      query += 'AND hasOutdoorSeating = ?';
      filters.push(hasOutdoorSeating);
      if (isLuxury) {
        query += 'AND isLuxury = ?';
        filters.push(isLuxury);
      }
    }
    if (isLuxury) {
      query += 'AND isLuxury = ?';
      filters.push(isLuxury);
    }
  }

  if (!query && hasOutdoorSeating) {
    query += 'SELECT * FROM restaurants WHERE hasOutdoorSeating = ?';
    filters.push(hasOutdoorSeating);
    if (isLuxury) {
      query += 'AND isLuxury = ?';
      filters.push(isLuxury);
    }
  }

  if (!query && isLuxury) {
    query += 'SELECT * FROM restaurants WHERE isLuxury = ?';
    filters.push(isLuxury);
  }
  console.log('filters===>', filters);
  console.log(query);

  const response = await db.all(query, filters);
  return response;
}
app.get('/restaurants/filter', async (req, res) => {
  try {
    const isVeg = req.query.isVeg;
    const hasOutdoorSeating = req.query.hasOutdoorSeating;
    const isLuxury = req.query.isLuxury;

    const restaurants = await fetchResturantsByFilters(
      isVeg,
      hasOutdoorSeating,
      isLuxury
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found' });
    }

    return res.status(200).json({
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

async function fetchResturantByRatingDesc() {
  const query = 'SELECT * FROM restaurants ORDER BY rating DESC';
  const result = await db.all(query, []);
  return result;
}

app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    const restaurants = await fetchResturantByRatingDesc();

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found' });
    }

    return res.status(200).json({
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

async function getAllDishes() {
  const query = 'SELECT * FROM dishes';
  return await db.all(query, []);
}

app.get('/dishes', async (req, res) => {
  try {
    const dishes = await getAllDishes();
    if (dishes.length === 0) {
      return res.status(404).json({ message: 'No dishes found' });
    }
    return res.status(200).json({
      dishes,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

async function getDisheById(id) {
  const query = 'SELECT * FROM dishes WHERE id = ?';
  return await db.get(query, [id]);
}

app.get('/dishes/details/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Please provide valid dish id' });
    }

    const dish = await getDisheById(id);

    if (!dish) {
      return res.status(404).json({ message: 'No dish found with id ' + id });
    }

    return res.status(200).json({
      dish,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

async function getDishesByFilter(isVeg) {
  let query = 'SELECT * FROM dishes';
  let filter = [];
  if (isVeg) {
    (query += ' WHERE isVeg = ?'), filter.push(isVeg);
  }

  return await db.all(query, filter);
}

app.get('/dishes/filter', async (req, res) => {
  try {
    const isVeg = req.query.isVeg;

    const dish = await getDishesByFilter(isVeg);

    if (!dish) {
      return res.status(404).json({ message: 'No dish found with id ' + id });
    }

    return res.status(200).json({
      dish,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

async function getDishesSortByAsc() {
  const query = 'SELECT * FROM dishes ORDER BY price ASC';
  return await db.all(query, []);
}

app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    const dishes = await getDishesSortByAsc();
    if (dishes.length === 0) {
      return res.status(404).json({ message: 'No dishes found' });
    }
    return res.status(404).json({
      dishes,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
