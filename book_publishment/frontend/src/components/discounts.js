import { getTable, loadCartAndWishlistButtons, loadDiscountsIcon } from "../utils/utils";
import { loadBookById } from "./booksList";

export async function loadDiscounts() {
  const container = document.querySelector('.discounts');

  const dataDiscounts = await getTable('discounts');

  const discountBookIds = dataDiscounts.filter(discount => discount.is_valid).map(discount => discount.book_id);

  discountBookIds.forEach(async (bookId) => {
    const html = `
      <div class="book-container">
        ${await loadBookById(bookId)}
      </div>
    `;
    
    const discount = dataDiscounts.find(discount => discount.book_id === bookId);
    const discountPercent = discount.discount_percent;
    const newPrice = discount.total_price;

    container.insertAdjacentHTML('beforeend', html);

    await loadCartAndWishlistButtons(bookId);
    await loadDiscountsIcon(bookId, discountPercent, newPrice);
  });
  

}