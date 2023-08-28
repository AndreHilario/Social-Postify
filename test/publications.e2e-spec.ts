import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from './../src/app.module';
import { PrismaModule } from "./../src/prisma/prisma.module";
import { PrismaService } from "./../src/prisma/prisma.service";
import * as request from "supertest";
import publicationsFactory from "./factories/publications/publications-factory";
import postsFactory from "./factories/posts/posts-factory";
import mediasFactory from "./factories/medias/medias-factory";

describe('Publication e2e Tests', () => {
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
        await prisma.publication.deleteMany();
        await prisma.media.deleteMany();
        await prisma.post.deleteMany();

        await app.init();
    });

    it('POST /publications => should create a new publication and return 201 created', async () => {
        const post = await postsFactory.createPost(prisma);
        const media = await mediasFactory.createMedia(prisma);
        const publication = await publicationsFactory.createPublication(prisma, media.id, post.id);

        const response = await request(app.getHttpServer())
            .post('/publications')
            .send(publication);
        expect(response.statusCode).toBe(HttpStatus.CREATED);
        expect(response.body.mediaId).toBe(publication.mediaId);
        expect(response.body.postId).toBe(publication.postId);
        expect(new Date(response.body.date)).toEqual(new Date(publication.date));

        const createdPublication = await publicationsFactory.getPublicationById(prisma, publication.id);

        expect(createdPublication).not.toBe(null);
    });

    it('GET /publications => should return 200 and a list of publications', async () => {
        const post = await postsFactory.createPost(prisma);
        const media = await mediasFactory.createMedia(prisma);
        const publication = await publicationsFactory.createPublication(prisma, media.id, post.id);

        const response = await request(app.getHttpServer())
            .get('/publications');

        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body).toEqual([
            {
                id: publication.id,
                mediaId: publication.mediaId,
                postId: publication.postId,
                date: new Date(publication.date).toISOString(),
                createdAt: publication.createdAt.toISOString(),
                updatedAt: publication.updatedAt.toISOString()
            }
        ]);
    });

    it('GET /publications/:id => should return 200 and the correct publication by id sent', async () => {
        const post = await postsFactory.createPost(prisma);
        const media = await mediasFactory.createMedia(prisma);
        const publication = await publicationsFactory.createPublication(prisma, media.id, post.id);

        const response = await request(app.getHttpServer())
            .get(`/publications/${publication.id}`);

        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body).toEqual(
            {
                id: publication.id,
                mediaId: publication.mediaId,
                postId: publication.postId,
                date: new Date(publication.date).toISOString(),
                createdAt: publication.createdAt.toISOString(),
                updatedAt: publication.updatedAt.toISOString()
            }
        );
    });

    it('GET /publications/:id => should return 404 when provided with a non-existent id', async () => {
        const nonExistentId = 9999;

        const response = await request(app.getHttpServer())
            .get(`/publications/${nonExistentId}`);

        expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('PUT /publications/:id => should return 403 when trying to update a published publication', async () => {
        const post = await postsFactory.createPost(prisma);
        const media = await mediasFactory.createMedia(prisma);

        const scheduledPublication = await publicationsFactory.createPublication(prisma, media.id, post.id);
        scheduledPublication.date = new Date(Date.now() - 3600000);

        const updatedData = {
            mediaId: media.id,
            postId: post.id,
            date: new Date(Date.now() + 7200000).toISOString(),
        };

        const response = await request(app.getHttpServer())
            .put(`/publications/${scheduledPublication.id}`)
            .send(updatedData);

        expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('PUT /publications/:id => should return 200 and update a scheduled publication', async () => {
        const post = await postsFactory.createPost(prisma);
        const media = await mediasFactory.createMedia(prisma);

        const scheduledPublication = await publicationsFactory.createPublication(prisma, media.id, post.id);
        scheduledPublication.date = new Date(Date.now() + 720000);
        const updatedData = await publicationsFactory.updatePublication(prisma, scheduledPublication.id, media.id, post.id);

        const response = await request(app.getHttpServer())
            .put(`/publications/${scheduledPublication.id}`)
            .send(updatedData);

        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body.mediaId).toBe(updatedData.mediaId);
        expect(response.body.postId).toBe(updatedData.postId);
        expect(new Date(response.body.date)).toEqual(new Date(updatedData.date));
    });


    it('DELETE /publications/:id => should return 204 and delete the correct publication by id sent', async () => {
        const post = await postsFactory.createPost(prisma);
        const media = await mediasFactory.createMedia(prisma);
        const publication = await publicationsFactory.createPublication(prisma, media.id, post.id);

        const response = await request(app.getHttpServer())
            .delete(`/publications/${publication.id}`);

        expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);

        const deletedPost = await publicationsFactory.getPublicationById(prisma, publication.id);
        expect(deletedPost).toBe(null);
    });
});