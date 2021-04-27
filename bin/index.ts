#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkSaasTlsFactory } from '../lib/index';

export class CdkSaasTlsFactoryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      new CdkSaasTlsFactory(this, 'CdkSaasTlsFactory');
  }
}

const app = new cdk.App();
new CdkSaasTlsFactoryStack(app, 'CdkSaasTlsFactoryStack');

