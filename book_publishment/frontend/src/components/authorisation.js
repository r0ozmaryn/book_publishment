import supabase from "../../supabase/supabaseClient";

let currentUser = null;
let currentUserProfile = null;

export async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) return {error: `Помилка реєстрації: ${error.message}`};

  const userId = data.user?.id;
  if (!userId) {
    return {error: 'Не вдалося отримати ID користувача.'};
  };

  const { error: profileError } = await supabase
  .from('profiles')
  .insert([
    {
      user_id: userId,
      email
    }
  ]);

  if (profileError) {
    return {error: 'Користувача створено, але не вдалося додати у профілі: ' + profileError.message};
  }

  return {success: "Успішна реєстрація, профіль створено!"};
}

export async function logIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return { error: `Помилка входу: ${error.message}`};
  

  return {success: "Успішний вхід!"};
}

export async function logOut() {
  const { error } = await supabase.auth.signOut();

  if (error) return {error: `Помилка при виході: ${error.message}`};

  currentUser = null;
  currentUserProfile = null;

  return {success: "Ви вийшли з акаунту"};
}

export async function checkUser() {
  if (currentUser) return currentUser;
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  if (currentUser) {
    console.log("frontend: Користувач увійшов:", currentUser.email);
    return currentUser;
  } else {
    console.log("frontend: Користувач не увійшов");
    return null;
  }
}

export async function getToken() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    console.error("frontend: Сесія не знайдена");
    return null;
  }

  const token = data.session.access_token;
  return token;
}

export async function setUserProfile() {
  try {
    const token = await getToken();
    const res = await fetch("http://localhost:3000/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    currentUserProfile = data;
    if (res.ok) {
      console.log(`frontend: Email: ${data.email}, Статус: ${data.profile?.is_admin ? 'Адмін' : 'Користувач'}`);
    } else {
      console.error('frontend: Помилка:', data.error);
    }
  } catch (err) {
    console.error("frontend: Помилка при отриманні профілю:", err.message);
  }
}

export async function isAdmin () {
  if (!currentUserProfile) await setUserProfile();
  return !!currentUserProfile?.profile?.is_admin;
}

export function getUserProfile () {
  return currentUserProfile;
}

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
}

export async function updateUserProfile({ first_name, last_name, phone }) {
  const token = await getToken();

  if (!token) {
    console.error("Не вдалося отримати токен");
    return { error: "Недійсний токен" };
  }

  const res = await fetch("http://localhost:3000/profile-data", {
    method: 'POST',
    body: JSON.stringify({ first_name, last_name, phone }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Помилка з бекенда:", data.error);
    return { error: data.error };
  }

  await setUserProfile();

  return { success: true, message: data.message };
}

export async function changePassword (oldPassword, newPassword) {
  const token = await getToken();

  const response = await fetch('http://localhost:3000/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      oldPassword,
      newPassword
    })
  });
  if (!response.ok) return { error: response.error };
  return { success: 'Пароль успішно змінено. Увійдіть з новим паролем.' };
}