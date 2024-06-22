document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const messageDiv = document.getElementById('message');

  uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('csvFile', document.getElementById('csvFile').files[0]);

      const response = await fetch('/cargar-csv', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al cargar CSV');
      }

      const data = await response.json();
      messageDiv.textContent = data.message;
    } catch (error) {
      console.error('Error:', error);
      messageDiv.textContent = 'Error al cargar CSV';
    }
  });
});
