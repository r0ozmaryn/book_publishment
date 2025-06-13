import { getBookFromURL, getRowById, getBookRating, renderStars, loadCartAndWishlistButtons, getTable, loadDiscountsIcon } from "../utils/utils";

export async function loadBook () {
  const bookId = getBookFromURL();
  
  if (!bookId) {
    console.error('Error getting book');
    return;
  };

  const book = await getRowById('books', bookId);
  const genres = await getTable('genres');
  const bookGenre = genres.find(genre => genre.genre_id === book.genre_id).name;
  const dataBooksAuthors = await getRowById('books_authors', bookId);
  const bookRecensions = await getRowById('recensions', bookId);
  const bookAuthor = await getRowById('authors', dataBooksAuthors.author_id);
  const dataDiscounts = await getTable('discounts');

  const rating = getBookRating(bookRecensions, bookId);

  const html = `
  <h1>${book.title}</h1>
    <div class="book-container">
      <div class="book-cover-container">
        <image src="${book.cover_image_url}" class="book-cover">
      </div>
      <div class="book-info-container book-${bookId}">
        <div class="main-info book-${bookId}">
          <div class="book-title">${book.title}</div>
          <a href='/author?author=${bookAuthor.author_id}' class="book-author" onclick="
          e.preventDefault();
          navigate('/author?author=${bookAuthor.author_id}');
        ">${bookAuthor.first_name} ${bookAuthor.last_name}</a>
          <div class="book-stars-container">
            ${renderStars(rating)}
          </div>
          <div class="book-rating">${rating.toFixed(1)}</div>
          <div class="book-price-container book-${book.book_id}">
            <div class="book-price book-${book.book_id}">${book.price} грн</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelector('.book-page-container').insertAdjacentHTML('afterbegin', html);

  document.querySelector('.description-container').innerHTML = `
  <h3>Опис</h3>
    <div class="genre"><span>Жанр:</span> ${bookGenre}</div>
    <div class="description"><span>Опис книги:</span> ${book.description}</div>
    <div class="pages-num"><span>Кількість сторінок:</span> ${book.pages}</div>
  `;

  await loadCartAndWishlistButtons(bookId);
        
  const discount = dataDiscounts.find(discount => discount.book_id === bookId && discount.is_valid);
  if (discount) {
    const discountPercent = discount.discount_percent;
    const newPrice = discount.total_price;
    await loadDiscountsIcon(bookId, discountPercent, newPrice);
  }
}

export function loadDescription () {

}