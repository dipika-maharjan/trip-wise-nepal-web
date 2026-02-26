import crypto from 'crypto';
import { Request, Response } from 'express';
import axios from 'axios';
import { BookingModel } from '../models/booking.model';
import { sendPaymentSuccessEmail } from '../config/paymentEmail';

// POST /api/payment/esewa/initiate
export const initiateEsewaPayment = async (req: Request, res: Response) => {
  try {
    const { amount, bookingId } = req.body;
    console.log('eSewa initiate params:', { amount, bookingId });
    if (!amount || !bookingId) {
      console.log('Missing amount or bookingId:', { amount, bookingId });
      return res.status(400).json({ message: 'Amount and bookingId are required.' });
    }
      // Use only required fields for signature and signed_field_names (per eSewa v2 docs)
      const total_amount = String(amount);
      // Use only alphanumeric and hyphen for transaction_uuid
      const rawUuid = `booking-${bookingId}-${Date.now()}`;
      const transaction_uuid = rawUuid.replace(/[^a-zA-Z0-9-]/g, '');
      // Save transaction_uuid to booking for later lookup
      await BookingModel.findByIdAndUpdate(bookingId, { transaction_uuid });
      const product_code = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
      const success_url = process.env.ESEWA_SUCCESS_URL || 'http://localhost:3000/payment/success';
      const failure_url = process.env.ESEWA_FAILURE_URL || 'http://localhost:3000/payment/failure';
      // Required but unsigned fields
      const amountStr = String(amount);
      const tax_amount = '0';
      const product_service_charge = '0';
      const product_delivery_charge = '0';
      // Signature and signed_field_names
      const signedFields = ['total_amount', 'transaction_uuid', 'product_code'];
      const message = signedFields.map(f => `${f}=${eval(f)}`).join(',');
      const secret_key = process.env.ESEWA_SECRET_KEY || '';
      const signature = crypto
        .createHmac('sha256', secret_key)
        .update(message)
        .digest('base64');
      const signed_field_names = signedFields.join(',');
      // Build POST payload: all required fields, only three are signed
      const formData: Record<string, string> = {
        amount: amountStr,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code,
        product_service_charge,
        product_delivery_charge,
        success_url,
        failure_url,
        signed_field_names,
        signature,
      };

      // Debug log for troubleshooting
      console.log('eSewa v2 signature debug:', {
        message,
        secret_key,
        signature,
        POST: formData
      });

      // Build the full payload for eSewa POST form
      console.log('eSewa v2 POST payload:', formData);
      return res.json({
        esewaUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        formData,
      });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to initiate payment', error });
  }
};

// GET /api/payment/esewa/success
export const esewaSuccess = async (req: Request, res: Response) => {
  try {
    // Support v2: decode 'data' param if present
    let product_code, total_amount, transaction_uuid;
    if (req.query.data) {
      try {
        const decoded = JSON.parse(Buffer.from(req.query.data as string, 'base64').toString());
        product_code = decoded.product_code || process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
        total_amount = decoded.total_amount;
        transaction_uuid = decoded.transaction_uuid;
      } catch (err) {
        return res.status(400).json({ message: 'Invalid data parameter.' });
      }
    } else {
      product_code = req.query.product_code || process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
      total_amount = req.query.total_amount;
      transaction_uuid = req.query.transaction_uuid;
    }
    if (!product_code || !total_amount || !transaction_uuid) {
      return res.status(400).json({ message: 'Missing required query parameters.' });
    }
    // Call eSewa v2 status API
    const verifyUrl = process.env.ESEWA_VERIFY_URL || 'https://rc.esewa.com.np/api/epay/transaction/status/';
    try {
      const response = await axios.get(verifyUrl, {
        params: {
          product_code,
          total_amount,
          transaction_uuid,
        },
      });
      // Debug log
      console.log('eSewa v2 status API response:', response.data);
      if (response.data.status === 'COMPLETE') {
        // Update booking/payment status
        let updateResult = await BookingModel.findOneAndUpdate(
          { transaction_uuid },
          { paymentStatus: 'paid', bookingStatus: 'confirmed' },
          { new: true }
        );
        if (updateResult) {
          await sendPaymentSuccessEmail(updateResult);
            // Redirect to booking details page
            return res.redirect(`http://localhost:3000/user/bookings/${updateResult._id}`);
        } else {
          return res.status(200).json({ status: 'PAID', message: 'Payment verified, but booking not found for update.' });
        }
      } else {
        return res.status(400).json({ status: 'FAILED', message: 'Payment not complete or failed.' });
      }
    } catch (error: any) {
      console.error('eSewa status API error:', error.response ? error.response.data : error.message);
      return res.status(400).json({ message: 'Error verifying payment', error });
    }
    // End of catch block, remove stray code
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying payment', error });
  }
};

// GET /api/payment/esewa/failure
export const esewaFailure = (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Payment failed or cancelled.' });
};
