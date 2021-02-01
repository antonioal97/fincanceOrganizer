const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

//Último item
//Armazenamento no local storage do browser
//Foi alterada a posição dele para funcionamento da aplicação
const Storage = {
  get(){
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
  },
  set(transactions){
    //O localstorage só armazena string
    localStorage.setItem("dev.finances: transactions", JSON.stringify(transactions));
  }
};

//1º Objeto contendo as funções
const Transaction = {
  //Array contendo as transações
  //Pratica sobre manipulação de array
  all: Storage.get(),
  // [
  //   {
  //     description: "Luz",
  //     amount: -50000,
  //     date: "23/01/2021",
  //   },
  //   {
  //     description: "Website",
  //     amount: 500000,
  //     date: "23/01/2021",
  //   },
  //   {
  //     description: "Internet",
  //     amount: -20000,
  //     date: "23/01/2021",
  //   },
  // ], 
  add(transaction) {
    Transaction.all.push(transaction);
    // console.log(Transaction.all)
    App.reload();
  },
  remove(index){
    //Método SLICE é aplicado em arrays.
    //Ele recebe um index, e quantos valores quero excluir 
    Transaction.all.splice(index, 1);
    App.reload();
  },
  incomes() {
    let income = 0;
    // pegar todas as transações
    // para cada transação
    Transaction.all.forEach(transaction => {
      // se ela for maior que zero
      if (transaction.amount > 0){
        // somar a uma variável e retornar a variável
        income += transaction.amount;
      }
    })
    return income;
  },
  expenses() {
    let expenses = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0){
        expenses += transaction.amount;
      }
    })
    return expenses;
  },
  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
};

const DOM = {
  //Atributo do container da tabela
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    //1 - criei um elemento na DOM através do JS
    const tr = document.createElement("tr");

    //2 - Faço a função innerHTMLTransaction um filho do recem criado <tr></tr>
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);

    //Insere o atributo 'data-index' no html
    //Atribui a ele o valor do 'index'
    tr.dataset.index = index;

    //inserindo as linhas dentro da tabela atavés do atributo transactionsContainer.
    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
      <tr>
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}"> ${amount}</td>
        <td class="date">${transaction.date}</td>
        <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
      </tr>
    `;

    return html;
  },

  //Retornar os valores calculados para o usuário
  updateBalance() {
    document
            .getElementById("incomeDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.incomes());
    document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expenses());
    document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total());
  },

  clearTransactions() {
    // DOM.transactionsContainer.innerHTML = "";
    DOM.transactionsContainer.innerHTML = "";
  },
};

//Formatação do número para o front - end
const Utils = {
  formatAmount(value){
    value = Number(value.replace(/\,\./g, "")) * 100;
    // value = Number(value) * 100;

    return value;
  },
  formatDate(date){
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};

//Contém dados do formulário e suas ações
const Form = {
  //Conexão do JS com o html para receber os dados.
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  // 2
  getValues(){
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  //3
  validateFields(){
    const { description, amount, date } = Form.getValues();

    if(description.trim() === "" ||
       amount.trim() === "" ||
       date.trim() === ""){
         throw new Error(" Por favor, preencha todos os campos")
       }

    console.log(description);
  },

  formatValues(){
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date
    }
  },

  clearFields(){
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event){
    //1 - Fazer com que o comportamento padrão não seja executado
    event.preventDefault();

    try{
      //2 - Verificar se todas as infos estão preechidas
      // Form.validateFields();
      
      //3 - Formatar os dados para salvar
      const transaction = Form.formatValues();
      
      //4 - salvar
      Transaction.add(transaction);
      
      //5 - Apagar os dados do formulário
      Form.clearFields();
      
      //6 - fechar o modal
      Modal.close();
      
      //7 - Atualizar a aplicação
      //Quando adiciono uma transação, o app já da reload
      // App.reload();
    } catch(error){
      alert(error.message);
    }
  }
};

//Iniciar o aplicativo e atualizar novos valores
const App = {
  init() {
    // Transaction.all.forEach(transaction, index => {
    //   DOM.addTransaction(transaction, index);
    // });
        //shorthand da arrow function
    Transaction.all.forEach(DOM.addTransaction)

    
    DOM.updateBalance();

    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
