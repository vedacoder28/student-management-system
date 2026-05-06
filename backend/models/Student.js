const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, default: '' },
    credits: { type: Number, required: true, min: 1 }
}, { _id: true });

const semResultSchema = new mongoose.Schema({
    sem: { type: Number, required: true },
    sgpa: { type: Number, default: null },
    totalCredits: { type: Number, default: 0 }
}, { _id: false });

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
    department: {
        type: String,
        required: true,
        enum: ['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Information Technology', 'Electrical Engineering']
    },
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
    feeStatus: { type: String, default: 'Pending', enum: ['Paid', 'Pending', 'Overdue'] },
    feeAmount: { type: Number, default: 0 },
    enrollDate: { type: Date, default: Date.now },
    address: { type: String, default: '' },
    currentSem: { type: Number, default: 1, min: 1, max: 8 },
    cgpa: { type: Number, default: null },
    semResults: { type: [semResultSchema], default: [] },
    currentSubjects: { type: [subjectSchema], default: [] },
    attendance: {
        totalClasses: { type: Number, default: 0 },
        present: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);