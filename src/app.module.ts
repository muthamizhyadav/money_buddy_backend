import { Module,MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { IncomeandexpensessModule } from './incomeandexpensess/incomeandexpensess.module';
import { GlobalJwtAuthGuard } from './auth/guards/global-jwt-auth.guard';
import { AppConfigModule } from './app-config/app-config.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    UsersModule,
    AuthModule,
    IncomeandexpensessModule,
    AppConfigModule,
    ReceiptsModule,
    AiModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GlobalJwtAuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .forRoutes('*'); 
  }
}