import { loadWishlistById } from "../components/wish";
import { getUserId, updateNavHeader } from "../utils/utils";

export async function renderWishlistPage () {
  const userId = await getUserId();
  if (!userId) console.error('Не вдалось знайти користувача');
  const container = document.querySelector('.app');

  container.innerHTML = `
    <h1 class="main-title">Ваш список бажаного</h1>
    <div class="wishlist"></div>
  `;

  await loadWishlistById(userId);
}