import { formatDateTime, getRowsByField, getTable, renderStars } from "../utils/utils";
import { checkUser, getToken } from "./authorisation";

export async function loadRecensions (bookId) {
  const container  = document.querySelector('.recensions-container');
  container.innerHTML = '';

  const {data: dataRecensions} = await getRowsByField('recensions', 'book_id', bookId);
  const confirmedRecensions = dataRecensions?.filter(recension => recension.is_confirmed);
  const dataProfiles = await getTable('profiles');

  container.insertAdjacentHTML('afterbegin', `
    <h2>Рецензії:</h2>
    ${!await checkUser() ?
      `<div>Увійдіть, щоб додати рецензію.</div>` :
      `<button class="create-recension book-${bookId}">Додати рецензію</button>`
    }
  `);

  const createRecensionButton = document.querySelector(`.create-recension.book-${bookId}`);
  createRecensionButton?.addEventListener('click', async () => await createRecension(bookId));

  if (confirmedRecensions.length === 0) container.insertAdjacentHTML('beforeend', '<br><div>Пусто. Додайте першу рецензію.</div>');
  dataRecensions.forEach((recension) => {
    if (!recension.is_confirmed) return;
    const user = dataProfiles.find(profile => profile.user_id === recension.user_id);
    const html = `
    <div class="recension-container">
      <div class="user-name">${user.first_name} ${user.last_name}</div>
      <div class="book-stars-container">
        ${renderStars(recension.rating)}
      </div>  
      <div class="recension-date">${formatDateTime(recension.created_at)}</div>
      <div class="recension-text">${recension.comment}</div>
    </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
  })
}

async function createRecension (bookId) {
  const container = document.querySelector('.recensions-container');
  let rating = 0;
  let comment = '';

  container.innerHTML = `
  <h2>Ваша рецензія:</h2>
  <div class="create-recension-container">
    <div class="book-stars-container">
      ${renderStars(0)}
    </div>
    <textarea rows="5" cols="10" class="create-recension-input" placeholder="Введіть текст"></textarea>
    <button class="add-recension">Додати рецензію</button>
    <div class="message"></div>
  </div>
  `
  const stars = container.querySelectorAll('.fa-star');
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      const clickedRating = index + 1;

      if (clickedRating === rating) {
        rating = 0;
      } else {
        rating = clickedRating;
      }

      stars.forEach((s, i) => {
        s.classList.toggle('active', i < rating);
      });
    })
  });
  
  const commentInput = document.querySelector('.create-recension-input');
  document.querySelector('.add-recension').addEventListener('click', async () => {
    comment = commentInput.value.trim();
    if (!comment) return;
    const response = await addRecension(bookId, rating, comment);
    if (response.success) {
      document.querySelector('.create-recension-container').innerHTML = `
      <div class="add-recension-success">Вашу рецензію відправлено на обробку</div>
      <button class="back-to-recensions-button">Повернутись до рецензій</button>`;

      document.querySelector('.back-to-recensions-button').addEventListener('click', () => loadRecensions(bookId));
    } else {
      document.querySelector('.message').innerHTML = `<div class="add-recension-error">Помилка при створенні рецензії: ${response.error}</div>`;
    }
  })
}

export async function addRecension (bookId, rating, comment) {
  const token = await getToken();
    
  if(!token) return { error: 'Ви не увійшли'};

  const response = await fetch(`http://localhost:3000/api/add-recension`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      bookId,
      rating,
      comment
    })
  });

  if (!response.ok) {
    return { error: 'Не вдалось створити відгук ' + response.message};
  }
  return { success: 'Відгук створено' }
}