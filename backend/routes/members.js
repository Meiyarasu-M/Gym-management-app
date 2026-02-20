const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getMembers).post(authorize('admin'), createMember);
router.route('/:id')
  .get(getMember)
  .put(authorize('admin'), updateMember)
  .delete(authorize('admin'), deleteMember);

module.exports = router;
