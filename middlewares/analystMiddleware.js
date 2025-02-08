export const analystMiddleware = async (req, res, next) => {
    if (req.role !== 'resource_analyst') {
        return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to resource analyst' });
    }
    return next();
 }