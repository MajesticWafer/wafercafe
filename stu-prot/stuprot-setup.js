document.getElementById('save-ids').addEventListener('click', function() {
  const input = document.getElementById('course-ids').value;
  const courseIds = input.split(/[\s,]+/).filter(Boolean);
  localStorage.setItem('courseIds', JSON.stringify(courseIds));
  alert('Course IDs saved!');
});
