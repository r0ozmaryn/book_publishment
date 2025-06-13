import { loadAdminTables, loadDiscountsManager } from "../components/adminPanel";

export async function renderAdminPanelPage () {
  const container = document.querySelector('.app');

  container.innerHTML = `
    <h1 class="main-title">Адмін панель</h1>
    <div class="admin-panel-container">
      <h2 class="secondary-title">Виберіть дію:</h2>
      <button class="edit-tables">Редагування таблиць</button>
      <button class="manage-discounts">Менеджер знижок</button>
      <div class="discounts-manager"></div>
    </div>
  `;

  document.querySelector('.edit-tables').addEventListener('click', async (e) => {
    e.preventDefault();
    await loadAdminTables();
  });

  document.querySelector('.manage-discounts').addEventListener('click', async (e) => {
    e.preventDefault();
    await loadDiscountsManager();
  })
  
}