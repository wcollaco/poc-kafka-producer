import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka  } from '@nestjs/microservices';
import { Producer } from '@nestjs/microservices/external/kafka.interface';
import {
    SchemaRegistry,
    readAVSCAsync
  } from '@kafkajs/confluent-schema-registry';
import { RawAvroSchema } from '@kafkajs/confluent-schema-registry/dist/@types';

@Controller('producer')
export class ProducerController implements OnModuleInit{
    private kafkaProducer: Producer;
    private schemaId: number;
    private schemaRegistryClient: SchemaRegistry;

    constructor(
        @Inject('KAFKA_SERVICE')
        private readonly clientKafka: ClientKafka,
    ) {}

    async onModuleInit() {
        this.kafkaProducer = await this.clientKafka.connect();
        try {
            this.schemaRegistryClient = new SchemaRegistry({
                host: 'http://host.docker.internal:8081'
            });

            const schema = await readAVSCAsync('src/schemas/user-interaction.avsc');
            const { id } = await this.schemaRegistryClient.register(schema);    
            console.log(id);
            this.schemaId = id;   
        }
    catch(error){
        console.log(error);
    }
    }
    
    @Get()
    async producer() {
        const data = {
            name: "lorem",
            email: "ipsum"
          };
        const encodedData = await this.schemaRegistryClient.encode(this.schemaId, data);

        this.kafkaProducer.send({
           topic: 'user-interaction',
            messages: [{ value: encodedData }]
        }).catch((error) => {
            console.log(error);
        });
    }
}

