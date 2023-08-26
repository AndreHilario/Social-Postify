import { PrismaService } from "./../../../src/prisma/prisma.service";
import { FactoryPost } from "./posts-factory.entity";
import * as faker from 'faker';

export async function createPost(prisma: PrismaService) {
    const post = new FactoryPost(
        faker.lorem.sentence(),
        faker.lorem.sentence(7),
        faker.image.imageUrl()
    );

    return await prisma.post.create({
        data: {
            title: post.title,
            text: post.text,
            image: post.image
        }
    });
}

export async function createWrongPost(prisma: PrismaService) {
    const post = new FactoryPost(
        faker.lorem.sentence(),
        ""
    );

    if (post.text === "" || post.title === "" || !post.text || !post.title) {
        return null;
    }

    const createdPost = await prisma.post.create({
        data: {
            title: post.title,
            text: post.text,
        },
    });

    return createdPost;
}

export async function getPosts(prisma: PrismaService) {
    return await prisma.post.findMany();
}

export async function getPostById(prisma: PrismaService, id: number) {
    return await prisma.post.findFirst({
        where: {
            id
        }
    });
}

export async function updatePost(prisma: PrismaService, id: number) {
    const updatedPost = new FactoryPost(
        faker.lorem.sentence(),
        faker.lorem.sentence(5)
    );
    return await prisma.post.update({
        where: {
            id
        },
        data: {
            title: updatedPost.title,
            text: updatedPost.text,
        },
    });
}