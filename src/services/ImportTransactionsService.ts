import csvtojson from 'csvtojson';
import fs from 'fs';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  csvFile: string;
}

class ImportTransactionsService {
  async execute({ csvFile }: Request): Promise<Transaction[]> {
    const data = await csvtojson().fromFile(csvFile);

    const transactions: Transaction[] = [];

    const createTransactionService = new CreateTransactionService();

    for (const transactionArray of data) {
      const transaction = await createTransactionService.execute(
        transactionArray,
      );

      transactions.push(transaction);
    }

    await fs.promises.unlink(csvFile);

    return transactions;
  }
}

export default ImportTransactionsService;
