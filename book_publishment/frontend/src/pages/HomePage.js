import { loadBookById } from "../components/booksList";
import { getTable, loadCartAndWishlistButtons, renderBooksDropdown, loadDiscountsIcon } from "../utils/utils";

export async function renderHomePage() {
  const container = document.querySelector(".app");
  container.innerHTML = `
    <div class="hero-banner">
      <div class="hero-content">
        <h1>Поєднуємо читачів і історії</h1>
        <p>Відкрий світ нових книжок разом із PoLit</p>
        <a class="hero-button" href="/books" onclick="event.preventDefault(); navigate('/books');">Переглянути книги</a>
      </div>
    </div>
    <div class="navigation-container">
      <div class="navigation-element">
        <a class="navigation-button books-button" href="/books" onclick="
          event.preventDefault();
          navigate("/books");
        ">Книги
        </a>
        <div class="dropdown books-dropdown">
        ${await renderBooksDropdown()}
        </div>
      </div>
      <div class="navigation-element">
        <a class="navigation-button authors-button" href="/authors" onclick="
          event.preventDefault();
          navigate("/authors");
          ">Автори
        </a>
        <div class="dropdown authors-dropdown">
          <a class="dropdown-origin" href="/authors?origin=українські" onclick="event.preventDefault(); navigate('/authors?origin=українські');">
            Українські автори
          </a>
          <a class="dropdown-origin" href="/authors?origin=зарубіжні" onclick="event.preventDefault(); navigate('/authors?origin=зарубіжні');">
            Зарубіжні автори
          </a>
        </div>
      </div>
      <div class="navigation-element">
      <a class="navigation-button" href="/discounts" onclick="event.preventDefault(); navigate('/discounts');">Знижки</a></div>
      <div class="navigation-element"><a class="navigation-button" href="/about-us" onclick="event.preventDefault(); navigate('/about-us');">Про нас</a></div>
    </div>
    <h2 class="new-books-title">Новинки:</h2>
    <div class="new-books-container"></div>
    <div class="new_books"></div>
  `;

  document.querySelector(".books-button").addEventListener("mouseover", () => {
    document.querySelector('.books-dropdown').style.visibility = 'visible';
  });
  document.querySelector(".books-button").addEventListener("mouseout", () => {
    document.querySelector('.books-dropdown').style.visibility = 'hidden';
  });

  document.querySelector('.books-dropdown').addEventListener("mouseover", () => {
    document.querySelector('.books-dropdown').style.visibility = 'visible';
  });
  document.querySelector('.books-dropdown').addEventListener("mouseout", () => {
    document.querySelector('.books-dropdown').style.visibility = 'hidden';
  });

  document.querySelector(".authors-button").addEventListener("mouseover", () => {
    document.querySelector('.authors-dropdown').style.visibility = 'visible';
  });
  document.querySelector(".authors-button").addEventListener("mouseout", () => {
    document.querySelector('.authors-dropdown').style.visibility = 'hidden';
  });

  document.querySelector('.authors-dropdown').addEventListener("mouseover", () => {
    document.querySelector('.authors-dropdown').style.visibility = 'visible';
  });
  document.querySelector('.authors-dropdown').addEventListener("mouseout", () => {
    document.querySelector('.authors-dropdown').style.visibility = 'hidden';
  });

  const mainContainer = document.querySelector('.new-books-container');
  const dataBooks = await getTable('books');
  const dataDiscounts = await getTable('discounts');
  const newBooks = dataBooks.filter((book) => book.is_new).map((book) => book.book_id);
  newBooks.forEach(async (bookId) => {
    mainContainer.insertAdjacentHTML('beforeend', `
      <div class="book-container">
        ${await loadBookById(bookId)}
      </div>`);

      await loadCartAndWishlistButtons(bookId);
      
      const discount = dataDiscounts.find(discount => discount.book_id === bookId && discount.is_valid);
      if (discount) {
        const discountPercent = discount.discount_percent;
        const newPrice = discount.total_price;
        await loadDiscountsIcon(bookId, discountPercent, newPrice);
      }
  })
}