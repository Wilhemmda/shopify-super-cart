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
  const response = await admin.graphql(
    `query {
      currentAppInstallation {
        id
      }
    }`
  )
  const data = await response.json()

  return json({id :data.data.currentAppInstallation.id, shop})
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
            key: "div",
            type: "multi_line_text_field",
            value: "Free Shipping!",
            ownerId: id
          }
      }}
    )
    console.log(response.json())
    }  
    
     if (data.get('action') === 'delete') {
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
              key: "div",
              type: "multi_line_text_field",
              value: "",
              ownerId: id
            }
        }}  
        
      )
       console.log(response)
     }
     return null
}
  
export default function testPage() {
  const {id, shop} = useLoaderData()
  
  console.log(id, shop)
  const submit = useSubmit()
  const addDiv = () => submit({id: id, action : 'add'}, {method: 'POST'})
  const deleteDiv = () => submit({id: id, action : 'delete'}, {method: 'DELETE'})

  return (
    <Page>
      <ui-title-bar title="Dashboard">
        <a href="https://demowil.myshopify.com/admin/themes/current/editor?context=apps&template=&activateAppId=24492438-4ce6-406a-8ce0-0af353f6c5d1/app-embed">
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
