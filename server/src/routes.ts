import express, { response } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';
import { celebrate, Joi } from 'celebrate';

const routes = express.Router();
const upload = multer(multerConfig);
const pointsController = new PointsController();
const itemsController = new ItemsController();

//Lista os items que podem ser recebidos pelos pontos de coleta
routes.get('/items', itemsController.index);
//Cria os pontos de coleta
routes.post(
    '/points',
    upload.single('image'),
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            items: Joi.string().required(),
        })
    }, {
        abortEarly: false
    }),
    pointsController.create);
//Lista os pontos de coleta de acordo com um filtro
routes.get('/points', pointsController.index);
//Lista um ponto de coleta especifico
routes.get('/points/:id', pointsController.show);

export default routes;