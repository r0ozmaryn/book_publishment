import { config } from 'dotenv';
import express from 'express';
import cron from 'node-cron';
import supabase from './supabase/supabaseClient.js';
import cors from 'cors';

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

///////////////////// Крони /////////////////// 

cron.schedule('0 0 * * *', async () => {
  console.log('Запуск щоденної задачі...');
  const { error } = await supabase.rpc('update_is_new_books');
  if (error) {
    console.error('Помилка у Cron:', error);
  } else {
    console.log('Cron: is_new успішно оновлено');
  }
});

cron.schedule('0 0 * * *', async () => {
  console.log('Запуск щоденної задачі...');
  const { error } = await supabase.rpc('update_discounts');
  if (error) {
    console.error('Помилка у Cron:', error);
  } else {
    console.log('Cron: is_valid успішно оновлено');
  }
});

// cron.schedule('0 19 * * *', async () => {
//   console.log('Оновлення знижок о 19:00...');
//   const { error } = await supabase.rpc('adjust_all_discounts', { percent_delta: 5 });
//   if (error) {
//     console.error('Помилка у Cron:', error);
//   } else {
//     console.log('Cron: is_valid успішно оновлено');
//   }
// });

/////////////// Взяти всі таблиці //////////////////
app.get('/api/tables', async (req, res) => {
  const { data, error } = await supabase.rpc('get_all_tables');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
})

////////////////// Взяти дані з таблиць /////////
app.get('/api/books', async (req, res) => {
  const { data, error } = await supabase.from('books').select('*').order('book_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/authors', async (req, res) => {
  const {data, error} = await supabase.from('authors').select('*').order('author_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/books_authors', async (req, res) => {
  const {data, error} = await supabase.from('books_authors').select('*').order('book_and_author_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/recensions', async (req, res) => {
  const {data, error} = await supabase.from('recensions').select('*').order('recension_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/genres', async (req, res) => {
  const {data, error} = await supabase.from('genres').select('*').order('genre_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/profiles', async (req, res) => {
  const {data, error} = await supabase.from('profiles').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/cart', async (req, res) => {
  const {data, error} = await supabase.from('cart').select('*').order('cart_item_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/wishlist', async (req, res) => {
  const {data, error} = await supabase.from('wishlist').select('*').order('wish_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/discounts', async (req, res) => {
  const {data, error} = await supabase.from('discounts').select('*').order('discount_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/////////// Взяти конкретне поле з таблиці ////////////
app.post('/api/books/row-by-id', async (req, res) => {
  const { id } = req.body;
  const {data, error} = await supabase
    .from('books')
    .select('*')
    .eq('book_id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/authors/row-by-id', async (req, res) => {
  const { id } = req.body;
  const {data, error} = await supabase
    .from('authors')
    .select('*')
    .eq('author_id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/books_authors/row-by-id', async (req, res) => {
  const { id } = req.body;
  const {data, error} = await supabase
    .from('books_authors')
    .select('*')
    .eq('book_id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/recensions/row-by-id', async (req, res) => {
  const { id } = req.body;
  const {data, error} = await supabase
    .from('recensions')
    .select('*')
    .eq('book_id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/cart/row-by-id', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  const { id } = req.body;
  const {data, error} = await supabase
    .from('cart')
    .select('*')
    .eq('book_id', id);

  if (error) res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

///////////// Перевірити, чи поле існує ////////////
app.post('/api/cart/check-if-item-exists', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  const { itemId } = req.body;
  const {data, error} = await supabase
    .from('cart')
    .select('*')
    .eq('book_id', itemId)
    .eq('user_id', user.id);

  if (error) res.status(500).json({ error: error.message });
  res.status(200).json(data);
})

app.post('/api/wishlist/check-if-item-exists', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  const { itemId } = req.body;
  const {data, error} = await supabase
    .from('wishlist')
    .select('*')
    .eq('book_id', itemId)
    .eq('user_id', user.id);

  if (error) res.status(500).json({ error: error.message });
  res.status(200).json(data);
})

////////////////// Взяти кілька полів з таблиці ///////

app.post('/api/cart/rows-by-field', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }
  
  const { field, id } = req.body;
  const {data, error} = await supabase
    .from('cart')
    .select('*')
    .eq(field, id)
    .eq('user_id', user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({data});
});

app.post('/api/wishlist/rows-by-field', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }
  
  const { field, id } = req.body;
  const {data, error} = await supabase
    .from('wishlist')
    .select('*')
    .eq(field, id)
    .eq('user_id', user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({data});
})

app.post('/api/recensions/rows-by-field', async (req, res) => {
  const { field, id } = req.body;
  const {data, error} = await supabase
    .from('recensions')
    .select('*')
    .eq(field, id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({data});
})

////////////////// Вставити рядок в таблицю //////////
app.post('/api/put-in-cart', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  const {book_id, quantity} = req.body;

  const {error} = await supabase
  .from('cart')
  .insert({
    user_id: user.id,
    book_id,
    quantity
  });

  if (error) return res.status(401).json({ message : 'Помилка при додаванні в кошик :' + error.message})
  
  res.status(200).json({message : 'Книгу додано до кошика'});
})

app.post('/api/put-in-wishlist', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  const {book_id} = req.body;

  const {error} = await supabase
  .from('wishlist')
  .insert({
    user_id: user.id,
    book_id
  });

  if (error) return res.status(401).json({ message : 'Помилка при додаванні до бажаного :' + error.message})
  
  res.status(200).json({message : 'Книгу додано до кошика'});
})

app.post('/api/add-recension', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  const {bookId, rating, comment} = req.body;

  const {error} = await supabase
  .from('recensions')
  .insert({
    user_id: user.id,
    book_id: bookId,
    rating,
    comment,
  });

  if (error) return res.status(401).json({ message : 'Помилка при додаванні до бажаного :' + error.message})
  
  res.status(200).json({message : 'Книгу додано до кошика'});
})

//////////////////// Змінити поле в таблиці //////////

app.post('/api/cart/update-field-by-id', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  const { id, newValue} = req.body;

  const {error} = await supabase
  .from('cart')
  .update({
    quantity: newValue
  })
  .eq('cart_item_id', id)
  .single();

  if (error) res.status(401).json({ message : 'Помилка при оновленні даних:' + error.message})
  
  res.status(200).json({message : 'Дані оновлено'});
})

////////////////////// Видалити поле з таблиці ///////

app.post('/api/cart/delete-row-by-id', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  const { id } = req.body;
  const {error} = await supabase
    .from('cart')
    .delete()
    .eq('user_id', user.id)
    .eq('cart_item_id', id);

  if (error) res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Книгу видалено з кошика' });
});

app.post('/api/wishlist/delete-row-by-id', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  const { field, id } = req.body;
  const {error} = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', user.id)
    .eq(field, id);

  if (error) res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Книгу видалено з кошика' });
});

/////////////////////// Профіль //////////////////
app.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // тепер ти знаєш, хто це
  res.json({ email: user.email, profile });
});

app.post('/profile-data', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }
  
  const { first_name, last_name, phone } = req.body;

  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('first_name, last_name, phone')
    .eq('user_id', user.id)
    .single();

  if (fetchError || !existingProfile) {
    return res.status(500).json({ error: "Не вдалося отримати профіль" });
  }

  if (
    existingProfile.first_name === first_name &&
    existingProfile.last_name === last_name &&
    existingProfile.phone === phone
  ) {
    return res.status(200).json({ message: "Дані не змінилися — оновлення не потрібне." });
  }
  
  const { error: dataError } = await supabase
    .from('profiles')
    .update({
      first_name,
      last_name,
      phone
    })
    .eq('user_id', user.id);

  if (dataError) {
    return res.status(401).json({ error: "Помилка при оновленні даних" });
  }

  res.status(200).json({ message: "Профіль оновлено." });
});

/////////////////// Допоміжні //////////////////////
app.get('/api/user-id', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "Немає токена" });

  const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

  if (tokenError || !user) {
    return res.status(401).json({ error: "backend: Недійсний токен" });
  }

  res.status(200).json(user.id);
})


app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});