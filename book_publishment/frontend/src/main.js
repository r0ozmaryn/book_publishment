import { renderHomePage } from './pages/HomePage.js';
import { renderBooksPage } from './pages/BooksPage.js';
import { renderAuthorisationPage } from './pages/Authorisation.js';
import { renderProfilePage } from './pages/ProfilePage.js';
import { checkUser, logOut, setUserProfile } from './components/authorisation.js';
import { updateNavHeader } from './utils/utils.js';
import { renderBookPage } from './pages/BookPage.js';
import { renderAuthorsPage } from './pages/AuthorsPage.js';
import { renderAuthorPage } from './pages/AuthorPage.js';
import { renderCartPage } from './pages/CartPage.js';
import { renderWishlistPage } from './pages/WhishlistPage.js';
import { renderAdminPanelPage } from './pages/AdminPanelPage.js';
import { renderAboutUsPage } from './pages/AboutUs.js';
import { renderDiscountsPage } from './pages/Discounts.js';
import supabase from '../supabase/supabaseClient.js';

function refreshAtSevenPm() {
  const now = new Date();
  const sevenPm = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 19, 0, 0);
  const timeUntilSevenPm = sevenPm.getTime() - now.getTime();

  setTimeout(() => {
    window.location.reload(true);
  }, timeUntilSevenPm);
}


function refreshAtMidnight() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const timeUntilMidnight = midnight.getTime() - now.getTime();

  setTimeout(() => {
    window.location.reload(true);
  }, timeUntilMidnight);
}

refreshAtMidnight();

const routes = {
  '/': renderHomePage,
  '/login': renderAuthorisationPage,
  '/books': renderBooksPage,
  '/book': renderBookPage,
  '/profile': renderProfilePage,
  '/authors': renderAuthorsPage,
  '/author': renderAuthorPage,
  '/cart': renderCartPage,
  '/wishlist': renderWishlistPage,
  '/about-us': renderAboutUsPage,
  '/admin-panel': renderAdminPanelPage,
  '/discounts': renderDiscountsPage
};

export async function navigate(path) {
  history.pushState({}, '', path);
  await renderRoute(path);
}

async function renderRoute(fullPath) {
  const path = fullPath.split('?')[0];
  const renderPage = routes[path];

  if (renderPage) {
    document.querySelector('.app').innerHTML = '';
    await renderPage();
  } else {
    document.querySelector('.app').innerHTML = '<h1>404 - Not found</h1>';
  }
}

window.addEventListener(
  'popstate',
  async () => await renderRoute(location.pathname)
);
console.log(location.pathname);
document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkUser();
  if (user) {
    await setUserProfile();
  }

  await renderRoute(location.pathname);
  await updateNavHeader();
});

window.navigate = navigate;
