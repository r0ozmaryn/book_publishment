import { loadBooks } from "../components/booksList";
import { getAuthorFromURL, getGenreFromURL, getRowById, getBooksListFromURL } from "../utils/utils";

export async function renderBooksPage () {
  const {genreId, genreName} = getGenreFromURL();
  const booksListStr = getBooksListFromURL();
  const booksList = booksListStr?.split('-').map(bookId => Number(bookId));
  const authorId = getAuthorFromURL();

  const author = authorId ? await getRowById('authors', authorId) : null;
  
  const container = document.querySelector('.app');
  container.innerHTML = `
    <div class="books-page-hero hero">
      <h1>Книги</h1>
    </div>
    <div class="search-container"></div>
    <h2 class="secondary-title">${genreName ? `Жанр: ${genreName}` : ''}</h2>
    <h2 class="secondary-title">${author ? `Автор: ${author.first_name} ${author.last_name}` : ''}</h2>
    <div class='books'></div>
  `;

  if (genreId) {
    await loadBooks({genreId})
  } else if (booksList) {
    await loadBooks({booksList})
  } else {  
    await loadBooks({})
  };
}