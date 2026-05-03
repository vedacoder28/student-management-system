const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                var cleaned = v.replace(/\s/g, '').replace(/\+/g, '');
                return /^\d{10}$/.test(cleaned);
            },
            message: 'Please enter exactly 10 digits after +91'
        }
    },
    dob: { type: Date, required: true },
    grade: { type: String, required: true, enum: ['A', 'B', 'C', 'D', 'F'] },
    department: { type: String, required: true, enum: ['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Information Technology', 'Electrical Engineering'] },
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