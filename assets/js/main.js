// Product 클래스: 제품을 나타내는 클래스
class Product {
  constructor(productNumber, serialNumber, purchaseDate) {
    this.productNumber = productNumber;
    this.serialNumber = serialNumber;
    this.purchaseDate = purchaseDate;
  }
}

// UI 클래스: UI 관련 작업 처리
class UI {
  editMode = false;
  editTarget = null;

  static displayProducts() {
    const products = Store.getProducts();
    products.forEach((product) => {
      UI.addProductToList(product);
    });
  }

  static addProductToList(product) {
    const table = document.querySelector('#product-list');
    const row = document.createElement('tr');

    row.innerHTML = `
              <td>${product.productNumber}</td>
              <td>${product.serialNumber}</td>
              <td>${product.purchaseDate}</td>
              <td><i class="fas fa-trash-alt text-danger" onClick="UI.removeProduct(event, '${product.serialNumber}')"></i></td>
              <td><i class="far fa-edit text-primary" onClick="UI.editProduct(event, '${product.serialNumber}')"></i></td>
          `;

    table.appendChild(row);
  }

  static checkForSerialNumber(serialNumber) {
    const products = Store.getProducts();
    return products.some((product) => product.serialNumber === serialNumber);
  }

  static updateProductToList(product) {
    if (UI.editTarget && UI.editMode) {
      let row = UI.editTarget.parentElement.parentElement;
      row.innerHTML = `
              <td>${product.productNumber}</td>
              <td>${product.serialNumber}</td>
              <td>${product.purchaseDate}</td>
              <td><i class="fas fa-trash-alt text-danger" onClick="UI.removeProduct(event, '${product.serialNumber}')"></i></td>
              <td><i class="far fa-edit text-primary" onClick="UI.editProduct(event, '${product.serialNumber}')"></i></td>
          `;
    }
  }

  static editProduct(event, serialNumber) {
    UI.editTarget = event.target;
    UI.editMode = true;
    let productList = Store.getProducts();
    productList.forEach((product) => {
      if (product.serialNumber === serialNumber) {
        document.querySelector('#productNumber').value = product.productNumber;
        document.querySelector('#serialNumber').value = product.serialNumber;
        document.querySelector('#purchaseDate').value = product.purchaseDate;
      }
    });

    document.getElementById('submitBtn').innerHTML = 'Edit Product';
    document.querySelector('#serialNumber').disabled = true;
  }

  static removeProduct(event, serialNumber) {
    event.target.parentElement.parentElement.remove();
    Store.removeProduct(serialNumber);
    UI.showAlertMessage('Product removed', 'success');
  }

  static clearFields() {
    document.querySelector('#productNumber').value = '';
    document.querySelector('#serialNumber').value = '';
    document.querySelector('#purchaseDate').value = '';
    UI.editMode = false;
    UI.editTarget = null;
    document.querySelector('#serialNumber').disabled = false;
    document.getElementById('submitBtn').innerHTML = 'Save Product';
  }

  static showAlertMessage(message, classname) {
    const div = document.createElement('div');
    div.className = `alert alert-${classname}`;
    div.innerHTML = message;
    const container = document.querySelector('.container');
    container.insertBefore(div, document.querySelector('#product-form'));

    setTimeout(() => {
      document.querySelector('.alert').remove();
    }, 3000);
  }
}

// Store 클래스: 데이터 저장 및 관리
class Store {
  static getProducts() {
    let products;
    if (localStorage.getItem('products') === null) {
      products = [];
    } else {
      products = JSON.parse(localStorage.getItem('products'));
    }

    return products;
  }

  static addProduct(product) {
    const products = Store.getProducts();
    if (UI.editMode) {
      Store.updateProduct(product);
    } else {
      products.push(product);
      localStorage.setItem('products', JSON.stringify(products));
    }
  }

  static removeProduct(serialNumber) {
    const products = Store.getProducts();
    const updatedProducts = products.filter(
      (product) => product.serialNumber !== serialNumber
    );
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  }

  static updateProduct(product) {
    const products = Store.getProducts();
    const updatedProducts = products.map((prod) => {
      if (prod.serialNumber === product.serialNumber) {
        return product;
      }
      return prod;
    });
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  }
}

// 이벤트: 페이지 로드 시 제품 목록 표시
document.addEventListener('DOMContentLoaded', UI.displayProducts);

// 이벤트: 제품 추가 폼 제출 시
document.querySelector('#product-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const productNumber = document.querySelector('#productNumber').value;
  const serialNumber = document.querySelector('#serialNumber').value;
  const purchaseDate = document.querySelector('#purchaseDate').value;

  if (productNumber === '' || serialNumber === '' || purchaseDate === '') {
    UI.showAlertMessage('Please fill in all fields', 'danger');
  } else {
    const product = new Product(productNumber, serialNumber, purchaseDate);

    if (UI.editMode) {
      UI.updateProductToList(product);
      Store.addProduct(product);
      UI.showAlertMessage('Product updated', 'success');
      UI.clearFields();
    } else {
      const serialNumberExists = UI.checkForSerialNumber(serialNumber);
      if (serialNumberExists) {
        UI.showAlertMessage('Please enter a unique Serial Number', 'danger');
      } else {
        UI.addProductToList(product);
        Store.addProduct(product);
        UI.showAlertMessage('Product added', 'success');
        UI.clearFields();
      }
    }
  }
});
