import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const CreateTransaction = new CreateTransactionService();

  const transaction = await CreateTransaction.execute({
    title,
    value,
    type,
    category,
  });

  const transactionsRepository = await getCustomRepository(
    TransactionsRepository,
  );

  const total = await transactionsRepository.getBalance();

  if (type === 'outcome') {
    if (value > total.total) {
      return response
        .status(400)
        .json({ message: 'Você não tem saldo disponível', status: 'error' });
    }
  }

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const DeleteTransaction = new DeleteTransactionService();

  await DeleteTransaction.execute(id);

  return response.send().status(204);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const ImportTransactions = new ImportTransactionsService();

    const transactions = await ImportTransactions.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
