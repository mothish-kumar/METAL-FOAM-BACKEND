export const qualityControlMiddleware = async (req, res, next) => {
    if(req.role !== 'quality_control') {
        return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to quality Control' });
    }
    return next();
}