import { Injectable, Scope } from '@nestjs/common'
import DataLoader from 'dataloader'
import type { User } from '@admin/@generated'
import { UserLoader } from './loaders/user.loader'

type LoaderMap = {
  userloader: DataLoader<number, User | null>
}

@Injectable({ scope: Scope.REQUEST })
export class DataLoaderService {
  public loaders: LoaderMap

  constructor(private readonly userLoader: UserLoader) {
    this.loaders = this.getDataloaders()
  }

  private getDataloaders(): LoaderMap {
    return {
      userloader: this.userLoader.generateDataLoader()
    }
  }
}
