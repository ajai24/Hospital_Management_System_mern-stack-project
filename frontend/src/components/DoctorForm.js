import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './DoctorForm.css';

const DoctorForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        experience: '',
        consultationFee: '',
        availableDays: [],
        timeSlots: [],
        image: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchDoctor();
        }
    }, [id]);

    const fetchDoctor = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/doctors/${id}`);
            setFormData(response.data);
            setError('');
        } catch (err) {
            setError('Error fetching doctor details. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'experience' || name === 'consultationFee') {
            // Convert to number for numeric fields
            setFormData(prevState => ({
                ...prevState,
                [name]: value === '' ? '' : Number(value)
            }));
        } else if (name === 'availableDays' || name === 'timeSlots') {
            // Handle multiple select
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData(prevState => ({
                ...prevState,
                [name]: values
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (id) {
                await axios.patch(`http://localhost:5000/api/doctors/${id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/doctors', formData);
            }
            navigate('/doctors');
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving doctor details');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) {
        return (
            <div className="loading">
                <h2>Loading Doctor Details...</h2>
                <p>Please wait while we fetch the information.</p>
            </div>
        );
    }

    return (
        <div className="doctor-form-container">
            <h2>{id ? 'Edit Doctor' : 'Add New Doctor'}</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="doctor-form">
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter doctor's full name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter email address"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter phone number"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        required
                        placeholder="Enter specialization"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="qualification">Qualification</label>
                    <input
                        type="text"
                        id="qualification"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        required
                        placeholder="Enter qualification"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="experience">Experience (years)</label>
                    <input
                        type="number"
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="Enter years of experience"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="consultationFee">Consultation Fee</label>
                    <input
                        type="number"
                        id="consultationFee"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="Enter consultation fee"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="availableDays">Available Days</label>
                    <select
                        id="availableDays"
                        name="availableDays"
                        value={formData.availableDays}
                        onChange={handleChange}
                        required
                        multiple
                    >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="timeSlots">Time Slots</label>
                    <select
                        id="timeSlots"
                        name="timeSlots"
                        value={formData.timeSlots}
                        onChange={handleChange}
                        required
                        multiple
                    >
                        <option value="09:00-10:00">09:00-10:00</option>
                        <option value="10:00-11:00">10:00-11:00</option>
                        <option value="11:00-12:00">11:00-12:00</option>
                        <option value="14:00-15:00">14:00-15:00</option>
                        <option value="15:00-16:00">15:00-16:00</option>
                        <option value="16:00-17:00">16:00-17:00</option>
                        <option value="19:00-20:00">19:00-20:00</option>
                        <option value="20:00-21:00">20:00-21:00</option>
                        <option value="21:00-22:00">21:00-22:00</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Image URL</label>
                    <input
                        type="url"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Enter image URL (optional)"
                    />
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={() => navigate('/doctors')}
                        className="cancel-btn"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="submit-btn"
                    >
                        {loading ? 'Saving...' : (id ? 'Update Doctor' : 'Add Doctor')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DoctorForm;
