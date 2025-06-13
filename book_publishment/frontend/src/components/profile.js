import { changePassword, getUserProfile, updateUserProfile } from "./authorisation";
import { logOut } from "./authorisation";
import swal from "sweetalert";
import { updateNavHeader } from "../utils/utils";

export async function loadProfile () {
  const profileData = getUserProfile();
  const { email, first_name, last_name, phone } = profileData.profile;

  const container = document.querySelector('.profile');

  const html = `
  <div class="profile-info">
  <h1>Ваш профіль</h1>
    <p class="profile-label">Емейл: <span class="profile-data-text">${email}</span></p>

    <div class='changable'>
      <p class="profile-label">Ім'я: <span class="profile-data-text">${first_name || '<span class="placeholder">Не вказано</span></span>'}</p>

      <p class="profile-label">Прізвище: <span class="profile-data-text">${last_name || '<span class="placeholder">Не вказано</span></span>'}</p>

      <p class="profile-label">Номер телефону: <span class="profile-data-text">${phone || '<span class="placeholder">Не вказано</span></span>'}</p>

      <button class="change-profile-data">Змінити дані</button>
      <p class="message"></p>
    </div>

    <button class="logout">Вийти з акаунту</button>
  </div>
`;
  container.insertAdjacentHTML('beforeend', html);

  document.querySelector('.change-profile-data').addEventListener('click', () => {
    document.querySelector('.changable').innerHTML = `
      <label class="name-label">Ім'я:</label>
      <input class="name-input" value="${first_name || ''}" placeholder="Введіть ім\'я"><br>
      <label class="surname-label">Прізвище:</label>
      <input class="surname-input" value="${last_name || ''}" placeholder="Введіть прізвище"><br>
      <label class="phone-label">Номер телефону:</label>
      <input class="phone-input" value="${phone || ''}" placeholder="0123456789"></input>
      <button class="submit-profile-changes">Зберегти</button>
      <button class="deny-profile-changes">Скасувати</button>
      <p class="message"></p>
    `;

    document.querySelector('.submit-profile-changes').addEventListener('click', async () => {

      const first_name = document.querySelector('.name-input').value;
      const last_name = document.querySelector('.surname-input').value;
      const phone = document.querySelector('.phone-input').value;

      if (
        (first_name && !/^[a-zA-Z]+$/.test(first_name)) ||
        (last_name && !/^[a-zA-Z]+$/.test(last_name)) ||
        (phone && !/\\d/.test(phone))
      ) {
        document.querySelector('.message').innerText = 'Неправильний ввід (використовуйте латиницю) ✕';
        return;
      }

      const res = await updateUserProfile({ first_name, last_name, phone});
      if (res.error) {
        document.querySelector('.message').innerText = res.error;
      } else {
        navigate('/profile');
        document.querySelector('.message').innerText = res.message;
      }
    });

    document.querySelector('.deny-profile-changes').addEventListener('click', async () => {
      navigate('/profile');
    });
  });

  document.querySelector('.logout').addEventListener('click', () => {
    swal({
      title: 'Вийти з акаунту',
      text: 'Ви впевнені, що хочете вийти?',
      icon: 'warning',
      buttons: ['Ні', 'Вийти'],
      dangerMode: true,
    }).then(async (logout) => {
      if (logout) {
        const response = await logOut();
        response.success ? swal("Ви вийшли", response.success, 'success') : swal("Помилка!", response.error, 'error');

        navigate('/login');
        await updateNavHeader();
      } else {
        swal.stopLoading();
        swal.close();
      }
    });
  })
}