import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from './../src/app.module';
import { PrismaModule } from "./../src/prisma/prisma.module";
import { PrismaService } from "./../src/prisma/prisma.service";
import * as request from "supertest";
import mediasFactory from "./factories/medias/medias-factory";
import * as faker from 'faker';

describe('Media e2e Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService = new PrismaService();

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule, PrismaModule],
        })
            .overrideProvider(PrismaService)
            .useValue(prisma)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prisma = await moduleFixture.resolve(PrismaService);
        await prisma.media.deleteMany();

        await app.init();
    });

    it('POST /medias => should create a new media and return 201 created', async () => {
        const media = await mediasFactory.createMedia(prisma);
        const newMedia = {
            title: faker.lorem.sentence(2),
            username: faker.internet.userName()
        }

        const response = await request(app.getHttpServer())
            .post('/medias')
            .send(newMedia);
        expect(response.statusCode).toBe(HttpStatus.CREATED);
        expect(response.body.title).toBe(newMedia.title);
        expect(response.body.username).toBe(newMedia.username);

        const createdPost = await mediasFactory.getMediaById(prisma, media.id);

        expect(createdPost).not.toBe(null);
    });

    it('POST /medias => should not create a new media and return 409 conflict', async () => {
        const media = await mediasFactory.createMedia(prisma);

        const response = await request(app.getHttpServer())
            .post('/medias')
            .send(media);
        expect(response.statusCode).toBe(HttpStatus.CONFLICT);
        expect(response.body.message).toBe('You already have the same media');
    });

    it('GET /medias => should return 200 and a list of medias', async () => {
        const createdMedia = await mediasFactory.createMedia(prisma);

        const response = await request(app.getHttpServer())
            .get('/medias');

        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body).toEqual([
            {
                id: createdMedia.id,
                title: createdMedia.title,
                username: createdMedia.username,
                createdAt: createdMedia.createdAt.toISOString(),
                updatedAt: createdMedia.updatedAt.toISOString()
            }
        ]);
    });

    it('GET /medias/:id => should return 200 and the correct media by id sent', async () => {
        const createdMedia = await mediasFactory.createMedia(prisma);

        const response = await request(app.getHttpServer())
            .get(`/medias/${createdMedia.id}`);

        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body).toEqual(
            {
                id: createdMedia.id,
                title: createdMedia.title,
                username: createdMedia.username,
                createdAt: createdMedia.createdAt.toISOString(),
                updatedAt: createdMedia.updatedAt.toISOString()
            }
        );
    });

    it('PUT /medias/:id => should return 404 when provided with a non-existent id', async () => {
        const nonExistentId = 9999;

        const response = await request(app.getHttpServer())
            .put(`/medias/${nonExistentId}`);

        expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('PUT /medias/:id => should return 409 and conflict with the correct media by id sent', async () => {
        const media = await mediasFactory.createMedia(prisma);
        const updatedMedia = await mediasFactory.updateMedia(prisma, media.id);

        const response = await request(app.getHttpServer())
            .put(`/medias/${media.id}`)
            .send(updatedMedia);
        
        expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('DELETE /medias/:id => should return 204 and delete the correct media by id sent', async () => {
        const media = await mediasFactory.createMedia(prisma);

        const response = await request(app.getHttpServer())
            .delete(`/medias/${media.id}`);

        expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);

        const deletedMedia = await mediasFactory.getMediaById(prisma, media.id);
        expect(deletedMedia).toBe(null);
    });
});