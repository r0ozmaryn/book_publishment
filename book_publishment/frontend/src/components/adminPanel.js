import supabase from "../../supabase/supabaseClient";
import { getTable, dbTypeToInputType } from "../utils/utils";
import swal from "sweetalert";

export async function loadAdminTables () {
  const container = document.querySelector('.admin-panel-container');
  container.innerHTML = `
  <h1>Виберіть таблицю для редагування:</h1>
  <a class="go-back" href="/admin-panel" onclick="event.preventDefault(); navigate('/admin-panel');">Назад</a>
  <div class="tables-list"></div>
  <div class="table"></div>`;

  const response = await fetch('http://localhost:3000/api/tables');
  const allTables = await response.json();
  allTables.forEach(table => {
    const html = `
      <a class="table-link table-${table.name}">${table.name}</a>
    `;
    document.querySelector('.tables-list').insertAdjacentHTML('beforeend', html);

    document.querySelector(`.table-link.table-${table.name}`).addEventListener('click', async () => {
      await loadTable(table.name);
    })
  })

}

export async function loadDiscountsManager() {
  const mainContainer = document.querySelector('.admin-panel-container');
  mainContainer.innerHTML = `
  <h1>Менеджер знижок</h1>
  <a class="go-back" href="/admin-panel" onclick="event.preventDefault(); navigate('/admin-panel');">Назад</a>
  <div class="discounts-manager"></div>`;

  const container = document.querySelector('.discounts-manager');

  const controlsHtml = `
    <div class="discount-controls">
      <div id="add-discount-form" style="display:none; margin-top: 1rem;"></div>
      <button class="add-to-table" id="add-discount-toggle">Додати знижку</button>
      <h3>Змінити всі рядки</h3>
      <button class="btn-all-discount" data-delta="-5">-5%</button>
      <button class="btn-all-discount" data-delta="5">+5%</button>
    </div><br>
    <div id="discounts-table"></div>
  `;
  container.insertAdjacentHTML('beforeend', controlsHtml);

  document.querySelectorAll('.btn-all-discount').forEach(btn => {
    btn.addEventListener('click', async () => {
      const delta = parseFloat(btn.dataset.delta);
      const { data, error } = await supabase.rpc('adjust_all_discounts', { percent_delta: delta });

      if (error) return swal("Помилка", error.message, "error");
      await loadDiscountsTable();
    });
  });

  document.getElementById('add-discount-toggle').addEventListener('click', async () => {
    const formContainer = document.getElementById('add-discount-form');
    if (formContainer.innerHTML !== '') {
      formContainer.innerHTML = '';
      formContainer.style.display = 'none';
      document.getElementById('add-discount-toggle').innerText = 'Додати знижку';
      return;
    }

    formContainer.style.display = 'block';
    document.getElementById('add-discount-toggle').innerText = 'Скасувати';

    const booksWithDiscounts = await supabase.from('discounts').select('book_id');
    const allBooks = await supabase.from('books').select('book_id, title');
    const discountedIds = new Set(booksWithDiscounts.data.map(d => d.book_id));
    const booksWithoutDiscounts = allBooks.data.filter(b => !discountedIds.has(b.book_id));

    let formHtml = `
      <form id="new-discount-form">
        <label>Книга:</label>
        <select name="book_id" required>
          ${booksWithoutDiscounts.map(b => `<option value="${b.book_id}">${b.title}</option>`).join('')}
        </select><br/>
        <label>Знижка:</label>
        <input type="number" name="discount_percent" required min="1" max="90"/><br/>
        <label>Дата початку:</label>
        <input type="date" name="start_date" required/><br/>
        <label>Дата завершення:</label>
        <input type="date" name="end_date" required/><br/>
        <button type="submit">Додати знижку</button>
      </form>
    `;

    formContainer.innerHTML = formHtml;

    document.getElementById('new-discount-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target).entries());
      formData.discount_percent = +formData.discount_percent;
      const { error } = await supabase.from('discounts').insert([formData]);
      if (error) swal("Помилка", error.message, "error");
      else {
        formContainer.innerHTML = '';
        await loadDiscountsTable();
      }
    });
  });

  await loadDiscountsTable();
}

async function loadDiscountsTable() {
  const container = document.getElementById('discounts-table');
  const { data, error } = await supabase
    .from('discounts')
    .select('discount_id, discount_percent, start_date, end_date, book_id, books(title)')
    .order('discount_id');

  if (error) return swal("Помилка", error.message, "error");

  let html = `
    <table border="1">
      <thead>
        <tr>
          <th>Назва книги</th>
          <th>Знижка</th>
          <th>Початок</th>
          <th>Кінець</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const d of data) {
    html += `
      <tr data-id="${d.discount_id}">
        <td>${d.books?.title || '??'}</td>
        <td><span class="view">${d.discount_percent}%</span><input class="edit-input" type="number" name="discount_percent" value="${d.discount_percent}" style="display:none" min="0" max="90"/></td>
        <td><span class="view">${d.start_date}</span><input class="edit-input" type="date" name="start_date" value="${d.start_date}" style="display:none"/></td>
        <td><span class="view">${d.end_date}</span><input class="edit-input" type="date" name="end_date" value="${d.end_date}" style="display:none"/></td>
        <td>
          <button class="delete-btn">Видалити</button>
          <button class="save-discount" style="display:none">Зберегти</button>
          <button class="edit-btn">Редагувати</button>
        </td>
      </tr>
    `;
  }

  html += '</tbody></table>';
  container.innerHTML = html;

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('tr').dataset.id;
      const { error } = await supabase.from('discounts').delete().eq('discount_id', id);
      if (error) swal("Помилка", error.message, "error");
      else loadDiscountsTable();
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('tr');
      row.querySelectorAll('.view').forEach(el => el.style.display = 'none');
      row.querySelectorAll('.edit-input').forEach(el => el.style.display = 'inline-block');
      row.querySelector('.edit-btn').style.display = 'none';
      row.querySelector('.save-discount').style.display = 'inline-block';
    });
  });

  document.querySelectorAll('.save-discount').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('tr');
      const id = row.dataset.id;

      const updated = {
        discount_percent: +row.querySelector('input[name="discount_percent"]').value,
        start_date: row.querySelector('input[name="start_date"]').value,
        end_date: row.querySelector('input[name="end_date"]').value,
      };

      const { error } = await supabase.from('discounts').update(updated).eq('discount_id', id);
      if (error) swal("Помилка", error.message, "error");
      else loadDiscountsTable();
    });
  });
}


async function loadTable (tableName) {
  const container = document.querySelector('.table');

  const table = await getTable(tableName);
  const headers = Object.keys(table[0]);
  let html = '';

  if (['books', 'books_authors', 'genres', 'authors'].includes(tableName)) {
    html = `<button class="add-to-table">Додати запис</button>`;
  }

  html += `<table border="1"><thead><tr>`;
  headers.forEach((key) => {
    html += `<th>${key}</th>`;
  });
  html += '<th>Дія</th></tr></thead><tbody>';

  table.forEach((row) => {
    html += `<tr data-id="${Object.values(row)[0]}">`;
    headers.forEach((key) => {
      html += `<td><span>${row[key]}</span></td>`;
    });
    html += `
      <td>
        <button class="edit-btn">Редагувати</button>
        <button class="delete-btn">Видалити</button>
      </td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;

  attachEditDeleteListeners(tableName, headers);

  document.querySelector('.add-to-table')?.addEventListener('click', async () => {
    await loadAddForm(tableName, headers);
  })
}

async function loadAddForm (tableName, fields) {
  const container = document.querySelector('.table');

  let html = `
  <h3>Додати запис у ${tableName}</h3>
  <form id="insert-form">
  `;

  const schema = await getTableSchema(tableName);
  const requiredFields = await getRequiredFields(tableName);

  fields.forEach((field) => {
    const fieldDataType = schema.find(obj => field === obj.column_name)?.data_type;
    const inputType = dbTypeToInputType[fieldDataType] || 'text';
    if (requiredFields.includes(field)) {

      if (inputType === 'checkbox') {
        html += `
          <label>
            <input type="checkbox" name="${fieldName}" ${isRequired ? 'required' : ''} />
            ${fieldName} ${isRequired ? '<span style="color:red">*</span>' : ''}
          </label>
          <br/>
        `;
      } else {
      html += `
        <label>${field} <span style="color:red">*</span></label>
        <input type="${inputType}" name="${field}" required/>
        <br/>`;
      }

    } else {
    html += `
      <label>${field}</label>
      <input type="${inputType}" name="${field}" />
      <br/>`;
    }
  });

  html += `<button type="submit">Додати</button></form>`;
  container.innerHTML = html;

  document.getElementById('insert-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    console.log(formData);

    const processedData = {};

    for (const key in formData) {
      let value = formData[key];

      if (e.target.elements[key] && e.target.elements[key].type === 'checkbox') {
        processedData[key] = value === 'on';
      }
      else if (e.target.elements[key] && e.target.elements[key].type === 'number') {
        processedData[key] = value === '' ? null : Number(value);
      }
      else if (e.target.elements[key] && (e.target.elements[key].type === 'date' || e.target.elements[key].type === 'datetime-local')) {
        processedData[key] = value === '' ? null : value;
      }
      else if (typeof value === 'string') {
        processedData[key] = value.trim();
      }
      else {
        processedData[key] = value;
      }
    }

    const { error } = await supabase.from(tableName).insert([processedData]);
    if (error) {
      swal('Помилка!', error.message, 'error');
    } else {
      loadTable(tableName);
      e.target.reset();
    }
  });
}

async function getRequiredFields(tableName) {
  const { data, error } = await supabase.rpc('get_not_null_columns', {
    input_table_name: tableName
  });

  if (error) {
    console.error('Помилка при отриманні NOT NULL полів:', error.message);
    return [];
  }

  return data.map(col => col.column_name);
}

function attachEditDeleteListeners(tableName, fields) {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('tr').dataset.id;
      const { error } = await supabase.from(tableName).delete().eq(fields[0], id);
      if (error) swal('Помилка', error.message, 'error');
      else loadTable(tableName);
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('tr');
      if (row.classList.contains('editing')) return;

      const schema = await getTableSchema(tableName);
      await renderEditInputs(row, fields, schema);

      btn.textContent = 'Зберегти';
      btn.classList.add('save-btn');
      btn.classList.remove('edit-btn');

      btn.addEventListener('click', async () => {
        const inputs = row.querySelectorAll('input');
        const updated = {};
        inputs.forEach((input, index) => {
          let val = input.type === 'checkbox' ? input.checked : input.value;
          updated[fields[index]] = val;
        });

        const id = row.dataset.id;
        const { error } = await supabase.from(tableName).update(updated).eq(fields[0], id);
        if (error) swal('Помилка', error.message, 'error');
        else loadTable(tableName);
      }, { once: true });
    });
  });
}


/// Допоміжні
async function getTableSchema(tableName) {
  const { data, error } = await supabase.rpc('get_column_types', { table_name_param: tableName });
  if (error) {
    console.error('Помилка при отриманні типів:', error.message);
    return [];
  }
  return data;
}

async function renderEditInputs(row, fields, schema) {
  row.classList.add('editing');
  const spans = row.querySelectorAll('td span');

  spans.forEach((span, i) => {
    const field = fields[i];
    const type = schema.find(f => f.column_name === field)?.data_type || 'text';
    const inputType = dbTypeToInputType[type] || 'text';
    let value = span.textContent;

    let inputHtml = '';

    if (inputType === 'checkbox') {
      const checked = value === 'true' ? 'checked' : '';
      inputHtml = `<input type="checkbox" ${checked} />`;
    } else {
      inputHtml = `<input type="${inputType}" value="${value}" />`;
    }

    span.outerHTML = inputHtml;
  });
}