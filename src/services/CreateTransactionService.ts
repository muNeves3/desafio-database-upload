// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

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
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const CategoryRepository = getRepository(Category);

    let CategoryFind = await CategoryRepository.findOne({
      where: { title: category },
    });

    if (!CategoryFind) {
      CategoryFind = await CategoryRepository.create({
        title: category,
      });

      await CategoryRepository.save(CategoryFind);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: CategoryFind,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
