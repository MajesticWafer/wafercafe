function showMenu() {
  const menu = document.getElementById('menu');
  const courseList = document.getElementById('course-list');
  const courseIds = JSON.parse(localStorage.getItem('courseIds')) || [];

  courseList.innerHTML = '';  // Clear previous list
  courseIds.forEach(id => {
    const listItem = document.createElement('li');
    listItem.textContent = `Course ${id}`;
    listItem.style.cursor = 'pointer';
    listItem.addEventListener('click', function() {
      window.location.href = `https://hilliard.instructure.com/courses/${id}`;
    });
    courseList.appendChild(listItem);
  });

  menu.style.display = 'block';
}

document.getElementById('show-menu').addEventListener('click', showMenu);

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 'e') {
    showMenu();
  }
});
