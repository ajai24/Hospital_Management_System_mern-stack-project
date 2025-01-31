import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="home-link">
                    <i className="fas fa-home"></i>
                    <span>Home</span>
                </Link>
                <h1>AK Hospital </h1>
            </div>
            <ul className="nav-links">
                <li>
                    <Link to="/doctors">Doctors</Link>
                </li>
                <li>
                    <Link to="/appointments">Appointments</Link>
                </li>
                <li>
                    <Link to="/book-appointment" className="book-appointment-btn">Book Appointment</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
