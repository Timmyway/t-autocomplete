const btnAdd = document.querySelector('#btnAdd');
// const btnSave = document.querySelector('#btnSave');
// const btnLoad = document.querySelector('#btnLoad');
const btnClear = document.querySelector('#btnClear');
const input = document.querySelector('.input');
const listContainer = document.querySelector('#list-container')
const saveIndicator = document.querySelector('#indicator--save');

var timeout = {id: null};

function createNewElement(classNames='') {    
    if (input.value.length < 1) {
        alert('Item is required');
        return;
    }
    if (timeout.id !== null) {
        console.log(timeout.id)
        clearTimeout(timeout.id);
        console.log('Timeout cleared');
    }    
    // Create a new list element
    const li = document.createElement('li');
    if (classNames) {
        console.log(classNames)
        li.classList = classNames;
    }
    li.appendChild(document.createTextNode(input.value));    
    // Create close element button
    const closeIcon = document.createElement('i');
    closeIcon.className = 'close fa fa-times btn btn-icon text-danger';    

    li.appendChild(closeIcon);
    listContainer.appendChild(li);
    input.value = '';
    timeout.id = setTimeout(() => {
        saveItems();
        console.log(timeout.id);
    }, 2500)
}

function addItem(e) {        
    e.preventDefault();
    createNewElement();    
}

function addItemKeydown(e) {
    if (e.keyCode === 13) {
        createNewElement();        
    }
}

function removeItem(e) {
    if (timeout.id !== null) {
        console.log(timeout.id)
        clearTimeout(timeout.id);
        console.log('Timeout cleared');
    }
    if (e.target.classList.contains('close')) {
        console.log('Deleting the item');
        e.target.parentElement.remove();
    } else {
        e.target.classList.toggle('is-done');    
    }
    timeout.id = setTimeout(() => {
        saveItems();
        console.log(timeout.id);
    }, 2500)
}

function loadItems() {
    console.log('Load items');
    let todos = JSON.parse(localStorage.getItem('todos'));
    if (todos) {
        console.log('Loaded items: ', todos);
        todos.forEach(todo => {
            input.value = todo.text;
            createNewElement(todo.classNames);
        });
    }    
}

function saveItems() {
    saveIndicator.style.display = 'block';
    console.log('Save item to localstorage');
    let todos = [...document.querySelectorAll('#list-container li')]
    .map((li) => {
        return {text: li.textContent, classNames: li.className}
    });    
    console.log(todos);
    localStorage.setItem('todos', JSON.stringify(todos));
    console.log('Saved to localstorage');    
    setTimeout(() => {
        saveIndicator.style.display = 'none';
    }, 1000)
}

function clearItems() {
    listContainer.innerHTML = '';
    localStorage.clear();    
}

// Features: add, remove, mark as done
btnAdd.addEventListener('click', addItem);
// btnSave.addEventListener('click', saveItems);
// btnLoad.addEventListener('click', loadItems);
btnClear.addEventListener('click', clearItems);
listContainer.addEventListener('click', removeItem);
input.addEventListener('keydown', addItemKeydown);

loadItems();