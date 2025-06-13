import { getCurrentUser, getToken, checkUser, isAdmin } from "../components/authorisation";
import { getCartItemsNum, putInCart } from "../components/cart";
import { getWishlistItemsNum, putInWishlist } from "../components/wish";
import swal from "sweetalert";

export const dbTypeToInputType = {
  'uuid': 'text',
  'text': 'text',
  'varchar': 'text',
  'character varying': 'text',
  'int4': 'number',
  'int8': 'number',
  'numeric': 'number',
  'boolean': 'checkbox',
  'date': 'date',
  'timestamp with time zone': 'datetime-local'
};

export async function getTable (tableName) {
  const response = await fetch(`http://localhost:3000/api/${tableName}`);
  if (!response.ok) throw new Error('Помилка при отриманні таблиці');
  const data = await response.json();
  if (data.length === 0) {
    console.log('Даних немає');
    return null;
  }
  console.log('Отримані дані:', data);
  return data;
};

export async function getRowById (tableName, id) {
  const response = await fetch(`http://localhost:3000/api/${tableName}/row-by-id`, {
    method: 'POST',
    body: JSON.stringify({
      id
    }),
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (!response.ok) throw new Error('Помилка при отриманні рядка таблиці');
  const data = await response.json();
  return data;
};

export async function updateFieldById (tableName, id, newValue) {
  const token = await getToken();

  if(!token) return { error: 'Ви не увійшли'};

  const response = await fetch(`http://localhost:3000/api/${tableName}/update-field-by-id`, {
    method: 'POST',
    body: JSON.stringify({
      id,
      newValue
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Помилка при оновленні поля таблиці');
  const data = await response.json();
  return data;
};

export async function deleteRowByField (tableName, field=null, id) {
  const token = await getToken();

  if(!token) return { error: 'Ви не увійшли'};

  const response = await fetch(`http://localhost:3000/api/${tableName}/delete-row-by-id`, {
    method: 'POST',
    body: JSON.stringify({
      field,
      id
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Помилка при видаленні рядка таблиці');
  const data = await response.json();
  return data;
};

export async function checkIfItemExists (tableName, itemId) {
  const token = await getToken();

  const response = await fetch(`http://localhost:3000/api/${tableName}/check-if-item-exists`, {
    method: 'POST',
    body: JSON.stringify({
      itemId
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const dataArray = await response.json();
  if (dataArray.length === 0) return false;
  return true;
}

export async function updateNavHeader() {
  const nav = document.querySelector('.nav-links');
  

  let html = '';
  if (await getCurrentUser()) {
    html = `
      <a class="nav-link" href="/profile" onclick="event.preventDefault(); navigate('/profile');">Мій акаунт</a>
      <a class="nav-link icon" href="/wishlist" onclick="event.preventDefault(); navigate('/wishlist');">
        <image class="wishlist-icon" src="https://odevawsbdylbsjcowgpg.supabase.co/storage/v1/object/sign/icons/wishlist-unactive.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNmI3Y2E5OS01MTFjLTRkZDgtOGQ2Zi1iYzU0ZDcyMjg4YTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy93aXNobGlzdC11bmFjdGl2ZS5wbmciLCJpYXQiOjE3NDg5NDI2ODQsImV4cCI6MTc4MDQ3ODY4NH0.qEjG61NKbb0plEmtvZRV0zEVUcs64FnPMExO_RJVhTg">
        <div class="wishlist-items-num">${await getWishlistItemsNum()}</div>
      </a>
      <a class="nav-link icon" href="/cart" onclick="event.preventDefault(); navigate('/cart');">
        <image class="cart-icon" src="https://odevawsbdylbsjcowgpg.supabase.co/storage/v1/object/sign/icons/cart_icon.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2M2YjdjYTk5LTUxMWMtNGRkOC04ZDZmLWJjNTRkNzIyODhhMSJ9.eyJ1cmwiOiJpY29ucy9jYXJ0X2ljb24ucG5nIiwiaWF0IjoxNzQ4NzE1NzIwLCJleHAiOjE3ODAyNTE3MjB9.ERvLglTI4p20dUsNYM4j9XLX54nCOuvz0vpAZd3KnkA">
        <div class="cart-items-num">${await getCartItemsNum()}</div>
      </a>
      ${await isAdmin() ? `<a class="nav-link" href="/admin-panel" onclick="event.preventDefault(); navigate('/admin-panel');">Адмін-панель</a>` : ''}
    `;
  }

  nav.innerHTML = `
    <a class="nav-link" href="/" onclick="
      event.preventDefault();
      navigate('/');
    ">Головна</a>
    ${html ? html :
    `<a class="nav-link" href="/login" onclick="event.preventDefault(); navigate('/login');">Увійти</a>`}
  `;

  const links = document.querySelectorAll('.nav-link');
  links.forEach((link) => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    })
  })
}

export function getBookRating(dataRecensions, bookId) {
  let rates = 0;
  let ratesAmount = 0;
  dataRecensions.forEach((recension) => {
    if (!recension.is_confirmed) return;
    if (recension.book_id === bookId) {
      rates += recension.rating;
      ratesAmount++;
    }
  });
  return rates/ratesAmount || 0;
};

export function getAuthorRating (dataRecensions, bookIds) {
  let rates = 0;
  let ratesAmount = 0;
  bookIds.forEach((bookId) => {
    const bookRating = getBookRating(dataRecensions, bookId);

    rates += bookRating;
    ratesAmount++;
  });
  return rates/ratesAmount || 0;
}

export function renderStars (rating) {
  let i = 1;
  let stars = '';
  while (i <= 5) {
    if (i <= rating) {
    stars += `<i class="fa-solid fa-star active"></i>`;
    } else {
      stars += `<i class="fa-solid fa-star"></i>`;
    }
    i++;
  }
  return stars;
}

export async function renderBooksDropdown () {
  const dataGenres = await getTable('genres');
  
  return dataGenres.map(genre => `
    <a class="dropdown-genre" href="/books?genre=${genre.genre_id}" onclick="event.preventDefault(); navigate('/books?genre=${genre.genre_id}&n=${genre.name}');">
      ${genre.name}
    </a>
  `).join('');
};

export function getGenreFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {genreId: Number(params.get("genre")), genreName: params.get('n')};
}

export function getBookFromURL() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("book"));
}

export function getOriginFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("origin");
}

export function formatDate (date) {
  return date.split('-').reverse().join('.');
}

export function formatDateTime (str) {
  const date = str.slice(0, 10).split('-').reverse().join('.');
  const time = str.slice(11, 19);
  return `${date} ${time}`;
}

export function getAuthorFromURL() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("author"));
}

export function getBooksListFromURL () {
  const params = new URLSearchParams(window.location.search);
  return params.get("booksList");
}

export async function getUserId () {
  const token = await getToken();

  if(!token) return { error: 'Ви не увійшли'};

  const response = await fetch(`http://localhost:3000/api/user-id`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) return;
  const userId = await response.json();
  return userId;
}

export async function getRowsByField (tableName, field, id) {
  const token = await getToken();

  const response = await fetch(`http://localhost:3000/api/${tableName}/rows-by-field`, {
    method: 'POST',
    body: JSON.stringify({
      field,
      id
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return { error: 'Не вдалось знайти користувача' + response.error};
  }
  const data = await response.json();
  return data;
}

export async function loadCartAndWishlistButtons (bookId) {
  let putInCartHTML = `<button class="put-in-cart-btn book-${bookId}">У кошик</button>`;
  let putInWishlistHTML = `
  <div class="wishlist-button-container">
    <img class="add-to-wishlist book-${bookId} active" src="https://odevawsbdylbsjcowgpg.supabase.co/storage/v1/object/sign/icons/wishlist-unactive.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNmI3Y2E5OS01MTFjLTRkZDgtOGQ2Zi1iYzU0ZDcyMjg4YTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy93aXNobGlzdC11bmFjdGl2ZS5wbmciLCJpYXQiOjE3NDg5NDI2ODQsImV4cCI6MTc4MDQ3ODY4NH0.qEjG61NKbb0plEmtvZRV0zEVUcs64FnPMExO_RJVhTg">
    <img class="del-from-wishlist book-${bookId}" src="https://odevawsbdylbsjcowgpg.supabase.co/storage/v1/object/sign/icons/wishlist-active.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNmI3Y2E5OS01MTFjLTRkZDgtOGQ2Zi1iYzU0ZDcyMjg4YTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy93aXNobGlzdC1hY3RpdmUuanBnIiwiaWF0IjoxNzQ4OTQyOTAyLCJleHAiOjE3ODA0Nzg5MDJ9.iY5DxDdJyQ1pkHJ7a1sHQlJ4lZ0aAX2fUlaCiAG1_Jk">
  </div>`;
  if (!await checkUser()) {
    putInCartHTML = `<p>Увійдіть, щоб придбати товар</p>`;
    putInWishlistHTML = '';
  } else {
    const resCart = await checkIfItemExists('cart',bookId);
    if (resCart) putInCartHTML = `<p>Вже в кошику</p>`;

    const resWishlist = await checkIfItemExists('wishlist', bookId);
    if (resWishlist) putInWishlistHTML =`
    <div class="wishlist-button-container">
      <img class="add-to-wishlist book-${bookId}" src="https://odevawsbdylbsjcowgpg.supabase.co/storage/v1/object/sign/icons/wishlist-unactive.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNmI3Y2E5OS01MTFjLTRkZDgtOGQ2Zi1iYzU0ZDcyMjg4YTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy93aXNobGlzdC11bmFjdGl2ZS5wbmciLCJpYXQiOjE3NDg5NDI2ODQsImV4cCI6MTc4MDQ3ODY4NH0.qEjG61NKbb0plEmtvZRV0zEVUcs64FnPMExO_RJVhTg">
      <img class="del-from-wishlist book-${bookId} active" src="https://odevawsbdylbsjcowgpg.supabase.co/storage/v1/object/sign/icons/wishlist-active.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNmI3Y2E5OS01MTFjLTRkZDgtOGQ2Zi1iYzU0ZDcyMjg4YTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy93aXNobGlzdC1hY3RpdmUuanBnIiwiaWF0IjoxNzQ4OTQyOTAyLCJleHAiOjE3ODA0Nzg5MDJ9.iY5DxDdJyQ1pkHJ7a1sHQlJ4lZ0aAX2fUlaCiAG1_Jk">
    </div>
    `;
  }
  document.querySelector(`.main-info.book-${bookId}`)?.insertAdjacentHTML('beforeend', putInCartHTML);

  document.querySelector(`.put-in-cart-btn.book-${bookId}`)?.addEventListener('click', async () => {
    const response = await putInCart(bookId, 1);
    response.success ? swal({
      title: "Книгу успішно додано в кошик!",
      icon: 'success',
      buttons: ['Ок', 'Переглянути кошик'],
      defeat: true
    }).then(async (showCart) => {
      if (showCart) {
        await updateNavHeader();
        navigate('/cart');
      } else {
        await updateNavHeader();
        swal.stopLoading();
        swal.close();
      }
    }) : swal("Помилка!", response.error, 'error');
  });

  document.querySelector(`.book-info-container.book-${bookId}`).insertAdjacentHTML('beforeend', putInWishlistHTML);

  const putInWishlistButton = document.querySelector(`.add-to-wishlist.book-${bookId}`);
  const delFromWishlistButton = document.querySelector(`.del-from-wishlist.book-${bookId}`);
  putInWishlistButton?.addEventListener('click', async () => {
    await putInWishlist(bookId);
    putInWishlistButton.classList.remove('active');
    delFromWishlistButton.classList.add('active');
    await updateNavHeader();
  });

  delFromWishlistButton?.addEventListener('click', async () => {
    await deleteRowByField('wishlist', 'book_id', bookId);
    delFromWishlistButton.classList.remove('active');
    putInWishlistButton.classList.add('active');
    await updateNavHeader();
  });
}

export async function loadDiscountsIcon (bookId, discountPercent, newPrice) {

  let discountHTML = `<div class="discount-icon book-${bookId}">-${discountPercent}%</div>`;

  document.querySelector(`.book-price.book-${bookId}`).classList.add('crossed');

  document.querySelector(`.book-price-container.book-${bookId}`).insertAdjacentHTML('afterbegin', discountHTML);

  document.querySelector(`.book-price-container.book-${bookId}`).insertAdjacentHTML('beforeend',` <div class="new-book-price">${newPrice} грн</div>`);
}