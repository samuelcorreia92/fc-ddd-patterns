import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import CustomerRepositoryInterface from "../../../../domain/customer/repository/customer-repository.interface";
import CustomerModel from "./customer.model";
import EventDispatcherInterface from "../../../../domain/@shared/event/event-dispatcher.interface";
import EventDispatcher from "../../../../domain/@shared/event/event-dispatcher";
import EnviaConsoleLog1Handler from "../../../../domain/customer/event/handler/EnviaConsoleLog1Handler";
import EnviaConsoleLog2Handler from "../../../../domain/customer/event/handler/EnviaConsoleLog2Handler";
import CustomerCreatedEvent from "../../../../domain/customer/event/customer-created.event";
import EventHandlerInterface from "../../../../domain/@shared/event/event-handler.interface";

export default class CustomerRepository implements CustomerRepositoryInterface {

  private _eventHandler1: EventHandlerInterface;
  private _eventHandler2: EventHandlerInterface;
  private _eventDispatcher: EventDispatcherInterface;

  constructor() {
    this._eventHandler1 = new EnviaConsoleLog1Handler();
    this._eventHandler2 = new EnviaConsoleLog2Handler();
    this._eventDispatcher = new EventDispatcher();
    this._eventDispatcher.register("CustomerCreatedEvent", this._eventHandler1);
    this._eventDispatcher.register("CustomerCreatedEvent", this._eventHandler2);
  }

  async create(entity: Customer): Promise<void> {
    await CustomerModel.create({
      id: entity.id,
      name: entity.name,
      street: entity.Address.street,
      number: entity.Address.number,
      zipcode: entity.Address.zip,
      city: entity.Address.city,
      active: entity.isActive(),
      rewardPoints: entity.rewardPoints,
    });

    this._eventDispatcher.notify(new CustomerCreatedEvent(entity));
  }

  async update(entity: Customer): Promise<void> {
    await CustomerModel.update(
      {
        name: entity.name,
        street: entity.Address.street,
        number: entity.Address.number,
        zipcode: entity.Address.zip,
        city: entity.Address.city,
        active: entity.isActive(),
        rewardPoints: entity.rewardPoints,
      },
      {
        where: {
          id: entity.id,
        },
      }
    );
  }

  async find(id: string): Promise<Customer> {
    let customerModel;
    try {
      customerModel = await CustomerModel.findOne({
        where: {
          id,
        },
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Customer not found");
    }

    const customer = new Customer(id, customerModel.name);
    const address = new Address(
      customerModel.street,
      customerModel.number,
      customerModel.zipcode,
      customerModel.city
    );
    customer.changeAddress(address);
    return customer;
  }

  async findAll(): Promise<Customer[]> {
    const customerModels = await CustomerModel.findAll();

    const customers = customerModels.map((customerModels) => {
      let customer = new Customer(customerModels.id, customerModels.name);
      customer.addRewardPoints(customerModels.rewardPoints);
      const address = new Address(
        customerModels.street,
        customerModels.number,
        customerModels.zipcode,
        customerModels.city
      );
      customer.changeAddress(address);
      if (customerModels.active) {
        customer.activate();
      }
      return customer;
    });

    return customers;
  }
}
