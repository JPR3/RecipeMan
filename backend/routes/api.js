import express from 'express';
import usersRoutes from './users.js';
import recipesRoutes from './recipes.js';
import listsRoutes from './lists.js';
import ingredientsRoutes from './ingredients.js';
import unitsRoutes from './units.js';
import tagsRoutes from './tags.js';

const apiRouter = express.Router();

apiRouter.use(usersRoutes);
apiRouter.use(recipesRoutes);
apiRouter.use(listsRoutes);
apiRouter.use(ingredientsRoutes);
apiRouter.use(unitsRoutes);
apiRouter.use(tagsRoutes);

export default apiRouter;