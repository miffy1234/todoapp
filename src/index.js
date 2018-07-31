import React from "react";
import { render } from "react-dom";
import { chan, go, timeout, take, put, putAsync, buffers } from "js-csp";
import R from "ramda";
import { SHOW_ALL } from "./constants";
import App from "./components/App";

const initialState = {
  items: [],
  isLoading: false,
  filter: SHOW_ALL
};

let createStore = function(state) {
  let _state = state;
  return {
    get: () => _state,
    set: state => {
      _state = state;
    }
  };
};

// helper
const createRender = R.curry((node, app) => render(app, node));

// create App channel... and render function
const AppChannel = chan(buffers.sliding(1));
const doRender = createRender(document.getElementById("root"));
const store = createStore(initialState);

function* fetchItems() {
  yield timeout(2000);
  return [{ id: 10001, text: "foo" }, { id: 10002, text: "bar" }];
}

const createChannel = (action, store) => {
  const ch = chan();
  go(function*() {
    while (true) {
      const value = yield take(ch);
      yield put(AppChannel, action(store.get(), value));
    }
  });
  return ch;
};

// helper function for passing an object and getting channels
const createChannels = (actions, store) =>
  R.map(action => createChannel(action, store), actions);

// channels...
const getItems = (isLoading, todos) => {
  return go(function*() {
    yield put(isLoading, true);
    const fetchedItems = yield* fetchItems();
    yield put(todos, fetchedItems);
    yield timeout(10);
    yield put(isLoading, false);
  });
};

const getNextId = R.compose(
  R.inc,
  R.reduce(R.max, 0),
  R.pluck("id")
);

const Actions = {
  isLoading: (model, isLoading) => R.assoc("isLoading", isLoading, model),
  loadItems: (model, items) =>
    R.assoc("items", R.concat(R.prop("items", model), items), model),
  addItem: (model, text) =>
    R.assoc(
      "items",
      R.append(
        { text, id: getNextId(R.prop("items", model)), completed: false },
        R.prop("items", model)
      ),
      model
    ),
  removeItem: (model, id) =>
    R.assoc(
      "items",
      R.filter(item => item.id !== id, R.prop("items", model)),
      model
    ),
  editItem: (model, [id, text]) => {
    const index = R.findIndex(R.propEq("id", id), R.prop("items", model));
    return R.assocPath(["items", index, "text"], text, model);
  },
  updateFilter: (model, filter) => R.assoc("filter", filter, model),
  completeTodo: (model, id) => {
    const index = R.findIndex(R.propEq("id", id), R.prop("items", model));
    return R.assocPath(
      ["items", index, "completed"],
      R.not(R.path(["items", index, "completed"], model)),
      model
    );
  },
  completeAll: model => {
    const items = R.prop("items", model);
    const toggleState = R.all(R.prop("completed"), items);
    return R.assoc(
      "items",
      R.map(item => R.assoc("completed", !toggleState, item), items),
      model
    );
  },
  clearCompleted: model =>
    R.assoc(
      "items",
      R.reject(R.prop("completed"), R.prop("items", model)),
      model
    )
};

const AppStart = (Actions, store, Component) => {
  const actions = createChannels(Actions, store);
  // initial render...
  putAsync(AppChannel, store.get());
  go(function*() {
    while (true) {
      store.set(yield take(AppChannel));
      doRender(
        <Component {...store.get()} actions={R.merge(actions, { getItems })} />
      );
    }
  });
};

// start
AppStart(Actions, store, App);
