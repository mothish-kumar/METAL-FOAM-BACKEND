export const designSupportMiddleware = async (req, res, next) => {
    if(req.role !== 'design_support') {
        return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to designSupport' });
    }
    return next();
}