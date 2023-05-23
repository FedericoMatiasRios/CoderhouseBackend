import faker from 'faker';

export async function fakerEndPoint(req, res) {
    try {
        const products = [];

        for (let i = 0; i < 100; i++) {
            const product = {
                title: faker.commerce.productName(),
                description: faker.lorem.sentences(),
                code: faker.lorem.word(),
                price: faker.commerce.price(),
                status: true,
                stock: faker.datatype.number(),
                category: faker.commerce.department(),
                thumbnails: [
                    faker.image.imageUrl(),
                    faker.image.imageUrl(),
                    faker.image.imageUrl(),
                ],
            };
            products.push(product);
        }
        res.json(products);
    } catch (err) {
        console.log(err);
    }
}