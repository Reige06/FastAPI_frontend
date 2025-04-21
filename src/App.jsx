import { useState, useEffect } from "react";
import "./index.css";
import profile from "./assets/Images/3.png";
import axios from "axios";

const API_URL = "https://fastapi-backend-f2k4.onrender.com/api/todos/"

function App() {
  const [task, setTask] = useState([]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("all");

  // Load dark mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Fetch Task from Backend
  useEffect(() => {
    axios.get(API_URL)
    .then((Response) => setTask(Response.data))
    .catch((error) => console.error('Error fetching data:', error));
  }, []);


  // Add Task
  const addTask = () => {
    if (input.trim() === "") return;
  
    const newTask = { description: input, status: "pending" };  
  
    axios.post(API_URL, newTask, { headers: { "Content-Type": "application/json" } })
      .then(response => {
        if (response.data) {
          setTask(prevTasks => [...prevTasks, response.data]);
          setInput(""); 
        } else {
          console.error("Invalid response:", response);
        }
      })
      .catch(error => console.error("Error adding task:", error.response?.data || error.message));
  };

  // Toggle Task Completion
  const toggleComplete = (id, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";  

    axios.patch(`${API_URL}${id}/`, { status: newStatus })
      .then(response => {
        setTask(task.map(todo => (todo.id === id ? { ...response.data, editing: false } : todo)));
      })
      .catch(error => console.error("Error updating task:", error));
};

  // Enable Editing Mode
  const enableEditing = (id) => {
    setTask(task.map(todo => (todo.id === id ? { ...todo, editing: true } : todo)));
  };

  // Save Edited Task
  const saveEdit = (id, newDescription) => {
    if (newDescription.trim() === "") return;

    axios.patch(`${API_URL}${id}/`, { description: newDescription })
      .then(response => {
        setTask(task.map(todo => 
          todo.id === id ? { ...response.data, editing: false } : todo
        ));
      })
      .catch(error => console.error("Error updating task:", error));
};

  // Cancel Edit
  const cancelEdit = (id) => {
    setTask(task.map(todo => (todo.id === id ? { ...todo, editing: false } : todo)));
  };

  // Delete Task
  const deleteTodo = (id) => {
    axios.delete(`${API_URL}${id}/`)
      .then(() => setTask(task.filter(todo => todo.id !== id)))
      .catch(error => console.error("Error deleting task:", error.response?.data || error.message));
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Filter Tasks
  const filteredTask = task.filter(todo => {
    if (filter === "completed") return todo.status === "completed"; 
    if (filter === "pending") return todo.status === "pending";
    return true;
  });

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>

      {/* Left Side: Profile Section */}
      <div className="profile-container">
        <img src={profile} alt="Profile" className="profile-img" />
        <h2>Reige J Bongo</h2>
        <p>Admin@domain.com</p>
      </div>  

      {/* Right Side: Tasks Section */}
      <div className="tasks-container">
        <div className="header">
          <h1>Todo List App</h1>
          <div className="title">
            <h2>Tasks</h2>
            <button className="toggle-btn" onClick={toggleDarkMode}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>

        {/* Create Task */}
        <div className="task-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Create a task..."
          />
          <button onClick={addTask}>Add</button>
        </div>

        {/* Filter Buttons */}
        <div className="filters">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("completed")}>Completed</button>
          <button onClick={() => setFilter("pending")}>Pending</button>
        </div>

        {/* Task List */}
        <ul className="task-list">
          {filteredTask.map(todo => (
            <li key={todo.id} className={todo.status === "completed" ? "completed" : "pending"}>
              
              {/* Left Side */}
              <div className="task-left">
                <input
                  type="checkbox"
                  checked={todo.status === "completed"}
                  onChange={() => toggleComplete(todo.id, todo.status)}
                />
                {todo.editing ? (
                  <input
                    type="text"
                    defaultValue={todo.description}
                    onBlur={(e) => saveEdit(todo.id, e.target.value)}
                    autoFocus
                  />
                ) : (
                  <span>{todo.description}</span>
                )}
              </div>

              {/* Right Side */}
              <div className="task-right">
                {todo.editing ? (
                  <>
                    <button onClick={() => saveEdit(todo.id, input)} className="save-btn">✔</button>
                    <button onClick={() => cancelEdit(todo.id)} className="cancel-btn">✖</button>
                  </>
                ) : (
                  <button onClick={() => enableEditing(todo.id)} className="edit-btn">✏️</button>
                )}
                
                <button onClick={() => deleteTodo(todo.id)} className="delete-btn">🗑️</button>
              </div>

            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
