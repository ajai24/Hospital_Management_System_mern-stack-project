const router = require('express').Router();
const Doctor = require('../models/doctor');

// Get all doctors
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new doctor
router.post('/', async (req, res) => {
    const doctor = new Doctor({
        name: req.body.name,
        email: req.body.email,
        specialization: req.body.specialization,
        qualification: req.body.qualification,
        experience: req.body.experience,
        phone: req.body.phone,
        availableDays: req.body.availableDays,
        timeSlots: req.body.timeSlots,
        consultationFee: req.body.consultationFee,
        image: req.body.image
    });

    try {
        const newDoctor = await doctor.save();
        res.status(201).json(newDoctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update doctor
router.patch('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const allowedUpdates = [
            'name', 'email', 'specialization', 'qualification',
            'experience', 'phone', 'availableDays', 'timeSlots',
            'consultationFee', 'image'
        ];

        allowedUpdates.forEach(update => {
            if (req.body[update] !== undefined) {
                doctor[update] = req.body[update];
            }
        });

        const updatedDoctor = await doctor.save();
        res.json(updatedDoctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        await doctor.deleteOne();
        res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get available time slots for a specific doctor and date
router.get('/:id/available-slots/:date', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const date = new Date(req.params.date);
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];

        if (!doctor.availableDays.includes(dayOfWeek)) {
            return res.json({ availableSlots: [] });
        }

        // Here you would also check existing appointments and remove booked slots
        res.json({ availableSlots: doctor.timeSlots });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
