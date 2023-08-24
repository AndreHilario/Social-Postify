import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { MediasService } from './medias.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Controller('medias')
export class MediasController {
  constructor(private readonly mediasService: MediasService) { }

  @Post()
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediasService.create(createMediaDto);
  }

  @Get()
  findAll() {
    return this.mediasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediasService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediasService.update(id, updateMediaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediasService.remove(id);
  }
}
