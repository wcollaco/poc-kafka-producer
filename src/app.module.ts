import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProducerController } from './producer/producer.controller'
import { ClientsModule, Transport } from '@nestjs/microservices';
import { trace } from 'console';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['host.docker.internal:9094'],
          }       
        }
      }
    ])
  ],
  controllers: [AppController, ProducerController],
  providers: [AppService],
})
export class AppModule {}
