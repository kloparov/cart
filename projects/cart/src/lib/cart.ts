import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from './cart-item';

export type AddCartItemInput = Omit<CartItem, 'quantity'> & { quantity?: number };

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 0;
  }

  return Math.floor(quantity);
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly items = new Map<string, CartItem>();
  private readonly store = new BehaviorSubject<readonly CartItem[]>([]);

  readonly items$ = this.store.asObservable();

  getTotalItems(): number {
    return this.store.value.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.store.value.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getItems(): readonly CartItem[] {
    return this.store.value;
  }

  getById(itemId: string): CartItem | undefined {
    return this.items.get(itemId);
  }

  getQuantity(itemId: string): number {
    const item = this.getById(itemId);
    return item ? item.quantity : 0;
  }

  add(item: AddCartItemInput): void {
    const quantity = normalizeQuantity(item.quantity ?? 1) || 1;
    const existing = this.getById(item.id);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.set(item.id, CartItem.create({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: quantity,
        sku: item.sku,
      }));
    }
    
    this.flush();
  }

  remove(itemId: string): void {
    if (this.items.delete(itemId)) {
      this.flush();
    }
  }

  update(itemId: string, quantity: number): void {
    const temp = this.getById(itemId);
    if (temp) {
      if (normalizeQuantity(quantity) === 0) {
        this.remove(itemId);
        return;
      }

      temp.quantity = normalizeQuantity(quantity);
      this.items.set(itemId, temp);
      this.flush();
    }
  }

  clear(): void {
    if (this.items.size === 0) {
      return;
    }

    this.items.clear();
    this.flush();
  }

  private flush(): void {
    this.store.next(Array.from(this.items.values()));
  }
}
