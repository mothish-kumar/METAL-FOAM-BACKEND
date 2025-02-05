import mongoose from 'mongoose';

const QualityCriteriaSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique:true,
        ref: 'Employee'
    },
    densityThreshold: {
        type: Number,
        required: true
    },
    flexuralStrengthThreshold:{
        type: Number,
        required: true
    },
    tensileStrengthThreshold:{
        type: Number,
        required: true
    },
    porosityThreshold:{
        type: Number,
        required: true
    },
    thermalConductivityThreshold:{
        type: Number,
        required: true
    },
    
}, { collection: 'qualityCriteria' });

const QualityCriteria = mongoose.model('QualityCriteria', QualityCriteriaSchema);
export default QualityCriteria;