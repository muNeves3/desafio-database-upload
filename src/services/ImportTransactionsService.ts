import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionCsv {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const readCsvStream = fs.createReadStream(filePath);
    const parseStream = csvParse({
      from_line: 2,
    });
    const parseCsv = readCsvStream.pipe(parseStream);

    const transactions: TransactionCsv[] = [];
    const categories: string[] = [];

    parseCsv.on('data', async line => {
      const [title, value, type, category] = line.map((cell: string) =>
        cell.trim(),
      );

      // eslint-disable-next-line no-useless-return
      if (!title || !value || !type) return;

      categories.push(category);
      transactions.push({ title, value, type, category });
    });
    await new Promise(resolve => parseCsv.on('end', resolve));

    const existenceCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existenceCategoriesTitle = existenceCategories.map(category => {
      return category.title;
    });

    const AddCategorytitles = categories
      .filter(category => !existenceCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = await categoriesRepository.create(
      AddCategorytitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existenceCategories];

    const createdTansactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTansactions);

    await fs.promises.unlink(filePath);

    return createdTansactions;
  }
}

export default ImportTransactionsService;
