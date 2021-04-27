import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as cdk from '@aws-cdk/core';

export interface CdkSaasTlsFactoryStateProps {
  // Define construct properties here
}

export class CdkSaasTlsFactoryState extends cdk.Construct {

  public domainTable: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props: CdkSaasTlsFactoryStateProps = {}) {
    super(scope, id);

    // Define construct contents here

    const domainTable = new dynamodb.Table(this, 'DomainTable', {
      partitionKey: { name: 'domain', type: dynamodb.AttributeType.STRING }
    });
    this.domainTable = domainTable;
  }
}
