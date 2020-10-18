import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomerRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer Does not exisit');
    }

    const productsId = products.map(product => {
      return { id: product.id };
    });

    const foundProducts = await this.productsRepository.findAllById(productsId);
    console.log(foundProducts[0]);

    if (products.length !== foundProducts.length) {
      throw new AppError('Product not exist');
    }

    const order = await this.ordersRepository.create({
      customer,
      products: foundProducts.map(product => {
        return {
          product_id: product.id,
          price: product.price,
          quantity: product.quantity,
        };
      }),
    });

    return order;
  }
}

export default CreateOrderService;
