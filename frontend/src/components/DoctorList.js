import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DoctorList.css';

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            console.log('Fetching doctors...');
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/doctors');
            console.log('Doctors data:', response.data);
            setDoctors(response.data);
            setError('');
        } catch (err) {
            console.error('Error details:', err);
            setError('Error fetching doctors. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this doctor?')) {
            try {
                await axios.delete(`http://localhost:5000/api/doctors/${id}`);
                setDoctors(doctors.filter(doctor => doctor._id !== id));
            } catch (err) {
                setError('Error deleting doctor. Please try again.');
                console.error('Error:', err);
            }
        }
    };

    const filteredDoctors = doctors.filter(doctor => {
        const searchString = searchTerm.toLowerCase();
        return (
            doctor.name.toLowerCase().includes(searchString) ||
            doctor.specialization.toLowerCase().includes(searchString)
        );
    });

    if (loading) {
        return (
            <div className="loading">
                <h2>Loading Doctors...</h2>
                <p>Please wait while we fetch the doctor list.</p>
            </div>
        );
    }

    return (
        <div className="doctor-list-container">
            <div className="doctor-list-header">
                <h2>Our Doctors</h2>
                <button 
                    className="add-btn"
                    onClick={() => window.location.href = '/add-doctor'}
                >
                    Add New Doctor
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search doctors by name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredDoctors.length === 0 ? (
                <div className="no-doctors">
                    <h3>No Doctors Found</h3>
                    <p>
                        {searchTerm 
                            ? 'No doctors match your search criteria.' 
                            : 'There are no registered doctors yet.'}
                    </p>
                </div>
            ) : (
                <div className="doctor-grid">
                    {filteredDoctors.map(doctor => (
                        <div key={doctor._id} className="doctor-card">
                            <div className="doctor-info">
                                <h3>Dr. {doctor.name}</h3>
                                <p className="specialization">{doctor.specialization}</p>
                                <div className="details">
                                    <p><strong>Experience:</strong> {doctor.experience} years</p>
                                    <p><strong>Consultation Fee:</strong> ${doctor.consultationFee}</p>
                                    <p><strong>Email:</strong> {doctor.email}</p>
                                    <p><strong>Phone:</strong> {doctor.phone}</p>
                                    {doctor.availability && (
                                        <p><strong>Available:</strong> {doctor.availability}</p>
                                    )}
                                </div>
                            </div>
                            <div className="doctor-actions">
                                <button
                                    onClick={() => window.location.href = `/edit-doctor/${doctor._id}`}
                                    className="edit-btn"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(doctor._id)}
                                    className="delete-btn"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorList;
