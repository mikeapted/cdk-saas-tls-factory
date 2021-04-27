import * as cdk from '@aws-cdk/core';
import { CdkSaasTlsFactoryApi } from './api';
import { CdkSaasTlsFactoryState } from './state';
import { CdkSaasTlsFactoryStateMachinePostDomain } from './stateMachinePostDomain';

export interface CdkSaasTlsFactoryProps {
  // Define construct properties here
}

export class CdkSaasTlsFactory extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: CdkSaasTlsFactoryProps = {}) {
    super(scope, id);

    const saasState = new CdkSaasTlsFactoryState(this, 'State');
    const saasStateMachinePostDomain = new CdkSaasTlsFactoryStateMachinePostDomain(this, 'StateMachine', {
      domainTable: saasState.domainTable
    });
    const saasApi = new CdkSaasTlsFactoryApi(this, 'Api', {
      domainTable: saasState.domainTable,
      postDomain: saasStateMachinePostDomain.postDomain
    });
  }
}
