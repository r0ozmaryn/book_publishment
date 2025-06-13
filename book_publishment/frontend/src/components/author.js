import { getTable, formatDate, getRowById } from "../utils/utils";

export async function loadAuthors (authorOrigin = null) {
  try {
      const dataAuthorsAll = await getTable('authors');
      const dataBooksAuthors = await getTable('books_authors');

      let authorsIds = '';
      if (authorOrigin) {
        authorsIds = dataAuthorsAll.filter((author) => author.origin === authorOrigin).map(author => author.author_id);
        console.log(authorsIds);
      } else {
        authorsIds = dataAuthorsAll.map(author => author.author_id);
      }
  
      const list = document.querySelector('.authors');
      authorsIds.forEach(async (authorId) => {
        const authorBooks = dataBooksAuthors.filter((relation) => relation.author_id === authorId);
        const authorBooksIds = authorBooks.map((book) => book.book_id);

        const html = await loadAuthorById(authorId, authorBooksIds);
        list.insertAdjacentHTML('beforeend', html);
      });
    } catch (error) {
      console.error('Помилка:', error);
    }
}

export async function loadAuthorById (authorId, authorBooksIds) {
  if (!authorId) {
    console.error('Error getting book');
    return;
  };

  if (!authorBooksIds) {
    const dataBooksAuthors = await getTable('books_authors');
    const authorBooks = dataBooksAuthors.filter((relation) => relation.author_id === authorId);
    authorBooksIds = authorBooks.map((book) => book.book_id);
  }

  const author = await getRowById('authors', authorId);
  
  return `
  <div class="author-container">
    <div class="author-photo-container">
      <image class="author-photo" src="${author.photo_url}">
    </div>
    <div class="author-info-container">
      <div class="author-name">${author.first_name} ${author.last_name}</div>
      <div class="author-birth-death">${formatDate(author.birth_date)}${author.death_date ? ' - ' + formatDate(author.death_date) : ''}</div>
      <div class="author-biography">${author.biography}</div>
      <a class="show-author-books-link" href="/books?booksList=${authorBooksIds.join('-')}&author=${author.author_id}">Переглянути книги автора</a>
    </div>
  </div>`;
}