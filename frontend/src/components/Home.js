import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home">
            <div className="hero-section">
                <h1>Welcome to AK Hospital </h1>
                <p>Book appointments with our expert doctors and manage your healthcare needs efficiently.</p>
                <button 
                    className="book-now-btn"
                    onClick={() => navigate('/book-appointment')}
                >
                    Book an Appointment Now
                </button>
            </div>

            <div className="features-section">
                <div className="feature-card">
                    <h3>Book Appointments</h3>
                    <p>Schedule appointments with our expert doctors at your convenience.</p>
                    <button onClick={() => navigate('/book-appointment')}>
                        Book Now
                    </button>
                </div>

                <div className="feature-card">
                    <h3>Our Doctors</h3>
                    <p>View our team of experienced and qualified medical professionals.</p>
                    <button onClick={() => navigate('/doctors')}>
                        View Doctors
                    </button>
                </div>

                <div className="feature-card">
                    <h3>View Appointments</h3>
                    <p>Check and manage your upcoming and past appointments.</p>
                    <button onClick={() => navigate('/appointments')}>
                        View All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
