import React from "react";

// taken partly from the redux Todo example

export default class TodoTextInput extends React.Component {
  state = {
    text: this.props.text || ""
  };

  handleSubmit = e => {
    const text = e.target.value.trim();
    if (e.which === 13 && text !== "") {
      this.props.onSave(text);
      if (this.props.newTodo) {
        this.setState({ text: "" });
      }
    }
  };

  handleChange = e => {
    this.setState({ text: e.target.value });
  };

  render() {
    return (
      <input
        className={
          this.props.editing ? "edit" : this.props.newTodo ? "new-todo" : ""
        }
        type="text"
        placeholder={this.props.placeholder}
        autoFocus="true"
        value={this.state.text}
        onChange={this.handleChange}
        onKeyDown={this.handleSubmit}
      />
    );
  }
}
