import { expect } from 'chai';
import supertest from 'supertest';

const localhost = 'http://localhost:8080';
const request = supertest(localhost);

const base64Credentials = Buffer.from('adminCoder@coder.com:123456').toString('base64');
const authHeader = `Basic ${base64Credentials}`;

let createdCartId;

describe('Cart Router', () => {
    it('should return the correct base URL', async () => {
        const response = await request.get('/');
        const baseUrl = response.request.url;

        expect(baseUrl).to.equal('http://localhost:8080/');
    });

    describe('GET /api/carts/', () => {
        it('should get all carts', async () => {
            try {
                // Send a GET request to get all carts
                const response = await request.get('/api/carts').set('Authorization', authHeader);

                expect(response.status).to.equal(200);
                expect(response.body.docs).to.be.an('array');
                expect(response.body.docs.length).to.be.greaterThan(0);
            } catch (error) {
                console.error('Error getting carts:', error);
            }
        });
    });

    describe('POST /api/carts/', () => {
        it('should create a new cart', async () => {
            try {
                // Send a POST request with the Basic Authentication header to create the cart
                const response = await request
                    .post('/api/carts')
                    .set('Authorization', authHeader);

                // Store the created cart ID
                createdCartId = response.body._id;
            } catch (error) {
                console.error('Error creating cart:', error);
            }
        });
    });

    describe('PUT /api/carts/:cid', () => {
        it('should update the cart', async () => {
            try {
                const updatedProducts = [
                    { productId: 'product1', quantity: 5 },
                    { productId: 'product2', quantity: 10 },
                ];

                // Send a PUT request with the Basic Authentication header to update the cart
                const response = await request
                    .put(`/api/carts/${createdCartId}`)
                    .set('Authorization', authHeader)
                    .send({ products: updatedProducts });

                expect(response.status).to.equal(200);
            } catch (error) {
                console.error('Error updating cart:', error);
            }
        });
    });

    describe('DELETE /api/carts/:cid', () => {
        it('should delete the cart', async () => {
            try {
                if (createdCartId) {
                    // Send a DELETE request with the Basic Authentication header to delete the cart
                    const response = await request
                        .delete(`/api/carts/${createdCartId}`)
                        .set('Authorization', authHeader);

                    expect(response.status).to.equal(200);
                }
            } catch (error) {
                console.error('Error deleting cart:', error);
            }
        });
    });
});