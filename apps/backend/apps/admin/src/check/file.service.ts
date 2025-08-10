import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { UnprocessableDataException } from '@libs/exception'
import { StorageService } from '@libs/storage'
import { Cluster, Comparison } from './model/check-result.dto'

@Injectable()
export class FileService {
  constructor(private readonly storageService: StorageService) {}

  async getComparisonsFile(checkId: number): Promise<Comparison[]> {
    const comparisonJson = await this.storageService.readObject(
      `comparison${checkId}.json`
    )
    if (comparisonJson == '') {
      throw new UnprocessableDataException('cannot read comparison.json')
    }
    const rawComparisons = JSON.parse(comparisonJson)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawComparisons.map((rawComparison: any) =>
      plainToInstance(Comparison, rawComparison)
    )
  }

  async getClustersFile(checkId: number): Promise<Cluster[]> {
    const clusterJson = await this.storageService.readObject(
      `cluster${checkId}.json`
    )
    if (clusterJson == '') {
      throw new UnprocessableDataException('cannot read cluster.json')
    }
    const rawClusters = JSON.parse(clusterJson)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawClusters.map((rawCluster: any) =>
      plainToInstance(Cluster, rawCluster)
    )
  }

  async clearFiles(checkId: number): Promise<void> {
    await this.storageService.deleteObject(
      `comparison${checkId}.json`,
      'checkResult'
    )
    await this.storageService.deleteObject(
      `cluster${checkId}.json`,
      'checkResult'
    )
  }
}
