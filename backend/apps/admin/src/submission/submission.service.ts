import { Injectable } from '@nestjs/common'
import { CreateSubmissionInput } from './dto/create-submission.input'
import { UpdateSubmissionInput } from './dto/update-submission.input'

@Injectable()
export class SubmissionService {
  create(createSubmissionInput: CreateSubmissionInput) {
    return 'This action adds a new submission'
  }

  findAll() {
    return `This action returns all submission`
  }

  findOne(id: number) {
    return `This action returns a #${id} submission`
  }

  update(id: number, updateSubmissionInput: UpdateSubmissionInput) {
    return `This action updates a #${id} submission`
  }

  remove(id: number) {
    return `This action removes a #${id} submission`
  }
}
