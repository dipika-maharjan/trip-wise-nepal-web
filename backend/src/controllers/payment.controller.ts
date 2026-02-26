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
    const { amt, oid, refId } = req.query;
    if (!amt || !oid || !refId) {
      return res.status(400).json({ message: 'Missing required query parameters.' });
    }
    const verifyParams = new URLSearchParams({
      amt: String(amt),
      rid: String(refId),
      pid: String(oid),
      scd: process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST',
    });
    const verifyUrl = process.env.ESEWA_VERIFY_URL || 'https://rc.esewa.com.np/api/epay/transaction/status/';
    const response = await axios.get(`${verifyUrl}?${verifyParams.toString()}`);
    if (response.data.includes('<response_code>Success</response_code>')) {
      console.log('eSewa payment callback params:', { amt, oid, refId });
      // Try to update booking/payment status using bookingId (oid may be transaction_uuid, not _id)
      // Try both _id and transaction_uuid fields for robustness
      let updateResult = await BookingModel.findOneAndUpdate(
        { $or: [ { _id: oid }, { transaction_uuid: oid } ] },
        { paymentStatus: 'paid', bookingStatus: 'confirmed' },
        { new: true }
      );
      console.log('eSewa payment update result:', updateResult);
      if (!updateResult) {
        // Try to extract bookingId from oid if it is in the format booking-<bookingId>-timestamp
        const match = String(oid).match(/^booking-([a-fA-F0-9]{24})-/);
        console.log('eSewa payment fallback match:', match);
        if (match && match[1]) {
          updateResult = await BookingModel.findOneAndUpdate(
            { _id: match[1] },
            { paymentStatus: 'paid', bookingStatus: 'confirmed' },
            { new: true }
          );
          console.log('eSewa payment update fallback result:', updateResult);
        }
      }
      // Always try transaction_uuid match as last resort
      if (!updateResult) {
        updateResult = await BookingModel.findOneAndUpdate(
          { transaction_uuid: oid },
          { paymentStatus: 'paid', bookingStatus: 'confirmed' },
          { new: true }
        );
        console.log('eSewa payment update final transaction_uuid result:', updateResult);
      }
      if (updateResult) {
        // Send payment confirmation email to user
        await sendPaymentSuccessEmail(updateResult);
        return res.status(200).json({ message: 'Payment verified and booking updated successfully.' });
      } else {
        console.error('Booking not found for update. Params:', { oid, refId });
        return res.status(200).json({ message: 'Payment verified, but booking not found for update.' });
      }
    } else {
      console.error('Payment verification failed. Params:', { amt, oid, refId, response: response.data });
      return res.status(400).json({ message: 'Payment verification failed.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying payment', error });
  }
};

// GET /api/payment/esewa/failure
export const esewaFailure = (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Payment failed or cancelled.' });
};
