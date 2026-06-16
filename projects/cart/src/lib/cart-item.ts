export class CartItem {
  id!: string;
  name!: string;
  price!: number;
  quantity!: number;
  sku?: string;


  static clone(item: CartItem, quantity?: number): CartItem {
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity !== undefined ? quantity : item.quantity,
      sku: item.sku,
    };
  }

  static equals(item1: CartItem, item2: CartItem): boolean {
    return (
      item1.id === item2.id &&
      item1.name === item2.name &&
      item1.price === item2.price &&
      item1.quantity === item2.quantity &&
      item1.sku === item2.sku
    );
  } 

  static create(input: Omit<CartItem, 'quantity'> & { quantity: number }): CartItem {
    return {
      id: input.id,
      name: input.name,
      price: input.price,
      quantity: input.quantity,
      sku: input.sku,
    };
  }


}



