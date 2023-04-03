window.onload = () => {
  
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
    inputItem.value = '';
    inputAmount.value = '';
  }
  
  // ketika tombol submit ditekan, jalankan fungsi addTransaction()
  const btnSubmit = document.querySelector('.btn-submit');
  btnSubmit.addEventListener('click', addTransaction);
  
  function addTransaction() {
    // value input
    const item = inputItem.value.trim();
    const amount = inputAmount.value.trim();
    // lakukan validasi
    if (validate(item, amount) == true) {
      // masukkan value input sebagai "objek"
      const object = {item: item, amount: parseFloat(amount)};
      // masukkan isi variabel "object" ke variabel "tasks"
      tasks.push(object);
      // simpan ke localstorage
      saveToLocalStorage();
      // tampilkan element ke halaman
      updateUI(object);
      // total semua pemasukan dan pengeluaran
      updateBalance();
      // beri pesan bahwa "transaksi berhasil ditambahkan"
      alerts('success', 'New transaction has been added!');
      // muat data yang sudah disimpan kedalam localstorage
      loadData();
      // bersihkan value input
      clear();
    }
  }
  
  function validate(item, amount) {
    // jika semua input masih kosong
    if (!item && !amount) return alerts('error', 'field`s was empty!');
    // jika input "item" kosong
    if (!item) return alert('error', 'field item was empty!');
    // jika input "amount" kosong
    if (!amount) return alert('error', 'field amount was empty!');
    // jika jumlah karakter pada input "item" terlalu panjang
    if (item.length > 50) return alerta('error', 'field item must be less then 50 character!');
    // jika input "amount" berisi sebuah spasi
    if (amount.match(/\s/g)) return alerts('error', 'The amount field can only contain numbers and no spaces');
    // jika jumlah karakter pada input "amount" terlalu panjang
    if (amount.length > 10) return alerts('error', 'field amount must be less then 10 character!');
    // jika berhasil melewati semua validasi
    return true;
  }
  
  function saveToLocalStorage() {
    /*
      simpan isi variabel "tasks" kedalam localstorage dan parsing isi 
      variabel "tasks" menjadi string JSON
    */
    localStorage.setItem('expense-app', JSON.stringify(tasks));
  }
  
  function updateUI(param, index) {
    // bersihkan isi element "content"
    const result = showUI(param, index);
    content.insertAdjacentHTML('beforeend', result);
  }
  
  function showUI({item, amount}, index) {
    // Math.abs() berguna untuk mengkonversikan angka minus menajadi angka biasa
    return `
    <div class="box-content shadow-sm ${setString(amount, 'expense', 'income')}" data-id="${index}">
      <h6 class="fw-normal my-auto">${item}</h6>
      <h5 class="fw-normal my-auto ${setString(amount, 'text-red', 'text-green')}">
        ${setString(amount, '-', '+')} $${Math.abs(amount)}
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
    const amount = tasks.map(task => task.amount);
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
  
  const balance = document.querySelector('.balance');
  const incomeText = document.querySelector('.income');
  const expenseText = document.querySelector('.expense');
  
  function setValue(total, income, expense) {
    // set value dari tiap parameter
    balance.textContent = `${filterBalance(total)}`;
    incomeText.textContent = `$${income}`;
    expenseText.textContent = `$${expense}`;
  }
  
  function filterBalance(total) {
    /*
      jika isi parametwr "total" lebih kecil dari angka 0, maka berikan string beruoa "-$" dibagian depan
      dan jalankan fungsi Math.abs() guna untuk mengkonversikan angka minus menjadi angka biasa
      hasil awal : -$-100 menjadi -$100
    */
    return (total < 0) ? `- $${Math.abs(total)}` : `$${total}`;
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
    // bersihkan isi element "content"
    content.innerHTML = '';
    // dapatkan data yang sudah disimpan kedalam localstorage
    const data = localStorage.getItem('expense-app');
    /*
      jika variabel "data" menghasilkan boolean "true" maka parsing data tersebut dan masukkan datanya 
      kedalam variabel "tasks". tapi jika variabel "data" menghasilkan boolean "false"
      maka ganti isi variabel "tasks" menjadi array kosong.
    */
    tasks = (data) ? JSON.parse(data) : [];
    // looping isi variabel "tasks"
    tasks.forEach((task, index) => {
      // tampilkan element yang ke halaman
      updateUI(task, index);
      // update total pemasukan dan pengeluaran
      updateBalance();
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
        // update total pemasukan dan pengeluaran
        updateBalance();
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
  
}