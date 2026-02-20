const express = require('express');
const router = express.Router();
const {
  getPayments,
  createPayment,
  getPayment,
  deletePayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getPayments).post(authorize('admin'), createPayment);
router.route('/:id')
  .get(getPayment)
  .delete(authorize('admin'), deletePayment);

module.exports = router;
