import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from './cart-item';

export type AddCartItemInput = Omit<CartItem, 'quantity'> & { quantity?: number };

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private readonly itemsMap = new Map<string, CartItem>();
  private readonly itemsSubject = new BehaviorSubject<readonly CartItem[]>([]);

  readonly items$ = this.itemsSubject.asObservable();

  getItems(): readonly CartItem[] {
    return this.itemsSubject.value;
  }

  addItem(item: AddCartItemInput): void {
    const quantity = this.normalizeQuantity(item.quantity ?? 1);
    if (!quantity) {
      return;
    }

    const existingItem = this.itemsMap.get(item.id);
    if (existingItem) {
      existingItem.quantity += quantity;
      this.itemsMap.set(item.id, existingItem);
    } else {
      this.itemsMap.set(item.id, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
      });
    }

    this.publish();
  }

  removeItem(itemId: string): void {
    if (this.itemsMap.delete(itemId)) {
      this.publish();
    }
  }

  updateQuantity(itemId: string, quantity: number): void {
    const existingItem = this.itemsMap.get(itemId);
    if (!existingItem) {
      return;
    }

    const normalizedQuantity = this.normalizeQuantity(quantity);
    if (!normalizedQuantity) {
      this.removeItem(itemId);
      return;
    }

    existingItem.quantity = normalizedQuantity;
    this.itemsMap.set(itemId, existingItem);
    this.publish();
  }

  clear(): void {
    if (this.itemsMap.size === 0) {
      return;
    }

    this.itemsMap.clear();
    this.publish();
  }

  getTotalItems(): number {
    return this.itemsSubject.value.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.itemsSubject.value.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  private normalizeQuantity(quantity: number): number {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return 0;
    }

    return Math.floor(quantity);
  }

  private publish(): void {
    this.itemsSubject.next(Array.from(this.itemsMap.values()));
  }
}
