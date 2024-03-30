import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as DataBase from '@/entities/instance'

@Injectable()
export class DataBaseService {
    constructor(@InjectRepository(DataBase.UserEntier) public readonly tableUser: Repository<DataBase.UserEntier>) {}
}
