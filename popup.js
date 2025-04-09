document.addEventListener('DOMContentLoaded', () => {
  const categoriesContainer = document.getElementById('categories-container');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const categoryTemplate = document.getElementById('category-template');

  loadCategories();

  addCategoryBtn.addEventListener('click', addCategory);

  function loadCategories() {
    chrome.storage.sync.get('categories', (data) => {
      const categories = data.categories || [];
      categories.forEach(categoryData => {
        addCategory(categoryData);
      });
    });
  }

  function addCategory(categoryData = { name: '', color: '#ffffff', urls: '' }) {
    const newCategory = categoryTemplate.content.cloneNode(true);
    const categoryDiv = newCategory.querySelector('.category');
    const nameInput = newCategory.querySelector('.category-name');
    const colorInput = newCategory.querySelector('.category-color');
    const colorPreview = newCategory.querySelector('.color-preview');
    const urlsTextarea = newCategory.querySelector('.website-urls');
    const saveButton = newCategory.querySelector('.save-category-btn');
    const deleteButton = newCategory.querySelector('.delete-category-btn');

    nameInput.value = categoryData.name;
    colorInput.value = categoryData.color;
    updateColorPreview(categoryData.color, colorPreview);
    urlsTextarea.value = categoryData.urls;

    colorInput.addEventListener('input', () => {
      updateColorPreview(colorInput.value, colorPreview);
    });

    saveButton.addEventListener('click', () => {
      saveCategory(categoryDiv);
    });

    deleteButton.addEventListener('click', () => {
      deleteCategory(categoryDiv);
    });

    categoriesContainer.appendChild(categoryDiv);
  }

  function updateColorPreview(colorCode, previewElement) {
    previewElement.style.backgroundColor = colorCode;
  }

  function saveCategory(categoryDiv) {
    const nameInput = categoryDiv.querySelector('.category-name');
    const colorInput = categoryDiv.querySelector('.category-color');
    const urlsTextarea = categoryDiv.querySelector('.website-urls');

    const categoryData = {
      name: nameInput.value.trim(),
      color: colorInput.value,
      urls: urlsTextarea.value.trim()
    };

    chrome.storage.sync.get('categories', (data) => {
      let categories = data.categories || [];
      const index = Array.from(categoriesContainer.children).indexOf(categoryDiv);

      if (index !== -1) {
        categories[index] = categoryData;
      } else {
        categories.push(categoryData);
      }

      chrome.storage.sync.set({ 'categories': categories });
    });
  }

  function deleteCategory(categoryDiv) {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      const index = Array.from(categoriesContainer.children).indexOf(categoryDiv);
      if (index !== -1) {
        chrome.storage.sync.get('categories', (data) => {
          let categories = data.categories || [];
          categories.splice(index, 1);
          chrome.storage.sync.set({ 'categories': categories }, () => {
            categoryDiv.remove();
          });
        });
      }
    }
  }

});