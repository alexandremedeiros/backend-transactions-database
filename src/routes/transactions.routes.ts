import { getCustomRepository } from 'typeorm';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Response {
  transaction: Transaction;
  category: Category;
}

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find({
    relations: ['category'],
  });
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();

  try {
    await deleteTransaction.execute(id);
    return response.status(204).send();
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importFile = path.join(uploadConfig.directory, request.file.filename);

    const importTransactionsService = new ImportTransactionsService();

    const transactions = await importTransactionsService.execute({
      csvFile: importFile,
    });

    return response.json(transactions);
  },
);

export default transactionsRouter;
