const Payment = require('../models/Payment');
const Member = require('../models/Member');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, memberId, method, sort = 'date', order = 'desc' } = req.query;

    const query = {};
    if (memberId) query.member = memberId;
    if (method) query.method = method;

    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('member', 'name email phone planType')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create payment and update member subscription
// @route   POST /api/payments
// @access  Private/Admin
const createPayment = async (req, res) => {
  try {
    const { memberId, amount, method, planType, notes, date } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Extend subscription from today or current end (whichever is later)
    const base = member.subscriptionEnd > new Date() ? new Date(member.subscriptionEnd) : new Date();
    const plan = planType || member.planType;

    if (plan === 'Monthly') base.setMonth(base.getMonth() + 1);
    else if (plan === 'Quarterly') base.setMonth(base.getMonth() + 3);
    else if (plan === 'Yearly') base.setFullYear(base.getFullYear() + 1);

    // Create payment record
    const payment = await Payment.create({
      member: memberId,
      amount,
      method: method || 'Cash',
      planType: plan,
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
      status: 'Completed',
    });

    // Update member subscription
    await Member.findByIdAndUpdate(memberId, {
      subscriptionEnd: base,
      planType: plan,
      status: 'Active',
    });

    const populated = await Payment.findById(payment._id).populate('member', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Payment logged and subscription extended',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('member', 'name email phone planType');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private/Admin
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    await payment.deleteOne();
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPayments, createPayment, getPayment, deletePayment };
