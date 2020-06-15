import Transaction from '../models/Transaction';
import CSV from '../classes/LoadCSV';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(transactions_file_name: string): Promise<Transaction[] | any> {
    const loadCSV = new CSV();

    const transactionsFile = await loadCSV.loadCSV(transactions_file_name);

    const createTransaction = new CreateTransactionService();

    const transactionsIncome = transactionsFile.lines.filter(
      transaction => transaction.type === 'income',
    );

    const transactionsOutcome = transactionsFile.lines.filter(
      transaction => transaction.type === 'outcome',
    );

    let transactions: Transaction[] = [];

    if (transactionsIncome) {
      const createTransactionsIncomePromises: Array<Promise<Transaction>> = [];
      transactionsIncome.map(transaction => {
        return createTransactionsIncomePromises.push(
          createTransaction.execute(transaction),
        );
      });

      const transactionsIncomeCreated = await Promise.all(
        createTransactionsIncomePromises,
      );

      transactions = [...transactions, ...transactionsIncomeCreated];
    }

    if (transactionsOutcome) {
      const createTransactionsOutcomePromises: Array<Promise<Transaction>> = [];

      transactionsOutcome.map(transaction => {
        return createTransactionsOutcomePromises.push(
          createTransaction.execute(transaction),
        );
      });

      const transactionsOutcomeCreated = await Promise.all(
        createTransactionsOutcomePromises,
      );

      transactions = [...transactions, ...transactionsOutcomeCreated];
    }

    return transactions;
  }
}

export default ImportTransactionsService;
