import { ShoppingCartService } from './shopping-cart';

describe('ShoppingCartService', () => {
  let service: ShoppingCartService;

  beforeEach(() => {
    service = new ShoppingCartService();
  });

  it('should add items and calculate totals', () => {
    service.addItem({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2 });
    service.addItem({ id: 'pen-1', name: 'Pen', price: 1.5, quantity: 3 });

    expect(service.getItems()).toEqual([
      { id: 'book-1', name: 'Book', price: 12.5, quantity: 2 },
      { id: 'pen-1', name: 'Pen', price: 1.5, quantity: 3 },
    ]);
    expect(service.getTotalItems()).toBe(5);
    expect(service.getSubtotal()).toBe(29.5);
  });

  it('should merge quantities when adding duplicate item ids', () => {
    service.addItem({ id: 'book-1', name: 'Book', price: 12.5, quantity: 1 });
    service.addItem({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2 });

    expect(service.getItems()).toEqual([{ id: 'book-1', name: 'Book', price: 12.5, quantity: 3 }]);
  });

  it('should remove items when quantity is updated to zero', () => {
    service.addItem({ id: 'book-1', name: 'Book', price: 12.5, quantity: 1 });

    service.updateQuantity('book-1', 0);

    expect(service.getItems()).toEqual([]);
  });

  it('should expose item changes through items$', (done) => {
    const snapshots: string[] = [];

    const subscription = service.items$.subscribe((items) => {
      snapshots.push(JSON.stringify(items));
      if (snapshots.length === 2) {
        expect(snapshots[0]).toBe('[]');
        expect(snapshots[1]).toBe('[{"id":"book-1","name":"Book","price":12.5,"quantity":1}]');
        subscription.unsubscribe();
        done();
      }
    });

    service.addItem({ id: 'book-1', name: 'Book', price: 12.5 });
  });
});
