export const productionMiddleware = async (req, res, next) => {
    if(req.role !== 'production_assembly') {
        return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to production assembly' });
    }
    return next();
}