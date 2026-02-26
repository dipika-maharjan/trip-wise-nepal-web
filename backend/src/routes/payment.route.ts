import { Router } from 'express';
import { initiateEsewaPayment, esewaSuccess, esewaFailure } from '../controllers/payment.controller';

const router = Router();

// Initiate eSewa payment
router.post('/esewa/initiate', initiateEsewaPayment);
// eSewa success callback
router.get('/esewa/success', esewaSuccess);
// eSewa failure callback
router.get('/esewa/failure', esewaFailure);

export default router;
