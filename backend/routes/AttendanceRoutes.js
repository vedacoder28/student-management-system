const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Save attendance for a subject on a date
// POST /api/attendance
// Body: { date, subjectId, subjectName, sem, department, records: [{studentId, status}] }
router.post('/', async (req, res) => {
    try {
        const { date, subjectId, subjectName, sem, department, records } = req.body;
        const results = [];

        for (const record of records) {
            const result = await Attendance.findOneAndUpdate(
                { date, studentId: record.studentId, subjectId },
                { date, studentId: record.studentId, subjectId, subjectName, sem, department, status: record.status },
                { upsert: true, new: true }
            );
            results.push(result);
        }

        // Update each student's overall attendance count for this subject
        const studentIds = records.map(r => r.studentId);
        for (const sid of studentIds) {
            const total = await Attendance.countDocuments({ studentId: sid, subjectId });
            const present = await Attendance.countDocuments({ studentId: sid, subjectId, status: { $in: ['Present', 'Late'] } });
            // Store per-subject stats could be added later; for now update overall
        }

        res.json({ message: 'Attendance saved', count: results.length });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get attendance for a date + subject
// GET /api/attendance/:date/:subjectId
router.get('/:date/:subjectId', async (req, res) => {
    try {
        const records = await Attendance.find({
            date: req.params.date,
            subjectId: req.params.subjectId
        }).populate('studentId', 'name department currentSem status');
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get full attendance history for a student per subject
// GET /api/attendance/student/:studentId/:subjectId
router.get('/student/:studentId/:subjectId', async (req, res) => {
    try {
        const records = await Attendance.find({
            studentId: req.params.studentId,
            subjectId: req.params.subjectId
        }).sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get attendance summary per subject for a student
// GET /api/attendance/summary/:studentId
router.get('/summary/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const summary = [];
        for (const subj of student.currentSubjects) {
            const total = await Attendance.countDocuments({ studentId: student._id, subjectId: subj._id });
            const present = await Attendance.countDocuments({ studentId: student._id, subjectId: subj._id, status: { $in: ['Present', 'Late'] } });
            summary.push({
                subjectId: subj._id,
                subjectName: subj.name,
                code: subj.code,
                credits: subj.credits,
                total,
                present,
                percentage: total > 0 ? Math.round((present / total) * 100) : 0
            });
        }
        res.json(summary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;