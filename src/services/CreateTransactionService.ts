import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (value > total) {
        throw new AppError('Value for outcome is bigger than total value');
      }
    }

    const categoriesRepository = getRepository(Category);

    let category_id = '';

    const checkCategoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    /*
    If exists, get the category id to create the transaction
    If category not exists, create and use retrieve category id to create the transaction.
    */
    if (checkCategoryExists) {
      category_id = checkCategoryExists.id;
    } else {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);

      category_id = newCategory.id;
    }

    const categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id,
      category: categoryExists,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
