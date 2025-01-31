import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AppointmentForm.css';

const TIME_SLOTS = [
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
    "17:00-18:00",
    "18:00-19:00",
    "19:00-20:00",
];

const AppointmentForm = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [availableSlots, setAvailableSlots] = useState(TIME_SLOTS);
    const [availabilityInfo, setAvailabilityInfo] = useState({
        available: false,
        message: '',
        availableDays: [],
        timeSlots: []
    });
    const [formData, setFormData] = useState({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        age: '',
        gender: '',
        doctor: '',
        appointmentDate: '',
        appointmentTime: '',
        symptoms: ''
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (formData.doctor && formData.appointmentDate) {
            checkAvailableSlots();
        } else {
            setAvailableSlots(TIME_SLOTS);
        }
    }, [formData.doctor, formData.appointmentDate]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/doctors');
            if (response.data && response.data.length > 0) {
                setDoctors(response.data);
                setError('');
            } else {
                setError('No doctors available. Please try again later.');
            }
        } catch (err) {
            setError('Error fetching doctors. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkAvailableSlots = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/appointments/doctor-availability/${formData.doctor}`, {
                params: {
                    date: formData.appointmentDate
                }
            });
            
            setAvailabilityInfo(response.data);
            setAvailableSlots(response.data.timeSlots);
            
            if (!response.data.available) {
                setError(response.data.message);
                // Reset time slot if doctor is not available
                setFormData(prevState => ({
                    ...prevState,
                    appointmentTime: ''
                }));
            } else if (response.data.timeSlots.length === 0) {
                setError('All time slots are booked for the selected date. Please choose another date.');
                setFormData(prevState => ({
                    ...prevState,
                    appointmentTime: ''
                }));
            } else {
                setError('');
            }
        } catch (err) {
            console.error('Error checking available slots:', err);
            setError('Error checking doctor availability. Please try again.');
            setAvailableSlots([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Reset time if date or doctor changes
        if (name === 'appointmentDate' || name === 'doctor') {
            setFormData(prevState => ({
                ...prevState,
                appointmentTime: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            const appointmentData = {
                ...formData,
                age: parseInt(formData.age)
            };

            await axios.post('http://localhost:5000/api/appointments', appointmentData);
            navigate('/appointments');
        } catch (err) {
            setError(err.response?.data?.message || 'Error booking appointment');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <h2>Loading...</h2>
                <p>Please wait while we prepare the appointment form.</p>
            </div>
        );
    }

    return (
        <div className="appointment-form-container">
            <h2>Book an Appointment</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="appointment-form">
                <div className="form-section">
                    <h3>Patient Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="patientName">Full Name</label>
                            <input
                                type="text"
                                id="patientName"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="patientEmail">Email</label>
                            <input
                                type="email"
                                id="patientEmail"
                                name="patientEmail"
                                value={formData.patientEmail}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="patientPhone">Phone Number</label>
                            <input
                                type="tel"
                                id="patientPhone"
                                name="patientPhone"
                                value={formData.patientPhone}
                                onChange={handleChange}
                                required
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                required
                                min="0"
                                max="150"
                                placeholder="Enter your age"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Appointment Details</h3>
                    <div className="form-group">
                        <label htmlFor="doctor">Select Doctor</label>
                        <select
                            id="doctor"
                            name="doctor"
                            value={formData.doctor}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a Doctor</option>
                            {doctors.map(doctor => (
                                <option key={doctor._id} value={doctor._id}>
                                    Dr. {doctor.name} - {doctor.specialization}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.doctor && availabilityInfo.availableDays.length > 0 && (
                        <div className="availability-info">
                            <p>Doctor is available on: {availabilityInfo.availableDays.join(', ')}</p>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="appointmentDate">Preferred Date</label>
                            <input
                                type="date"
                                id="appointmentDate"
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="appointmentTime">Preferred Time</label>
                            <select
                                id="appointmentTime"
                                name="appointmentTime"
                                value={formData.appointmentTime}
                                onChange={handleChange}
                                required
                                disabled={!availabilityInfo.available || availableSlots.length === 0}
                            >
                                <option value="">Select Time Slot</option>
                                {availableSlots.map((slot, index) => (
                                    <option key={index} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>
                            {formData.doctor && formData.appointmentDate && availableSlots.length === 0 && (
                                <p className="error-text">No available slots for this date</p>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="symptoms">Symptoms or Reason for Visit</label>
                        <textarea
                            id="symptoms"
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleChange}
                            required
                            placeholder="Please describe your symptoms or reason for the appointment"
                            rows="4"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={() => navigate('/')}
                        className="cancel-btn"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading || availableSlots.length === 0}
                        className="submit-btn"
                    >
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AppointmentForm;
