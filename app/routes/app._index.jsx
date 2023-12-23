import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Button, ButtonGroup, ChoiceList, Divider, Frame, Icon, Modal, OptionList, Page, Popover } from "@shopify/polaris";
import { getVendors, getproductTypes } from "~/models/helpers.server";
import { authenticate } from "~/shopify.server";
import { Card, List, Text, BlockStack, InlineGrid} from '@shopify/polaris';
import React, { useCallback, useState } from 'react';
import {
  DragHandleMinor, DeleteMinor, DuplicateMinor
} from '@shopify/polaris-icons';

export async function loader ({ request }) {
  const { admin } = await authenticate.admin(request);
  const {session } = await authenticate.admin(request);
  const {shop} = session
  // Récupère les vendeurs et les types de produits existants
  const responseId = await admin.graphql(
    `query {
      currentAppInstallation {
        id
      }
    }`
  )
  let id = await responseId.json()
  id = id.data.currentAppInstallation.id
  const response = await admin.graphql(
    `#graphql
    query allTypesAndVendors {
      products(first: 30) {
        edges{
          node{
            productType,
            vendor
          }
        }
      }
    }`,
  )
  const data = await response.json()
  const vendors = getVendors(data)
  const productTypes = getproductTypes(data)
  return json({vendors, productTypes, id})
}

export async function action({request}) {
  const { session } = await authenticate.admin(request);
  const { admin } = await authenticate.admin(request)

  const data = await request.formData()
  const action = data.get('action')
  if(action === 'createTestMetafield') {
    const response = await admin.graphql(
      `#graphql
        mutation CreateAppDataMetafield($metafieldsSetInput:[MetafieldsSetInput!]!) {
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
        }
      `,
      {
        variables: {
          metafieldsSetInput: {
            namespace: "block_metafields",
            key: "test",
            type: "rich_text_field",
            value: "aS1hbS1hLXNlY3JldC1hcGkta2V5Cg==",
            ownerId: 'sd'
          }
        }
      }
    )
  }
  return null
}

export default function index() {
  const{vendors, productTypes, id} = useLoaderData()
  console.log("Product Types:", productTypes);
  console.log("Vendors:", vendors);
  console.log('id:', id)


  // Bouton pour test créer un metafield de test
  const submit = useSubmit()
  const addMetafieldTest = () => submit({action:'createTestMetafield', id: id}, {method:'POST'})
/////////////////////// Partie menus deroulants 'popover' avec polaris

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([])
  const [productTypesActive, setProductTypesActive] = useState(false);
  const [vendorsActive, setVendorsActive] = useState(false);


  const toggleProductTypes = useCallback(
    () => setProductTypesActive((productTypesActive) => !productTypesActive),
    [],
  );
  const toggleVendors = useCallback(
    () => setVendorsActive((vendorsActive) => !vendorsActive),
    [],
  );

  const productTypesActivator =() => {
    return(
    <Button onClick={toggleProductTypes} disclosure>
      Product Types 
    </Button>
    )
  }
  const vendorsActivator = () => {
    return(
      <Button onClick={toggleVendors} disclosure>Vendors</Button>
    )
  }
  const [selected, setSelected] = useState(['hidden']);

  const handleChange = useCallback((value) => setSelected(value), []);

//////////////////////// Partie quand tu cliques sur supprimer ça affiche une fenetre

  const [active, setActive] = useState(false);

  const toggleModal = useCallback(() => setActive((active) => !active), []);

  const destroy = <Button 
  icon={<Icon
    source={DeleteMinor}
    tone="base"/>} 
  onClick={toggleModal}
  variant="monochromePlain"
  tone="critical"
  ></Button>;
///////////////////////////////

  return(
    <Page
    primaryAction={{content: 'Save',  onAction: () => {},}}
    secondaryActions={[{content: 'Créer un metafield test', onAction: () => addMetafieldTest()}]}
    >
        <Card roundedAbove="md" background="bg-surface-secondary">
          <BlockStack>
           <InlineGrid columns="1fr auto">
            <Text as="h2" variant="headingSm">
             Staff accounts
            </Text>
            <ButtonGroup>
              <Popover
                active={productTypesActive}
                activator={productTypesActivator()}
                onClose={toggleProductTypes}
                autofocusTarget="first-node"
              >
                <OptionList
                  allowMultiple
                  onChange={setSelectedTypes}
                  options={productTypes.map((value) => {return {value: value, label: value}})}
                  selected={selectedTypes}
                />
              </Popover>
              <Popover
                active={vendorsActive}
                activator={vendorsActivator()}
                onClose={toggleVendors}
              >
                <OptionList
                  allowMultiple
                  onChange={setSelectedVendors}
                  options={vendors.map((value) => {return {value: value, label: value}})}
                  selected={selectedVendors}
                />
              </Popover>
             <Button
              onClick={() => {}}
              icon={<Icon
                source={DuplicateMinor}
                tone="base"
              />}
             ></Button>
             <Modal
              activator={destroy}
              open={active}
              onClose={toggleModal}
              title="Delete this set?"
              primaryAction={{
                destructive: true,
                content: 'Delete set',
                onAction: toggleModal,
              }}
              secondaryActions={[
                {
                  content: 'Continue editing',
                  onAction: toggleModal,
                },
              ]}
            >
              <Modal.Section>
                If you delete this set, you can't retrieve all that you created.
              </Modal.Section>
            </Modal>
            </ButtonGroup>
           </InlineGrid>
          </BlockStack>
          
          <Text as="h1">Set 1</Text>
          <Text as="p" variant="bodyMd">
            The set is shown for:
          </Text>
          <List type="bullet">
             <List.Item>Yellow shirt</List.Item>
             <List.Item>Red shirt</List.Item>
             <List.Item>Green shirt</List.Item>
          </List>
          <Divider />
            <Icon
              source={DragHandleMinor}
            />
        </Card>
    </Page>
  )
}
