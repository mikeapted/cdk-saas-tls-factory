import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';

export interface CdkSaasTlsFactoryStateMachinePostDomainProps {
  domainTable: dynamodb.ITable
}

export class CdkSaasTlsFactoryStateMachinePostDomain extends cdk.Construct {

  public postDomain: sfn.StateMachine;

  constructor(scope: cdk.Construct, id: string, props: CdkSaasTlsFactoryStateMachinePostDomainProps) {
    super(scope, id);

    // Wait states
    const wait2sec = new sfn.Wait(this, 'Wait 2 Seconds', {
      time: sfn.WaitTime.duration(cdk.Duration.seconds(2))
    });

    // Add domain name to DynamoDB state table
    const insertDomain = new tasks.DynamoPutItem(this, 'Insert Domain in DDB', {
      table: props.domainTable,
      item: { domain: tasks.DynamoAttributeValue.fromString(sfn.JsonPath.stringAt('$.domain')) },
      resultPath: '$.domainInsert',
    });
    //insertDomain.addCatch(sendToErrorQueue);

    // Success State
    const succeed = new sfn.Succeed(this, 'Succeed');

    // State machine defintion
    const definition = wait2sec
      .next(insertDomain)
      .next(succeed)

    // State machine resource
    const postDomain = new sfn.StateMachine(this, 'StateMachine', {
      definition,
      timeout: cdk.Duration.minutes(60)
    });
    this.postDomain = postDomain;

  }
}
