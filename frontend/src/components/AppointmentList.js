import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AppointmentList.css';

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/appointments');
            setAppointments(response.data);
            setError(null);
        } catch (err) {
            const errorMessage = err.code === 'ECONNREFUSED' 
                ? 'Unable to connect to the server. Please make sure the backend server is running.'
                : err.response?.data?.message || 'Error fetching appointments. Please try again.';
            setError(errorMessage);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            const response = await axios.patch(`http://localhost:5000/api/appointments/${appointmentId}`, {
                status: newStatus
            });
            
            // Update the appointments list with the new status
            setAppointments(appointments.map(appointment => 
                appointment._id === appointmentId ? response.data : appointment
            ));

            // Show success message
            alert(`Appointment status updated to ${newStatus}`);
        } catch (err) {
            alert('Error updating appointment status. Please try again.');
            console.error('Error:', err);
        }
    };

    const handleDelete = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await axios.delete(`http://localhost:5000/api/appointments/${appointmentId}`);
                setAppointments(appointments.filter(appointment => appointment._id !== appointmentId));
                alert('Appointment cancelled successfully');
            } catch (err) {
                alert('Error cancelling appointment. Please try again.');
                console.error('Error:', err);
            }
        }
    };

    const filteredAppointments = appointments.filter(appointment => {
        const searchString = searchTerm.toLowerCase();
        return (
            appointment.patientName.toLowerCase().includes(searchString) ||
            appointment.patientEmail.toLowerCase().includes(searchString) ||
            appointment.patientPhone.toLowerCase().includes(searchString) ||
            (appointment.doctor?.name || '').toLowerCase().includes(searchString)
        );
    });

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div className="loading">
                <h2>Loading Appointments...</h2>
                <p>Please wait while we fetch the appointments.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={fetchAppointments} className="retry-btn">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="appointment-list">
            <h2>Appointments</h2>
            
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="no-appointments">
                    <h3>No Appointments Found</h3>
                    <p>There are no appointments matching your search criteria.</p>
                </div>
            ) : (
                <div className="appointments-grid">
                    {filteredAppointments.map((appointment) => (
                        <div key={appointment._id} className="appointment-card">
                            <div className="appointment-header">
                                <h3>{appointment.patientName}</h3>
                                <span className={`status-badge ${appointment.status}`}>
                                    {appointment.status}
                                </span>
                            </div>

                            <div className="appointment-details">
                                <div className="detail-group">
                                    <h4>Patient Information</h4>
                                    <p><strong>Email:</strong> {appointment.patientEmail}</p>
                                    <p><strong>Phone:</strong> {appointment.patientPhone}</p>
                                    <p><strong>Age:</strong> {appointment.age}</p>
                                    <p><strong>Gender:</strong> {appointment.gender}</p>
                                </div>

                                <div className="detail-group">
                                    <h4>Doctor Information</h4>
                                    <p><strong>Name:</strong> Dr. {appointment.doctor?.name || 'Not assigned'}</p>
                                    <p><strong>Specialization:</strong> {appointment.doctor?.specialization || 'N/A'}</p>
                                    <p><strong>Consultation Fee:</strong> ${appointment.doctor?.consultationFee || 'N/A'}</p>
                                </div>

                                <div className="detail-group">
                                    <h4>Appointment Details</h4>
                                    <p><strong>Date:</strong> {formatDate(appointment.appointmentDate)}</p>
                                    <p><strong>Time:</strong> {appointment.appointmentTime}</p>
                                    <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
                                    {appointment.notes && (
                                        <p><strong>Notes:</strong> {appointment.notes}</p>
                                    )}
                                </div>
                            </div>

                            <div className="appointment-actions">
                                <select
                                    value={appointment.status}
                                    onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                                    className="status-select"
                                >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>

                                <button
                                    onClick={() => handleDelete(appointment._id)}
                                    className="cancel-btn"
                                >
                                    Cancel Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppointmentList;
