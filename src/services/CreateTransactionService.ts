import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_title,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();

      if (value > balance.total) {
        throw new AppError('Inssuficient Balance.');
      }
    }

    const category: Category = await this.getCategory(category_title);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }

  private async getCategory(category_title: string): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const category = await categoriesRepository.findOne({
      where: { title: category_title },
    });

    // Se a categoria não existir, cria uma nova.
    if (!category) {
      const newCategory = categoriesRepository.create({
        title: category_title,
      });
      await categoriesRepository.save(newCategory);
      return newCategory;
    }

    return category;
  }
}

export default CreateTransactionService;
