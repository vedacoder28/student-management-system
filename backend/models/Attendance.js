const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: { type: String, required: true },       // "2026-05-04"
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, required: true }, // subject _id from student.currentSubjects
    subjectName: { type: String, required: true },
    sem: { type: Number, required: true },
    department: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Absent' }
}, { timestamps: true });

// One record per student per subject per date
attendanceSchema.index({ date: 1, studentId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);