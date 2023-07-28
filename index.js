// Theme class to handle theme switching
class Theme {
    // Constructor sets initial theme to light and adds click event to theme button
    constructor() {
        this.html = document.documentElement;
        this.html.dataset.theme = `theme-light`;
        this.themeBtn = document.querySelector('.theme-btn');
        this.themeBtn.addEventListener('click', this.toggleTheme.bind(this));    
        
    }
    // Function to toggle theme between light and dark
    toggleTheme() {
        const themeIcon = this.themeBtn.querySelector('img');

        if (this.themeBtn.classList.contains('light')) {
            this.themeBtn.classList.remove('light');
            this.themeBtn.classList.add('dark');
            this.html.dataset.theme = 'theme-dark';
            themeIcon.src = './images/icon-sun.svg';
            themeIcon.alt = 'moon svg';
        } else {
            this.themeBtn.classList.remove('dark');
            this.themeBtn.classList.add('light');
            this.html.dataset.theme = 'theme-light';
            themeIcon.src = './images/icon-moon.svg';
            themeIcon.alt = 'sun svg';
        }
    }
}
// Components class to manage main app components and actions
class Components {
    // Constructor to set up components and event listeners
    constructor() {
        this.wrapper = document.querySelector('.wrapper');
        this.todoUl = this.wrapper.querySelector('.todos');
        this.actions = this.wrapper.querySelector('.actions');
        this.clearCompletedBtn = this.actions.querySelector('.clear-completed-btn');
        this.filterBox = this.wrapper.querySelector('.filters');
        window.addEventListener('DOMContentLoaded', () => {
            this.toggleEmptyContainer();
            this.changeUI();
        });
        window.addEventListener('resize', this.changeUI.bind(this))
    }

    // Function to create an empty container for todo items
    emptyGenerator() {
        const empty = document.createElement('div');
        empty.className = "empty-container";
        empty.textContent = "No todo items left!";
        return empty;
    }

    // Function to change UI layout based on window size
    changeUI() {
        if (window.innerWidth >= 1180) {
            this.actions.insertBefore(this.filterBox, this.clearCompletedBtn);
            this.filterBox.classList.add('clear-margin')
        } else {
            this.wrapper.insertBefore(this.filterBox, document.querySelector('.drag-help-info'));
            this.filterBox.classList.remove('clear-margin');
        }
    }

    // Function to check for empty todo container and display message
    toggleEmptyContainer() {
        switch (this.todoUl.childElementCount) {
            case 0:
                this.todoUl.append(this.emptyGenerator());
                break;
            default:
                if (this.todoUl.querySelector('.empty-container')) {
                    this.todoUl.querySelector('.empty-container').remove();
                };
                break;
        }
    }

    // Function to generate HTML for a new todo item
    todoGenerator(text) {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.draggable = true;
        todoItem.innerHTML = `
                        <label class="check-label">
                            <input type="checkbox">
                            <span class="check-round"></span>
                        </label>
                        <li class="todo">${text}</li>
                        <button class="btn delete"><img src="./images/icon-cross.svg" alt="cross svg"></button>
    `;

        const label = todoItem.querySelector('label');
        const li = todoItem.querySelector('li');
        const button = todoItem.querySelector('button');

        return [todoItem, label, li, button];
    }
}
// TodoItem class to handle todo items and their actions
class TodoItem extends Components {
    constructor() {
        super();
        this.addTodoBtn = document.querySelector('.add-todo');
        this.addTodoBtn.addEventListener('click', this.addTodo.bind(this));
        this.clearCompletedBtn.addEventListener('click', this.clearCompletedHandler.bind(this));
    }

     // Function to count active todo items
    activeTodoCount() {
        const count = this.actions.querySelector('#count');
        const wholeCount = this.todoUl.querySelectorAll('.todo-item').length;
        const inactiveCount = this.todoUl.querySelectorAll('.todo-item.strike').length;
        const activeCount = wholeCount - inactiveCount;
        count.textContent = activeCount;
    }

    // Function to add a new todo
    addTodo(e) {
        e.preventDefault();
        // getting input text
        const todoInput = document.getElementById('todo-input');
        const text = todoInput.value;
        if (text === '') return;
        const [todoItem, checkLabel, todoLi, deleteBtn] = this.todoGenerator(text);

        // adding todo
        this.todoUl.append(todoItem);
        this.toggleEmptyContainer();
        this.activeTodoCount()

        // clearing the input
        todoInput.value = '';

        // event delegation is used here.
        todoItem.addEventListener('click', e => {
            if (e.target === checkLabel || checkLabel.querySelector('span') || checkLabel.querySelector('input')) {
                if (checkLabel.querySelector('input').checked) {
                    todoItem.classList.add('strike');
                    this.activeTodoCount();
                } else {
                    todoItem.classList.remove('strike');
                    this.activeTodoCount();
                }
            }
            

            if (e.target === todoLi) {
                if (e.target.closest('div.todo-item').classList.contains('strike')) {
                    e.target.closest('div.todo-item').classList.remove('strike');
                    checkLabel.querySelector('input').checked = false;
                    this.activeTodoCount();
                } else {
                    e.target.closest('div.todo-item').classList.add('strike');
                    checkLabel.querySelector('input').checked = true;
                    this.activeTodoCount();
                }
            }

            if (e.target === deleteBtn || e.target === deleteBtn.querySelector('img')) {
                e.target.closest('div.todo-item').classList.add('slide');
                e.target.closest('div.todo-item').addEventListener('animationend', this.removeTodo.bind(this, todoItem));
            }
        });

        todoItem.addEventListener('dragstart', e => {
            console.log('dragstart');
            todoItem.classList.add('ondrag');
        });
        todoItem.addEventListener('dragend', e => {
            console.log('dragend');
            todoItem.classList.remove('ondrag');
        });

        this.todoUl.addEventListener('dragenter', e => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(this.todoUl, e.clientY)
            const draggable = document.querySelector('.ondrag')
            if (afterElement == null) {
                this.todoUl.appendChild(draggable)
            } else {
                this.todoUl.insertBefore(draggable, afterElement)
            }
        });
    }
    // Function to handle dragging and reordering todo items
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.todo-item:not(.ondrag)')]

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = y - box.top - box.height / 2
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child }
            } else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element
    }

    // Function to handle todo item removal
    removeTodo(todoItem) {
        todoItem.remove();
        this.toggleEmptyContainer();
        this.activeTodoCount();
    }
    // Function to handle clearing completed todo items
    clearCompletedHandler(e) {
        e.preventDefault();
        const completedTodos = this.todoUl.querySelectorAll('.todo-item.strike');
        if (completedTodos.length === 0) return;
        completedTodos.forEach(completedTodo => {
            // completedTodo.remove();
            completedTodo.querySelector('.delete').click();
        })
        this.toggleEmptyContainer();
    }
}
// Filters class to manage filtering of todo items
class Filters {
    constructor() {
        this.todo = new TodoItem();
        this.todo.filterBox.addEventListener('click', this.filterBtnsHandler.bind(this));
    }
    // Function to filter todo items based on status (all, active, completed)
    filterHandler(className = 'all') {
        const allTodo = [...this.todo.todoUl.querySelectorAll('.todo-item')];

        switch (className) {
            case 'completed':
                if (this.todo.todoUl.querySelectorAll('.strike').length === 0) {
                    alert('No completed items left!');
                    return;
                }
                allTodo.forEach(todo => {
                    if (todo.classList.contains('strike')) {
                        todo.style.display = 'flex';
                    } else {
                        todo.style.display = 'none';
                    }
                })
                break;
            case 'live':
                if (this.todo.todoUl.querySelectorAll('.strike').length === allTodo.length) {
                    alert('No active items left!');
                    return;
                }
                allTodo.forEach(todo => {
                    if (!todo.classList.contains('strike')) {
                        todo.style.display = 'flex';
                    } else {
                        todo.style.display = 'none';
                    }
                })
                break;
            case 'all':
                allTodo.forEach(todo => {
                    todo.removeAttribute('style');
                });
                break;
        }
    }
    // Function to handle filter button clicks
    filterBtnsHandler(e) {
        e.preventDefault();
        const allBtn = this.todo.filterBox.querySelector('.all');
        const liveBtn = this.todo.filterBox.querySelector('.live');
        const completedBtn = this.todo.filterBox.querySelector('.completed-btn');

        let refValue;

        if (e.target.classList.contains('completed-btn')) {
            refValue = 'completed';
            allBtn.classList.remove('active');
            liveBtn.classList.remove('active');
            completedBtn.classList.add('active');
        } else if (e.target.classList.contains('live')) {
            refValue = 'live';
            allBtn.classList.remove('active');
            liveBtn.classList.add('active');
            completedBtn.classList.remove('active');
        } else if (e.target.classList.contains('all')) {
            refValue = 'all';
            allBtn.classList.add('active');
            liveBtn.classList.remove('active');
            completedBtn.classList.remove('active');
        }

        this.filterHandler(refValue);
    }
}
// App class to initialize the application
class App {
    static init() {
        new Theme();
        new Filters();
    }
}
// the App.init() method to start the application
App.init();

