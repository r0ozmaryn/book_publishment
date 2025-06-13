import { register, logIn, checkUser, setUserProfile } from "../components/authorisation";
import { navigate } from "../main";
import { updateNavHeader } from "../utils/utils";
import swal from 'sweetalert';

export function renderAuthorisationPage () {
  const container = document.querySelector('.app');
  container.innerHTML = `
  <div class="authorisation-wrapper">
    <div class='authorisation-page-container'>
    <div class="email-container">
      <label class="email-label">Email</label>
      <input class="email-input" placeholder="user@example.com">
    </div>
    <div class="password-container">
      <label class="password-label">Пароль</label>
      <input type="password" class="password-input" placeholder="Введіть пароль">
      <span class="password-toggle-icon"><i class="fas fa-eye"></i></span>
    </div>
    <div class="response"></div>
    <button class="login-submit">Увійти</button>
    <div class="go-to-register">Не маєте акаунту? <span class="go-to-register-span">Зареєструватись</span></div>
    </div>
  </div>
  `;

  document.querySelector('.go-to-register').addEventListener('click', () => {
    container.innerHTML = `
    <div class="authorisation-wrapper">
      <div class='authorisation-page-container'>
      <div class="email-container">
        <label class="email-label">Email</label>
        <input class="email-input" placeholder="user@example.com">
      </div>
      <div class="password-container">
        <label class="password-label">Пароль</label>
        <input type="password" class="password-input" placeholder="Введіть пароль">
        <span class="password-toggle-icon"><i class="fas fa-eye"></i></span>
      </div>
      <div class="response"></div>
      <button class="register-submit">Зареєструватись</button>
      <div class="go-to-login">Я вже маю акаунт. <span class="go-to-login-span">Увійти</span></div>
      </div>
      </div>
    `;
    
    const passwordField = document.querySelector('.password-input');
    const togglePassword = document.querySelector(".password-toggle-icon i");

    togglePassword.addEventListener("click", () => {
      if (passwordField.type === "password") {
        passwordField.type = "text";
        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");
      } else {
        passwordField.type = "password";
        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");
      }
    });

    document.querySelector('.register-submit').addEventListener('click', async () => {
      const email = document.querySelector('.email-input').value;
  
      if (!email.includes('@')) {
        document.querySelector('.response').innerText = 'Ведіть email.';
      } else if (passwordField.value.length < 6) {
        document.querySelector('.response').innerText = 'Пароль повинен містити не менше 6 символів.';
      } else {
        const response = await register(email, passwordField.value);
        await checkUser();
        await setUserProfile();
        if (response.success) {
          swal("Ви зареєструвались!", response.success, 'success');
          navigate('/');
          updateNavHeader(); 
        } else {
          document.querySelector('.response').innerHTML = `${response.error}`;
        }
      }
    });

    document.querySelector('.go-to-login').addEventListener('click', () => {
      navigate('/login')
    });   
  });

  const passwordField = document.querySelector('.password-input');
  const togglePassword = document.querySelector(".password-toggle-icon i");

  togglePassword.addEventListener("click", () => {
    if (passwordField.type === "password") {
      passwordField.type = "text";
      togglePassword.classList.remove("fa-eye");
      togglePassword.classList.add("fa-eye-slash");
    } else {
      passwordField.type = "password";
      togglePassword.classList.remove("fa-eye-slash");
      togglePassword.classList.add("fa-eye");
    }
  });

  document.querySelector('.login-submit').addEventListener('click', async () => {
    const email = document.querySelector('.email-input').value;

    if (email && passwordField.value) {
      const response = await logIn(email, passwordField.value);
      await checkUser();
      await setUserProfile();
      if (response.success) {
        swal("Ви увійшли!", response.success, 'success');
        navigate('/');
        updateNavHeader(); 
      } else {
        document.querySelector('.response').innerHTML = `Неправильний email чи пароль.`;
      }
    } else {
      document.querySelector('.response').innerText = 'Неправильний email чи пароль.';
    }
  });
};