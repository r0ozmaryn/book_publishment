import { loadDiscounts } from "../components/discounts";

export async function renderDiscountsPage () {
  const container = document.querySelector('.app')

  container.innerHTML = `
  <div class="books-page-hero hero">
      <h1>Знижки</h1>
  </div>
  <div class="search-container"></div>
  <div class='discounts'></div>
  `;

  await loadDiscounts();
}