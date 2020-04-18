import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const checkExistingTransaction = await transactionsRepository.findOne({
      where: { id },
    });

    if (!checkExistingTransaction) {
      throw new AppError('Transaction not exists');
    }

    await transactionsRepository.delete({ id });
  }
}

export default DeleteTransactionService;
