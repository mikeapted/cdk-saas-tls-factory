import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as iam from "@aws-cdk/aws-iam";
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as cdk from '@aws-cdk/core';

export interface CdkSaasTlsFactoryApiProps {
  domainTable: dynamodb.ITable,
  postDomain: sfn.IStateMachine
}

export class CdkSaasTlsFactoryApi extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: CdkSaasTlsFactoryApiProps) {
    super(scope, id);

    // Define construct contents here

    const apigRole = new iam.Role(this, 'APIGRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
    });
    props.domainTable.grantReadWriteData(apigRole);
    props.postDomain.grantStartExecution(apigRole);

    const api = new apigateway.RestApi(this, 'tls-provisioning');

    // POST route to start provisioining
    const domains = api.root.addResource('domains');
    const updateDomain = domains.addMethod('POST', new apigateway.AwsIntegration({
      service: 'states',
      action: 'StartExecution',
      options: {
        credentialsRole: apigRole,
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
        requestTemplates: {
          'application/json': `{
            "stateMachineArn": "${props.postDomain.stateMachineArn}",
            "input": "$util.escapeJavaScript($input.body)"
          }`
        },
        integrationResponses: [{ statusCode: "200" }]
      }
    }), {
      methodResponses: [{ statusCode: '200' }],
    });

    // GET route to retrieve status
    const domain = domains.addResource('{domain}');  
    const getDomain = domain.addMethod('GET', new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'GetItem',
      options: {
        credentialsRole: apigRole,
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
        requestTemplates: {
          'application/json': `{
            "TableName": "${props.domainTable.tableName}",
            "Key": {
              "domain": {
                "S": "$input.params('domain')"
              }
            }
          }`
        },
        integrationResponses: [
          { 
            statusCode: "200",
            responseTemplates: {
              'application/json': JSON.stringify({
                "domain": "$input.path('$.Item.domain.S')",
                "status": "$input.path('$.Item.status.S')",
                "dnsValidationName": "$input.path('$.Item.dnsValidationName.S')",
                "dnsValidationValue": "$input.path('$.Item.dnsValidationValue.S')",
                "distributionUrl": "$input.path('$.Item.distributionUrl.S')",
              })
            }
          }
        ]
      }
    }), {
      methodResponses: [{ statusCode: '200' }],
    });

    // DELETE route to remove a domain
    const deleteDomain = domain.addMethod('DELETE', new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'DeleteItem',
      options: {
        credentialsRole: apigRole,
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
        requestTemplates: {
          'application/json': `{
            "TableName": "${props.domainTable.tableName}",
            "Key": {
              "domain": {
                "S": "$input.params('domain')"
              }
            }
          }`
        },
        integrationResponses: [{ statusCode: "200" }]
      }
    }), {
      methodResponses: [{ statusCode: '200' }],
    });

  }
}
