document.addEventListener('DOMContentLoaded', () => {
  const addForm = document.getElementById('addForm');
  const dataTableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];

  const loadData = async () => {
    try {
      const response = await fetch('/api/datos');
      const data = await response.json();
      dataTableBody.innerHTML = '';
      data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.alcaldia}</td>
          <td>${row.localidad}</td>
          <td>${row.sexo}</td>
          <td>${row.rango_edad}</td>
          <td>${row.poblacion}</td>
          <td>
            <button onclick="editData(${row.id})">Editar</button>
            <button onclick="deleteData(${row.id})">Eliminar</button>
          </td>
        `;
        dataTableBody.appendChild(tr);
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  addForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = {
      alcaldia: document.getElementById('alcaldia').value,
      localidad: document.getElementById('localidad').value,
      sexo: document.getElementById('sexo').value,
      rango_edad: document.getElementById('rango_edad').value,
      poblacion: document.getElementById('poblacion').value,
    };

    try {
      await fetch('/api/datos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      addForm.reset();
      loadData();
    } catch (error) {
      console.error('Error al agregar dato:', error);
    }
  });

  loadData();
});

const editData = async (id) => {
  // Implementa la lógica para editar los datos
  // Puedes mostrar un formulario de edición y actualizar la fila correspondiente en la tabla
};

const deleteData = async (id) => {
  try {
    await fetch(`/api/datos/${id}`, { method: 'DELETE' });
    loadData();
  } catch (error) {
    console.error('Error al eliminar dato:', error);
  }
};
