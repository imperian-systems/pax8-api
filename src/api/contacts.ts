import {
  Contact,
  ContactListResponse,
  CreateContactRequest,
  UpdateContactRequest,
  ListContactsParams,
  assertContact,
  assertContactListResponse,
  isCreateContactRequest,
  isUpdateContactRequest,
  MIN_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../models/contacts';

export interface ContactsApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>;
}

/**
 * Contacts API namespace for the Pax8Client.
 * Provides methods for listing, retrieving, creating, updating, and deleting company contacts.
 */
export class ContactsApi {
  constructor(private readonly client: ContactsApiClient) {}

  /**
   * List contacts for a company with page-based pagination.
   *
   * @param params - Company ID and pagination parameters
   * @returns Promise resolving to a paginated list of contacts
   */
  async list(params: ListContactsParams): Promise<ContactListResponse> {
    return listContacts(this.client, params);
  }

  /**
   * Get a specific contact by ID.
   *
   * @param companyId - The unique identifier of the company
   * @param contactId - The unique identifier of the contact
   * @returns Promise resolving to the contact details
   */
  async get(companyId: string, contactId: string): Promise<Contact> {
    return getContact(this.client, companyId, contactId);
  }

  /**
   * Create a new contact for a company.
   *
   * @param companyId - The unique identifier of the company
   * @param request - Contact creation data
   * @returns Promise resolving to the created contact
   */
  async create(companyId: string, request: CreateContactRequest): Promise<Contact> {
    return createContact(this.client, companyId, request);
  }

  /**
   * Update an existing contact with partial data.
   *
   * @param companyId - The unique identifier of the company
   * @param contactId - The unique identifier of the contact
   * @param request - Partial contact update data
   * @returns Promise resolving to the updated contact
   */
  async update(companyId: string, contactId: string, request: UpdateContactRequest): Promise<Contact> {
    return updateContact(this.client, companyId, contactId, request);
  }

  /**
   * Delete a contact from a company.
   *
   * @param companyId - The unique identifier of the company
   * @param contactId - The unique identifier of the contact
   * @returns Promise resolving when deletion is complete
   */
  async delete(companyId: string, contactId: string): Promise<void> {
    return deleteContact(this.client, companyId, contactId);
  }
}

const handleErrorResponse = async (response: Response): Promise<never> => {
  const contentType = response.headers.get('content-type');
  let errorData: unknown;

  if (contentType?.includes('application/json')) {
    try {
      errorData = await response.json();
    } catch {
      errorData = { code: 'unknown_error', message: response.statusText || 'Unknown error' };
    }
  } else {
    errorData = { code: 'unknown_error', message: response.statusText || 'Unknown error' };
  }

  const errorMessage =
    typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof errorData.message === 'string'
      ? errorData.message
      : response.statusText || 'Unknown error';

  throw new Error(errorMessage);
};

/**
 * List contacts for a company with page-based pagination.
 *
 * @param client - API client with request method
 * @param params - Company ID and pagination parameters
 * @returns Promise resolving to a paginated list of contacts
 */
export const listContacts = async (
  client: ContactsApiClient,
  params: ListContactsParams,
): Promise<ContactListResponse> => {
  if (!params?.companyId || typeof params.companyId !== 'string' || params.companyId.trim().length === 0) {
    throw new TypeError('companyId is required and must be a non-empty string');
  }

  // Validate and normalize page parameter
  let page = 0;
  if (params.page !== undefined) {
    if (typeof params.page !== 'number' || !Number.isInteger(params.page) || params.page < 0) {
      throw new TypeError('page must be a non-negative integer');
    }
    page = params.page;
  }

  // Validate and normalize size parameter
  let size = DEFAULT_PAGE_SIZE;
  if (params.size !== undefined) {
    if (typeof params.size !== 'number' || !Number.isInteger(params.size)) {
      throw new TypeError('size must be an integer');
    }
    if (params.size < MIN_PAGE_SIZE || params.size > MAX_PAGE_SIZE) {
      throw new TypeError(`size must be between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}`);
    }
    size = params.size;
  }

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  searchParams.set('size', size.toString());

  const path = `/companies/${encodeURIComponent(params.companyId)}/contacts?${searchParams.toString()}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertContactListResponse(data);

  return data;
};

/**
 * Get a specific contact by ID.
 *
 * @param client - API client with request method
 * @param companyId - The unique identifier of the company
 * @param contactId - The unique identifier of the contact
 * @returns Promise resolving to the contact details
 */
export const getContact = async (client: ContactsApiClient, companyId: string, contactId: string): Promise<Contact> => {
  if (!companyId || typeof companyId !== 'string' || companyId.trim().length === 0) {
    throw new TypeError('companyId is required and must be a non-empty string');
  }

  if (!contactId || typeof contactId !== 'string' || contactId.trim().length === 0) {
    throw new TypeError('contactId is required and must be a non-empty string');
  }

  const path = `/companies/${encodeURIComponent(companyId)}/contacts/${encodeURIComponent(contactId)}`;
  const response = await client.request(path, { method: 'GET' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertContact(data);

  return data;
};

/**
 * Create a new contact for a company.
 *
 * @param client - API client with request method
 * @param companyId - The unique identifier of the company
 * @param request - Contact creation data
 * @returns Promise resolving to the created contact
 */
export const createContact = async (
  client: ContactsApiClient,
  companyId: string,
  request: CreateContactRequest,
): Promise<Contact> => {
  if (!companyId || typeof companyId !== 'string' || companyId.trim().length === 0) {
    throw new TypeError('companyId is required and must be a non-empty string');
  }

  if (!isCreateContactRequest(request)) {
    throw new TypeError('Invalid create contact request');
  }

  const path = `/companies/${encodeURIComponent(companyId)}/contacts`;
  const response = await client.request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertContact(data);

  return data;
};

/**
 * Update an existing contact with partial data.
 *
 * @param client - API client with request method
 * @param companyId - The unique identifier of the company
 * @param contactId - The unique identifier of the contact
 * @param request - Partial contact update data
 * @returns Promise resolving to the updated contact
 */
export const updateContact = async (
  client: ContactsApiClient,
  companyId: string,
  contactId: string,
  request: UpdateContactRequest,
): Promise<Contact> => {
  if (!companyId || typeof companyId !== 'string' || companyId.trim().length === 0) {
    throw new TypeError('companyId is required and must be a non-empty string');
  }

  if (!contactId || typeof contactId !== 'string' || contactId.trim().length === 0) {
    throw new TypeError('contactId is required and must be a non-empty string');
  }

  if (!isUpdateContactRequest(request)) {
    throw new TypeError('Invalid update contact request');
  }

  const path = `/companies/${encodeURIComponent(companyId)}/contacts/${encodeURIComponent(contactId)}`;
  const response = await client.request(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const data: unknown = await response.json();
  assertContact(data);

  return data;
};

/**
 * Delete a contact from a company.
 *
 * @param client - API client with request method
 * @param companyId - The unique identifier of the company
 * @param contactId - The unique identifier of the contact
 * @returns Promise resolving when deletion is complete
 */
export const deleteContact = async (
  client: ContactsApiClient,
  companyId: string,
  contactId: string,
): Promise<void> => {
  if (!companyId || typeof companyId !== 'string' || companyId.trim().length === 0) {
    throw new TypeError('companyId is required and must be a non-empty string');
  }

  if (!contactId || typeof contactId !== 'string' || contactId.trim().length === 0) {
    throw new TypeError('contactId is required and must be a non-empty string');
  }

  const path = `/companies/${encodeURIComponent(companyId)}/contacts/${encodeURIComponent(contactId)}`;
  const response = await client.request(path, { method: 'DELETE' });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  // DELETE returns 204 No Content, so no body to parse
};
