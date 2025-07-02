import Transaction from "../models/TransactionModel.js";
import User from "../models/UserSchema.js";
import moment from "moment";

// Add Transaction
export const addTransactionController = async (req, res) => {
  try {
    const {
      title,
      amount,
      description,
      date,
      category,
      userId,
      transactionType,
      isRecurring,
      recurringFrequency,
    } = req.body;

    if (!title || !amount || !description || !date || !category || !transactionType) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const newTransaction = await Transaction.create({
      title,
      amount,
      category,
      description,
      date,
      user: userId,
      transactionType,
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : null,
    });

    user.transactions.push(newTransaction._id);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction added successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All Transactions
export const getAllTransactionController = async (req, res) => {
  try {
    const { userId, type, frequency, startDate, endDate } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const query = { user: userId };

    if (type !== "all") {
      query.transactionType = type;
    }

    if (frequency !== "custom") {
      query.date = {
        $gt: moment().subtract(Number(frequency), "days").toDate(),
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: moment(startDate).toDate(),
        $lte: moment(endDate).toDate(),
      };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete Transaction
export const deleteTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.body.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const deleted = await Transaction.findByIdAndDelete(transactionId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    user.transactions = user.transactions.filter(
      (tid) => tid.toString() !== transactionId
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Transaction
export const updateTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { title, amount, description, date, category, transactionType } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    if (title) transaction.title = title;
    if (description) transaction.description = description;
    if (amount) transaction.amount = amount;
    if (category) transaction.category = category;
    if (transactionType) transaction.transactionType = transactionType;
    if (date) transaction.date = date;

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
