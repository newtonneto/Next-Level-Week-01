import multer from 'multer';
import path from 'path';
import crypto from 'crypto'

export default {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', '..', 'uploads', 'photos'),
        filename(request, file, callback) {
            //Gera uma string aleatoria que será usada para dar um nome único ao arquivo recebido
            const hash = crypto.randomBytes(6).toString('hex');

            const fileName = `${hash}-${file.originalname}`;

            callback(null, fileName);
        }
    })
};