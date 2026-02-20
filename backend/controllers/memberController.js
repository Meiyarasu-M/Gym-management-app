const Member = require('../models/Member');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Get all members (with search, sort, pagination)
// @route   GET /api/members
// @access  Private/Admin
const getMembers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort = 'createdAt',
      order = 'desc',
      status,
      planType,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (planType) query.planType = planType;

    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [members, total] = await Promise.all([
      Member.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Member.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: members,
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

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const payments = await Payment.find({ member: req.params.id }).sort({ date: -1 }).limit(10);

    res.json({ success: true, data: { ...member.toObject(), payments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new member
// @route   POST /api/members
// @access  Private/Admin
const createMember = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      planType,
      subscriptionStart,
      notes,
      createAccount,
      password,
    } = req.body;

    const existing = await Member.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A member with this email already exists' });
    }

    // Calculate subscription end
    const start = subscriptionStart ? new Date(subscriptionStart) : new Date();
    const end = new Date(start);
    if (planType === 'Monthly') end.setMonth(end.getMonth() + 1);
    else if (planType === 'Quarterly') end.setMonth(end.getMonth() + 3);
    else if (planType === 'Yearly') end.setFullYear(end.getFullYear() + 1);

    const member = await Member.create({
      name,
      email,
      phone,
      planType: planType || 'Monthly',
      subscriptionStart: start,
      subscriptionEnd: end,
      notes: notes || '',
      status: 'Active',
    });

    // Optionally create a user account for the member
    if (createAccount && password) {
      await User.create({
        name,
        email,
        password,
        role: 'member',
        memberId: member._id,
      });
    }

    res.status(201).json({ success: true, message: 'Member created successfully', data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = async (req, res) => {
  try {
    const { planType, subscriptionStart, status, ...rest } = req.body;
    const updateData = { ...rest, status };

    // Recalculate subscription end if plan changed
    if (planType) {
      const start = subscriptionStart ? new Date(subscriptionStart) : new Date();
      const end = new Date(start);
      if (planType === 'Monthly') end.setMonth(end.getMonth() + 1);
      else if (planType === 'Quarterly') end.setMonth(end.getMonth() + 3);
      else if (planType === 'Yearly') end.setFullYear(end.getFullYear() + 1);
      updateData.planType = planType;
      updateData.subscriptionStart = start;
      updateData.subscriptionEnd = end;
    }

    const member = await Member.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({ success: true, message: 'Member updated successfully', data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    await Payment.deleteMany({ member: req.params.id });
    await User.deleteOne({ memberId: req.params.id });
    await member.deleteOne();

    res.json({ success: true, message: 'Member and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMembers, getMember, createMember, updateMember, deleteMember };
