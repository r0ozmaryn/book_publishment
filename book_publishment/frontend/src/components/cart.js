import { updateFieldById, deleteRowByField, updateNavHeader, getRowsByField, getUserId, getTable, loadDiscountsIcon } from "../utils/utils";
import { getToken } from "./authorisation";
import { loadBookById } from "./booksList";
import { renderCartPage } from "../pages/CartPage";

export async function putInCart (bookId, quantity) {
  const token = await getToken();
  
  if(!token) return { error: 'Ви не увійшли'};

  const response = await fetch('http://localhost:3000/api/put-in-cart', {
    method: 'POST',
    body: JSON.stringify({
      book_id: bookId,
      quantity
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return { error: 'Не вдалось додати книгу до кошика ' + response.message};
  }
  return { success: 'Книгу додано в кошик' }
}

export async function loadCartById (userId) {
  const container = document.querySelector('.cart');
  const totalContainer = document.querySelector('.total-container');
  container.innerHTML = '';
  totalContainer.innerHTML = '';

  if (!userId) return "Не вдалось знайти користувача";

  const dataDiscounts = await getTable('discounts');

  const {data: cart} = await getRowsByField('cart', 'user_id', userId);
  if (cart.length === 0) container.insertAdjacentHTML('beforeend', '<h2 class="secondary-title">Пусто. Додайте книгу в кошик, щоб вона тут з\'явилась</h2>');

  let total = 0;
  cart.forEach( async (item) => {
    total += item.total_price;
    const html = `
      <div class="book-container-horizontal">
        ${await loadBookById(item.book_id)}
        <div class="buying-info">
          <label class="quantity-label">Кількість: </label>
          <input type="number" class="quantity-input item-${item.cart_item_id}" value=${item.quantity} min=1>
          <button class="delete-from-cart item-${item.cart_item_id}">Видалити</button>
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
    
    const input = document.querySelector(`.quantity-input.item-${item.cart_item_id}`);
    input.addEventListener('input', async () => {
      const quantity = input.value;
      await updateFieldById('cart', item.cart_item_id, quantity);
      await updateNavHeader();
      await renderCartPage();
    });

    const button = document.querySelector(`.delete-from-cart.item-${item.cart_item_id}`);
    button.addEventListener('click', async () => {
      await deleteRowByField('cart', item.cart_item_id);
      await updateNavHeader();
      await renderCartPage();
    });

  });
  totalContainer.insertAdjacentHTML('beforeend', `<p class="total-price">Всього: ${total} грн</p>`);
}

export async function getCartItemsNum () {
  const userId = await getUserId();

  let totalQuantity = 0;
  const {data: cart} = await getRowsByField('cart', 'user_id', userId);
  cart.forEach((item) => {
    totalQuantity += item.quantity;
  });

  return totalQuantity;
}