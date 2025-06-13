import { loadProfile } from "../components/profile";

export async function renderProfilePage () {
  const container = document.querySelector('.app');
  container.innerHTML = `
    <div class='profile'>
      
    </div>
  `;

  await loadProfile();
}