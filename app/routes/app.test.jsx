import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Banner,
  Box,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  Form,
  FormLayout,
  Layout,
  Link,
  List,
  Page,
  Text,
  TextField,
  VerticalStack,
} from "@shopify/polaris";
import React, { useCallback, useState } from 'react';
import { authenticate } from "../shopify.server";
import db from '../db.server'
import { json } from "@remix-run/node";



export async function loader ({ request }) {
  const { admin } = await authenticate.admin(request);
  const {session } = await authenticate.admin(request);
  const {shop} = session
  const responseId = await admin.graphql(
    `query {
      currentAppInstallation {
        id
      }
    }`
  )
  const data = await responseId.json()
  const responseData = await admin.graphql(
    `#graphql
    query divContent($id: ID!, $namespace: String!, $key: String!) {
      appInstallation(id : $id) {
        apiKey: metafield (namespace : $namespace, key: $key){
          value
        }
      }
    }
    `,
    {variables: {
      id: data.data.currentAppInstallation.id, shop,
      namespace : "super_cart_metafields",
      key: 'div'
    }
  }
  )
  const div = await responseData.json()
  return json({id :data.data.currentAppInstallation.id, div, shop})
}

export const action= async ({request}) =>{
  const { session } = await authenticate.admin(request);
  const {shop} = session
  const { admin } = await authenticate.admin(request);
  const data = await request.formData()

  const id = data.get('id')
  if (data.get('action') === 'add') {
    const response = await admin.graphql(
      `#graphql
      mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafieldsSetInput) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafieldsSetInput: {
            namespace: "secret_keys",
            key: "api_key",
            type: "single_line_text_field",
            value: "aS1hbS1hLXNlY3JldC1hcGkta2V5Cg==",
            ownerId: id
          }
      }}
    )
    const addResponse = await response.json()
    console.log(addResponse)
    }  
    
     if (data.get('action') === 'delete') {
      const response = await admin.graphql(
        `#graphql
        mutation UpdateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafieldsSetInput) {
            metafields {
              id
              namespace
              key
            }
            userErrors {
              field
              message
            }
          }
        }`,
        {
          variables: {
            metafieldsSetInput: {
              namespace: "super_cart_metafields",
              key: "div",
              type: "single_line_text_field",
              value: "",
              ownerId: id
            }
        }}  
        
      )
      const deleteResponse = await response.json()
      console.log(deleteResponse)
     }
     return null
}
  
export default function testPage() {
  const {id, div, shop} = useLoaderData()
  
  console.log(id, div)
  const submit = useSubmit()
  const addDiv = () => submit({id: id, action : 'add'}, {method: 'POST'})
  const deleteDiv = () => submit({id: id, action : 'delete'}, {method: 'POST'})

  return (
    <Page>
      <ui-title-bar title="Dashboard">
        <a href={`https://${shop}/admin/themes/current/editor?context=apps&template=&activateAppId=24492438-4ce6-406a-8ce0-0af353f6c5d1/app-embed`}>
        Active super cart
        </a>
        <button onClick={addDiv}>Add div</button>
        <button onClick={deleteDiv}>Delete div</button>
      </ui-title-bar>
      <Layout>
        <Layout.Section >
          <Banner onDismiss={() => {}}>
            <p>
              OK
            </p>
          </Banner>
        </Layout.Section>
       <Layout.Section>
        
       </Layout.Section>
      </Layout>
    </Page>
  );
}
