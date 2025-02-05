import AccessControl from "../Schema/AccessControlSchema.js";

export const dataAccessMiddleware = async (req, res, next) => { 
    const employeeId = req.username;
    const accessControl = await AccessControl.findOne({ employeeId })
    if (!accessControl) {
        return res.status(404).json({ error: "You don't make request to access the data" })
    }
    console.log(accessControl.status)
    if(accessControl.status === 'active') {
        return next();
    }
    return res.status(403).json({ error: "You don't have permission to access the data" });
}