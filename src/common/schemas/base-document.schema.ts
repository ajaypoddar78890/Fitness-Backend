import { Prop } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Schema as MongooseSchema } from 'mongoose';

export function createDocumentUid(): string {
  return randomUUID().replace(/-/g, '');
}

export abstract class BaseDocumentSchema {
  @Prop({
    type: String,
    unique: true,
    sparse: true,
    index: true,
    default: () => createDocumentUid(),
  })
  uid: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export function applyBaseSchemaFeatures(schema: MongooseSchema): void {
  schema.pre('validate', function setUid(next) {
    if (!this.uid) {
      this.uid = createDocumentUid();
    }
    next();
  });

  schema.index({ uid: 1 }, { unique: true, sparse: true });
}
