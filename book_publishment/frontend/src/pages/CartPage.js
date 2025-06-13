import { loadCartById } from "../components/cart";
import { getUserId } from "../utils/utils";

export async function renderCartPage () {
  const userId = await getUserId();
  if (!userId) console.error('Не вдалось знайти користувача');

  const container = document.querySelector('.app');

  container.innerHTML = `
    <h1 class="main-title">Ваш кошик</h1>
    <div class="cart"></div>
    <div class="total-container"></div>
  `;

  await loadCartById(userId);
}