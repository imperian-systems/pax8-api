import { describe, it, expect, beforeEach, vi } from 'vitest';

import { listContacts, getContact, createContact, updateContact, deleteContact } from '../../../src/api/contacts';
import type { ContactsApiClient } from '../../../src/api/contacts';
import type { ContactListResponse, Contact, CreateContactRequest, UpdateContactRequest } from '../../../src/models/contacts';

/**
 * Integration tests for Contacts API flows.
 * These tests verify complete user journeys with realistic data flows.
 */

describe('Contacts API Integration Tests', () => {
  let mockClient: ContactsApiClient;

  beforeEach(() => {
    mockClient = {
      request: vi.fn(),
    };
  });

  describe('User Story 1: List Contacts with Pagination', () => {
    it('should retrieve first page with default pagination', async () => {
      const mockResponse: ContactListResponse = {
        content: Array.from({ length: 10 }, (_, i) => ({
          id: `contact-${i + 1}`,
          firstName: `First${i + 1}`,
          lastName: `Last${i + 1}`,
          email: `contact${i + 1}@example.com`,
          createdDate: '2024-01-01T00:00:00Z',
        })),
        page: {
          size: 10,
          totalElements: 25,
          totalPages: 3,
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

      expect(result.content).toHaveLength(10);
      expect(result.page.size).toBe(10);
      expect(result.page.totalElements).toBe(25);
      expect(result.page.totalPages).toBe(3);
      expect(result.page.number).toBe(0);
    });

    it('should paginate through multiple pages', async () => {
      // First page
      const firstPage: ContactListResponse = {
        content: Array.from({ length: 10 }, (_, i) => ({
          id: `contact-page1-${i + 1}`,
          firstName: `First${i + 1}`,
          lastName: `Last${i + 1}`,
          email: `page1-contact${i + 1}@example.com`,
          createdDate: '2024-01-01T00:00:00Z',
        })),
        page: {
          size: 10,
          totalElements: 25,
          totalPages: 3,
          number: 0,
        },
      };

      // Second page
      const secondPage: ContactListResponse = {
        content: Array.from({ length: 10 }, (_, i) => ({
          id: `contact-page2-${i + 1}`,
          firstName: `First${i + 11}`,
          lastName: `Last${i + 11}`,
          email: `page2-contact${i + 11}@example.com`,
          createdDate: '2024-01-01T00:00:00Z',
        })),
        page: {
          size: 10,
          totalElements: 25,
          totalPages: 3,
          number: 1,
        },
      };

      // Third page (partial)
      const thirdPage: ContactListResponse = {
        content: Array.from({ length: 5 }, (_, i) => ({
          id: `contact-page3-${i + 1}`,
          firstName: `First${i + 21}`,
          lastName: `Last${i + 21}`,
          email: `page3-contact${i + 21}@example.com`,
          createdDate: '2024-01-01T00:00:00Z',
        })),
        page: {
          size: 10,
          totalElements: 25,
          totalPages: 3,
          number: 2,
        },
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(firstPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(secondPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(thirdPage), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      // Fetch all pages
      const page1 = await listContacts(mockClient, { companyId: 'comp-123', page: 0 });
      const page2 = await listContacts(mockClient, { companyId: 'comp-123', page: 1 });
      const page3 = await listContacts(mockClient, { companyId: 'comp-123', page: 2 });

      expect(page1.content).toHaveLength(10);
      expect(page2.content).toHaveLength(10);
      expect(page3.content).toHaveLength(5);
      expect(page1.page.number).toBe(0);
      expect(page2.page.number).toBe(1);
      expect(page3.page.number).toBe(2);
    });

    it('should handle custom page size up to maximum', async () => {
      const mockResponse: ContactListResponse = {
        content: Array.from({ length: 200 }, (_, i) => ({
          id: `contact-${i + 1}`,
          firstName: `First${i + 1}`,
          lastName: `Last${i + 1}`,
          email: `contact${i + 1}@example.com`,
          createdDate: '2024-01-01T00:00:00Z',
        })),
        page: {
          size: 200,
          totalElements: 200,
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

      const result = await listContacts(mockClient, { companyId: 'comp-123', size: 200 });

      expect(result.content).toHaveLength(200);
      expect(result.page.size).toBe(200);
    });

    it('should handle empty results', async () => {
      const mockResponse: ContactListResponse = {
        content: [],
        page: {
          size: 10,
          totalElements: 0,
          totalPages: 0,
          number: 0,
        },
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await listContacts(mockClient, { companyId: 'comp-empty' });

      expect(result.content).toHaveLength(0);
      expect(result.page.totalElements).toBe(0);
    });

    it('should handle unauthorized access', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'unauthorized', message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(listContacts(mockClient, { companyId: 'comp-123' })).rejects.toThrow();
    });
  });

  describe('User Story 2: View Contact Detail', () => {
    it('should retrieve full contact details by ID', async () => {
      const mockContact: Contact = {
        id: 'contact-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        types: [
          { type: 'Admin', primary: true },
          { type: 'Billing', primary: false },
          { type: 'Technical', primary: false },
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

      expect(result.id).toBe('contact-123');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.phone).toBe('+1-555-0123');
      expect(result.types).toHaveLength(3);
      expect(result.types![0]).toEqual({ type: 'Admin', primary: true });
    });

    it('should handle 404 for non-existent contact', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Contact not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(getContact(mockClient, 'comp-123', 'invalid-contact')).rejects.toThrow();
    });
  });

  describe('User Story 3: Create New Contact', () => {
    it('should create contact with all fields', async () => {
      const createRequest: CreateContactRequest = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1-555-1111',
        types: [
          { type: 'Admin', primary: true },
          { type: 'Billing', primary: true },
        ],
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

      expect(result.id).toBe('contact-456');
      expect(result.firstName).toBe('Alice');
      expect(result.lastName).toBe('Johnson');
      expect(result.email).toBe('alice.johnson@example.com');
      expect(result.types).toHaveLength(2);
    });

    it('should create contact with only required fields', async () => {
      const createRequest: CreateContactRequest = {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@example.com',
      };

      const mockCreated: Contact = {
        id: 'contact-789',
        ...createRequest,
        createdDate: '2024-01-03T00:00:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCreated), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await createContact(mockClient, 'comp-123', createRequest);

      expect(result.id).toBe('contact-789');
      expect(result.phone).toBeUndefined();
      expect(result.types).toBeUndefined();
    });

    it('should handle validation errors', async () => {
      const invalidRequest = {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'invalid-email',
      } as CreateContactRequest;

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

      await expect(createContact(mockClient, 'comp-123', invalidRequest)).rejects.toThrow();
    });

    it('should handle primary contact demotion scenario', async () => {
      // Create first Admin primary contact
      const firstContact: CreateContactRequest = {
        firstName: 'Primary',
        lastName: 'One',
        email: 'primary1@example.com',
        types: [{ type: 'Admin', primary: true }],
      };

      const mockFirstCreated: Contact = {
        id: 'contact-primary1',
        ...firstContact,
        createdDate: '2024-01-04T00:00:00Z',
      };

      // Create second Admin primary contact (should auto-demote first)
      const secondContact: CreateContactRequest = {
        firstName: 'Primary',
        lastName: 'Two',
        email: 'primary2@example.com',
        types: [{ type: 'Admin', primary: true }],
      };

      const mockSecondCreated: Contact = {
        id: 'contact-primary2',
        ...secondContact,
        createdDate: '2024-01-04T00:00:01Z',
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockFirstCreated), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockSecondCreated), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      const first = await createContact(mockClient, 'comp-123', firstContact);
      const second = await createContact(mockClient, 'comp-123', secondContact);

      expect(first.types![0].primary).toBe(true);
      expect(second.types![0].primary).toBe(true);
      // Note: In real API, fetching first contact again would show primary=false
    });
  });

  describe('User Story 4: Update Existing Contact', () => {
    it('should update contact with partial data', async () => {
      const updateRequest: UpdateContactRequest = {
        phone: '+1-555-9999',
      };

      const mockUpdated: Contact = {
        id: 'contact-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-9999',
        types: [{ type: 'Admin', primary: true }],
        createdDate: '2024-01-01T00:00:00Z',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify(mockUpdated), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await updateContact(mockClient, 'comp-123', 'contact-123', updateRequest);

      expect(result.phone).toBe('+1-555-9999');
      expect(result.firstName).toBe('John'); // Unchanged
      expect(result.email).toBe('john.doe@example.com'); // Unchanged
    });

    it('should update types array', async () => {
      const updateRequest: UpdateContactRequest = {
        types: [
          { type: 'Admin', primary: true },
          { type: 'Technical', primary: true },
        ],
      };

      const mockUpdated: Contact = {
        id: 'contact-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
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

      expect(result.types).toHaveLength(2);
      expect(result.types![0].type).toBe('Admin');
      expect(result.types![1].type).toBe('Technical');
      expect(result.types![0].primary).toBe(true);
      expect(result.types![1].primary).toBe(true);
    });

    it('should handle 404 for non-existent contact', async () => {
      const updateRequest: UpdateContactRequest = {
        phone: '+1-555-8888',
      };

      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Contact not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(updateContact(mockClient, 'comp-123', 'invalid-contact', updateRequest)).rejects.toThrow();
    });
  });

  describe('User Story 5: Delete Contact', () => {
    it('should delete existing contact successfully', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        })
      );

      await expect(deleteContact(mockClient, 'comp-123', 'contact-123')).resolves.toBeUndefined();
    });

    it('should handle 404 for non-existent contact', async () => {
      vi.mocked(mockClient.request).mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'not_found', message: 'Contact not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(deleteContact(mockClient, 'comp-123', 'invalid-contact')).rejects.toThrow();
    });

    it('should handle cascading operations - create, update, then delete', async () => {
      // Create
      const createRequest: CreateContactRequest = {
        firstName: 'Temp',
        lastName: 'Contact',
        email: 'temp@example.com',
      };

      const mockCreated: Contact = {
        id: 'contact-temp',
        ...createRequest,
        createdDate: '2024-01-05T00:00:00Z',
      };

      // Update
      const updateRequest: UpdateContactRequest = {
        phone: '+1-555-7777',
      };

      const mockUpdated: Contact = {
        ...mockCreated,
        phone: '+1-555-7777',
      };

      vi.mocked(mockClient.request)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockCreated), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockUpdated), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response(null, {
            status: 204,
          })
        );

      // Execute flow
      const created = await createContact(mockClient, 'comp-123', createRequest);
      expect(created.id).toBe('contact-temp');

      const updated = await updateContact(mockClient, 'comp-123', created.id, updateRequest);
      expect(updated.phone).toBe('+1-555-7777');

      await expect(deleteContact(mockClient, 'comp-123', created.id)).resolves.toBeUndefined();
    });
  });
});
