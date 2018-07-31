import React from "react";
import { putAsync } from "js-csp";
import R from "ramda";
import TodoItem from "./TodoItem";
import TodoTextInput from "./TodoTextInput";

import { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } from "../constants";

// taken from the redux example
const TODO_FILTERS = {
  [SHOW_ALL]: () => true,
  [SHOW_ACTIVE]: todo => !todo.completed,
  [SHOW_COMPLETED]: todo => todo.completed
};

const App = ({ items, isLoading, filter, actions }) => {
  if (isLoading) return <p>loading...</p>;
  return (
    <div id="app">
      <div className="todoapp">
        <header className="header">
          <h1>Todos</h1>
          <TodoTextInput
            newTodo
            onSave={text => putAsync(actions.addItem, text)}
            placeholder="What needs to be done?"
          />
        </header>
        <section className="main">
          <input
            type="checkbox"
            className="toggle-all"
            onClick={() => putAsync(actions.completeAll)}
          />
          <ul className="todo-list">
            {R.map(
              item => (
                <TodoItem
                  key={item.id}
                  todo={item}
                  deleteTodo={id => putAsync(actions.removeItem, id)}
                  editTodo={(id, text) =>
                    putAsync(actions.editItem, [id, text])
                  }
                  completeTodo={id => putAsync(actions.completeTodo, id)}
                />
              ),
              R.filter(TODO_FILTERS[filter], items)
            )}
          </ul>
        </section>
        <footer className="footer">
          <span className="todo-count">
            <strong id="todo-items">
              {R.length(R.reject(R.prop("completed"), items))}
            </strong>
            <span> items</span>
            <span> left</span>
          </span>
          <ul className="filters">
            <li id="show-all">
              <a
                href="#"
                className={filter === SHOW_ALL ? "selected" : ""}
                onClick={() => putAsync(actions.updateFilter, SHOW_ALL)}
              >
                All
              </a>
            </li>
            <li id="show-active">
              <a
                href="#"
                className={filter === SHOW_ACTIVE ? "selected" : ""}
                onClick={() => putAsync(actions.updateFilter, SHOW_ACTIVE)}
              >
                Active
              </a>
            </li>
            <li id="show-completed">
              <a
                href="#"
                className={filter === SHOW_COMPLETED ? "selected" : ""}
                onClick={() => putAsync(actions.updateFilter, SHOW_COMPLETED)}
              >
                Completed
              </a>
            </li>
          </ul>
          {R.any(item => item.completed, items) && (
            <button
              className="clear-completed"
              onClick={() => putAsync(actions.clearCompleted)}
            >
              Clear completed
            </button>
          )}
        </footer>
      </div>
      <button
        onClick={() =>
          putAsync(actions.getItems(actions.isLoading, actions.loadItems))
        }
      >
        Load Async Items
      </button>
    </div>
  );
};

export default App;
