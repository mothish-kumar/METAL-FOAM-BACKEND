export const designSupportMiddleware = async (req, res, next) => {
    if(req.role !== 'designSupport') {
        return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to designSupport' });
    }
    return next();
}