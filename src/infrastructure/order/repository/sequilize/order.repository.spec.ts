import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await await orderRepository.find(order.id);

    expect(orderModel).toStrictEqual(order);
  });

  it("should update an order", async () => {
    const customerRepository = new CustomerRepository();
    const productRepository = new ProductRepository();
    const orderRepository = new OrderRepository();

    // Customer
    const customer = new Customer("123", "Customer 1");
    customer.Address = new Address("Street 1", 1, "Zipcode 1", "City 1")
    await customerRepository.create(customer);

    // Product
    const product = new Product("01", "Product 1", 10);
    await productRepository.create(product);

    // Order
    const orderItem = new OrderItem("1", product.name, product.price, product.id, 2);
    const order = new Order("123", "123", [orderItem]);
    await orderRepository.create(order);

    // Update order
    const updatedProduct = new Product("02", "Product 2", 20);
    await productRepository.update(updatedProduct);

    const updatedOrderItem = new OrderItem("1", product.name, product.price, product.id, 2);
    const updatedOrder = new Order("123", "123", [updatedOrderItem]);
    await orderRepository.update(updatedOrder);

    // Validate Update
    const orderEntityFromBD = await orderRepository.find(order.id);
    expect(orderEntityFromBD).toStrictEqual(updatedOrder);
  });

  it("should get all orders", async () => {
    const customerRepository = new CustomerRepository();
    const productRepository = new ProductRepository();
    const orderRepository = new OrderRepository();

    // Customer
    const customer = new Customer("123", "Customer 1");
    customer.Address = new Address("Street 1", 1, "Zipcode 1", "City 1")
    await customerRepository.create(customer);

    // Product's
    const product1 = new Product("01", "Product 1", 10);
    const product2 = new Product("02", "Product 2", 20);
    await productRepository.create(product1);
    await productRepository.create(product2);

    // Order's
    const order1 = new Order("123", "123", [
      new OrderItem("1", product1.name, product1.price, product1.id, 1)
    ]);
    await orderRepository.create(order1);

    const order2 = new Order("456", "123", [
      new OrderItem("2", product2.name, product2.price, product2.id, 2)
    ]);
    await orderRepository.create(order2);

    // Validate Update
    const ordersFromBD = await orderRepository.findAll();
    expect(ordersFromBD.length).toBe(2);
    expect(ordersFromBD[0]).toStrictEqual(order1);
    expect(ordersFromBD[1]).toStrictEqual(order2);
  });
});
