import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Document, DocumentSchema } from 'src/models/document.model';
import { School, SchoolSchema } from 'src/models/school.model';
import { Subject, SubjectSchema } from 'src/models/subject.model';
import { Cart, CartSchema } from 'src/models/cart.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Document.name, schema: DocumentSchema},
      {name: School.name, schema: SchoolSchema},
      {name: Subject.name, schema: SubjectSchema},
      {name: Cart.name, schema: CartSchema},
    ])
  ],
  controllers: [DocumentController],
  providers: [DocumentService]
})
export class DocumentModule {}
