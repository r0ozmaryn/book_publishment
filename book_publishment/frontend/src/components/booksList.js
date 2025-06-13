import { getBookRating, getTable, renderStars, getRowById,loadCartAndWishlistButtons, loadDiscountsIcon } from "../utils/utils";
import { loadSearch } from "./search";

export async function loadBooks({genreId = null, booksList = null}) {
  try {
    const dataBooksAll = await getTable('books');
    const dataDiscounts = await getTable('discounts');

    let booksIds = '';
    let booksTitles = '';
    if (genreId) {
      booksIds = dataBooksAll.filter((book) => book.genre_id === genreId).map((book) => book.book_id);
      booksTitles = dataBooksAll.filter((book) => book.genre_id === genreId).map((book) => {
        return {
        id: book.book_id,
        title: book.title
        }
      });
    } else if (booksList) {
      booksIds = booksList;
      booksTitles = dataBooksAll.filter((book) => booksList.includes(book.book_id)).map((book) => {
        return {
        id: book.book_id,
        title: book.title
        }
      });
    } else {
      booksIds = dataBooksAll.map((book) => book.book_id);
      booksTitles = dataBooksAll.map((book) => {
        return {
        id: book.book_id,
        title: book.title
        }
      });
    }

    loadSearch(booksTitles);

    const list = document.querySelector('.books');

    booksIds.forEach(async (bookId) => {
      const html = `
        <div class="book-container">
          ${await loadBookById(bookId)}
        </div>
      `;
      list.insertAdjacentHTML('beforeend', html);

      await loadCartAndWishlistButtons(bookId);
      
      const discount = dataDiscounts.find(discount => discount.book_id === bookId && discount.is_valid);
      if (discount) {
        const discountPercent = discount.discount_percent;
        const newPrice = discount.total_price;
        await loadDiscountsIcon(bookId, discountPercent, newPrice);
      }
    });

  } catch (error) {
    console.error('Помилка:', error);
  }
}

export async function loadBookById (bookId) {
  if (!bookId) {
    console.error('Error getting book');
    return;
  };

  const book = await getRowById('books', bookId);
  const dataBooksAuthors = await getRowById('books_authors', bookId);
  const bookRecensions = await getRowById('recensions', bookId);
  const bookAuthor = await getRowById('authors', dataBooksAuthors.author_id);

  const rating = getBookRating(bookRecensions, bookId);

  return `
    <a class="book-cover-container" href='/book?book=${book.book_id}' onclick="
      e.preventDefault();
      navigate('/book?book=${book.book_id}');
    ">
      <image src="${book.cover_image_url}" class="book-cover">
    </a>
    <div class="book-info-container book-${book.book_id}">
      <div class="main-info book-${book.book_id}">
        <a class="book-title" href='/book?book=${book.book_id}' onclick="
          e.preventDefault();
          navigate('/book?book=${book.book_id}');
        ">${book.title}</a>
        <a class="book-author" href='/author?author=${bookAuthor.author_id}' onclick="
          e.preventDefault();
          navigate('/author?author=${bookAuthor.author_id}');
        ">${bookAuthor.first_name} ${bookAuthor.last_name}</a>
        <div class="book-stars-container">
          ${renderStars(rating)}
        </div>
        <div class="book-rating">${rating.toFixed(1)}</div>
        <div class="book-price-container book-${book.book_id}">
        <div class="book-price book-${book.book_id}">${book.price} грн</div></div>
      </div>
    </div>
  `;
}