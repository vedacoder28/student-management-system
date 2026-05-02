const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: '' },
    age: { type: Number, required: true, min: 5, max: 100 },
    grade: { type: String, required: true, enum: ['A', 'B', 'C', 'D', 'F'] },
    department: { type: String, required: true },
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
    feeStatus: { type: String, default: 'Pending', enum: ['Paid', 'Pending', 'Overdue'] },
    feeAmount: { type: Number, default: 0 },
    enrollDate: { type: Date, default: Date.now },
    address: { type: String, default: '' },
    attendance: {
        totalClasses: { type: Number, default: 0 },
        present: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);