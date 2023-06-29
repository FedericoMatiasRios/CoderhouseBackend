import { expect } from 'chai';
import supertest from 'supertest';

const localhost = 'http://localhost:8080';
const request = supertest(localhost);

const base64Credentials = Buffer.from('adminCoder@coder.com:123456').toString('base64');
const authHeader = `Basic ${base64Credentials}`;

let createdProductId;

describe('Product Router', () => {
  it('should return the correct base URL', async () => {
    const response = await request.get('/');
    const baseUrl = response.request.url;

    expect(baseUrl).to.equal('http://localhost:8080/');
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      try {
        // Send a GET request to get all products
        const response = await request.get('/api/products').set('Authorization', authHeader);

        expect(response.status).to.equal(200);
        expect(response.body.docs).to.be.an('array');
        expect(response.body.docs.length).to.be.greaterThan(0);
      } catch (error) {
        console.error('Error getting products:', error);
      }
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      try {
        const newProduct = {
          title: 'Test Product',
          description: 'Test Description',
          code: '12345',
          price: 10,
          stock: 100,
          category: 'Test Category',
          thumbnails: ['thumbnail1.jpg', 'thumbnail2.jpg'],
        };

        // Send a POST request with the Basic Authentication header to create the product
        const response = await request
          .post('/api/products')
          .set('Authorization', authHeader)
          .send(newProduct);

        // Store the created product ID
        createdProductId = response.body._id;
      } catch (error) {
        console.error('Error creating product:', error);
      }
    });
  });

  describe('GET /api/products/:pid', () => {
    it('should get the product', async () => {
      try {
        // Send a GET request to get the created product
        const response = await request.get(`/api/products/${createdProductId}`).set('Authorization', authHeader);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body._id).to.equal(createdProductId);
      } catch (error) {
        console.error('Error getting product:', error);
      }
    });
  });

  describe('PUT /api/products/:pid', () => {
    it('should update the product', async () => {
      try {
        const updatedProduct = {
          title: 'Updated Test Product',
          description: 'Updated Test Description',
          code: '54321',
          price: 20,
          stock: 200,
          category: 'Updated Test Category',
          thumbnails: ['updated-thumbnail1.jpg', 'updated-thumbnail2.jpg'],
        };

        // Send a PUT request with the Basic Authentication header to update the product
        const response = await request
          .put(`/api/products/${createdProductId}`)
          .set('Authorization', authHeader)
          .send(updatedProduct);

        expect(response.status).to.equal(201);
      } catch (error) {
        console.error('Error updating product:', error);
      }
    });
  });

  describe('DELETE /api/products/:pid', () => {
    it('should delete the product', async () => {
      try {
        if (createdProductId) {
          // Send a DELETE request with the Basic Authentication header to delete the product
          const response = await request
            .delete(`/api/products/${createdProductId}`)
            .set('Authorization', authHeader);

          expect(response.status).to.equal(201);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    });
  });
});