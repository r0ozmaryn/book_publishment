import {
  getRowsByField,
  deleteRowByField,
  updateNavHeader,
  getUserId,
  getTable,
  loadDiscountsIcon,
} from '../utils/utils';
import { getToken } from './authorisation';
import { putInCart } from './cart';
import { loadBookById } from './booksList';
import { renderWishlistPage } from '../pages/WhishlistPage';
import swal from 'sweetalert';

export async function loadWishlistById(userId) {
  const container = document.querySelector('.wishlist');
  container.innerHTML = '';

  const dataDiscounts = await getTable('discounts');

  const {data: wishlist} = await getRowsByField('wishlist', 'user_id', userId);
  if (wishlist.length === 0)
    container.insertAdjacentHTML(
      'beforeend',
      "<h2 class='secondary-title'>Пусто. Додайте книгу в бажане, щоб вона тут з'явилась</h2>"
    );

  wishlist.forEach(async (item) => {
    const html = `
      <div class="book-container-horizontal">
        ${await loadBookById(item.book_id)}
        <div class="buying-info">
          <button class="put-in-cart-btn book-${item.book_id}">У кошик</button>
          <button class="delete-from-wishlist item-${
            item.wish_id
          }">Видалити з бажаного</button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    const discount = dataDiscounts.find(discount => discount.book_id === item.book_id && discount.is_valid);
    
    if (discount) {
      const discountPercent = discount.discount_percent;
      const newPrice = discount.total_price;
      await loadDiscountsIcon(item.book_id, discountPercent, newPrice);
    }

    const deleteButton = document.querySelector(
      `.delete-from-wishlist.item-${item.wish_id}`
    );
    deleteButton.addEventListener('click', async () => {
      await deleteRowByField('wishlist', 'wish_id', item.wish_id);
      await updateNavHeader();
      await renderWishlistPage();
    });

    const putInCartButton = document.querySelector(
      `.put-in-cart-btn.book-${item.book_id}`
    );
    putInCartButton.addEventListener('click', async () => {
      const response = await putInCart(item.book_id, 1);
      response.success
        ? swal({
            title: 'Книгу успішно додано в кошик!',
            icon: 'success',
            buttons: ['Ок', 'Переглянути кошик'],
            defeat: true,
          }).then(async (showCart) => {
            if (showCart) {
              await updateNavHeader();
              navigate('/cart');
            } else {
              await updateNavHeader();
              swal.stopLoading();
              swal.close();
            }
          })
        : swal('Помилка!', response.error, 'error');
    });
  });
}

export async function getWishlistItemsNum() {
  const userId = await getUserId();
  const { data: wishlist } = await getRowsByField(
    'wishlist',
    'user_id',
    userId
  );

  return wishlist.length;
}

export async function putInWishlist(bookId) {
  const token = await getToken();

  if (!token) return { error: 'Ви не увійшли' };

  const response = await fetch('http://localhost:3000/api/put-in-wishlist', {
    method: 'POST',
    body: JSON.stringify({
      book_id: bookId,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return { error: 'Не вдалось додати книгу до бажаного ' + response.message };
  }
  return { success: 'Книгу додано до бажаного' };
}