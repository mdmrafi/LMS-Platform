// Quick script to add balance to learner1
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const bankAccountSchema = new mongoose.Schema({
    accountNumber: String,
    accountHolder: String,
    accountType: String,
    balance: Number,
    secret: String,
    transactions: Array
}, { timestamps: true });

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

const addBalance = async () => {
    try {
        const BANK_DB_URI = process.env.BANK_MONGODB_URI || 'mongodb://localhost:27017/bank_database';
        await mongoose.connect(BANK_DB_URI);

        console.log('Connected to Bank database');

        // Find learner1's account (starts with ACC-L)
        const learnerAccount = await BankAccount.findOne({
            accountHolder: 'Alice Learner'
        });

        if (!learnerAccount) {
            console.log('❌ Learner account not found');
            process.exit(1);
        }

        console.log(`Found account: ${learnerAccount.accountNumber}`);
        console.log(`Current balance: ₹${learnerAccount.balance}`);

        // Add 50,000 to balance
        const amountToAdd = 50000;
        learnerAccount.balance += amountToAdd;

        // Add transaction record
        learnerAccount.transactions.push({
            transactionId: `ADMIN-ADD-${Date.now()}`,
            type: 'credit',
            amount: amountToAdd,
            balanceAfter: learnerAccount.balance,
            description: 'Admin balance addition',
            date: new Date()
        });

        await learnerAccount.save();

        console.log(`✅ Added ₹${amountToAdd} to account`);
        console.log(`New balance: ₹${learnerAccount.balance}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addBalance();
