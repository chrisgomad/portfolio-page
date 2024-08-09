import React, { useState, useEffect } from 'react';
import logo from "./logo.svg";
import "./App.css";
import { getEntries, addEntry, updateEntry, deleteEntry } from './services/entryService';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });

  useEffect(() => {
    const fetchEntries = async () => {
      const data = await getEntries();
      setEntries(data);
    };
    fetchEntries();
  }, []);

  const handleAddEntry = async () => {
    const addedEntry = await addEntry(newEntry);
    setEntries([...entries, addedEntry]);
    setNewEntry({ title: '', content: '' }); // Reset the form
  };

  const handleUpdateEntry = async (id, updatedEntry) => {
    const updated = await updateEntry(id, updatedEntry);
    setEntries(entries.map(entry => (entry._id === id ? updated : entry)));
  };

  const handleDeleteEntry = async (id) => {
    await deleteEntry(id);
    setEntries(entries.filter(entry => entry._id !== id));
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={
              <div>
                <h1>Entries</h1>
                <ul>
                  {entries.map(entry => (
                    <li key={entry._id}>
                      {entry.title} - {entry.content}
                      <button onClick={() => handleUpdateEntry(entry._id, { title: 'Updated', content: 'Updated content' })}>Edit</button>
                      <button onClick={() => handleDeleteEntry(entry._id)}>Delete</button>
                    </li>
                  ))}
                </ul>
                <div>
                  <input
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    placeholder="Content"
                  />
                  <button onClick={handleAddEntry}>Add Entry</button>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;