const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

router.post('/', async (req, res) => {
    try {
        const { date, records } = req.body;
        const results = [];
        for (const record of records) {
            const result = await Attendance.findOneAndUpdate(
                { date, studentId: record.studentId },
                { date, studentId: record.studentId, status: record.status },
                { upsert: true, new: true }
            );
            results.push(result);
            const totalClasses = await Attendance.countDocuments({ studentId: record.studentId });
            const presentCount = await Attendance.countDocuments({
                studentId: record.studentId,
                status: { $in: ['Present', 'Late'] }
            });
            await Student.findByIdAndUpdate(record.studentId, {
                attendance: { totalClasses, present: presentCount }
            });
        }
        res.json({ message: 'Attendance saved', count: results.length });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/:date', async (req, res) => {
    try {
        const records = await Attendance.find({ date: req.params.date })
            .populate('studentId', 'name department status');
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;