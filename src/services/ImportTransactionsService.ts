import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionCsv {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    const CreateTransaction = new CreateTransactionService();

    const csvFilePath = path.resolve(
      uploadConfig.directory,
      'import_template.csv',
    );
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] | PromiseLike<Transaction[]> = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const data of lines) {
      const [title, type, value, category] = data;

      // eslint-disable-next-line no-await-in-loop
      await CreateTransaction.execute({
        title,
        type,
        value,
        category,
      });
    }

    return lines;
  }
}

export default ImportTransactionsService;
