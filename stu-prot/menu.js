// Create and insert the menu HTML and styles into the document
function createMenu() {
  const style = document.createElement('style');
  style.textContent = `
    .floating-button {
      position: fixed;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      border-radius: 10px;
      padding: 12.5px 20px;
      color: white;
      background-color: #d6caff;
      transition: transform 0.2s, background-color 0.2s;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
      z-index: 1001;
    }

    .floating-button:hover {
      background-color: #d0c2ff;
      transform: scale(1.05);
    }

    .menu {
      position: fixed;
      top: calc(50% + 40px); /* Adjusted top position */
      right: 10px;
      background-color: #d9cdff; /* Changed background color */
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
      z-index: 1000;
      display: none;
    }

    .menu h2 {
      color: white;
      margin-top: 0;
    }

    .menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .menu li {
      margin: 10px 0;
    }

    .menu button {
      background-color: #d6caff;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 5px;
      width: 100%;
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s, background-color 0.2s;
    }

    .menu button:hover {
      background-color: #d0c2ff;
      transform: scale(1.05);
    }

    /* Hamburger icon styles */
    .hamburger-icon {
      display: inline-block;
      width: 30px;
      height: 3px;
      background-color: white;
      margin: 6px 0;
      transition: transform 0.2s, opacity 0.2s;
    }

    .hamburger-icon.middle {
      margin: 6px 0;
    }

    /* Closed state */
    #show-menu.closed .line1,
    #show-menu.closed .line3 {
      transform: translateY(6px) rotate(0deg);
    }

    #show-menu.closed .line2 {
      opacity: 1;
    }

    /* Open state */
    #show-menu.opened .line1 {
      transform: translateY(9px) rotate(45deg);
    }

    #show-menu.opened .line2 {
      opacity: 0;
    }

    #show-menu.opened .line3 {
      transform: translateY(-9px) rotate(-45deg);
    }
  `;
  document.head.appendChild(style);

  const menuHtml = `
    <div id="menu" class="menu">
      <h2>Courses</h2>
      <ul id="course-list"></ul>
    </div>
    <button id="show-menu" class="floating-button closed">
      <span class="hamburger-icon line1"></span>
      <span class="hamburger-icon line2 middle"></span>
      <span class="hamburger-icon line3"></span>
    </button>
  `;

  document.body.insertAdjacentHTML('beforeend', menuHtml);
}

// Show the menu and populate it with course links
function showMenu() {
  const menu = document.getElementById('menu');
  const courseList = document.getElementById('course-list');
  const courseIds = JSON.parse(localStorage.getItem('courseIds')) || [];

  courseList.innerHTML = '';  // Clear previous list
  courseIds.forEach(id => {
    const listItem = document.createElement('li');
    const button = document.createElement('button');
    button.textContent = `Go to Course ${id}`;
    button.addEventListener('click', function() {
      window.location.href = id;
    });
    listItem.appendChild(button);
    courseList.appendChild(listItem);
  });

  menu.style.display = 'block';
}

// Toggle the menu visibility
function toggleMenu() {
  const menu = document.getElementById('menu');
  const showMenuButton = document.getElementById('show-menu');
  if (menu.style.display === 'none' || !menu.style.display) {
    showMenu();
    showMenuButton.classList.remove('closed');
    showMenuButton.classList.add('opened');
  } else {
    menu.style.display = 'none';
    showMenuButton.classList.remove('opened');
    showMenuButton.classList.add('closed');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createMenu();

  document.getElementById('show-menu').addEventListener('click', toggleMenu);

  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'e') {
      toggleMenu();
    }
  });
});
