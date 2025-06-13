import { loadAuthorById } from "../components/author";
import { getAuthorFromURL } from "../utils/utils";

export async function renderAuthorPage () {
  const authorId = getAuthorFromURL();
  if (!authorId) navigate("/");

  const container = document.querySelector('.app');
  container.innerHTML = `
    <div class='author-page-container'>
      ${await loadAuthorById(authorId)}
    </div>
  `;

}