import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as sfn from '@aws-cdk/aws-stepfunctions';

export interface CdkSaasTlsFactoryStateMachineProps {
  domainTable: dynamodb.ITable
}

export class CdkSaasTlsFactoryStateMachine extends cdk.Construct {

  public postDomain: sfn.StateMachine;

  constructor(scope: cdk.Construct, id: string, props: CdkSaasTlsFactoryStateMachineProps) {
    super(scope, id);

    // Wait states
    const wait10sec = new sfn.Wait(this, 'Wait 10 Seconds', {
      time: sfn.WaitTime.duration(cdk.Duration.seconds(10))
    });

    // Success State
    const succeed = new sfn.Succeed(this, 'Succeed');

    // State machine defintion
    const definition = wait10sec
      .next(succeed)

    // State machine resource
    const postDomain = new sfn.StateMachine(this, 'StateMachine', {
      definition,
      timeout: cdk.Duration.minutes(60)
    });
    this.postDomain = postDomain;

  }
}
