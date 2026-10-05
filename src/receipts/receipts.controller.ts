import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { ReceiptsService } from './receipts.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Receipt } from './schemas/receipt.schema';

@ApiTags('receipts')
@ApiBearerAuth()
@ApiExtraModels(Receipt)
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post('scan')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiOperation({
    summary: 'Scan a bill/receipt image with OCR and store the result',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Parsed receipt stored for the current user',
    schema: {
      type: 'object',
      properties: {
        receipt: { $ref: getSchemaPath(Receipt) },
        parsed: {
          type: 'object',
          properties: {
            merchant: { type: 'string' },
            total: { type: 'number' },
            currency: { type: 'string' },
            date: { type: 'string' },
            items: { type: 'array', items: { type: 'object' } },
            confidence: { type: 'string' },
          },
        },
        rawText: { type: 'string' },
      },
    },
  })
  scan(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.receiptsService.scan(user.userId, file as Express.Multer.File);
  }

  @Get()
  @ApiOperation({ summary: 'List scanned receipts' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(Receipt) },
    },
  })
  findAll(@CurrentUser() user: { userId: string }) {
    return this.receiptsService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scanned receipt' })
  @ApiParam({ name: 'id', example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @ApiOkResponse({ type: Receipt })
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.receiptsService.findOne(user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scanned receipt' })
  @ApiParam({ name: 'id', example: '8f14e45f-ceea-467f-a1d6-1b7a9d3f7c2a' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Receipt deleted successfully' },
      },
    },
  })
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.receiptsService.remove(user.userId, id);
  }
}
