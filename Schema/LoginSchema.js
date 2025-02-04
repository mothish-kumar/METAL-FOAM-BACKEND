import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    lastLogoutAt: {
        type: Date,
        default: null
    }
}, { collection: 'login' });

// Add method to update login status
loginSchema.methods.updateLoginStatus = async function(status) {
    this.isLoggedIn = status;
    if (status) {
        this.lastLoginAt = new Date();
    } else {
        this.lastLogoutAt = new Date();
    }
    await this.save();
};

const Login = mongoose.model('Login', loginSchema);

export default Login;