import express from 'express';
import usersRoutes from './users.js';
import recipesRoutes from './recipes.js';
import listsRoutes from './lists.js';
import ingredientsRoutes from './ingredients.js';
import unitsRoutes from './units.js';
import tagsRoutes from './tags.js';

const apiRouter = express.Router();

apiRouter.use('/api', usersRoutes);
apiRouter.use('/api', recipesRoutes);
apiRouter.use('/api', listsRoutes);
apiRouter.use('/api', ingredientsRoutes);
apiRouter.use('/api', unitsRoutes);
apiRouter.use('/api', tagsRoutes);

export default apiRouter;