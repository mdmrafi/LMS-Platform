const BankService = require('../services/bankService');

// Initialize LMS bank account
const initializeBank = async () => {
  try {
    const lmsAccountNumber = process.env.LMS_BANK_ACCOUNT;
    const lmsInitialBalance = parseFloat(process.env.LMS_INITIAL_BALANCE) || 1000000;

    console.log('🏦 Initializing LMS bank account via Bank Service...');

    // Check if bank service is available
    const healthCheck = await BankService.healthCheck();
    if (!healthCheck.success) {
      console.warn('⚠️  Bank service is not available. Please start the bank service first.');
      console.warn('   Run: cd bank-service && npm run dev');
      return;
    }

    // Try to get existing account
    const existingAccount = await BankService.getBalance(lmsAccountNumber);

    if (existingAccount.success) {
      console.log('✅ LMS bank account already exists');
      console.log(`   Account Number: ${existingAccount.data.accountNumber}`);
      console.log(`   Balance: ${existingAccount.data.balance}`);
      return;
    }

    // Register LMS account with Bank Service
    const result = await BankService.registerAccount({
      accountNumber: lmsAccountNumber,
      accountHolder: 'LMS Organization',
      accountType: 'lms',
      initialBalance: lmsInitialBalance,
      secret: process.env.BANK_SECRET_KEY || 'lms_secret_key'
    });

    if (result.success) {
      console.log('✅ LMS bank account created successfully');
      console.log(`   Account Number: ${result.data.accountNumber}`);
      console.log(`   Initial Balance: ${result.data.balance}`);
    } else {
      console.error('❌ Failed to create LMS bank account:', result.message);
    }
  } catch (error) {
    console.error('❌ Error initializing LMS bank account:', error.message);
  }
};

module.exports = initializeBank;
