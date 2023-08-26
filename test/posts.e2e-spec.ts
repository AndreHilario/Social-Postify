import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from './../src/app.module';
import { PrismaModule } from "./../src/prisma/prisma.module";
import { PrismaService } from "./../src/prisma/prisma.service";
import * as request from "supertest";
import { createPost, createWrongPost, getPostById, getPosts, updatePost } from "./factories/posts/posts-factory";

describe('PostsController', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule, PrismaModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prisma = await moduleFixture.resolve(PrismaService);
        await prisma.post.deleteMany();

        await app.init();
    });

    it('POST /posts => should create a new post and return 201 created', async () => {
        const post = await createPost(prisma);

        const response = await request(app.getHttpServer())
            .post('/posts')
            .send(post);
        expect(response.statusCode).toBe(HttpStatus.CREATED);
        expect(response.body.title).toBe(post.title);
        expect(response.body.text).toBe(post.text);

        if (response.body.image) expect(response.body.image).toBe(post.image);

        const createdPost = await getPostById(prisma, post.id);

        expect(createdPost).not.toBe(null);
    });

    it('POST /posts => should return 400 when post body is missing or in wrong format', async () => {
        const post = await createWrongPost(prisma);

        const response = await request(app.getHttpServer())
            .post('/posts')
            .send(post);
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain("All fields are required or use the correct format");

        const createdPost = await getPosts(prisma);

        expect(createdPost).toHaveLength(0);
    });

    it('GET /posts => should return 200 and a list of posts', async () => {
        const createdPost = await createPost(prisma);

        const response = await request(app.getHttpServer())
            .get('/posts');

        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body).toEqual([
            {
                id: createdPost.id,
                title: createdPost.title,
                text: createdPost.text,
                image: createdPost.image,
                createdAt: createdPost.createdAt.toISOString(),
                updatedAt: createdPost.updatedAt.toISOString()
            }
        ]);
    });

    it('GET /posts/:id => should return 200 and the correct post by id sent', async () => {
        const createdPost = await createPost(prisma);

        const response = await request(app.getHttpServer())
            .get(`/posts/${createdPost.id}`);

        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body).toEqual(
            {
                id: createdPost.id,
                title: createdPost.title,
                text: createdPost.text,
                image: createdPost.image,
                createdAt: createdPost.createdAt.toISOString(),
                updatedAt: createdPost.updatedAt.toISOString()
            }
        );
    });

    it('GET /posts/:id => should return 404 when provided with a non-existent id', async () => {
        const nonExistentId = 9999;

        const response = await request(app.getHttpServer())
            .get(`/posts/${nonExistentId}`);

        expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('PUT /posts/:id => should return 200 and update the correct post by id sent', async () => {
        const post = await createPost(prisma);
        const updatedPost = await updatePost(prisma, post.id);

        const response = await request(app.getHttpServer())
            .put(`/posts/${post.id}`)
            .send(updatedPost)

        expect(response.statusCode).toBe(HttpStatus.OK);

        const updatedPostFromDB = await getPostById(prisma, updatedPost.id);
        expect(updatedPostFromDB.title).toBe(updatedPost.title);
        expect(updatedPostFromDB.text).toBe(updatedPost.text);
    });

    it('DELETE /posts/:id => should return 204 and delete the correct post by id sent', async () => {
        const post = await createPost(prisma);

        const response = await request(app.getHttpServer())
            .delete(`/posts/${post.id}`);

        expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);

        const deletedPost = await getPostById(prisma, post.id);
        expect(deletedPost).toBe(null);
    });
});