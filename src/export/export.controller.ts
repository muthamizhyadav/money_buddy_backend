import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { ExportService } from './export.service';
import { ExportDto } from './dto/export.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('export')
@ApiBearerAuth()
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Download the current user data as a CSV or JSON file',
  })
  @ApiProduces('text/csv', 'application/json')
  async export(
    @CurrentUser() user: { userId: string },
    @Body() dto: ExportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.exportService.build(user.userId, dto.format);

    res.setHeader('Content-Type', file.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.filename}"`,
    );
    res.setHeader('Cache-Control', 'no-store');

    return file.content;
  }
}
