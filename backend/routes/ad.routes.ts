import { Router } from 'express';
import multer from 'multer';
import * as adController from '../controllers/ad.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Configuração mágica: Dizemos para o Multer salvar os arquivos na pasta "uploads"
const upload = multer({ dest: 'uploads/' });

// Rotas públicas
router.get('/', adController.getAll);
router.get('/:id', adController.getById);

// Rotas protegidas (Usamos o upload.array('images') para pegar as fotos)
router.post('/', authenticate, upload.array('images'), adController.create);
router.put('/:id', authenticate, upload.array('images'), adController.update);
router.delete('/:id', authenticate, adController.deleteAd);

export default router;