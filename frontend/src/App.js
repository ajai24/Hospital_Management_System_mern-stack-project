import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DoctorList from './components/DoctorList';
import DoctorForm from './components/DoctorForm';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/add-doctor" element={<DoctorForm />} />
            
            <Route path="/edit-doctor/:id" element={<DoctorForm />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/book-appointment" element={<AppointmentForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
