import Order from "../../../../domain/checkout/entity/order";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItem from "../../../../domain/checkout/entity/order_item";

export default class OrderRepository implements OrderRepositoryInterface {

    async create(entity: Order): Promise<void> {
        await OrderModel.create({
                id: entity.id,
                customer_id: entity.customerId,
                total: entity.total(),
                items: entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
            }, {
                include: [{model: OrderItemModel}],
            }
        );
    }

    async update(entity: Order): Promise<void> {
        await OrderModel.update({
                customer_id: entity.customerId,
                total: entity.total(),
                items: entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
            }, {
                where: {id: entity.id}
            }
        );
    }

    async find(id: string): Promise<Order> {
        let orderModel: OrderModel;
        try {
            orderModel = await OrderModel.findOne({
                where: {
                    id,
                },
                rejectOnEmpty: true,
                include: ["items"],
            });
        } catch (error) {
            throw new Error("Order not found");
        }

        return this.convertModelToEntity(orderModel);
    }

    async findAll(): Promise<Order[]> {
        const orderModels = await OrderModel.findAll({
            include: ["items"],
        });
        return orderModels.map((orderModel) => this.convertModelToEntity(orderModel));
    }

    private convertModelToEntity(orderModel: OrderModel) {
        return new Order(orderModel.id, orderModel.customer_id, orderModel.items.map((item) =>
            new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
        ));
    }

}
