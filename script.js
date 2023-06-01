window.addEventListener('DOMContentLoaded', () => {
  
  let tasks = [];
  
  const content = document.querySelector('.content');
  const inputItem = document.querySelector('.input-item');
  const inputAmount = document.querySelector('.input-amount');
  
  window.addEventListener('click', event => {
    // jika element yang ditekan memiliki class "btn-modal", maka jalankan fungsi clear()
    if (event.target.classList.contains('btn-modal')) clear();
  });
  
  function clear() {
    // bersihkan value input
    const form = document.querySelector('.form');
    form.reset();
  }
  
  // ketika tombol submit ditekan, jalankan fungsi addTransaction()
  const btnSubmit = document.querySelector('.btn-submit');
  btnSubmit.addEventListener('click', addTransaction);
  
  function addTransaction(event) {
    // mencegah aksi default dari element HTML seperti link, form dan lain sebagainya
    event.preventDefault();
    // value input
    const object = getInputValues();
    // lakukan validasi
    if (validate(object)) {
      // cek apakah data yang diinputkan sudah pernah dibuat
      // jika data sudah pernah dibuat
      if (isDataExist(object)) return alerts('error', 'Data is already in the list!');
      // masukkan isi variabel "object" ke variabel "tasks"
      tasks.unshift(object);
      // simpan ke localstorage
      saveToLocalStorage();
      // beri pesan bahwa "transaksi berhasil ditambahkan"
      alerts('success', 'New transaction has been added!');
      // muat data yang sudah disimpan kedalam localstorage
      loadData();
      // bersihkan value input
      clear();
    }
  }
  
  function convertToCurrency(price) {
    price = price.toLocaleString('US', { style: 'currency', currency: 'USD' });
    return price;
  }
  
  function getInputValues() {
    return {
      item: inputItem.value.trim(),
      amount: inputAmount.value.trim()
    };
  }
  
  function validate({ item, amount }) {
    // jika semua input masih kosong
    if (!item && !amount) return alerts('error', 'all field is empty!');
    // jika input "item" kosong
    if (!item) return alerts('error', 'field item is empty!');
    // jika input "amount" kosong
    if (!amount) return alerts('error', 'field amount is empty!');
    // jika jumlah karakter pada input "item" terlalu panjang
    if (item.length > 30) return alerts('error', 'field item must be less than 30 character!');
    // jika input "amount" berisi sebuah spasi
    if (amount.match(/\s/g)) return alerts('error', 'The amount field can only contain numbers and no spaces');
    // jika jumlah karakter pada input "amount" terlalu panjang
    if (amount.length > 10) return alerts('error', 'field amount must be no more than 10 character!');
    // jika berhasil melewati semua validasi
    return true;
  }
  
  function isDataExist({ item, amount }) {
    // hasil default apabila data belum pernah dibuat sama sekali
    let exist = false;
    // looping variabel "tasks"
    tasks.forEach(task => {
      // apabila data sudah pernah dibuat
      if (task.item == item && task.amount == amount) exist = true;
    });
    // kembalikan nilai berupa boolean true atau false
    return exist;
  }
  
  function saveToLocalStorage() {
    /*
      simpan isi variabel "tasks" kedalam localstorage dan parsing isi 
      variabel "tasks" menjadi string JSON
    */
    localStorage.setItem('expense-tracker-app', JSON.stringify(tasks));
  }
  
  function updateUI(param, index) {
    // render data dan jadikan element HTML
    const result = showUI(param, index);
    // tampilkan hasilnya
    content.insertAdjacentHTML('beforeend', result);
  }
  
  function showUI({item, amount}, index) {
    // Math.abs() berguna untuk mengkonversikan angka minus menajadi angka biasa
    return `
    <div class="box-content shadow-sm ${setString(amount, 'expense', 'income')}" data-id="${index}">
      <h6 class="fw-normal my-auto">${item}</h6>
      <h5 class="fw-normal my-auto ${setString(amount, 'text-red', 'text-green')}">
       ${setString(amount, '-', '+')} ${convertToCurrency(Math.abs(amount))}
      </h5>
    </div>
    `;
  }
  
  function setString(amount, string1, string2) {
    /*
      jika isi parameter "amount" lebih kecil dari angka 0
      maka kembalikan nilai berupa isi parameter "string1" dan kembalikan nilai
      dari isi parameter "string2" jika parameter "amount" lebih besar dari angka 0
    */
    return (amount < 0) ? string1 : string2;
  }
  
  function updateBalance() {
    // looping variabel "tasks" dan ambil object dengan properti "amount"
    const amount = tasks.map(task => parseFloat(task.amount));
    // jumlahkan semua isi dari variabel "amount"
    const total = amount.reduce((acc, num) => acc += num, 0);
    // cari isi dari variabel "amount" yang lebih besar dari angka 0, lalu jumlahkan
    const income = amount
      .filter(number => number > 0)
      .reduce((acc, num) => acc += num, 0);
    /*
      cari isi dari variabel "amount" yang lebih kecil dari angka 0, lalu jumlahkan.
      dan jika sudah dijumlahkan, maka kalikan dengan -1 supaya hasilnya bukan berupa angka minus
      contohnya seperti ini, hasil awal : -50 × -1, maka hasilnya akan menjadi 50
    */
    const expense = amount
      .filter(number => number < 0)
      .reduce((acc, num) => acc += num, 0) * -1;
    // angka 0 diakhir pada fungsi reduce() merupakan hasil dsfault
    // set isi variabel, total, income dan expense
    setValue(total, income, expense);
  }
  
  function setValue(total, income, expense) {
    // set value dari tiap parameter
    document.querySelector('.balance').textContent = `${filterBalance(convertToCurrency(total))}`;
    document.querySelector('.income').textContent = `${convertToCurrency(income)}`;
    document.querySelector('.expense').textContent = `${convertToCurrency(expense)}`;
  }
  
  function filterBalance(total) {
    /*
      jika isi parametwr "total" lebih kecil dari angka 0, maka berikan string beruoa "-$" dibagian depan
      dan jalankan fungsi Math.abs() guna untuk mengkonversikan angka minus menjadi angka biasa
      hasil awal : -$-100 menjadi -$100
    */
    return (total < 0) ? `- ${Math.abs(total)}` : `${total}`;
  }
  
  function alerts(type, text) {
    // plugin dari "sweetalert2"
    swal.fire ({
      icon: type,
      title: 'Alert',
      text: text
    });
  }
  
  function loadData() {
    resetState();
    // dapatkan data yang sudah disimpan kedalam localstorage
    const data = localStorage.getItem('expense-tracker-app');
    /*
      jika variabel "data" menghasilkan boolean "true" maka parsing data tersebut dan masukkan datanya 
      kedalam variabel "tasks". tapi jika variabel "data" menghasilkan boolean "false"
      maka ganti isi variabel "tasks" menjadi array kosong.
    */
    tasks = (data) ? JSON.parse(data) : [];
    // looping isi variabel "tasks"
    tasks.forEach((task, index) => {
      // update total pemasukan dan pengeluaran
      updateBalance();
      // tampilkan element yang ke halaman
      updateUI(task, index);
    });
  }
  
  loadData();
  
  // hapus data
  window.addEventListener('click', event => {
    // jika element yang ditekan memiliki class "box" 
    if (event.target.classList.contains('box-content')) {
      // dapatkan isi atribut "data-id" dari element yang ditekan
      const id = event.target.dataset.id;
      // jalankan fungsi deleteData()
      deleteData(id);
    }
  });
  
  function deleteData(id) {
    // plugin dari "sweetalert2"
    swal.fire ({
      icon: 'info',
      title: 'are you sure?',
      text: 'do you want to delete this data?',
      showCancelButton: true
    })
    .then(response => {
      // jika tombol yang ditekan bertuliskan "ok" atau "yes"
      if (response.isConfirmed) {
        // hapus element array dari variabel "tasks" berdasarkan isi paramter "id"
        tasks.splice(id, 1);
        // simpan perubahannya kedalam localstorage
        saveToLocalStorage();
        // beri pesan bahwa "data transaksi berhasil dihapus"
        alerts('success', 'Data transaction has been deleted!');
        // muat data yang ada di localstorage
        loadData();
      }
    });
  }
  
  // pencarian data
  const searchInput = document.querySelector('.search-input');
  searchInput.addEventListener('keyup', function() {
    // value 
    const value = this.value.trim();
    // konversikan "Nodelist" menjadi "array" supaya bisa dilooping
    const result = Array.from(content.children);
    result.forEach(data => {
      // data string 
      const string = data.textContent.toLowerCase();
      // tampilkan data yang serupa dengan isi "input pencarian"
      data.style.display = (string.indexOf(value) != -1) ? '' : 'none';
    });
  });
  
  function resetState() {
    content.innerHTML = '';
    document.querySelector('.balance').textContent = `$0`;
    document.querySelector('.income').textContent = `$0`;
    document.querySelector('.expense').textContent = '$0';
  }
  
});