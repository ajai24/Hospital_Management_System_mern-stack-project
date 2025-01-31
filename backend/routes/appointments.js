const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');

// Get available time slots
router.get('/available-slots', async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        // Validate doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Get all appointments for the doctor on the specified date
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            doctor: doctorId,
            appointmentDate: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $ne: 'Cancelled' }
        });

        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all appointments
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('doctor', 'name specialization consultationFee');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get appointments by doctor ID
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.params.doctorId })
            .populate('doctor', 'name specialization consultationFee');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new appointment
router.post('/', async (req, res) => {
    try {
        const {
            patientName,
            patientEmail,
            patientPhone,
            age,
            gender,
            doctor,
            appointmentDate,
            appointmentTime,
            symptoms
        } = req.body;

        // Validate doctor exists
        const doctorExists = await Doctor.findById(doctor);
        if (!doctorExists) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check if time slot is available
        const startDate = new Date(appointmentDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(appointmentDate);
        endDate.setHours(23, 59, 59, 999);

        const existingAppointment = await Appointment.findOne({
            doctor,
            appointmentDate: {
                $gte: startDate,
                $lte: endDate
            },
            appointmentTime,
            status: { $ne: 'Cancelled' }
        });

        if (existingAppointment) {
            return res.status(400).json({ 
                message: 'This time slot is already booked. Please select another time.' 
            });
        }

        const appointment = new Appointment({
            patientName,
            patientEmail,
            patientPhone,
            age,
            gender,
            doctor,
            appointmentDate,
            appointmentTime,
            symptoms,
            status: 'Scheduled'
        });

        const newAppointment = await appointment.save();
        const populatedAppointment = await Appointment.findById(newAppointment._id)
            .populate('doctor', 'name specialization consultationFee');
        
        res.status(201).json(populatedAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get specific appointment
router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('doctor', 'name specialization consultationFee');
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update appointment status
router.patch('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (req.body.status) {
            appointment.status = req.body.status;
        }

        const updatedAppointment = await appointment.save();
        const populatedAppointment = await Appointment.findById(updatedAppointment._id)
            .populate('doctor', 'name specialization consultationFee');
        
        res.json(populatedAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        await appointment.deleteOne();
        res.json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get doctor availability and slots
router.get('/doctor-availability/:doctorId', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        // Validate doctor exists and get their details
        const doctor = await Doctor.findById(req.params.doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check if the doctor works on this day
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        if (!doctor.availableDays.includes(dayOfWeek)) {
            return res.status(200).json({ 
                available: false,
                message: `Doctor is not available on ${dayOfWeek}s`,
                availableDays: doctor.availableDays,
                timeSlots: []
            });
        }

        // Get booked appointments for that day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const bookedAppointments = await Appointment.find({
            doctor: req.params.doctorId,
            appointmentDate: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $ne: 'Cancelled' }
        });

        // Get available time slots
        const bookedSlots = bookedAppointments.map(app => app.appointmentTime);
        const availableSlots = doctor.timeSlots.filter(slot => !bookedSlots.includes(slot));

        res.json({
            available: true,
            message: 'Doctor is available on this day',
            availableDays: doctor.availableDays,
            timeSlots: availableSlots
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
