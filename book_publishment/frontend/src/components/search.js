export async function loadSearch(data) {
  const container = document.querySelector('.search-container');

  const html = `
  <div class="search">
    <div class="search-icon"></div>
    <div class="input">
      <input class="search-input" placeholder="Шукайте" >
    </div>
    <span class="clear"></span>
    <div class="search-dropdown"></div>
  </div>
    `;

    container.insertAdjacentHTML('afterbegin', html);

    const searchIcon = document.querySelector('.search-icon');
    const search = document.querySelector('.search');
    const searchInput = document.querySelector('.search-input');

    searchIcon.addEventListener('click', () => {
      search.classList.toggle('active');
    });

    const dropdown = document.querySelector('.search-dropdown');
    searchInput.addEventListener('input', () => {
      let searchWord = searchInput.value.toLowerCase().trim();
      const searchLength = searchWord.length;
      const results = data.filter(book => book.title.toLowerCase().slice(0, searchLength) === searchWord);

      dropdown.innerHTML = '';
      if (!searchWord) return;

      results.forEach(book => {
        dropdown.insertAdjacentHTML('beforeend', `<div 
          class="dropdown-book-name book-${book.id}"
          href="/book?book=${book.id}"
          onclick="event.preventDefault(); navigate('/book?book=${book.id}')">${book.title}</div>`);
      })
    });

    document.querySelector('.clear').addEventListener('click', () => {
      searchInput.value = '';
      dropdown.innerHTML = '';
    })

};