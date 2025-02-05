export const adminMiddelware = async (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to admin' });
    }
    return next();
 }
