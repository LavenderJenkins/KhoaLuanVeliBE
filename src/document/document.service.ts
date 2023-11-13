import {HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import mongoose, {Model} from 'mongoose';
import {RedisKey} from 'src/enums';
import {ExceptionResponse} from 'src/exceptions/common.exception';
import {Cart} from 'src/models/cart.model';
import {Document} from 'src/models/document.model';
import {School} from 'src/models/school.model';
import {Subject} from 'src/models/subject.model';
import {RedisConnectionService} from 'src/redis-connection/redis-connection.service';
import {CreateDocumentDto} from './dto/create.dto';

@Injectable()
export class DocumentService {
  constructor(
    // private readonly postgres: PostgresqlService,
    private readonly redisService: RedisConnectionService,
    @InjectModel(Document.name)
    private readonly documentModel: Model<Document>,
    @InjectModel(School.name)
    private readonly schoolModel: Model<School>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<Subject>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,
  ) {}

  async create(userId: string, body: CreateDocumentDto) {
    const [school, subject] = await Promise.all([
      this.schoolModel.findById(body.school_id).lean(),
      this.subjectModel.findById(body.subject_id).lean(),
    ]);

    if (!school) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Trường học không hợp lệ',
      );
    }

    if (!subject) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Môn học không hợp lệ',
      );
    }

    const document = (
      await this.documentModel.create({
        ...body,
        created_by: userId,
      })
    ).toObject();

    return document;
  }

  async update(documentId: string, userId: string, body: CreateDocumentDto) {
    const {is_free, price} = body;

    const [school, subject, document] = await Promise.all([
      this.schoolModel.findById(body.school_id).lean(),
      this.subjectModel.findById(body.subject_id).lean(),
      this.documentModel.findById(documentId).lean(),
    ]);

    if (!document) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Tài liệu không hợp lệ',
      );
    }

    if (!school) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Trường học không hợp lệ',
      );
    }

    if (!subject) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Môn học không hợp lệ',
      );
    }

    const newDocument = await this.documentModel.findByIdAndUpdate(
      documentId,
      {
        ...body,
        price: is_free ? 0 : price,
        created_by: userId,
      },
      {new: true},
    );

    return newDocument;
  }

  async getList(userId: string, query: any) {
    const {
      search = '',
      price_from = null,
      price_to = null,
      school_id,
      subject_id,
      user_id = null,
    } = query;
    const skip = !isNaN(+query?.skip) ? +query?.skip : 0;
    const limit = !isNaN(+query?.limit) ? +query?.limit : 0;

    const conditions: any = {};

    if (school_id || subject_id || search) {
      conditions.$or = [];
      if (user_id) {
        conditions.$or.push({created_by: user_id});
      }
      if (school_id) {
        conditions.$or.push({school_id: school_id});
      }
      if (subject_id) {
        conditions.$or.push({subject_id: subject_id});
      }
      if (search) {
        conditions.$or.push({
          $or: [
            {name: {$regex: search, $options: 'i'}},
            {description: {$regex: search, $options: 'i'}},
            {address: {$regex: search, $options: 'i'}},
          ],
        });
      }
    }

    if (price_from && price_to) {
      conditions.price = {$gte: +price_from, $lte: +price_to};
    }

    const [data, total, saved = []] = await Promise.all([
      this.documentModel
        .find(conditions)
        .populate({
          path: 'created_by',
          populate: {
            path: 'school_id',
          },
        })
        .populate(['school_id', 'subject_id'])
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1})
        .lean(),
      this.documentModel.countDocuments(conditions),
      this.redisService.getFromSet(`${RedisKey.SavedDocuments}:${userId}`),
    ]);

    const result = data.map((doc) => {
      const school = doc.school_id;
      const subject = doc.subject_id;

      delete doc.school_id;
      delete doc.subject_id;

      return {
        ...doc,
        school,
        subject,
        is_saved: saved.includes(doc._id.toString()),
      };
    });

    return {data: result, total, skip: skip};
  }

  async getDetail(documentId: string) {
    const document = await this.documentModel
      .findById(documentId)
      .populate({
        path: 'created_by',
        populate: {
          path: 'school_id',
        },
      })
      .populate(['school_id', 'subject_id'])
      .lean();

    const school = document.school_id;
    const subject = document.subject_id;

    delete document.school_id;
    delete document.subject_id;

    return {
      ...document,
      school,
      subject,
    };
  }
  async getListSchool(userId: string, query) {
    const {search = ''} = query;

    const data = await this.schoolModel
      .find({
        ...(search && {name: {$regex: search, $options: 'i'}}),
      })
      .skip(+query.skip)
      .limit(+query.limit)
      .lean();
    return data;
  }

  async getListSubject(userId: string, query) {
    const {search = ''} = query;

    const data = await this.subjectModel
      .find({
        ...(search && {name: {$regex: search, $options: 'i'}}),
      })
      .skip(+query.skip)
      .limit(+query.limit)
      .lean();
    return data;
  }

  async addToSave(userId: string, documentId: string) {
    const key = `${RedisKey.SavedDocuments}:${userId}`;
    const isSaved = await this.redisService.isSetIncludes(key, documentId);

    if (isSaved) {
      await this.redisService.removeFromSet(key, documentId);
      await this.cartModel.findOneAndUpdate(
        {user_id: userId},
        {
          user_id: userId,
          $pull: {cart_items: new mongoose.Types.ObjectId(documentId)},
        },
        {upsert: true},
      );
      return 'Đã loại tài liệu khỏi danh sách lưu';
    }

    await this.redisService.addToSet(key, documentId);

    await this.cartModel.findOneAndUpdate(
      {user_id: userId},
      {
        user_id: userId,
        $push: {cart_items: new mongoose.Types.ObjectId(documentId)},
      },
      {upsert: true},
    );

    return 'Đã lưu tài liệu thành công';
  }

  async getSavedList(userId: string) {
    const key = `${RedisKey.SavedDocuments}:${userId}`;
    const savedDocumentIds = await this.redisService.getFromSet(key);
    let documentIds = [];
    if (savedDocumentIds) {
      documentIds = savedDocumentIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    const cart = await this.cartModel
      .findOne({user_id: userId})
      .select('cart_items')
      .lean();
    documentIds = cart.cart_items;

    const data = await this.documentModel
      .find({_id: {$in: documentIds}})
      .populate({
        path: 'created_by',
        populate: {
          path: 'school_id',
        },
      })
      .populate(['school_id', 'subject_id'])
      .lean();

    const result = data.map((doc) => {
      const school = doc.school_id;
      const subject = doc.subject_id;

      delete doc.school_id;
      delete doc.subject_id;

      return {
        ...doc,
        school,
        subject,
        is_saved: true,
      };
    });

    return result;
  }

  async removeAll(userId: string) {
    const key = `${RedisKey.SavedDocuments}:${userId}`;
    await this.redisService.del(key);

    await this.cartModel.findOneAndUpdate(
      {user_id: userId},
      {
        $set: {
          cart_items: [],
        },
      },
    );

    return [];
  }
}
