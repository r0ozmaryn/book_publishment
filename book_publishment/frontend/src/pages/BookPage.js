import { loadBook } from "../components/book";
import { loadRecensions } from "../components/recension";
import { getBookFromURL } from "../utils/utils";

export async function renderBookPage () {
  const bookId = getBookFromURL();

  if (!bookId) {
    console.error('Помилка при отриманні книги');
    return;
  };

  const container = document.querySelector('.app');

  container.innerHTML = `
  <div class="book-page-container">
  <div class="description-container"></div>
  <div class="recensions-container">
  </div>
  </div>
  `;

  await loadBook();
  await loadRecensions(bookId);
}