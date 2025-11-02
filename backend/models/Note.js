import React from "react";

function Note({ note, onDelete }) {
  return (
    <div className="note-item">
      <p>{note.text}</p>
      <button
        className="btn btn-danger btn-small"
        onClick={() => onDelete(note._id)}
      >
        Delete
      </button>
    </div>
  );
}

export default Note;

