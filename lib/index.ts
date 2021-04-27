import * as cdk from '@aws-cdk/core';
import * as api from './api';
import * as state from './state';
import * as stateMachine from './stateMachine';

export interface CdkSaasTlsFactoryProps {
  // Define construct properties here
}

export class CdkSaasTlsFactory extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: CdkSaasTlsFactoryProps = {}) {
    super(scope, id);

    const saasState = new state.CdkSaasTlsFactoryState(this, 'State');
    const saasStateMachine = new stateMachine.CdkSaasTlsFactoryStateMachine(this, 'StateMachine', {
      domainTable: saasState.domainTable
    });
    const saasApi = new api.CdkSaasTlsFactoryApi(this, 'Api', {
      domainTable: saasState.domainTable,
      postDomain: saasStateMachine.postDomain
    });
  }
}
