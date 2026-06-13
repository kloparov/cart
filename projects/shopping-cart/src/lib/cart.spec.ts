import { CartService } from './cart';

describe('ShoppingCartService', () => {
  let service: CartService;

  beforeEach(() => {
    service = new CartService();
  });

  describe('add()', () => {
    it('should add items and calculate totals', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2 });
      service.add({ id: 'pen-1', name: 'Pen', price: 1.5, quantity: 3 });

      const items = service.getItems();
      expect(items.length).toBe(2);
      expect(items[0]).toEqual({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2, sku: undefined });
      expect(items[1]).toEqual({ id: 'pen-1', name: 'Pen', price: 1.5, quantity: 3, sku: undefined });
      expect(service.getTotalItems()).toBe(5);
      expect(service.getSubtotal()).toBe(29.5);
    });

    it('should merge quantities when adding duplicate item ids', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 1 });
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2 });

      expect(service.getItems()).toEqual([{ id: 'book-1', name: 'Book', price: 12.5, quantity: 3, sku: undefined }]);
    });

    it('should use default quantity of 1 when not provided', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5 });

      expect(service.getItems()).toEqual([{ id: 'book-1', name: 'Book', price: 12.5, quantity: 1, sku: undefined }]);
      expect(service.getTotalItems()).toBe(1);
    });

    it('should normalize quantity to 1 when quantity is 0', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 0 });

      expect(service.getItems()[0].quantity).toBe(1);
    });

    it('should normalize negative quantities to 1', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: -5 });

      expect(service.getItems()[0].quantity).toBe(1);
    });

    it('should floor decimal quantities', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 3.7 });

      expect(service.getItems()[0].quantity).toBe(3);
    });

    it('should handle sku property', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 1, sku: 'SKU-123' });

      expect(service.getItems()[0].sku).toBe('SKU-123');
    });
  });

  describe('update()', () => {
    beforeEach(() => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2 });
    });

    it('should update item quantity', () => {
      service.update('book-1', 5);

      expect(service.getItems()[0].quantity).toBe(5);
      expect(service.getTotalItems()).toBe(5);
    });

    it('should remove items when quantity is updated to zero', () => {
      service.update('book-1', 0);

      expect(service.getItems()).toEqual([]);
    });

    it('should not affect non-existent items', () => {
      service.update('non-existent', 10);

      expect(service.getItems().length).toBe(1);
    });

    it('should floor decimal quantities on update', () => {
      service.update('book-1', 4.9);

      expect(service.getItems()[0].quantity).toBe(4);
    });
  });

  describe('remove()', () => {
    it('should remove items by id', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 1 });
      service.add({ id: 'pen-1', name: 'Pen', price: 1.5, quantity: 2 });

      service.remove('book-1');

      expect(service.getItems()).toEqual([{ id: 'pen-1', name: 'Pen', price: 1.5, quantity: 2, sku: undefined }]);
    });

    it('should not affect other items when removing', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 1 });
      service.add({ id: 'pen-1', name: 'Pen', price: 1.5, quantity: 2 });

      service.remove('book-1');

      expect(service.getTotalItems()).toBe(2);
    });

    it('should do nothing when removing non-existent item', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 1 });

      service.remove('non-existent');

      expect(service.getItems().length).toBe(1);
    });
  });

  describe('clear()', () => {
    it('should remove all items', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 1 });
      service.add({ id: 'pen-1', name: 'Pen', price: 1.5, quantity: 2 });

      service.clear();

      expect(service.getItems()).toEqual([]);
      expect(service.getTotalItems()).toBe(0);
      expect(service.getSubtotal()).toBe(0);
    });

    it('should do nothing when cart is already empty', () => {
      service.clear();

      expect(service.getItems()).toEqual([]);
    });
  });

  describe('getById()', () => {
    it('should return item by id', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2 });

      const item = service.getById('book-1');

      expect(item).toEqual({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2, sku: undefined });
    });

    it('should return undefined for non-existent item', () => {
      expect(service.getById('non-existent')).toBeUndefined();
    });
  });

  describe('getQuantity()', () => {
    it('should return quantity of item', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 3 });

      expect(service.getQuantity('book-1')).toBe(3);
    });

    it('should return 0 for non-existent item', () => {
      expect(service.getQuantity('non-existent')).toBe(0);
    });
  });

  describe('getTotalItems()', () => {
    it('should calculate total items across all cart items', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2 });
      service.add({ id: 'pen-1', name: 'Pen', price: 1.5, quantity: 3 });

      expect(service.getTotalItems()).toBe(5);
    });

    it('should return 0 for empty cart', () => {
      expect(service.getTotalItems()).toBe(0);
    });
  });

  describe('getSubtotal()', () => {
    it('should calculate subtotal correctly', () => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2 });
      service.add({ id: 'pen-1', name: 'Pen', price: 1.5, quantity: 3 });

      expect(service.getSubtotal()).toBe(29.5);
    });

    it('should return 0 for empty cart', () => {
      expect(service.getSubtotal()).toBe(0);
    });
  });

  describe('items$', () => {
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

      service.add({ id: 'book-1', name: 'Book', price: 12.5 });
    });

    it('should emit on remove', (done) => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 1 });

      const subscription = service.items$.subscribe((items) => {
        if (items.length === 0) {
          expect(items).toEqual([]);
          subscription.unsubscribe();
          done();
        }
      });

      service.remove('book-1');
    });

    it('should emit on update', (done) => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 2 });

      let emissionCount = 0;
      const subscription = service.items$.subscribe((items) => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(items[0].quantity).toBe(5);
          subscription.unsubscribe();
          done();
        }
      });

      service.update('book-1', 5);
    });

    it('should emit on clear', (done) => {
      service.add({ id: 'book-1', name: 'Book', price: 12.5, quantity: 1 });

      let emissionCount = 0;
      const subscription = service.items$.subscribe((items) => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(items).toEqual([]);
          subscription.unsubscribe();
          done();
        }
      });

      service.clear();
    });
  });
});
