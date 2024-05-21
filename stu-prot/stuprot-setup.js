document.getElementById('save-ids').addEventListener('click', function() {
  const input = document.getElementById('course-ids').value;
  const courseIds = input.split(/[\s,]+/).filter(Boolean).map(item => {
    // Extract course ID from URL if a URL is provided
    const match = item.match(/(?:https?:\/\/)?(?:[a-z0-9]+\.)?instructure\.com\/courses\/(\d+)/i);
    return match ? match[1] : item;
  });
  localStorage.setItem('courseIds', JSON.stringify(courseIds));
  alert('Course IDs saved!');
});
