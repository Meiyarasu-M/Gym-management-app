const Member = require('../models/Member');
const Payment = require('../models/Payment');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // Member counts
    const [totalMembers, activeMembers, inactiveMembers, expiringMembers] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'Active' }),
      Member.countDocuments({ status: 'Inactive' }),
      Member.countDocuments({
        subscriptionEnd: {
          $gte: now,
          $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        status: 'Active',
      }),
    ]);

    // Total revenue
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly income for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyIncome = await Payment.aggregate([
      {
        $match: {
          date: { $gte: twelveMonthsAgo },
          status: 'Completed',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          income: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly income with month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyIncome.map((item) => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      income: item.income,
      count: item.count,
    }));

    // Recent payments (last 8)
    const recentPayments = await Payment.find({ status: 'Completed' })
      .populate('member', 'name email planType')
      .sort({ date: -1 })
      .limit(8);

    // Plan distribution
    const planDistribution = await Member.aggregate([
      { $group: { _id: '$planType', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        expiringMembers,
        totalRevenue,
        monthlyIncome: formattedMonthly,
        recentPayments,
        planDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
