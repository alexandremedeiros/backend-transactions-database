import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { types } = require('pg');

types.setTypeParser(1700, 'text', parseFloat);

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income: number = await (
      await this.find({ where: { type: 'income' } })
    ).reduce((accumulator, transaction) => accumulator + transaction.value, 0);

    const outcome: number = await (
      await this.find({ where: { type: 'outcome' } })
    ).reduce((accumulator, transaction) => accumulator + transaction.value, 0);

    const balance: Balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
