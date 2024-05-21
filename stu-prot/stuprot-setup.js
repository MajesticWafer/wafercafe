document.getElementById('save-ids').addEventListener('click', function() {
  const input = document.getElementById('course-ids').value;
  const courseIds = input.split(/[\s,]+/).filter(Boolean);  // Split by commas or spaces and filter out empty strings
  localStorage.setItem('courseIds', JSON.stringify(courseIds));
  alert('Course IDs saved!');
});
