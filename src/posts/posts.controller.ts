// daon-frontend\src\posts\posts.controller.ts
import { Controller, Post, Get, Body, Param, Delete, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma/prisma.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('posts')
export class PostsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async create(@Body() body: any, @UploadedFiles() files: Array<Express.Multer.File>) {
    const { title, content, category } = body;
    const post = await this.prisma.post.create({
      data: {
        title,
        content,
        category,
        files: {
          create: files.map(f => ({
            url: `/uploads/${f.filename}`,
            name: f.originalname,
            type: f.mimetype.includes('image') ? 'image' : 'file'
          }))
        }
      }
    });
    return post;
  }

  @Public()
  @Get()
  async findAll(@Query('category') category: string) {
    return this.prisma.post.findMany({
      where: category ? { category } : {},
      include: { files: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}