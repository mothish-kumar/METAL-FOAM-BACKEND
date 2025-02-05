import QualityCriteria from "../Schema/QualityCriteriaSchema.js"

 // for new resource analyst to set the quality criteria
export const setQualityCriteria = async (req, res) => {
    const employeeId= req.params.employeeId
    const { densityThreshold, flexuralStrengthThreshold, tensileStrengthThreshold, porosityThreshold, thermalConductivityThreshold } = req.body
    try {
        const qualityCriteria = new QualityCriteria({ densityThreshold, flexuralStrengthThreshold, tensileStrengthThreshold, porosityThreshold, thermalConductivityThreshold, employeeId })
        await qualityCriteria.save()
        res.status(201).json({ message: "Quality Criteria set successfully" })
    }catch (error) {
        res.status(409).json({ message: error.message })
    }
}