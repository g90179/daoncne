// daon-backend/src/posts/posts.controller.ts
import { 
  Controller, Post, Get, Body, Param, Delete, 
  UseInterceptors, UploadedFiles, Query, Logger 
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma/prisma.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from '../auth/decorators/public.decorator'; // ✨ Public 데코레이터 추가

@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name); // ✨ 로거 추가
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
  // 🔑 인증이 필요한 메서드(공개 데코레이터 없음 -> 자동으로 가드 적용)
  async create(@Body() body: any, @UploadedFiles() files: Array<Express.Multer.File>) {
    this.logger.log(`[게시물 생성] 요청 접수: ${body.title || '제목없음'}`);
    
    try {
      const { title, content, category } = body;
      
      const post = await this.prisma.post.create({
        data: {
          title,
          content,
          category,
          files: {
            create: files.map(f => {
              // 🎥 비디오 파일인지 이미지인지 확실하게 분류
              let type = 'file';
              if (f.mimetype.startsWith('image/')) type = 'image';
              else if (f.mimetype.startsWith('video/')) type = 'video';
              
              return {
                url: `/uploads/${f.filename}`,
                name: f.originalname,
                type: type
              };
            })
          }
        }
      });
      this.logger.log(`[게시물 생성] 성공: ID ${post.id}`);
      return post;
    } catch (error) {
      this.logger.error(`[게시물 생성] 실패: ${error.message}`);
      throw error;
    }
  }

  // 🔑 방문자도 조회해야 하므로 @Public() 데코레이터 적용
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