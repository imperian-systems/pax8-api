import type { BillingTerm } from './products.js';

export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 200;

export const SUBSCRIPTION_STATUSES = [
  'Active',
  'Cancelled',
  'PendingManual',
  'PendingAutomated',
  'PendingCancel',
  'WaitingForDetails',
  'Trial',
  'Converted',
  'PendingActivation',
  'Activated',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// Subscription entity
export interface Subscription {
  id: string;
  companyId: string;
  productId: string;
  quantity: number;
  status: SubscriptionStatus;
  price: number;
  billingTerm: BillingTerm;
  billingStart: string; // ISO 8601
  startDate: string; // ISO 8601
  endDate: string | null; // ISO 8601, nullable
  createdDate: string; // ISO 8601
  commitmentTermId?: string | null;
  commitmentTermMonths?: number | null;
  commitmentEndDate?: string | null; // ISO 8601, nullable
}

// Update subscription request
export interface UpdateSubscriptionRequest {
  quantity: number;
}

// Cancel options
export interface CancelOptions {
  billingDate?: string; // ISO 8601 date string, optional
}

// Subscription history entry
export interface SubscriptionHistory {
  id: string;
  subscriptionId: string;
  action: string; // e.g., 'QuantityUpdate', 'StatusChange', 'Created'
  date: string; // ISO 8601
  userId?: string | null;
  previousQuantity?: number | null;
  newQuantity?: number | null;
}

// List subscriptions options
export interface ListSubscriptionsOptions {
  page?: number;
  size?: number;
  sort?: string;
  companyId?: string;
  productId?: string;
  status?: SubscriptionStatus;
}

// Page metadata for pagination
export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

// Subscription list response
export interface SubscriptionListResponse {
  content: Subscription[];
  page: PageMetadata;
}
