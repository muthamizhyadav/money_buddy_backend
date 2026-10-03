import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
  } from '@nestjs/common';
  
  import { IncomeandexpensessService } from './incomeandexpensess.service';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  import { CreateExpenseIncomeDto } from './dto/create-expense-income.dto';
  
  @Controller('incomeandexpensess')
  export class IncomeandexpensessController {
    constructor(
      private readonly incomeandexpensessService: IncomeandexpensessService,
    ) {}
  
    @Post('create')
    create(
      @CurrentUser() user: { userId: string },
      @Body() createExpenseIncomeDto: CreateExpenseIncomeDto,
    ) {
      return this.incomeandexpensessService.create(
        user.userId,
        createExpenseIncomeDto,
      );
    }
  
    @Get()
    findAll(
      @CurrentUser() user: { userId: string },
    ) {
      return this.incomeandexpensessService.findAll(
        user.userId,
      );
    }

    @Get(':id')
    findOne(
      @CurrentUser() user: { userId: string },
      @Param('id') id: string,
    ) {
      return this.incomeandexpensessService.findOne(
        user.userId,
        id,
      );
    }
  
    @Delete(':id')
    remove(
      @CurrentUser() user: { userId: string },
      @Param('id') id: string,
    ) {
      return this.incomeandexpensessService.remove(
        user.userId,
        id,
      );
    }
  }