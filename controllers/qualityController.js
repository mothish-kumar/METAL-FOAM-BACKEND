import Production from "../Schema/ProductionSchema.js";
import QualityControl from "../Schema/QualityControlSchema.js";


export const getStatus = async (req, res) => {
    try {
        const searchQuery = req.query.qualityStatus;
        let filter = {}
        if (searchQuery) {
            filter = {qualityStatus:searchQuery}
        }
        const data = await QualityControl.find(filter);
        if (data.length === 0) {
           return  res.status(200).json({message:"No Products found "})
        }
        res.status(200).json({message:"Data received successfully",data})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

export const submitQualityAssement = async (req, res) => {
    try {
        const qualityEmployeeId = req.username;
        const productionId = req.params.productionId
        const approvedBy = qualityEmployeeId;
        const approvalDate = Date.now();
        let { qualityStatus, youngsModulus, corrosionResistance, weightEfficiency, tensileStrength, weldIntegrity, corrosionImpact, weightRetention, rejectionReason, improvementSuggestions,reworkIssue } = req.body;
        
        if (!rejectionReason) {
            rejectionReason = "none"
        } 
        if (!improvementSuggestions) {
            improvementSuggestions = "No comments"
        }
        if(qualityStatus === 'Approved'){
            if (!qualityStatus || !youngsModulus || !corrosionResistance || !weightEfficiency || !tensileStrength || !weldIntegrity || !corrosionImpact || !weightRetention) {
                res.status(400).json({message:"Missing Fields are required"})
            }
            await Production.findOneAndUpdate({productionId},{productionStatus:'Completed',finishedAt: Date.now()})
            await QualityControl.findOneAndDelete({productionId})
        }
        if(qualityStatus === 'Rework'){
            await Production.findOneAndUpdate({productionId},{productionStatus:'Rework',reworkIssue})
        }
         await QualityControl.findOneAndUpdate({productionId},{
            qualityStatus, rejectionReason, improvementSuggestions, approvalDate, approvedBy, 'testResults.youngsModulus': youngsModulus,
            'testResults.corrosionResistance': corrosionResistance,
            'testResults.weightEfficiency': weightEfficiency,
            'testResults.tensileStrength': tensileStrength,
            'weldingAssessment.weldIntegrity': weldIntegrity,
            'weldingAssessment.corrosionImpact': corrosionImpact,
            'weldingAssessment.weightRetention':weightRetention
        })
        res.status(200).json({message:"Quality Assessment Sumitted Successfully"})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const reportGenerator = async (req, res) => {
    try {
        const productionId = req.params.productionId;
        const qualityReport = await Production.findOne({ productionId })
        if (!qualityReport) {
            return res.status(400).json({message:"No more quality Check submitted"})
        }
        res.status(200).json({message:"Production report generated successfully",qualityReport})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

export const getProductionOption = async(req,res)=>{
    try{
        const productionId = await QualityControl.find({qualityStatus:'Pending'},'productionId')
        const productionIds = productionId.map(doc => doc.productionId);
        res.status(200).json({productionId: productionIds})

    }catch(error){
        res.status(500).json({error:error.message})
    }
}

export const reportGeneratorOptions = async(req,res)=>{
    try{
        const production = await Production.find({productionStatus:'Completed'})
        res.status(200).json({data:production})
    }catch(error){
        res.status(500).json({error:error.message})
    }
}


