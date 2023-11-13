import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create.dto';

export class UpdateChatDto extends PartialType(CreateDocumentDto) {}
