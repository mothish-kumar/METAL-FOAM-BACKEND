import Production from "../Schema/ProductionSchema.js";
import QualityControl from "../Schema/QualityControlSchema.js";
import ProductionAccessRequest from "../Schema/ProductionAccessRequestSchema.js";
import { getAllDesignData, getTotal } from "../services/DesignerSupportServices.js";
import RejectedProduct from "../Schema/rejectedProductSchema.js";

export const getDashboardData = async (req, res) => {
    try {
        const userId = req.username;
        const userRole = req.role;
        let dashboardData = {};

        // Production & Assembly Dashboard
        if (userRole === "production_assembly") {
            const productionStats = await Production.aggregate([
                { $group: { _id: "$productionStatus", count: { $sum: 1 } } }
            ]);
            const activeProduction = await Production.find({ productionEmployeeId: userId });
            const accessRequests = await ProductionAccessRequest.find({ employeeId: userId });

            dashboardData = {
                productionSummary: {
                    totalProduction: await Production.countDocuments(),
                    statsByStatus: productionStats,
                },
                activeProduction,
                pendingAccessRequests: accessRequests.length,
                accessRequests
            };
        }

        // Quality Control Dashboard
        else if (userRole === "quality_control") {
            const qualityAssessments = await QualityControl.find({ qualityEmployeeId: userId });
            const qualityStats = await QualityControl.aggregate([
                { $group: { _id: "$qualityStatus", count: { $sum: 1 } } }
            ]);
            const totalRejected = await RejectedProduct.countDocuments({});

            dashboardData = {
                qualitySummary: {
                    totalEvaluations: await QualityControl.countDocuments(),
                    statsByStatus: qualityStats,
                },
                totalRejected,
                qualityAssessments
            };
        }

        // Design Support Dashboard
        else if (userRole === "design_support") {
            const { total } = await getTotal();
            const numericTotal = Number(total);
            const designData = await getAllDesignData(0, numericTotal > 10 ? 9 : numericTotal - 1);

            dashboardData = {
                designSummary: {
                    totalProductsDesigned: numericTotal,
                    recentDesigns: designData.response ? designData.data : []
                }
            };
        }

        // Admin Dashboard
        else if (userRole === "admin") {
            const productionStats = await Production.aggregate([
                { $group: { _id: "$productionStatus", count: { $sum: 1 } } }
            ]);
            const qualityStats = await QualityControl.aggregate([
                { $group: { _id: "$qualityStatus", count: { $sum: 1 } } }
            ]);
            const { total } = await getTotal();
            const numericTotal = Number(total);
            const accessRequests = await ProductionAccessRequest.find({});
            const totalRejected = await RejectedProduct.countDocuments({});
            const totalProduction = await Production.countDocuments();
            const totalQualityEvaluations = await QualityControl.countDocuments();

            dashboardData = {
                productionSummary: {
                    totalProduction,
                    statsByStatus: productionStats,
                },
                qualitySummary: {
                    totalEvaluations: totalQualityEvaluations,
                    statsByStatus: qualityStats,
                },
                designSummary: {
                    totalDesigns: numericTotal,
                },
                totalRejected,
                accessRequests,
            };
        }

        // Resource Analyst Dashboard
        else if (userRole === "resource_analyst") {
            const productionStats = await Production.aggregate([
                { $group: { _id: "$productionStatus", count: { $sum: 1 } } }
            ]);
            const totalProduction = await Production.countDocuments();
            const totalRejected = await RejectedProduct.countDocuments();

            dashboardData = {
                productionSummary: {
                    totalProduction,
                    statsByStatus: productionStats,
                },
                totalRejected
            };
        }

        // Default case if no matching role is found
        else {
            dashboardData = { message: "No dashboard data available for your role" };
        }

        res.status(200).json({ message: "Dashboard data fetched successfully", dashboardData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
