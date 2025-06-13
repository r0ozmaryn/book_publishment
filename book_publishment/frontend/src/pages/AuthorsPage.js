import { loadAuthors } from "../components/author";
import { getOriginFromURL } from "../utils/utils";

export async function renderAuthorsPage () {
  const authorOrigin = getOriginFromURL();

  const container = document.querySelector('.app');

  container.innerHTML = `
    <div class="authors-page">
      <div class="authors-page-hero hero">
        <h1>Автори</h1>
      </div>
      <h2 class="secondary-title">${authorOrigin ? `${authorOrigin[0].toUpperCase()}${authorOrigin.slice(1)} автори` : ''}</h2>
      <div class='authors'></div>
    </div>
  `;

  authorOrigin ? loadAuthors(authorOrigin) : loadAuthors();
}