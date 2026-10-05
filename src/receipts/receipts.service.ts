import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createWorker, Worker } from 'tesseract.js';

import { parseReceipt, ParsedReceipt } from './receipt-parser';
import { Receipt, ReceiptDocument } from './schemas/receipt.schema';

@Injectable()
export class ReceiptsService {
  private workerPromise?: Promise<Worker>;

  constructor(
    @InjectModel(Receipt.name)
    private readonly receiptModel: Model<ReceiptDocument>,
  ) {}

  private getWorker(): Promise<Worker> {
    if (!this.workerPromise) {
      this.workerPromise = createWorker('eng').catch((error) => {
        this.workerPromise = undefined;
        throw error;
      });
    }

    return this.workerPromise;
  }

  async scan(
    userId: string,
    file: { buffer: Buffer; originalname?: string; mimetype?: string; size?: number },
  ): Promise<{
    receipt: ReceiptDocument;
    parsed: ParsedReceipt;
    rawText: string;
  }> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(
        'Attach the bill image as multipart form field "file"',
      );
    }

    if (file.size && file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Image must be smaller than 10 MB');
    }

    let worker: Worker;
    try {
      worker = await this.getWorker();
    } catch {
      throw new BadRequestException(
        'OCR engine is unavailable right now. Please try again later.',
      );
    }

    let text = '';
    try {
      const result = await worker.recognize(file.buffer);
      text = result.data.text ?? '';
    } catch {
      throw new BadRequestException(
        'Could not read this image. Try a clearer photo of the bill.',
      );
    }

    const parsed = parseReceipt(text);

    const receipt = new this.receiptModel({
      userId,
      merchant: parsed.merchant,
      total: parsed.total > 0 ? parsed.total : undefined,
      currency: parsed.currency,
      date: parsed.date ? new Date(parsed.date) : new Date(),
      items: parsed.items,
      rawText: text.slice(0, 20000),
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });

    const saved = await receipt.save();

    return {
      receipt: saved,
      parsed,
      rawText: text,
    };
  }

  async findAll(userId: string): Promise<ReceiptDocument[]> {
    return this.receiptModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(userId: string, id: string): Promise<ReceiptDocument> {
    const receipt = await this.receiptModel.findOne({ _id: id, userId }).exec();

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return receipt;
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const receipt = await this.receiptModel
      .findOneAndDelete({ _id: id, userId })
      .exec();

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return { message: 'Receipt deleted successfully' };
  }
}
