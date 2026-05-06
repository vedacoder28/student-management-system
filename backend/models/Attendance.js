const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, required: true },
    subjectName: { type: String, required: true },
    sem: { type: Number, required: true },
    department: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Absent' }
}, { timestamps: true });

attendanceSchema.index({ date: 1, studentId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);