import { describe, it, expect, beforeEach, vi } from 'vitest';

import { listContacts, getContact, createContact, updateContact, deleteContact } from '../../../src/api/contacts';
import type { ContactsApiClient } from '../../../src/api/contacts';
import type { ContactListResponse, Contact, CreateContactRequest, UpdateContactRequest } from '../../../src/models/contacts';

/**
 * Contract tests for Contacts API endpoints.
 * These tests verify request/response structures match the OpenAPI specification.
 */

describe('Contacts API Contract Tests', () => {
  let mockClient: ContactsApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  describe('GET /companies/{companyId}/contacts - listContacts', () => {
    it('should return 200 with valid contact list response structure', async () => {
      const mockResponse: ContactListResponse = {
        content: [
          {
            id: 'contact-123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1-555-0123',
            types: [
              { type: 'Admin', primary: true },
              { type: 'Billing', primary: false },
            ],
            createdDate: '2024-01-01T00:00:00Z',
          },
        ],
        page: {
          size: 10,
          totalElements: 1,
          totalPages: 1,
          number: 0,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listContacts(mockClient, { companyId: 'comp-123' });

      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('id');
      expect(result.content[0]).toHaveProperty('firstName');
      expect(result.content[0]).toHaveProperty('lastName');
      expect(result.content[0]).toHaveProperty('email');
      expect(result.content[0]).toHaveProperty('createdDate');
      expect(result.page).toHaveProperty('size');
      expect(result.page).toHaveProperty('totalElements');
      expect(result.page).toHaveProperty('totalPages');
      expect(result.page).toHaveProperty('number');
    });

    it('should handle custom pagination parameters', async () => {
      const mockResponse: ContactListResponse = {
        content: [],
        page: {
          size: 50,
          totalElements: 0,
          totalPages: 0,
          number: 2,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listContacts(mockClient, {
        companyId: 'comp-123',
        page: 2,
        size: 50,
      });

      expect(result.page.size).toBe(50);
      expect(result.page.number).toBe(2);
    });

    it('should return 401 for unauthorized request', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'unauthorized', message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(listContacts(mockClient, { companyId: 'comp-123' })).rejects.toThrow();
    });

    it('should return 404 for non-existent company', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Company not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(listContacts(mockClient, { companyId: 'invalid-company' })).rejects.toThrow();
    });
  });

  describe('GET /companies/{companyId}/contacts/{contactId} - getContact', () => {
    it('should return 200 with valid contact detail', async () => {
      const mockContact: Contact = {
        id: 'contact-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-9876',
        types: [
          { type: 'Admin', primary: true },
          { type: 'Technical', primary: true },
        ],
        createdDate: '2024-01-01T00:00:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockContact), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getContact(mockClient, 'comp-123', 'contact-123');

      expect(result).toEqual(mockContact);
      expect(result.id).toBe('contact-123');
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(result.email).toBe('jane.smith@example.com');
      expect(result.types).toHaveLength(2);
    });

    it('should return 404 for non-existent contact', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Contact not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(getContact(mockClient, 'comp-123', 'invalid-contact')).rejects.toThrow();
    });

    it('should return 401 for unauthorized request', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'unauthorized', message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(getContact(mockClient, 'comp-123', 'contact-123')).rejects.toThrow();
    });
  });

  describe('POST /companies/{companyId}/contacts - createContact', () => {
    it('should return 201 with created contact', async () => {
      const createRequest: CreateContactRequest = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1-555-1111',
        types: [{ type: 'Billing', primary: true }],
      };

      const mockCreated: Contact = {
        id: 'contact-456',
        ...createRequest,
        createdDate: '2024-01-02T00:00:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCreated), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await createContact(mockClient, 'comp-123', createRequest);

      expect(result).toEqual(mockCreated);
      expect(result.id).toBe('contact-456');
      expect(result.firstName).toBe('Alice');
      expect(result.email).toBe('alice.johnson@example.com');
    });

    it('should return 400 for validation errors', async () => {
      const invalidRequest = {
        firstName: 'Bob',
        // Missing required lastName and email
      } as CreateContactRequest;

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 'validation_error',
            message: 'Missing required fields',
            details: { lastName: 'required', email: 'required' },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );

      await expect(createContact(mockClient, 'comp-123', invalidRequest)).rejects.toThrow();
    });

    it('should return 401 for unauthorized request', async () => {
      const createRequest: CreateContactRequest = {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@example.com',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'unauthorized', message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(createContact(mockClient, 'comp-123', createRequest)).rejects.toThrow();
    });

    it('should return 404 for non-existent company', async () => {
      const createRequest: CreateContactRequest = {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david@example.com',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Company not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(createContact(mockClient, 'invalid-company', createRequest)).rejects.toThrow();
    });
  });

  describe('PUT /companies/{companyId}/contacts/{contactId} - updateContact', () => {
    it('should return 200 with updated contact', async () => {
      const updateRequest: UpdateContactRequest = {
        phone: '+1-555-2222',
        types: [
          { type: 'Admin', primary: true },
          { type: 'Technical', primary: true },
        ],
      };

      const mockUpdated: Contact = {
        id: 'contact-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-2222',
        types: [
          { type: 'Admin', primary: true },
          { type: 'Technical', primary: true },
        ],
        createdDate: '2024-01-01T00:00:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockUpdated), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await updateContact(mockClient, 'comp-123', 'contact-123', updateRequest);

      expect(result).toEqual(mockUpdated);
      expect(result.phone).toBe('+1-555-2222');
      expect(result.types).toHaveLength(2);
    });

    it('should return 400 for validation errors', async () => {
      const invalidRequest: UpdateContactRequest = {
        email: 'invalid-email', // Invalid email format
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 'validation_error',
            message: 'Invalid email format',
            details: { email: 'must be a valid email address' },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );

      await expect(updateContact(mockClient, 'comp-123', 'contact-123', invalidRequest)).rejects.toThrow();
    });

    it('should return 404 for non-existent contact', async () => {
      const updateRequest: UpdateContactRequest = {
        phone: '+1-555-3333',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Contact not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(updateContact(mockClient, 'comp-123', 'invalid-contact', updateRequest)).rejects.toThrow();
    });

    it('should return 401 for unauthorized request', async () => {
      const updateRequest: UpdateContactRequest = {
        phone: '+1-555-4444',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'unauthorized', message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(updateContact(mockClient, 'comp-123', 'contact-123', updateRequest)).rejects.toThrow();
    });
  });

  describe('DELETE /companies/{companyId}/contacts/{contactId} - deleteContact', () => {
    it('should return 204 for successful deletion', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        })
      );

      await expect(deleteContact(mockClient, 'comp-123', 'contact-123')).resolves.toBeUndefined();
    });

    it('should return 404 for non-existent contact', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Contact not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(deleteContact(mockClient, 'comp-123', 'invalid-contact')).rejects.toThrow();
    });

    it('should return 401 for unauthorized request', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'unauthorized', message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(deleteContact(mockClient, 'comp-123', 'contact-123')).rejects.toThrow();
    });
  });
});
