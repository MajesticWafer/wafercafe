async function fetchCourseName(courseId, apiToken) {
  const response = await fetch(`https://hilliard.instructure.com/api/v1/courses/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch course name:', response.statusText);
    return `Course ${courseId}`;
  }

  const courseData = await response.json();
  return courseData.name;
}

async function showMenu() {
  const menu = document.getElementById('menu');
  const courseList = document.getElementById('course-list');
  const courseIds = JSON.parse(localStorage.getItem('courseIds')) || [];
  const apiToken = localStorage.getItem('apiToken');

  courseList.innerHTML = '';  // Clear previous list

  for (const id of courseIds) {
    const listItem = document.createElement('li');
    const courseName = await fetchCourseName(id, apiToken);

    listItem.textContent = courseName;
    listItem.style.cursor = 'pointer';
    listItem.addEventListener('click', function() {
      // Redirect to the course URL using the course ID
      window.location.href = `https://hilliard.instructure.com/courses/${id}`;
    });

    courseList.appendChild(listItem);
  }

  menu.style.display = 'block';
}

document.getElementById('show-menu').addEventListener('click', showMenu);

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 'e') {
    showMenu();
  }
});
